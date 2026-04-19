
DROP POLICY "Authenticated users can create orgs" ON public.organizations;

DROP POLICY IF EXISTS "Users without org can create one" ON public.organizations;
DROP POLICY IF EXISTS "Users without org can create one" ON public.organizations;
DROP POLICY IF EXISTS "Users without org can create one" ON public.organizations;
DROP POLICY IF EXISTS "Users without org can create one" ON public.organizations;
CREATE POLICY "Users without org can create one" ON public.organizations FOR INSERT
  TO authenticated
  WITH CHECK (public.get_my_org_id() IS NULL);
