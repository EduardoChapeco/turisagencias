-- =====================================================================
-- MIGRAÇÃO: 20260428000008_nuclear_rls_fix
-- DIAGNÓSTICO FORENSE CONFIRMADO:
--
-- RECURSÃO EM user_roles:
--   profiles_select contém: EXISTS (SELECT FROM user_roles WHERE role IN (...))
--   user_roles_select contém: EXISTS (SELECT FROM user_roles ur2 WHERE role IN (...))
--
--   FLUXO DO LOOP:
--   UPDATE profiles RETURNING *
--   → Postgres avalia profiles_select no row retornado
--   → profiles_select faz EXISTS (...FROM user_roles...)
--   → Postgres avalia user_roles_select para cada row de user_roles
--   → user_roles_select faz EXISTS (...FROM user_roles ur2...)  ← SELF-REFERENTIAL
--   → Postgres avalia user_roles_select novamente → LOOP INFINITO
--
-- SOLUÇÃO DEFINITIVA:
--   1. Destruir TODAS as políticas nas 3 tabelas críticas via DO loop dinâmico
--   2. Recriar get_my_org_id() com SET LOCAL row_security = OFF (PL/pgSQL)
--   3. Criar has_org_role() com SET LOCAL row_security = OFF
--   4. profiles_select: APENAS auth.uid() = user_id  ← ZERO referências externas
--   5. user_roles_select: APENAS auth.uid() = user_id ← ZERO referências a si mesmo
--   6. Acesso admin via SECURITY DEFINER functions exclusivamente
-- =====================================================================

-- ====================================================================
-- FASE 1: DESTRUIÇÃO TOTAL DE TODAS AS POLÍTICAS NAS TABELAS CRÍTICAS
-- ====================================================================
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename IN ('profiles', 'organizations', 'user_roles')
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON public.%I CASCADE',
      pol.policyname,
      pol.tablename
    );
    RAISE NOTICE 'Dropped policy "%" on "%"', pol.policyname, pol.tablename;
  END LOOP;
END;
$$;

-- ====================================================================
-- FASE 2: DESABILITAR RLS TEMPORARIAMENTE (para operações limpas)
-- ====================================================================
ALTER TABLE IF EXISTS public.profiles     DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_roles   DISABLE ROW LEVEL SECURITY;

-- ====================================================================
-- FASE 3: REESCREVER FUNÇÕES HELPER COM BYPASS TOTAL DE RLS
-- ====================================================================

-- Remover versões antigas de TODAS as variantes conhecidas
DROP FUNCTION IF EXISTS public.get_my_org_id() CASCADE;
DROP FUNCTION IF EXISTS public.has_role(uuid, text) CASCADE;
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role) CASCADE;
DROP FUNCTION IF EXISTS public.has_role(text) CASCADE;
DROP FUNCTION IF EXISTS public.is_super_admin() CASCADE;
DROP FUNCTION IF EXISTS public.current_user_role() CASCADE;
DROP FUNCTION IF EXISTS public.get_user_org_id(uuid) CASCADE;

-- FUNÇÃO PRINCIPAL: get_my_org_id()
-- Usa SET LOCAL row_security = OFF para NUNCA disparar RLS ao ler profiles
-- Isso quebra o ciclo definitivamente
CREATE OR REPLACE FUNCTION public.get_my_org_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id uuid;
BEGIN
  -- CRÍTICO: Desabilitar RLS para esta transação local
  -- Sem isso, ler profiles dentro da função ativaria as policies de profiles
  -- que por sua vez chamariam esta função → loop infinito
  SET LOCAL row_security = OFF;
  
  SELECT org_id INTO v_org_id
  FROM public.profiles
  WHERE user_id = auth.uid()
  LIMIT 1;
  
  RETURN v_org_id;
END;
$$;

-- FUNÇÃO: has_role - verifica papel sem disparar RLS em user_roles
-- Parâmetros compatíveis com o tipo app_role real do schema
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_exists boolean;
BEGIN
  -- CRÍTICO: Desabilitar RLS para não ativar user_roles_select
  SET LOCAL row_security = OFF;
  
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
    AND role = _role
  ) INTO v_exists;
  
  RETURN COALESCE(v_exists, false);
END;
$$;

-- FUNÇÃO: assign_org_admin_role - RPC seguro para onboarding
-- SECURITY DEFINER bypassa RLS completamente para o insert
DROP FUNCTION IF EXISTS public.assign_org_admin_role(uuid) CASCADE;
CREATE OR REPLACE FUNCTION public.assign_org_admin_role(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  SET LOCAL row_security = OFF;
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, 'org_admin')
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

-- Grants
GRANT EXECUTE ON FUNCTION public.get_my_org_id()                 TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role)        TO authenticated;
GRANT EXECUTE ON FUNCTION public.assign_org_admin_role(uuid)     TO authenticated;

-- ====================================================================
-- FASE 4: HABILITAR RLS COM POLÍTICAS ANTI-RECURSIVAS
-- ====================================================================

-- ==================== TABELA: profiles ====================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- SELECT: APENAS o próprio usuário vê seu próprio profile
-- NENHUMA referência a user_roles, NENHUMA subquery em profiles
-- Super admins precisam usar has_role() via service role key
CREATE POLICY "profiles_own_select"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- UPDATE: APENAS o próprio usuário atualiza seu profile
CREATE POLICY "profiles_own_update"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- INSERT: O trigger handle_new_user insere via SECURITY DEFINER (bypassa RLS)
-- Esta policy é necessária para caso de insert direto (ex: onboarding edge cases)
CREATE POLICY "profiles_own_insert"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Desabilitado para usuários normais (apenas service role)
-- (não criar policy de delete para autenticados = nenhum autenticado pode deletar)

-- ==================== TABELA: organizations ====================
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- SELECT: Membro vê sua própria org (get_my_org_id usa SET LOCAL row_security=OFF)
-- OU super_admin (has_role usa SET LOCAL row_security=OFF)
-- ZERO recursão: as funções SECURITY DEFINER não disparam mais as policies
CREATE POLICY "orgs_member_select"
  ON public.organizations
  FOR SELECT
  TO authenticated
  USING (
    id = public.get_my_org_id()
    OR public.has_role(auth.uid(), 'super_admin')
  );

-- INSERT: Qualquer autenticado pode criar organização (onboarding)
CREATE POLICY "orgs_insert"
  ON public.organizations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- UPDATE: Apenas org_admin ou super_admin da própria org pode atualizar
CREATE POLICY "orgs_admin_update"
  ON public.organizations
  FOR UPDATE
  TO authenticated
  USING (
    id = public.get_my_org_id()
    AND (
      public.has_role(auth.uid(), 'org_admin')
      OR public.has_role(auth.uid(), 'super_admin')
    )
  )
  WITH CHECK (
    id = public.get_my_org_id()
    AND (
      public.has_role(auth.uid(), 'org_admin')
      OR public.has_role(auth.uid(), 'super_admin')
    )
  );

-- DELETE: Apenas super_admin
CREATE POLICY "orgs_super_delete"
  ON public.organizations
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

-- ==================== TABELA: user_roles ====================
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- SELECT: APENAS os próprios roles do usuário
-- ZERO referência a user_roles dentro desta policy → ZERO recursão
CREATE POLICY "user_roles_own_select"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- INSERT: Usuário pode inserir apenas seu próprio role durante onboarding
-- Mas assign_org_admin_role() é SECURITY DEFINER e bypassa RLS, então
-- este é apenas para edge cases de insert direto
CREATE POLICY "user_roles_own_insert"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Apenas service role (não criar policy para autenticados)
-- DELETE: Apenas service role (não criar policy para autenticados)

-- ====================================================================
-- FASE 5: GARANTIR TRIGGER DE CRIAÇÃO DE PROFILE NO SIGNUP
-- ====================================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- SECURITY DEFINER bypassa RLS — profile é criado sem acionar policies
  INSERT INTO public.profiles (user_id, first_name, last_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  )
  ON CONFLICT (user_id) DO UPDATE
    SET first_name = COALESCE(EXCLUDED.first_name, public.profiles.first_name);

  -- Role padrão: agent
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'agent')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
EXCEPTION WHEN others THEN
  -- NUNCA falhar o signup por causa do perfil
  RAISE WARNING '[handle_new_user] failed silently: %', SQLERRM;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ====================================================================
-- FASE 6: STORAGE BUCKET para logos de org
-- ====================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('org-assets', 'org-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Limpar policies antigas do storage
DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname LIKE 'org_assets%'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
  END LOOP;
END;
$$;

CREATE POLICY "org_assets_insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'org-assets');

CREATE POLICY "org_assets_select"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'org-assets');

CREATE POLICY "org_assets_update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'org-assets');

CREATE POLICY "org_assets_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'org-assets');

-- ====================================================================
-- VERIFICAÇÃO FINAL
-- ====================================================================
DO $$
DECLARE
  rec RECORD;
BEGIN
  RAISE NOTICE '=== VERIFICAÇÃO DE POLÍTICAS RLS ===';
  FOR rec IN
    SELECT tablename, policyname, cmd
    FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename IN ('profiles', 'organizations', 'user_roles')
    ORDER BY tablename, policyname
  LOOP
    RAISE NOTICE 'Tabela: % | Policy: % | Cmd: %', rec.tablename, rec.policyname, rec.cmd;
  END LOOP;

  RAISE NOTICE '=== VERIFICAÇÃO DE RLS HABILITADO ===';
  FOR rec IN
    SELECT tablename, rowsecurity
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename IN ('profiles', 'organizations', 'user_roles')
  LOOP
    RAISE NOTICE 'Tabela: % | RLS: %', rec.tablename, rec.rowsecurity;
  END LOOP;
  RAISE NOTICE '=== FIM DA VERIFICAÇÃO ===';
END;
$$;
