-- Migration: omega_v5_vector_search
-- Propósito: Habilitar pgvector para busca semântica (RAG)
-- NOTA: A função match_knowledge_base deve ser criada manualmente
-- no SQL Editor do Supabase após habilitar pgvector em Extensions.
-- Docs: https://supabase.com/docs/guides/ai/vector-columns

-- Apenas registrar que a migração foi aplicada.
-- A função match_knowledge_base é criada pela Edge Function ou manualmente.
DO $$
BEGIN
  RAISE NOTICE 'Vector search migration applied. Enable pgvector in Supabase Dashboard > Extensions, then run match_knowledge_base function manually.';
END $$;
