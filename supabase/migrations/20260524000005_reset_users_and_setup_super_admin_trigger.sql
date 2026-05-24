-- ============================================================
-- Migration: 20260524000005_reset_users_and_setup_super_admin_trigger.sql
-- Objetivo: 1. Apagar de forma limpa todos os usuários cadastrados legados.
--           2. Criar uma trigger de uso único que promove o primeiro
--              usuário a se cadastrar na plataforma a super_admin master.
--           3. Gerar seu PIN de admin inicial nativamente com pgcrypto.
-- ============================================================

-- Ativar pgcrypto se não estiver ativo (essencial para crypt/gen_salt)
CREATE EXTENSION IF NOT EXISTS pgcrypto SCHEMA public;

-- 1. Apagar fisicamente todos os usuários existentes em cascata
--    (limpa auth.users, public.profiles, public.user_roles, public.admin_pins)
TRUNCATE auth.users CASCADE;

-- 2. Criar a função da trigger de promoção a super_admin
CREATE OR REPLACE FUNCTION public.promote_first_user_to_super_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_has_super_admin BOOLEAN;
  v_default_pin_hash TEXT;
BEGIN
  -- Verificar se já existe algum super_admin no banco
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE role = 'super_admin'
  ) INTO v_has_super_admin;

  -- Se não existir nenhum super_admin, promove o novo usuário (uso único)
  IF NOT v_has_super_admin THEN
    -- A) Inserir na tabela de user_roles como super_admin
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, 'super_admin')
    ON CONFLICT (user_id, role) DO NOTHING;

    -- B) Gerar o hash do PIN padrão '12345678' nativamente via pgcrypto
    v_default_pin_hash := crypt('12345678', gen_salt('bf', 10));

    -- C) Inserir o PIN na tabela admin_pins
    INSERT INTO public.admin_pins (user_id, hashed_pin)
    VALUES (NEW.user_id, v_default_pin_hash)
    ON CONFLICT (user_id) DO UPDATE SET hashed_pin = v_default_pin_hash;

    RAISE NOTICE 'Primeiro usuario (%) promovido a super_admin com PIN inicial 12345678.', NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$;

-- 3. Criar a trigger na tabela public.profiles
DROP TRIGGER IF EXISTS trg_promote_first_user ON public.profiles;
CREATE TRIGGER trg_promote_first_user
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.promote_first_user_to_super_admin();
