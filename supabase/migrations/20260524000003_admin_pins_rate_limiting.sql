-- ============================================================
-- Migration: 20260524000003_admin_pins_rate_limiting.sql
-- Objetivo: Adicionar suporte a rate-limiting persistente no PIN de admin
--           para defesa robusta contra Brute Force/Dicionário.
-- ============================================================

ALTER TABLE public.admin_pins 
  ADD COLUMN IF NOT EXISTS failed_attempts INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_attempt_at TIMESTAMPTZ;

-- Comentários documentando o comportamento de segurança
COMMENT ON COLUMN public.admin_pins.failed_attempts IS 'Número de tentativas incorretas consecutivas de digitação de PIN';
COMMENT ON COLUMN public.admin_pins.locked_until IS 'Data/hora até a qual a autenticação do PIN está bloqueada temporariamente';
COMMENT ON COLUMN public.admin_pins.last_attempt_at IS 'Data/hora do último teste de PIN realizado';
