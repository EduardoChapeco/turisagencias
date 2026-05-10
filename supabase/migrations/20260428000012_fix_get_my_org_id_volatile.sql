-- =====================================================================
-- MIGRAÇÃO: 20260428000012_fix_get_my_org_id_volatile
-- Corrige a função `get_my_org_id()` que foi declarada como STABLE, mas
-- internamente chama `SET LOCAL row_security = OFF`, o que não é 
-- permitido pelo PostgreSQL dentro de funções STABLE/IMMUTABLE.
-- =====================================================================

DROP FUNCTION IF EXISTS public.get_my_org_id() CASCADE;

CREATE OR REPLACE FUNCTION public.get_my_org_id()
RETURNS UUID
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id UUID;
BEGIN
  -- Temporarily disable RLS for this session scope to safely read profiles
  -- This prevents the recursion: policy -> get_my_org_id -> profiles -> policy
  SET LOCAL row_security = OFF;
  
  SELECT org_id INTO v_org_id
  FROM public.profiles
  WHERE user_id = auth.uid()
  LIMIT 1;
  
  RETURN v_org_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_my_org_id() TO authenticated;
