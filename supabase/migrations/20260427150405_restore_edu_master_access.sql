-- OMEGA v5.0: restore real master access for the audited owner account.
-- Keeps get_my_org_id() scoped to the linked organization; super_admin
-- recovery is handled through explicit SELECT policies only.

DO $$
DECLARE
  v_user_id uuid;
  v_org_id uuid;
BEGIN
  SELECT id
    INTO v_user_id
  FROM auth.users
  WHERE lower(email) = lower('eusoueduoficial@gmail.com')
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User eusoueduoficial@gmail.com not found';
  END IF;

  SELECT id
    INTO v_org_id
  FROM public.organizations
  WHERE slug = 'excelencia-tour-chapeco'
  LIMIT 1;

  IF v_org_id IS NULL THEN
    SELECT id
      INTO v_org_id
    FROM public.organizations
    WHERE slug ILIKE 'excelencia-tour%'
    ORDER BY created_at ASC
    LIMIT 1;
  END IF;

  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Organization excelencia-tour-chapeco not found';
  END IF;

  INSERT INTO public.profiles (user_id, email, first_name, last_name, org_id)
  VALUES (v_user_id, 'eusoueduoficial@gmail.com', '', '', v_org_id)
  ON CONFLICT (user_id) DO UPDATE
    SET org_id = excluded.org_id,
        email = COALESCE(public.profiles.email, excluded.email),
        updated_at = now();

  INSERT INTO public.user_roles (user_id, role)
  VALUES
    (v_user_id, 'agent'),
    (v_user_id, 'org_admin'),
    (v_user_id, 'super_admin')
  ON CONFLICT (user_id, role) DO NOTHING;
END $$;

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
