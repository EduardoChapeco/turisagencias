-- ============================================================
-- Migration: 20260524000004_update_submit_traveler_form.sql
-- Objetivo: Redefinir a RPC submit_traveler_form para aceitar todos
--           os 17 parâmetros do formulário e salvar RG, Passaporte,
--           Contatos de Emergência e Preferências (Milhas/Assento/Refeição).
-- ============================================================

-- Dropar versões antigas com cascata para limpar assinaturas incompatíveis
DROP FUNCTION IF EXISTS public.submit_traveler_form(UUID, TEXT, TEXT, DATE, TEXT, TEXT, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.submit_traveler_form(UUID, TEXT, TEXT, DATE, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, DATE, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) CASCADE;

CREATE OR REPLACE FUNCTION public.submit_traveler_form(
  _token UUID,
  _full_name TEXT,
  _cpf TEXT DEFAULT NULL,
  _birth_date DATE DEFAULT NULL,
  _gender TEXT DEFAULT NULL,
  _nationality TEXT DEFAULT NULL,
  _phone TEXT DEFAULT NULL,
  _email TEXT DEFAULT NULL,
  _rg TEXT DEFAULT NULL,
  _passport_number TEXT DEFAULT NULL,
  _passport_expiry DATE DEFAULT NULL,
  _emergency_contact_name TEXT DEFAULT NULL,
  _emergency_contact_phone TEXT DEFAULT NULL,
  _special_needs TEXT DEFAULT NULL,
  _seat_preference TEXT DEFAULT NULL,
  _meal_preference TEXT DEFAULT NULL,
  _loyalty_programs TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _traveler_id UUID;
BEGIN
  UPDATE public.travelers
  SET
    full_name = COALESCE(_full_name, full_name),
    cpf = COALESCE(_cpf, cpf),
    birth_date = COALESCE(_birth_date, birth_date),
    gender = COALESCE(_gender, gender),
    nationality = COALESCE(_nationality, nationality),
    phone = COALESCE(_phone, phone),
    email = COALESCE(_email, email),
    rg = COALESCE(_rg, rg),
    passport_number = COALESCE(_passport_number, passport_number),
    passport_expiry = COALESCE(_passport_expiry, passport_expiry),
    emergency_contact_name = COALESCE(_emergency_contact_name, emergency_contact_name),
    emergency_contact_phone = COALESCE(_emergency_contact_phone, emergency_contact_phone),
    special_needs = COALESCE(_special_needs, special_needs),
    -- Preferências salvas estruturadas dentro do campo JSONB frequent_flyer
    frequent_flyer = jsonb_build_object(
      'seat_preference', COALESCE(_seat_preference, ''),
      'meal_preference', COALESCE(_meal_preference, ''),
      'loyalty_programs', COALESCE(_loyalty_programs, '')
    ),
    form_completed_at = now()
  WHERE form_token = _token
  RETURNING id INTO _traveler_id;

  RETURN _traveler_id;
END;
$$;

-- Permissões
GRANT EXECUTE ON FUNCTION public.submit_traveler_form TO anon, authenticated;
