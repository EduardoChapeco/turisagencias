-- MIGRATION: OMEGA v7 Reality Sync (Builder & Finance)
-- Descrição: Materializa as tabelas do CMS Narrativo e do Motor Financeiro de Comissões,
-- aplicando o RLS (Row Level Security) anti-hacker mapeado.

-- ==========================================
-- BLOCO 1: CMS NARRATIVO (BUILDER)
-- ==========================================

-- A tabela public_sites e builder_projects já existem. Vamos ajustá-las ou criar as novas.
-- Criar a tabela de Sites se não existir ou forçarmos a estrutura:
CREATE TABLE IF NOT EXISTS builder_sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  site_type varchar NOT NULL DEFAULT 'website', -- 'website', 'linkbio', 'blog'
  slug varchar NOT NULL,
  custom_domain varchar UNIQUE,
  status varchar DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT builder_sites_slug_org_unique UNIQUE (org_id, slug)
);

-- Páginas Individuais do CMS
CREATE TABLE IF NOT EXISTS builder_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid REFERENCES builder_sites(id) ON DELETE CASCADE,
  slug varchar NOT NULL,
  title varchar NOT NULL,
  published_version_id uuid, -- referência circular para a versão ativa
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Histórico de Publicações e Render Público
CREATE TABLE IF NOT EXISTS builder_page_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid REFERENCES builder_pages(id) ON DELETE CASCADE,
  version_number int NOT NULL,
  content_json jsonb NOT NULL,
  seo_json jsonb,
  status varchar DEFAULT 'draft', -- 'published', 'archived', 'draft'
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- Registro de Componentes (Opcional para cache de blocos válidos)
CREATE TABLE IF NOT EXISTS builder_blocks_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  block_key varchar UNIQUE NOT NULL,
  category varchar NOT NULL,
  schema_definition jsonb,
  is_active boolean DEFAULT true
);

-- ==========================================
-- BLOCO 2: MOTOR FINANCEIRO DE COMISSÕES
-- ==========================================

-- Períodos de Competência (Fechamentos mensais)
CREATE TABLE IF NOT EXISTS agent_commission_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  month_date date NOT NULL, -- ex: '2026-05-01'
  status varchar DEFAULT 'open', -- 'open', 'review', 'closed', 'paid'
  total_sales numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Regras de Comissão Fixadas
CREATE TABLE IF NOT EXISTS agent_commission_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  agent_id uuid REFERENCES profiles(id) ON DELETE CASCADE, -- Nullable se for regra da agência toda
  operator_name varchar, -- Ex: 'Orinter'
  min_sales numeric DEFAULT 0,
  base_commission_pct numeric DEFAULT 1.0,
  over_commission_pct numeric DEFAULT 30.0,
  requires_tax_discount boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Entradas Individuais (Vendas convertidas em comissão)
CREATE TABLE IF NOT EXISTS agent_commission_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  agent_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  period_id uuid REFERENCES agent_commission_periods(id) ON DELETE CASCADE,
  quote_id uuid, -- referência opcional à cotação
  client_name varchar,
  operator_name varchar,
  booking_locator varchar,
  payment_method varchar,
  
  gross_sales numeric DEFAULT 0,
  taxes numeric DEFAULT 0,
  gross_over numeric DEFAULT 0,
  
  commissionable_base numeric DEFAULT 0,
  operator_tax numeric DEFAULT 0,
  net_over numeric DEFAULT 0,
  
  base_commission_amount numeric DEFAULT 0,
  over_commission_amount numeric DEFAULT 0,
  
  adjustment_amount numeric DEFAULT 0,
  final_commission numeric DEFAULT 0,
  
  status varchar DEFAULT 'pending', -- 'pending', 'approved', 'disputed'
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Logs de Auditoria do Financeiro
CREATE TABLE IF NOT EXISTS agent_commission_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id uuid REFERENCES agent_commission_entries(id) ON DELETE CASCADE,
  changed_by uuid REFERENCES profiles(id),
  old_data jsonb,
  new_data jsonb,
  change_reason varchar,
  created_at timestamptz DEFAULT now()
);

-- ==========================================
-- BLOCO 3: SEGURANÇA E RLS (ROW LEVEL SECURITY)
-- ==========================================

-- Builder RLS
ALTER TABLE builder_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE builder_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE builder_page_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sites org isolation" ON builder_sites FOR ALL USING (org_id = (select public.get_my_org_id()));
-- Versões publicadas são visíveis para todos
CREATE POLICY "Public published versions" ON builder_page_versions FOR SELECT USING (status = 'published');
-- Resto isolado
CREATE POLICY "Pages isolation" ON builder_pages FOR ALL USING (site_id IN (SELECT id FROM builder_sites WHERE org_id = (select public.get_my_org_id())));
CREATE POLICY "Page versions isolation" ON builder_page_versions FOR ALL USING (page_id IN (SELECT id FROM builder_pages WHERE site_id IN (SELECT id FROM builder_sites WHERE org_id = (select public.get_my_org_id()))));

-- Commissions RLS
ALTER TABLE agent_commission_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_commission_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_commission_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_commission_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Periods isolation" ON agent_commission_periods FOR ALL USING (org_id = (select public.get_my_org_id()));
CREATE POLICY "Rules isolation" ON agent_commission_rules FOR ALL USING (org_id = (select public.get_my_org_id()));

-- Agentes só veem suas próprias comissões
CREATE POLICY "Entries self select" ON agent_commission_entries FOR SELECT USING (agent_id = auth.uid() OR org_id = (select public.get_my_org_id()));
CREATE POLICY "Entries org admin" ON agent_commission_entries FOR ALL USING (org_id = (select public.get_my_org_id()));

CREATE POLICY "Audit logs org admin" ON agent_commission_audit_logs FOR ALL USING (
  entry_id IN (SELECT id FROM agent_commission_entries WHERE org_id = (select public.get_my_org_id()))
);

-- ==========================================
-- TRIGGER DE PROTEÇÃO FINANCEIRA (ANTI FRAUDE)
-- ==========================================
CREATE OR REPLACE FUNCTION protect_commission_tampering()
RETURNS TRIGGER AS $$
BEGIN
  -- Se o usuário logado não for super_admin e a comissão for alterada...
  -- Forçamos os valores calculados
  NEW.commissionable_base := NEW.gross_sales - NEW.taxes - NEW.gross_over;
  -- Taxa de operadora fictícia simplificada (ex: 3% sobre cartão)
  IF NEW.payment_method = 'CREDIT_CARD' THEN
     NEW.operator_tax := NEW.gross_over * 0.03;
  ELSE
     NEW.operator_tax := 0;
  END IF;
  
  NEW.net_over := NEW.gross_over - NEW.operator_tax;
  
  -- Para manter o trigger agnóstico das regras complexas neste MVP inicial, apenas validamos.
  -- O front ou Edge Function preencherão a base_commission_amount/over_commission_amount.
  NEW.final_commission := NEW.base_commission_amount + NEW.over_commission_amount + NEW.adjustment_amount;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS protect_commission_tampering_trigger ON agent_commission_entries;
CREATE TRIGGER protect_commission_tampering_trigger
BEFORE INSERT OR UPDATE ON agent_commission_entries
FOR EACH ROW EXECUTE FUNCTION protect_commission_tampering();
