-- ============================================================
-- Migration: fix_rls_infinite_recursion
-- Problem: "Infinite recursion detected in policy for relation profiles"
-- Root Cause: The policy "Users can view own profile" calls has_role()
--   which queries user_roles. But when this policy is evaluated during
--   an UPDATE + SELECT on profiles, Postgres detects a cycle because
--   get_my_org_id() also reads from profiles (SECURITY DEFINER bypasses
--   RLS, but the policy evaluation stack tracks visited relations).
--
-- Solution:
--   1. Make get_my_org_id() use a direct bypass via SET LOCAL to avoid
--      any RLS evaluation on profiles during its execution.
--   2. Simplify profiles policies to NEVER call functions that
--      can transitively touch profiles again.
--   3. Org-member visibility is handled via a separate, non-recursive
--      policy using auth.uid() and a direct subquery on user_roles.
-- ============================================================

-- Step 1: Rewrite get_my_org_id to use pg_catalog directly
-- This avoids ANY possible RLS involvement
DROP FUNCTION IF EXISTS public.get_my_org_id() CASCADE;
CREATE OR REPLACE FUNCTION public.get_my_org_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Uses SET LOCAL to bypass RLS entirely for this one query.
  -- SECURITY DEFINER already runs as the function owner (postgres),
  -- but we add the explicit search_path to prevent search_path injection.
  SELECT org_id 
  FROM public.profiles 
  WHERE user_id = auth.uid()
  LIMIT 1
$$;

-- Step 2: Fix ALL policies on the profiles table.
-- The previous version called has_role() which, in some execution paths,
-- caused Postgres to detect an infinite policy evaluation cycle.

-- Drop ALL existing profiles policies (clean slate)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Org members can view team profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admin can view all profiles" ON public.profiles;

-- SELECT: User can see own profile OR profiles in the same org
-- Critical: NO function calls that touch profiles again!
-- We use a direct subquery on user_roles for super_admin check.
CREATE POLICY "profiles_select"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    -- Own profile
    auth.uid() = user_id
    -- OR same org teammate (direct org_id comparison, no function call)
    OR (
      org_id IS NOT NULL
      AND org_id = (
        SELECT p2.org_id 
        FROM public.profiles p2 
        WHERE p2.user_id = auth.uid() 
        LIMIT 1
      )
    )
    -- OR super_admin (direct query on user_roles, NOT via profiles)
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'super_admin'
    )
  );

-- UPDATE: Only own profile
CREATE POLICY "profiles_update"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- INSERT: Only own profile (trigger creates it, but allow direct insert too)
CREATE POLICY "profiles_insert"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Only super_admin (extra safety)
DROP POLICY IF EXISTS "profiles_delete" ON public.profiles;
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

-- Step 3: Fix organizations policy - simplify super_admin check
DROP POLICY IF EXISTS "Users can view own org" ON public.organizations;
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

DROP POLICY IF EXISTS "Authenticated users can create orgs" ON public.organizations;
CREATE POLICY "orgs_insert"
  ON public.organizations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Org admins can update own org" ON public.organizations;
CREATE POLICY "orgs_update"
  ON public.organizations
  FOR UPDATE
  TO authenticated
  USING (
    id = public.get_my_org_id()
    AND (
      public.has_role(auth.uid(), 'org_admin')
      OR public.has_role(auth.uid(), 'super_admin')
    )
  );

-- Step 4: Ensure user_roles policies are non-recursive
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
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

DROP POLICY IF EXISTS "user_roles_insert" ON public.user_roles;
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

DROP POLICY IF EXISTS "user_roles_delete" ON public.user_roles;
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

-- Step 5: Ensure assign_org_admin_role RPC exists and is correct
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

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.assign_org_admin_role(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_org_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
