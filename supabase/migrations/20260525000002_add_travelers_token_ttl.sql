-- ───────────────────────────────────────────────────────────
-- OMEGA v6.0 Sprint 1 - Segurança de Magic Link de Viajantes (TTL e Expirabilidade)
-- ───────────────────────────────────────────────────────────

-- 1. Adicionar coluna de expiração do token na tabela public.travelers
ALTER TABLE public.travelers 
ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMPTZ DEFAULT (now() + interval '7 days');

-- 2. Redefinir a RPC get_traveler_by_token para verificar expiração
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
  loyalty_programs TEXT,
  token_expires_at TIMESTAMPTZ
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
    COALESCE(t.frequent_flyer->>'loyalty_programs', '') AS loyalty_programs,
    t.token_expires_at
  FROM public.travelers t
  WHERE t.form_token = _token
    AND (t.token_expires_at IS NULL OR t.token_expires_at > now());
END;
$$;

-- 3. Redefinir a RPC submit_traveler_form para validar a expiração antes de atualizar
DROP FUNCTION IF EXISTS public.submit_traveler_form(
  UUID, TEXT, TEXT, DATE, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, DATE, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT
);
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
  _expires_at TIMESTAMPTZ;
BEGIN
  -- Buscar expiração do token
  SELECT token_expires_at INTO _expires_at 
  FROM public.travelers 
  WHERE form_token = _token;

  IF _expires_at IS NOT NULL AND _expires_at < now() THEN
    RAISE EXCEPTION 'Este link expirou. Por favor solicite um novo acesso.';
  END IF;

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
    frequent_flyer = jsonb_build_object(
      'seat_preference', COALESCE(_seat_preference, ''),
      'meal_preference', COALESCE(_meal_preference, ''),
      'loyalty_programs', COALESCE(_loyalty_programs, '')
    ),
    form_completed_at = now(),
    -- Uso único: encurtar a expiração do token pós preenchimento para segurança extra (2 horas)
    token_expires_at = now() + interval '2 hours'
  WHERE form_token = _token
  RETURNING id INTO _traveler_id;

  RETURN _traveler_id;
END;
$$;
