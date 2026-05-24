-- ============================================================
-- Migration: 20260524000007_create_validate_traveler_token_rpc.sql
-- Objetivo: Criar uma RPC SECURITY DEFINER para buscar e validar um
--           viajante pelo token público de formulário, retornando
--           dados básicos e preexistentes de identificação.
-- ============================================================

DROP FUNCTION IF EXISTS public.get_traveler_by_token(UUID);

CREATE OR REPLACE FUNCTION public.get_traveler_by_token(_token UUID)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  form_completed_at TIMESTAMPTZ,
  birth_date DATE,
  cpf TEXT,
  gender TEXT,
  nationality TEXT,
  rg TEXT,
  passport_number TEXT,
  passport_expiry DATE,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  special_needs TEXT,
  seat_preference TEXT,
  meal_preference TEXT,
  loyalty_programs TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.full_name,
    t.email,
    t.phone,
    t.form_completed_at,
    t.birth_date,
    t.cpf,
    t.gender,
    t.nationality,
    t.rg,
    t.passport_number,
    t.passport_expiry,
    t.emergency_contact_name,
    t.emergency_contact_phone,
    t.special_needs,
    COALESCE(t.frequent_flyer->>'seat_preference', '') AS seat_preference,
    COALESCE(t.frequent_flyer->>'meal_preference', '') AS meal_preference,
    COALESCE(t.frequent_flyer->>'loyalty_programs', '') AS loyalty_programs
  FROM public.travelers t
  WHERE t.form_token = _token;
END;
$$;

-- Permissões
GRANT EXECUTE ON FUNCTION public.get_traveler_by_token(UUID) TO anon, authenticated;
