-- Migration: omega_v5_knowledge_base_enrichment
-- Propósito: Enriquecer a tabela ai_knowledge_base com campos de categorização
-- para que o RAG possa filtrar por tipo de conhecimento (politica, pacote, tom de voz, etc.)

ALTER TABLE public.ai_knowledge_base
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'geral',
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual'; -- manual | imported | auto_learned

-- Index para filtrar por categoria no RAG
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_category ON public.ai_knowledge_base(org_id, category);

-- A RPC match_knowledge_base foi movida para ser criada manualmente no SQL Editor
-- após habilitar a extensão pgvector.
DO $$
BEGIN
  RAISE NOTICE 'Skipping match_knowledge_base update. Enable pgvector first.';
END $$;
