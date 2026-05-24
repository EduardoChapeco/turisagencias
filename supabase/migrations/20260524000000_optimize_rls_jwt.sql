-- =====================================================================
-- MIGRAÇÃO: 20260524000000_optimize_rls_jwt
-- OBJETIVO:
--   Otimizar consultas RLS eliminando subqueries redundantes na tabela profiles.
--   A função get_my_org_id() agora prioriza a extração do org_id do JWT em memória.
-- =====================================================================

-- 1. Trigger de Sincronização Automática
CREATE OR REPLACE FUNCTION public.sync_user_org_id_to_auth()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.org_id IS NOT NULL THEN
      UPDATE auth.users
      SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('org_id', NEW.org_id)
      WHERE id = NEW.user_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.org_id IS DISTINCT FROM OLD.org_id THEN
      UPDATE auth.users
      SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('org_id', NEW.org_id)
      WHERE id = NEW.user_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_profile_org_id ON public.profiles;
CREATE TRIGGER trg_sync_profile_org_id
  AFTER INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_org_id_to_auth();

-- 2. Migração retroativa de usuários existentes
UPDATE auth.users u
SET raw_user_meta_data = COALESCE(u.raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('org_id', p.org_id)
FROM public.profiles p
WHERE p.user_id = u.id AND p.org_id IS NOT NULL;

-- 3. Reescrever get_my_org_id() com prioridade para o JWT
CREATE OR REPLACE FUNCTION public.get_my_org_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id_str text;
  v_org_id uuid;
BEGIN
  -- Tentar ler do JWT (altíssima performance, 0 consultas ao banco)
  v_org_id_str := auth.jwt() -> 'user_metadata' ->> 'org_id';
  IF v_org_id_str IS NOT NULL AND v_org_id_str != '' THEN
    BEGIN
      RETURN v_org_id_str::uuid;
    EXCEPTION WHEN OTHERS THEN
      -- Se a conversão falhar, continua para o fallback
    END;
  END IF;

  -- Fallback: Consulta tradicional (apenas se não estiver no JWT)
  SET LOCAL row_security = OFF;
  SELECT org_id INTO v_org_id
  FROM public.profiles
  WHERE user_id = auth.uid()
  LIMIT 1;
  
  RETURN v_org_id;
END;
$$;
