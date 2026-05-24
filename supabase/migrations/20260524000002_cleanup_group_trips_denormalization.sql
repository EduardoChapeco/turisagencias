-- ============================================================
-- Migration: 20260524000002_cleanup_group_trips_denormalization.sql
-- Objetivo: P2-3 — Remover colunas denormalizadas org_logo e org_name
--           de group_trips que violam normalização. Dados devem vir
--           via JOIN com organizations.
-- ============================================================

-- 1. Verificar se as colunas existem antes de dropar
-- (colunas adicionadas por migração incremental)
DO $$
BEGIN
  -- Dropar org_logo se existir
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'group_trips'
      AND column_name = 'org_logo'
  ) THEN
    ALTER TABLE group_trips DROP COLUMN org_logo;
    RAISE NOTICE 'Coluna org_logo removida de group_trips';
  ELSE
    RAISE NOTICE 'Coluna org_logo nao existe em group_trips — pulando';
  END IF;

  -- Dropar org_name se existir
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'group_trips'
      AND column_name = 'org_name'
  ) THEN
    ALTER TABLE group_trips DROP COLUMN org_name;
    RAISE NOTICE 'Coluna org_name removida de group_trips';
  ELSE
    RAISE NOTICE 'Coluna org_name nao existe em group_trips — pulando';
  END IF;
END $$;

-- 2. Garantir que a RPC get_public_group_trip faz JOIN correto com organizations
-- (verificada no código — já faz o join corretamente via usePublicGroupTrip)
-- Sem alteração na RPC necessária.

-- 3. Garantir index em group_trips.org_id para JOINs eficientes
CREATE INDEX IF NOT EXISTS idx_group_trips_org_id ON group_trips (org_id);
