-- Migration: Master Admin Trigger & Cleanup
-- Reseta contas e cria gatilho para o primeiro usuário ser master admin com uma organização.

-- 1. DROP do trigger antigo e da função
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 2. Limpar contas anteriores (Reset Parcial)
-- Cuidado: O uso de DELETE em auth.users pode falhar se tabelas filhas não tiverem CASCADE.
-- Usaremos um bloco seguro.
DO $$
BEGIN
  -- Tentar deletar as contas. O supabase default profile table já tem CASCADE.
  DELETE FROM auth.users;
  -- Remover também as organizações antigas para começar do zero (cuidado se houver trips atreladas)
  DELETE FROM public.organizations;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Falha ao apagar auth.users, continuando com os usuários existentes.';
END $$;

-- 3. Criar a nova função inteligente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_count int;
  v_org_id uuid;
  v_role text;
BEGIN
  -- Contar quantos usuários existem na auth.users.
  SELECT COUNT(*) INTO v_user_count FROM auth.users;
  
  -- Como o trigger é AFTER INSERT, o v_user_count será no mínimo 1 (o próprio usuário)
  IF v_user_count <= 1 THEN
    -- Primeiro usuário: Cria uma organização MASTER
    INSERT INTO public.organizations (name, max_users, plan)
    VALUES ('Excelência Tour', 999, 'enterprise')
    RETURNING id INTO v_org_id;
    
    v_role := 'admin';
  ELSE
    -- Pega a organização primária (a primeira criada) para não dar erro de RLS/Foreign Key
    SELECT id INTO v_org_id FROM public.organizations ORDER BY created_at ASC LIMIT 1;
    v_role := 'agent';
  END IF;

  -- Criar o profile atrelando à organização e extraindo o nome
  INSERT INTO public.profiles (user_id, first_name, last_name, org_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    v_org_id
  )
  ON CONFLICT (user_id) DO UPDATE
    SET first_name = COALESCE(EXCLUDED.first_name, public.profiles.first_name),
        org_id = COALESCE(EXCLUDED.org_id, public.profiles.org_id);

  -- Definir a role apropriada (admin para o primeiro, agent para os outros)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, v_role)
  ON CONFLICT (user_id, role) DO UPDATE SET role = EXCLUDED.role;

  -- Adicionar a flag de admin no meta_data da auth.users para garantir by-pass no frontend e edge functions
  IF v_role = 'admin' THEN
    UPDATE auth.users 
    SET raw_user_meta_data = jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{is_admin}', 'true'::jsonb)
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
EXCEPTION WHEN others THEN
  -- Evitar que erro no trigger impeça a criação no Gotrue
  RAISE WARNING '[handle_new_user] falhou: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- 4. Anexar o trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
