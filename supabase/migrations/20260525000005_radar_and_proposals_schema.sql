-- Migration: 20260525000005_radar_and_proposals_schema.sql
-- Descrição: Tabelas reais para fontes de notícias (master/usuário), artigos enriquecidos por IA, execuções de sync, propostas, templates e elementos de design.

-- 1. feeds_master (Fontes globais pré-cadastradas)
CREATE TABLE IF NOT EXISTS feeds_master (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT,
  feed_url TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'rss', -- rss | atom | blog | portal | manual | api
  category TEXT NOT NULL DEFAULT 'geral', -- turismo | aviacao | hotelaria | cruzeiros | destinos | vistos | economia | eventos | tecnologia | marketing | geral
  language TEXT NOT NULL DEFAULT 'pt-BR',
  country TEXT NOT NULL DEFAULT 'Brasil',
  is_active BOOLEAN NOT NULL DEFAULT true,
  trust_score INTEGER NOT NULL DEFAULT 100,
  fetch_frequency_minutes INTEGER NOT NULL DEFAULT 1440,
  last_fetched_at TIMESTAMP WITH TIME ZONE,
  last_success_at TIMESTAMP WITH TIME ZONE,
  last_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS para feeds_master
ALTER TABLE feeds_master ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para feeds_master (leitura para todos autenticados, escrita para super_admin)
CREATE POLICY feeds_master_read_policy ON feeds_master
  FOR SELECT TO authenticated USING (true);

CREATE POLICY feeds_master_write_policy ON feeds_master
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'super_admin'
    )
  );

-- 2. feeds_user (Fontes adicionadas por usuários de agências específicas)
CREATE TABLE IF NOT EXISTS feeds_user (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  url TEXT,
  feed_url TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'geral',
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_fetched_at TIMESTAMP WITH TIME ZONE,
  last_success_at TIMESTAMP WITH TIME ZONE,
  last_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS para feeds_user
ALTER TABLE feeds_user ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para feeds_user (restrito por org_id)
CREATE POLICY feeds_user_org_policy ON feeds_user
  FOR ALL TO authenticated USING (org_id = (SELECT org_id FROM profiles WHERE user_id = auth.uid() LIMIT 1));

-- 3. news_articles (Artigos normalizados e enriquecidos por IA)
CREATE TABLE IF NOT EXISTS news_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE, -- Nullable se for master article
  source_scope TEXT NOT NULL DEFAULT 'master', -- master | user
  source_feed_id UUID,
  source_name TEXT NOT NULL DEFAULT 'Notícias',
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  original_url TEXT NOT NULL,
  canonical_url TEXT,
  author TEXT,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  fetched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  raw_excerpt TEXT,
  raw_content TEXT,
  image_url TEXT,
  ai_summary TEXT,
  ai_short_summary TEXT,
  ai_bullets JSONB DEFAULT '[]'::jsonb,
  ai_tags JSONB DEFAULT '[]'::jsonb,
  ai_category TEXT DEFAULT 'geral',
  ai_sentiment TEXT DEFAULT 'neutro',
  ai_relevance_score INTEGER DEFAULT 50,
  ai_travel_agency_insight TEXT,
  ai_recommended_action TEXT,
  safe_to_publish BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'published', -- draft | curated | published | archived | rejected | ai_pending | ai_failed
  is_featured BOOLEAN NOT NULL DEFAULT false,
  reading_time_minutes INTEGER DEFAULT 2,
  hash_dedup TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS para news_articles
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para news_articles
CREATE POLICY news_articles_read_policy ON news_articles
  FOR SELECT USING (
    source_scope = 'master' 
    OR org_id = (SELECT org_id FROM profiles WHERE user_id = auth.uid() LIMIT 1)
  );

CREATE POLICY news_articles_write_policy ON news_articles
  FOR ALL TO authenticated USING (
    org_id = (SELECT org_id FROM profiles WHERE user_id = auth.uid() LIMIT 1)
    OR EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'super_admin'
    )
  );

-- 4. news_sync_runs (Histórico de execuções de sincronização)
CREATE TABLE IF NOT EXISTS news_sync_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE, -- Nullable se for global sync run
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  finished_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'running', -- running | success | partial | failed
  triggered_by TEXT NOT NULL DEFAULT 'system', -- system | admin | user
  total_feeds INTEGER NOT NULL DEFAULT 0,
  total_fetched INTEGER NOT NULL DEFAULT 0,
  total_new INTEGER NOT NULL DEFAULT 0,
  total_duplicates INTEGER NOT NULL DEFAULT 0,
  total_failed INTEGER NOT NULL DEFAULT 0,
  error_log JSONB DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS para news_sync_runs
ALTER TABLE news_sync_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY news_sync_runs_policy ON news_sync_runs
  FOR ALL TO authenticated USING (
    org_id IS NULL 
    OR org_id = (SELECT org_id FROM profiles WHERE user_id = auth.uid() LIMIT 1)
  );

-- 5. quote_templates (Templates estruturados para propostas)
CREATE TABLE IF NOT EXISTS quote_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE, -- Nullable se for template master
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  thumbnail_url TEXT,
  design_schema JSONB DEFAULT '{}'::jsonb,
  default_sections JSONB DEFAULT '[]'::jsonb,
  is_master BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS para quote_templates
ALTER TABLE quote_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY quote_templates_read_policy ON quote_templates
  FOR SELECT USING (
    is_master = true 
    OR org_id = (SELECT org_id FROM profiles WHERE user_id = auth.uid() LIMIT 1)
  );

CREATE POLICY quote_templates_write_policy ON quote_templates
  FOR ALL TO authenticated USING (
    org_id = (SELECT org_id FROM profiles WHERE user_id = auth.uid() LIMIT 1)
    OR EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'super_admin'
    )
  );

-- 6. quote_design_elements (Biblioteca de blocos visuais)
CREATE TABLE IF NOT EXISTS quote_design_elements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE, -- Nullable se for master
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- hero | itinerary | pricing | hotel | flight | gallery | inclusions | exclusions | terms | cta | contact | custom
  category TEXT,
  schema JSONB DEFAULT '{}'::jsonb,
  style_schema JSONB DEFAULT '{}'::jsonb,
  html_template TEXT,
  thumbnail_url TEXT,
  compatibility TEXT NOT NULL DEFAULT 'proposal', -- proposal | landing_page | news | blog | page
  is_master BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  version TEXT NOT NULL DEFAULT '1.0',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS para quote_design_elements
ALTER TABLE quote_design_elements ENABLE ROW LEVEL SECURITY;

CREATE POLICY quote_design_elements_read_policy ON quote_design_elements
  FOR SELECT USING (
    is_master = true 
    OR org_id = (SELECT org_id FROM profiles WHERE user_id = auth.uid() LIMIT 1)
  );

CREATE POLICY quote_design_elements_write_policy ON quote_design_elements
  FOR ALL TO authenticated USING (
    org_id = (SELECT org_id FROM profiles WHERE user_id = auth.uid() LIMIT 1)
    OR EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'super_admin'
    )
  );

-- 7. proposals (Propostas comerciais reais)
CREATE TABLE IF NOT EXISTS proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  destination TEXT,
  status TEXT NOT NULL DEFAULT 'draft', -- draft | sent | viewed | accepted | rejected | archived
  template_id UUID REFERENCES quote_templates(id) ON DELETE SET NULL,
  content_schema JSONB DEFAULT '[]'::jsonb,
  pricing_schema JSONB DEFAULT '{}'::jsonb,
  itinerary_schema JSONB DEFAULT '[]'::jsonb,
  media_schema JSONB DEFAULT '{}'::jsonb,
  public_slug TEXT UNIQUE,
  public_token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  pdf_url TEXT,
  webview_url TEXT,
  source_pdf_url TEXT,
  source_pdf_ocr_text TEXT,
  ai_extracted_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS para proposals
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

-- Segurança RLS para proposals (agentes veem os de sua org, clientes veem publicamente via token na webview)
CREATE POLICY proposals_agent_policy ON proposals
  FOR ALL TO authenticated USING (
    org_id = (SELECT org_id FROM profiles WHERE user_id = auth.uid() LIMIT 1)
  );

CREATE POLICY proposals_public_read_policy ON proposals
  FOR SELECT TO anon USING (
    status NOT IN ('draft', 'archived')
  );

-- 8. proposal_versions (Versionamento de propostas)
CREATE TABLE IF NOT EXISTS proposal_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  snapshot JSONB NOT NULL,
  html_snapshot TEXT,
  pdf_url TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS para proposal_versions
ALTER TABLE proposal_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY proposal_versions_policy ON proposal_versions
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM proposals 
      WHERE proposals.id = proposal_versions.proposal_id 
      AND proposals.org_id = (SELECT org_id FROM profiles WHERE user_id = auth.uid() LIMIT 1)
    )
  );

-- 9. proposal_assets (Mídia e comprovantes vinculados)
CREATE TABLE IF NOT EXISTS proposal_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type TEXT,
  bucket_path TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS para proposal_assets
ALTER TABLE proposal_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY proposal_assets_policy ON proposal_assets
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM proposals 
      WHERE proposals.id = proposal_assets.proposal_id 
      AND proposals.org_id = (SELECT org_id FROM profiles WHERE user_id = auth.uid() LIMIT 1)
    )
  );

-- Semeando feeds master iniciais (Panrotas, Mercado e Eventos, Brasil Turis)
INSERT INTO feeds_master (name, feed_url, category, language, is_active)
VALUES
  ('PANROTAS', 'https://www.panrotas.com.br/rss.xml', 'turismo', 'pt-BR', true),
  ('Mercado e Eventos', 'https://www.mercadoeeventos.com.br/feed/', 'eventos', 'pt-BR', true),
  ('Brasil Turis', 'https://brasilturis.com.br/feed/', 'turismo', 'pt-BR', true)
ON CONFLICT DO NOTHING;
