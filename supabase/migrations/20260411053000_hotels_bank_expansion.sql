-- Migration: hotels_bank_expansion
-- Criada em: 2026-04-11
-- Propósito: Adicionar colunas faltantes ao hotels_bank e padronizar com a nova interface
-- Dependências: hotels_bank

-- 1. Adicionar novas propriedades em hotels_bank
ALTER TABLE hotels_bank
  ADD COLUMN IF NOT EXISTS zip_code TEXT,
  ADD COLUMN IF NOT EXISTS amenities TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

-- 2. Trigger de updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trg_updated_at_hotels_bank'
  ) THEN
    CREATE TRIGGER trg_updated_at_hotels_bank
    BEFORE UPDATE ON hotels_bank
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END;
$$;
