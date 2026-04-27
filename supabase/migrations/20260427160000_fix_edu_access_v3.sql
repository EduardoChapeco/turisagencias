-- OMEGA v5.0: Fixed master access for Eduardo (eusoueduoficial@gmail.com)
-- Removido a tentativa de inserir na coluna 'email' (que não existe em profiles)
-- Mantido o vínculo com a organização 'Excelência Tour'

DO $$
DECLARE
  v_user_id uuid;
  v_org_id uuid;
BEGIN
  -- 1. Buscar o ID do usuário pelo e-mail (tabela auth.users)
  SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = lower('eusoueduoficial@gmail.com') LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE NOTICE 'Usuário eusoueduoficial@gmail.com não encontrado. Pulando vinculação de perfil.';
  ELSE
    -- 2. Buscar o ID da organização 'Excelência Tour'
    SELECT id INTO v_org_id FROM public.organizations WHERE slug ILIKE 'excelencia-tour%' ORDER BY created_at ASC LIMIT 1;

    IF v_org_id IS NULL THEN
      RAISE NOTICE 'Organização Excelência Tour não encontrada. Criando placeholder se necessário.';
    END IF;

    -- 3. Garantir o perfil correto (sem a coluna email)
    INSERT INTO public.profiles (user_id, org_id, first_name, last_name)
    VALUES (v_user_id, v_org_id, 'Eduardo', 'Excelência')
    ON CONFLICT (user_id) DO UPDATE
    SET org_id = COALESCE(excluded.org_id, public.profiles.org_id),
        updated_at = now();

    -- 4. Garantir papéis administrativos
    INSERT INTO public.user_roles (user_id, role)
    VALUES 
      (v_user_id, 'agent'),
      (v_user_id, 'org_admin'),
      (v_user_id, 'super_admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE NOTICE 'Perfil e papéis de Eduardo atualizados com sucesso.';
  END IF;
END $$;

-- 5. Reforçar políticas de RLS para Super Admin
DROP POLICY IF EXISTS "Users can view own org" ON public.organizations;
CREATE POLICY "Users can view own org"
  ON public.organizations
  FOR SELECT
  TO authenticated
  USING (
    id = public.get_my_org_id()
    OR public.has_role(auth.uid(), 'super_admin')
  );

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR public.has_role(auth.uid(), 'super_admin')
  );
