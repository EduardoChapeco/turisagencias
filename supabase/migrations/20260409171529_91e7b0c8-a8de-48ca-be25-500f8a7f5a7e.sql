
-- Function to assign org_admin role (called from onboarding, SECURITY DEFINER to bypass RLS)
CREATE OR REPLACE FUNCTION public.assign_org_admin_role(_user_id UUID)
RETURNS VOID
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

-- First-user super_admin: one-time trigger
-- When a new user is created, if they are the FIRST user ever, promote to super_admin
CREATE OR REPLACE FUNCTION public.promote_first_user()
RETURNS TRIGGER AS $$
DECLARE
  user_count INT;
BEGIN
  SELECT COUNT(*) INTO user_count FROM auth.users;
  -- If this is the first user (count = 1 because the trigger fires AFTER insert)
  IF user_count = 1 THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'super_admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'org_admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_promote_first_user
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.promote_first_user();

-- Ensure updated_at triggers exist (recreate if missing)
DROP TRIGGER IF EXISTS update_organizations_updated_at ON public.organizations;
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
