-- =============================================
-- 1. ATTACH TRIGGERS TO auth.users
-- These functions exist but were NEVER connected!
-- =============================================

-- Drop if exists to be idempotent
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_first_user_promote ON auth.users;

-- Create profile + default 'agent' role on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Promote first user to super_admin + org_admin
DROP TRIGGER IF EXISTS on_first_user_promote ON auth.users;
DROP TRIGGER IF EXISTS on_first_user_promote ON auth.users;
CREATE TRIGGER on_first_user_promote AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.promote_first_user();

-- =============================================
-- 2. HARDEN RLS POLICIES: public → authenticated
-- =============================================

-- CLIENTS: drop public, recreate as authenticated
DROP POLICY IF EXISTS "Users can create clients in own org" ON public.clients;
DROP POLICY IF EXISTS "Users can view clients in own org" ON public.clients;
DROP POLICY IF EXISTS "Users can update clients in own org" ON public.clients;
DROP POLICY IF EXISTS "Users can delete clients in own org" ON public.clients;

DROP POLICY IF EXISTS "Users can view clients in own org" ON public.clients;
DROP POLICY IF EXISTS "Users can view clients in own org" ON public.clients;
DROP POLICY IF EXISTS "Users can view clients in own org" ON public.clients;
DROP POLICY IF EXISTS "Users can view clients in own org" ON public.clients;
CREATE POLICY "Users can view clients in own org" ON public.clients
  FOR SELECT TO authenticated USING (org_id = get_my_org_id());
DROP POLICY IF EXISTS "Users can create clients in own org" ON public.clients;
DROP POLICY IF EXISTS "Users can create clients in own org" ON public.clients;
DROP POLICY IF EXISTS "Users can create clients in own org" ON public.clients;
DROP POLICY IF EXISTS "Users can create clients in own org" ON public.clients;
CREATE POLICY "Users can create clients in own org" ON public.clients
  FOR INSERT TO authenticated WITH CHECK (org_id = get_my_org_id());
DROP POLICY IF EXISTS "Users can update clients in own org" ON public.clients;
DROP POLICY IF EXISTS "Users can update clients in own org" ON public.clients;
DROP POLICY IF EXISTS "Users can update clients in own org" ON public.clients;
DROP POLICY IF EXISTS "Users can update clients in own org" ON public.clients;
CREATE POLICY "Users can update clients in own org" ON public.clients
  FOR UPDATE TO authenticated USING (org_id = get_my_org_id()) WITH CHECK (org_id = get_my_org_id());
DROP POLICY IF EXISTS "Users can delete clients in own org" ON public.clients;
DROP POLICY IF EXISTS "Users can delete clients in own org" ON public.clients;
DROP POLICY IF EXISTS "Users can delete clients in own org" ON public.clients;
DROP POLICY IF EXISTS "Users can delete clients in own org" ON public.clients;
CREATE POLICY "Users can delete clients in own org" ON public.clients
  FOR DELETE TO authenticated USING (org_id = get_my_org_id());

-- QUOTATIONS
DROP POLICY IF EXISTS "Users can create quotations in own org" ON public.quotations;
DROP POLICY IF EXISTS "Users can view quotations in own org" ON public.quotations;
DROP POLICY IF EXISTS "Users can update quotations in own org" ON public.quotations;
DROP POLICY IF EXISTS "Users can delete quotations in own org" ON public.quotations;

DROP POLICY IF EXISTS "Users can view quotations in own org" ON public.quotations;
DROP POLICY IF EXISTS "Users can view quotations in own org" ON public.quotations;
DROP POLICY IF EXISTS "Users can view quotations in own org" ON public.quotations;
DROP POLICY IF EXISTS "Users can view quotations in own org" ON public.quotations;
CREATE POLICY "Users can view quotations in own org" ON public.quotations
  FOR SELECT TO authenticated USING (org_id = get_my_org_id());
DROP POLICY IF EXISTS "Users can create quotations in own org" ON public.quotations;
DROP POLICY IF EXISTS "Users can create quotations in own org" ON public.quotations;
DROP POLICY IF EXISTS "Users can create quotations in own org" ON public.quotations;
DROP POLICY IF EXISTS "Users can create quotations in own org" ON public.quotations;
CREATE POLICY "Users can create quotations in own org" ON public.quotations
  FOR INSERT TO authenticated WITH CHECK (org_id = get_my_org_id());
DROP POLICY IF EXISTS "Users can update quotations in own org" ON public.quotations;
DROP POLICY IF EXISTS "Users can update quotations in own org" ON public.quotations;
DROP POLICY IF EXISTS "Users can update quotations in own org" ON public.quotations;
DROP POLICY IF EXISTS "Users can update quotations in own org" ON public.quotations;
CREATE POLICY "Users can update quotations in own org" ON public.quotations
  FOR UPDATE TO authenticated USING (org_id = get_my_org_id()) WITH CHECK (org_id = get_my_org_id());
DROP POLICY IF EXISTS "Users can delete quotations in own org" ON public.quotations;
DROP POLICY IF EXISTS "Users can delete quotations in own org" ON public.quotations;
DROP POLICY IF EXISTS "Users can delete quotations in own org" ON public.quotations;
DROP POLICY IF EXISTS "Users can delete quotations in own org" ON public.quotations;
CREATE POLICY "Users can delete quotations in own org" ON public.quotations
  FOR DELETE TO authenticated USING (org_id = get_my_org_id());

-- TRAVELERS
DROP POLICY IF EXISTS "Users can create travelers in own org" ON public.travelers;
DROP POLICY IF EXISTS "Users can view travelers in own org" ON public.travelers;
DROP POLICY IF EXISTS "Users can update travelers in own org" ON public.travelers;
DROP POLICY IF EXISTS "Users can delete travelers in own org" ON public.travelers;

DROP POLICY IF EXISTS "Users can view travelers in own org" ON public.travelers;
DROP POLICY IF EXISTS "Users can view travelers in own org" ON public.travelers;
DROP POLICY IF EXISTS "Users can view travelers in own org" ON public.travelers;
DROP POLICY IF EXISTS "Users can view travelers in own org" ON public.travelers;
CREATE POLICY "Users can view travelers in own org" ON public.travelers
  FOR SELECT TO authenticated USING (org_id = get_my_org_id());
DROP POLICY IF EXISTS "Users can create travelers in own org" ON public.travelers;
DROP POLICY IF EXISTS "Users can create travelers in own org" ON public.travelers;
DROP POLICY IF EXISTS "Users can create travelers in own org" ON public.travelers;
DROP POLICY IF EXISTS "Users can create travelers in own org" ON public.travelers;
CREATE POLICY "Users can create travelers in own org" ON public.travelers
  FOR INSERT TO authenticated WITH CHECK (org_id = get_my_org_id());
DROP POLICY IF EXISTS "Users can update travelers in own org" ON public.travelers;
DROP POLICY IF EXISTS "Users can update travelers in own org" ON public.travelers;
DROP POLICY IF EXISTS "Users can update travelers in own org" ON public.travelers;
DROP POLICY IF EXISTS "Users can update travelers in own org" ON public.travelers;
CREATE POLICY "Users can update travelers in own org" ON public.travelers
  FOR UPDATE TO authenticated USING (org_id = get_my_org_id()) WITH CHECK (org_id = get_my_org_id());
DROP POLICY IF EXISTS "Users can delete travelers in own org" ON public.travelers;
DROP POLICY IF EXISTS "Users can delete travelers in own org" ON public.travelers;
DROP POLICY IF EXISTS "Users can delete travelers in own org" ON public.travelers;
DROP POLICY IF EXISTS "Users can delete travelers in own org" ON public.travelers;
CREATE POLICY "Users can delete travelers in own org" ON public.travelers
  FOR DELETE TO authenticated USING (org_id = get_my_org_id());

-- TRAVELER_DOCUMENTS
DROP POLICY IF EXISTS "Users can create docs in own org" ON public.traveler_documents;
DROP POLICY IF EXISTS "Users can view docs in own org" ON public.traveler_documents;
DROP POLICY IF EXISTS "Users can update docs in own org" ON public.traveler_documents;
DROP POLICY IF EXISTS "Users can delete docs in own org" ON public.traveler_documents;

DROP POLICY IF EXISTS "Users can view docs in own org" ON public.traveler_documents;
DROP POLICY IF EXISTS "Users can view docs in own org" ON public.traveler_documents;
DROP POLICY IF EXISTS "Users can view docs in own org" ON public.traveler_documents;
DROP POLICY IF EXISTS "Users can view docs in own org" ON public.traveler_documents;
CREATE POLICY "Users can view docs in own org" ON public.traveler_documents
  FOR SELECT TO authenticated USING (org_id = get_my_org_id());
DROP POLICY IF EXISTS "Users can create docs in own org" ON public.traveler_documents;
DROP POLICY IF EXISTS "Users can create docs in own org" ON public.traveler_documents;
DROP POLICY IF EXISTS "Users can create docs in own org" ON public.traveler_documents;
DROP POLICY IF EXISTS "Users can create docs in own org" ON public.traveler_documents;
CREATE POLICY "Users can create docs in own org" ON public.traveler_documents
  FOR INSERT TO authenticated WITH CHECK (org_id = get_my_org_id());
DROP POLICY IF EXISTS "Users can update docs in own org" ON public.traveler_documents;
DROP POLICY IF EXISTS "Users can update docs in own org" ON public.traveler_documents;
DROP POLICY IF EXISTS "Users can update docs in own org" ON public.traveler_documents;
DROP POLICY IF EXISTS "Users can update docs in own org" ON public.traveler_documents;
CREATE POLICY "Users can update docs in own org" ON public.traveler_documents
  FOR UPDATE TO authenticated USING (org_id = get_my_org_id()) WITH CHECK (org_id = get_my_org_id());
DROP POLICY IF EXISTS "Users can delete docs in own org" ON public.traveler_documents;
DROP POLICY IF EXISTS "Users can delete docs in own org" ON public.traveler_documents;
DROP POLICY IF EXISTS "Users can delete docs in own org" ON public.traveler_documents;
DROP POLICY IF EXISTS "Users can delete docs in own org" ON public.traveler_documents;
CREATE POLICY "Users can delete docs in own org" ON public.traveler_documents
  FOR DELETE TO authenticated USING (org_id = get_my_org_id());

-- TRAVEL_GROUPS
DROP POLICY IF EXISTS "Users can create groups in own org" ON public.travel_groups;
DROP POLICY IF EXISTS "Users can view groups in own org" ON public.travel_groups;
DROP POLICY IF EXISTS "Users can update groups in own org" ON public.travel_groups;
DROP POLICY IF EXISTS "Users can delete groups in own org" ON public.travel_groups;

DROP POLICY IF EXISTS "Users can view groups in own org" ON public.travel_groups;
DROP POLICY IF EXISTS "Users can view groups in own org" ON public.travel_groups;
DROP POLICY IF EXISTS "Users can view groups in own org" ON public.travel_groups;
DROP POLICY IF EXISTS "Users can view groups in own org" ON public.travel_groups;
CREATE POLICY "Users can view groups in own org" ON public.travel_groups
  FOR SELECT TO authenticated USING (org_id = get_my_org_id());
DROP POLICY IF EXISTS "Users can create groups in own org" ON public.travel_groups;
DROP POLICY IF EXISTS "Users can create groups in own org" ON public.travel_groups;
DROP POLICY IF EXISTS "Users can create groups in own org" ON public.travel_groups;
DROP POLICY IF EXISTS "Users can create groups in own org" ON public.travel_groups;
CREATE POLICY "Users can create groups in own org" ON public.travel_groups
  FOR INSERT TO authenticated WITH CHECK (org_id = get_my_org_id());
DROP POLICY IF EXISTS "Users can update groups in own org" ON public.travel_groups;
DROP POLICY IF EXISTS "Users can update groups in own org" ON public.travel_groups;
DROP POLICY IF EXISTS "Users can update groups in own org" ON public.travel_groups;
DROP POLICY IF EXISTS "Users can update groups in own org" ON public.travel_groups;
CREATE POLICY "Users can update groups in own org" ON public.travel_groups
  FOR UPDATE TO authenticated USING (org_id = get_my_org_id()) WITH CHECK (org_id = get_my_org_id());
DROP POLICY IF EXISTS "Users can delete groups in own org" ON public.travel_groups;
DROP POLICY IF EXISTS "Users can delete groups in own org" ON public.travel_groups;
DROP POLICY IF EXISTS "Users can delete groups in own org" ON public.travel_groups;
DROP POLICY IF EXISTS "Users can delete groups in own org" ON public.travel_groups;
CREATE POLICY "Users can delete groups in own org" ON public.travel_groups
  FOR DELETE TO authenticated USING (org_id = get_my_org_id());

-- TRAVEL_GROUP_MEMBERS
DROP POLICY IF EXISTS "Users can create members via group org" ON public.travel_group_members;
DROP POLICY IF EXISTS "Users can view members via group org" ON public.travel_group_members;
DROP POLICY IF EXISTS "Users can delete members via group org" ON public.travel_group_members;

DROP POLICY IF EXISTS "Users can view members via group org" ON public.travel_group_members;
DROP POLICY IF EXISTS "Users can view members via group org" ON public.travel_group_members;
DROP POLICY IF EXISTS "Users can view members via group org" ON public.travel_group_members;
DROP POLICY IF EXISTS "Users can view members via group org" ON public.travel_group_members;
CREATE POLICY "Users can view members via group org" ON public.travel_group_members
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM travel_groups g WHERE g.id = travel_group_members.group_id AND g.org_id = get_my_org_id()));
DROP POLICY IF EXISTS "Users can create members via group org" ON public.travel_group_members;
DROP POLICY IF EXISTS "Users can create members via group org" ON public.travel_group_members;
DROP POLICY IF EXISTS "Users can create members via group org" ON public.travel_group_members;
DROP POLICY IF EXISTS "Users can create members via group org" ON public.travel_group_members;
CREATE POLICY "Users can create members via group org" ON public.travel_group_members
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM travel_groups g WHERE g.id = travel_group_members.group_id AND g.org_id = get_my_org_id()));
DROP POLICY IF EXISTS "Users can delete members via group org" ON public.travel_group_members;
DROP POLICY IF EXISTS "Users can delete members via group org" ON public.travel_group_members;
DROP POLICY IF EXISTS "Users can delete members via group org" ON public.travel_group_members;
DROP POLICY IF EXISTS "Users can delete members via group org" ON public.travel_group_members;
CREATE POLICY "Users can delete members via group org" ON public.travel_group_members
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM travel_groups g WHERE g.id = travel_group_members.group_id AND g.org_id = get_my_org_id()));

-- ORGANIZATIONS: harden existing + add WITH CHECK on update
DROP POLICY IF EXISTS "Users can view own org" ON public.organizations;
DROP POLICY IF EXISTS "Org admins can update own org" ON public.organizations;
DROP POLICY IF EXISTS "Users without org can create one" ON public.organizations;

DROP POLICY IF EXISTS "Users can view own org" ON public.organizations;
DROP POLICY IF EXISTS "Users can view own org" ON public.organizations;
DROP POLICY IF EXISTS "Users can view own org" ON public.organizations;
DROP POLICY IF EXISTS "Users can view own org" ON public.organizations;
CREATE POLICY "Users can view own org" ON public.organizations
  FOR SELECT TO authenticated USING (id = get_my_org_id());
DROP POLICY IF EXISTS "Org admins can update own org" ON public.organizations;
DROP POLICY IF EXISTS "Org admins can update own org" ON public.organizations;
DROP POLICY IF EXISTS "Org admins can update own org" ON public.organizations;
DROP POLICY IF EXISTS "Org admins can update own org" ON public.organizations;
CREATE POLICY "Org admins can update own org" ON public.organizations
  FOR UPDATE TO authenticated
  USING (id = get_my_org_id() AND has_role(auth.uid(), 'org_admin'))
  WITH CHECK (id = get_my_org_id());
DROP POLICY IF EXISTS "Users without org can create one" ON public.organizations;
DROP POLICY IF EXISTS "Users without org can create one" ON public.organizations;
DROP POLICY IF EXISTS "Users without org can create one" ON public.organizations;
DROP POLICY IF EXISTS "Users without org can create one" ON public.organizations;
CREATE POLICY "Users without org can create one" ON public.organizations
  FOR INSERT TO authenticated WITH CHECK (get_my_org_id() IS NULL);

-- PROFILES: harden
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- USER_ROLES: harden
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;

DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);