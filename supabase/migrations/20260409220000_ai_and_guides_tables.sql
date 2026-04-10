-- Migration: ai_and_guides_tables
-- Criada em: 2026-04-10
-- Propósito: Implementar as estruturas esquecidas para IA Orquestrada e Knowledge Base/Guias
-- Dependências: extensions (vector, pgcrypto), organizations, profiles

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Table: ai_keys_pool
CREATE TABLE IF NOT EXISTS ai_keys_pool (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  api_key_encrypted TEXT NOT NULL,
  label TEXT,
  monthly_limit INT,
  daily_limit INT,
  used_this_month INT DEFAULT 0,
  used_today INT DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  reset_daily_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  error_count INT DEFAULT 0,
  priority INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_keys_pool_org_id ON ai_keys_pool(org_id);
CREATE INDEX IF NOT EXISTS idx_ai_keys_pool_provider ON ai_keys_pool(provider);

-- RLS
ALTER TABLE ai_keys_pool ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Apenas admins acessam ai_keys_pool" ON ai_keys_pool FOR ALL
  TO authenticated
  USING (
    org_id = get_my_org_id() AND 
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('org_admin','super_admin')
  );

-- Trigger for updated_at (Not needed for ai_keys_pool as it doesn't have updated_at in PRD, but let's be strict to PRD).

-- 3. Table: ai_knowledge_base
CREATE TABLE IF NOT EXISTS ai_knowledge_base (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[],
  embedding vector(1536),
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_base_org_id ON ai_knowledge_base(org_id);
-- Index for vector search (HNSW or IVFFlat, using generic default)
-- CREATE INDEX ON ai_knowledge_base USING hnsw (embedding vector_cosine_ops);

-- RLS
ALTER TABLE ai_knowledge_base ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Membros da org acessam knowledge base" ON ai_knowledge_base FOR ALL
  TO authenticated
  USING (org_id = get_my_org_id());

CREATE TRIGGER trg_updated_at_ai_knowledge_base
BEFORE UPDATE ON ai_knowledge_base
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. Table: destination_guides
CREATE TABLE IF NOT EXISTS destination_guides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  cover_image_url TEXT,
  intro TEXT,
  tips JSONB DEFAULT '[]'::jsonb,
  useful_contacts JSONB DEFAULT '[]'::jsonb,
  emergency_numbers JSONB DEFAULT '[]'::jsonb,
  currency_info TEXT,
  climate_info TEXT,
  transportation TEXT,
  language_tips TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_destination_guides_org_id ON destination_guides(org_id);

-- RLS
ALTER TABLE destination_guides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Membros da org acessam destination_guides para edicao" ON destination_guides FOR ALL
  TO authenticated
  USING (org_id = get_my_org_id());

CREATE POLICY "Clientes acessam destination_guides publicados" ON destination_guides FOR SELECT
  TO authenticated
  USING (is_published = TRUE AND org_id = get_my_org_id()); -- Further restriction to client portal possible

CREATE TRIGGER trg_updated_at_destination_guides
BEFORE UPDATE ON destination_guides
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
