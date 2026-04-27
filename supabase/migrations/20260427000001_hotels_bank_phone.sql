-- Migration: hotels_bank_add_phone
-- Propósito: Adicionar coluna phone à hotels_bank para suportar a UI do Hotels.tsx
-- Dependências: hotels_bank

ALTER TABLE public.hotels_bank
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT;

-- Índice de busca para pesquisas por cidade (complementa o índice existente de org)
CREATE INDEX IF NOT EXISTS idx_hotels_bank_city ON public.hotels_bank(city);

COMMENT ON COLUMN public.hotels_bank.phone IS 'Telefone de contato do hotel (recepção/comercial)';
COMMENT ON COLUMN public.hotels_bank.email IS 'E-mail de contato do hotel (reservas/comercial)';
