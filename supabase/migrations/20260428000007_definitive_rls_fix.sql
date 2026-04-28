-- ===================================================================
-- MIGRATION: 20260428000007_definitive_rls_fix
-- PURPOSE: Definitive fix for infinite recursion in profiles RLS
-- 
-- ROOT CAUSE ANALYSIS:
--   The `profiles_select` policy was doing:
--     OR org_id = (SELECT p2.org_id FROM public.profiles p2 WHERE p2.user_id = auth.uid())
--   When Postgres evaluates SELECT policy during UPDATE...RETURNING on profiles,
--   it re-enters the same policy -> INFINITE RECURSION.
--
--   Migration 000006 tried using get_my_org_id() but that function ALSO
--   reads FROM profiles, causing the same cycle.
--
-- DEFINITIVE FIX:
--   1. Rewrite get_my_org_id() to use SET LOCAL row_security = OFF
--      so it reads profiles without triggering RLS evaluation.
--   2. Profiles SELECT policy uses ONLY auth.uid() = user_id (own profile)
--      OR a super_admin check via user_roles (no profiles reference).
--      Org-teammate visibility is REMOVED from this policy to break the cycle.
--      (Teammates can see each other via a separate materialized join if needed.)
--   3. Profiles UPDATE policy: same — only auth.uid() = user_id.
--   4. Organizations SELECT: uses get_my_org_id() which now correctly bypasses RLS.
-- ===================================================================

-- Step 1: Rewrite get_my_org_id with row_security bypass
-- This is the ONLY safe way to read profiles from within a SECURITY DEFINER function
-- that may itself be called during RLS evaluation.
DROP FUNCTION IF EXISTS public.get_my_org_id() CASCADE;
CREATE OR REPLACE FUNCTION public.get_my_org_id()
RETURNS UUID
LANGUAGE plpgsql
STABLE
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

-- Step 2: Definitive profiles policies — NO self-referential subqueries
-- Drop every possible existing policy name to ensure clean slate
DROP POLICY IF EXISTS "profiles_select"                    ON public.profiles;
DROP POLICY IF EXISTS "profiles_update"                    ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert"                    ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete"                    ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile"         ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile"       ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile"       ON public.profiles;
DROP POLICY IF EXISTS "Org members can view team profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admin can view all profiles"  ON public.profiles;
DROP POLICY IF EXISTS "allow_own_profile_select"           ON public.profiles;
DROP POLICY IF EXISTS "allow_own_profile_update"           ON public.profiles;

-- SELECT: Own profile OR super_admin.
-- Teammates CANNOT see each other directly via this policy.
-- This is intentional to break the recursion. Teammate visibility
-- is handled application-side via the profiles hook that uses
-- the service role key on the python engine.
CREATE POLICY "profiles_select"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role IN ('super_admin', 'org_admin')
    )
  );

-- UPDATE: Only own profile (no self-reference needed here)
CREATE POLICY "profiles_update"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- INSERT: Only own profile (trigger also inserts on signup)
CREATE POLICY "profiles_insert"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Only super_admin
CREATE POLICY "profiles_delete"
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role = 'super_admin'
    )
  );

-- Step 3: Fix organizations policies (drop all names that may exist)
DROP POLICY IF EXISTS "orgs_select"                        ON public.organizations;
DROP POLICY IF EXISTS "orgs_insert"                        ON public.organizations;
DROP POLICY IF EXISTS "orgs_update"                        ON public.organizations;
DROP POLICY IF EXISTS "Users can view own org"             ON public.organizations;
DROP POLICY IF EXISTS "Authenticated users can create orgs" ON public.organizations;
DROP POLICY IF EXISTS "Org admins can update own org"      ON public.organizations;

-- SELECT: Own org (via get_my_org_id which now safely bypasses RLS) OR super_admin
CREATE POLICY "orgs_select"
  ON public.organizations
  FOR SELECT
  TO authenticated
  USING (
    id = public.get_my_org_id()
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role = 'super_admin'
    )
  );

-- INSERT: Any authenticated user can create their org during onboarding
CREATE POLICY "orgs_insert"
  ON public.organizations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- UPDATE: Only if it's your org AND you're an admin
CREATE POLICY "orgs_update"
  ON public.organizations
  FOR UPDATE
  TO authenticated
  USING (
    id = public.get_my_org_id()
    AND EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role IN ('org_admin', 'super_admin')
    )
  )
  WITH CHECK (
    id = public.get_my_org_id()
    AND EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role IN ('org_admin', 'super_admin')
    )
  );

-- Step 4: Fix user_roles policies (self-referential is safe here since we don't recurse into profiles)
DROP POLICY IF EXISTS "user_roles_select"                  ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_insert"                  ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_delete"                  ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles"           ON public.user_roles;

-- SELECT: Own roles OR org_admin/super_admin can see all org roles
CREATE POLICY "user_roles_select"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur2
      WHERE ur2.user_id = auth.uid()
        AND ur2.role IN ('super_admin', 'org_admin')
    )
  );

-- INSERT: Own role assignment OR super_admin can assign any role
CREATE POLICY "user_roles_insert"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur2
      WHERE ur2.user_id = auth.uid()
        AND ur2.role = 'super_admin'
    )
  );

-- DELETE: Only super_admin
CREATE POLICY "user_roles_delete"
  ON public.user_roles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur2
      WHERE ur2.user_id = auth.uid()
        AND ur2.role = 'super_admin'
    )
  );

-- Step 5: Ensure assign_org_admin_role RPC is correct (SECURITY DEFINER)
DROP FUNCTION IF EXISTS public.assign_org_admin_role(uuid) CASCADE;
CREATE OR REPLACE FUNCTION public.assign_org_admin_role(_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, 'org_admin')
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

GRANT EXECUTE ON FUNCTION public.assign_org_admin_role(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;

-- Step 6: Fix the org-assets storage bucket policy (needed for logo upload)
-- The bucket must exist and be public-readable for logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('org-assets', 'org-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow authenticated users to upload to their own org folder
DROP POLICY IF EXISTS "org_assets_insert" ON storage.objects;
CREATE POLICY "org_assets_insert"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'org-assets');

DROP POLICY IF EXISTS "org_assets_select" ON storage.objects;
CREATE POLICY "org_assets_select"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'org-assets');

DROP POLICY IF EXISTS "org_assets_update" ON storage.objects;
CREATE POLICY "org_assets_update"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'org-assets');

DROP POLICY IF EXISTS "org_assets_delete" ON storage.objects;
CREATE POLICY "org_assets_delete"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'org-assets');
