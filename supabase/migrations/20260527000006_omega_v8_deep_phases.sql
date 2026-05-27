-- MIGRATION: OMEGA v8 Deep Enterprise Architecture
-- Descrição: Materializa as Fases 4 (Routing/Domains), 5 (AI Automation) e 6 (Immutable Legal Vault)

-- ==========================================
-- FASE 4: ROUTING & DOMÍNIOS CUSTOMIZADOS
-- ==========================================

CREATE TABLE IF NOT EXISTS builder_domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  site_id uuid REFERENCES builder_sites(id) ON DELETE CASCADE,
  hostname varchar NOT NULL UNIQUE, -- ex: www.agenciaviaja.com.br
  ssl_status varchar DEFAULT 'pending', -- 'pending', 'active', 'failed'
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar SEO Global no nível do Site
ALTER TABLE builder_sites 
ADD COLUMN IF NOT EXISTS global_seo_json jsonb DEFAULT '{"title_template": "%s | Turis Agências", "favicon_url": null}',
ADD COLUMN IF NOT EXISTS analytics_scripts text;

ALTER TABLE builder_domains ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Domains isolation" ON builder_domains FOR ALL USING (org_id = (select auth.user_org_id()));


-- ==========================================
-- FASE 5: MOTOR DE INTELIGÊNCIA ARTIFICIAL (SCORING & ROTEIROS)
-- ==========================================

-- Extensão PGVector (Essencial para RAG e Roteiros Semânticos)
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;

-- Garantir que ai_knowledge_base suporte busca semântica
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='ai_knowledge_base' AND column_name='semantic_embedding'
  ) THEN
    ALTER TABLE ai_knowledge_base ADD COLUMN semantic_embedding vector(1536);
  END IF;
END $$;

-- Barramento de Eventos da IA (Event Sourcing)
CREATE TABLE IF NOT EXISTS ai_event_bus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  event_type varchar NOT NULL, -- 'LEAD_CREATED', 'QUOTE_REQUESTED'
  payload jsonb NOT NULL,
  status varchar DEFAULT 'queued', -- 'queued', 'processing', 'completed', 'failed'
  agent_target varchar, -- 'SCORING_AGENT', 'ROTEIRO_AGENT'
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz
);

ALTER TABLE ai_event_bus ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Event Bus Isolation" ON ai_event_bus FOR ALL USING (org_id = (select auth.user_org_id()));

-- Função para despachar leads novos para a fila de Scoring
CREATE OR REPLACE FUNCTION trigger_ai_scoring_for_new_leads()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO ai_event_bus (org_id, event_type, payload, agent_target)
  VALUES (NEW.org_id, 'LEAD_CREATED', row_to_json(NEW)::jsonb, 'SCORING_AGENT');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Evita erro se a trigger já existe
DROP TRIGGER IF EXISTS tr_ai_scoring_lead ON leads;
CREATE TRIGGER tr_ai_scoring_lead
AFTER INSERT ON leads
FOR EACH ROW EXECUTE FUNCTION trigger_ai_scoring_for_new_leads();


-- ==========================================
-- FASE 6: O COFRE LEGAL (IMMUTABLE VAULT)
-- ==========================================

-- Tabela Cofre: Onde o contrato, voucher ou proposta fica guardado para sempre.
CREATE TABLE IF NOT EXISTS contract_vault_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations(id),
  client_id uuid REFERENCES profiles(id), -- Quem assinou
  document_type varchar NOT NULL, -- 'PROPOSAL', 'VOUCHER', 'LEGAL_CONTRACT'
  payload_json jsonb NOT NULL, -- O conteúdo exato no momento da assinatura
  document_hash varchar NOT NULL UNIQUE, -- SHA-256 do payload_json
  created_at timestamptz DEFAULT now()
);

-- Tabela de Assinaturas: Prova de Vida/Aceite (O "Blockchain")
CREATE TABLE IF NOT EXISTS contract_signatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_record_id uuid REFERENCES contract_vault_records(id),
  signer_name varchar NOT NULL,
  signer_email varchar NOT NULL,
  signer_cpf_cnpj varchar,
  signer_ip varchar NOT NULL,
  signer_user_agent varchar NOT NULL,
  signature_timestamp timestamptz DEFAULT now(),
  -- O hash final é um SHA-256(document_hash + signer_ip + timestamp)
  signature_hash varchar NOT NULL UNIQUE, 
  certificate_url varchar -- URL do PDF gerado com o carimbo do cofre
);

ALTER TABLE contract_vault_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_signatures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vault org read" ON contract_vault_records FOR SELECT USING (org_id = (select auth.user_org_id()));
CREATE POLICY "Vault client read" ON contract_vault_records FOR SELECT USING (client_id = auth.uid());
CREATE POLICY "Signature org read" ON contract_signatures FOR SELECT USING (
  vault_record_id IN (SELECT id FROM contract_vault_records WHERE org_id = (select auth.user_org_id()))
);

-- ---------------------------------------------------------
-- A MAGIA DO COFRE: TRIGGERS PÉTREAS (WORM / BLOCKCHAIN)
-- ---------------------------------------------------------
-- Uma vez inserido, ninguém, nem o super_admin, pode alterar ou deletar via SQL (Client ou Backend normal).

CREATE OR REPLACE FUNCTION block_vault_tampering()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'VIOLAÇÃO DE SEGURANÇA: Este registro é imutável. Registros do Cofre e Assinaturas não podem ser alterados (UPDATE) ou deletados (DELETE).';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_vault_record_update ON contract_vault_records;
CREATE TRIGGER prevent_vault_record_update
BEFORE UPDATE OR DELETE ON contract_vault_records
FOR EACH ROW EXECUTE FUNCTION block_vault_tampering();

DROP TRIGGER IF EXISTS prevent_signature_update ON contract_signatures;
CREATE TRIGGER prevent_signature_update
BEFORE UPDATE OR DELETE ON contract_signatures
FOR EACH ROW EXECUTE FUNCTION block_vault_tampering();
