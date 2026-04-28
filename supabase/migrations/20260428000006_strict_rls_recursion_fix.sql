-- Fix infinite recursion in profiles_select
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;

CREATE POLICY "profiles_select"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    -- Own profile
    auth.uid() = user_id
    -- OR same org teammate (via SECURITY DEFINER function to prevent recursion)
    OR (
      org_id IS NOT NULL
      AND org_id = public.get_my_org_id()
    )
    -- OR super_admin (direct query on user_roles)
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'super_admin'
    )
  );
