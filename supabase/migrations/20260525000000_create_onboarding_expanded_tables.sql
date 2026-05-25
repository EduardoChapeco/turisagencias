-- ───────────────────────────────────────────────────────────
-- OMEGA v6.0 Sprint 1 - Onboarding Expandido & Site Builder
-- ───────────────────────────────────────────────────────────

-- 1. PUBLIC SITES (Portal Institucional/Blog/LinkBio público da agência)
CREATE TABLE IF NOT EXISTS public.public_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  domain TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.public_sites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_sites_select_policy" ON public.public_sites
  FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "public_sites_all_policy" ON public.public_sites
  FOR ALL TO authenticated USING (org_id = public.get_my_org_id()) WITH CHECK (org_id = public.get_my_org_id());

-- 2. BUILDER PROJECTS (Projetos de site builder de cada agência)
CREATE TABLE IF NOT EXISTS public.builder_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  site_id UUID REFERENCES public.public_sites(id) ON DELETE SET NULL,
  project_type TEXT NOT NULL, -- website | landing | blog | linkbio | portal_skin
  title TEXT NOT NULL,
  current_version_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.builder_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "builder_projects_select_policy" ON public.builder_projects
  FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "builder_projects_all_policy" ON public.builder_projects
  FOR ALL TO authenticated USING (org_id = public.get_my_org_id()) WITH CHECK (org_id = public.get_my_org_id());

-- 3. BUILDER VERSIONS (Snapshots JSON de versionamento do site builder)
CREATE TABLE IF NOT EXISTS public.builder_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.builder_projects(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  frame_schema JSONB NOT NULL DEFAULT '{}'::jsonb,
  content_schema JSONB NOT NULL DEFAULT '{}'::jsonb,
  design_tokens JSONB NOT NULL DEFAULT '{}'::jsonb,
  render_snapshot JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft', -- draft | published
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.builder_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "builder_versions_select_policy" ON public.builder_versions
  FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "builder_versions_all_policy" ON public.builder_versions
  FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.builder_projects p WHERE p.id = project_id AND p.org_id = public.get_my_org_id()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.builder_projects p WHERE p.id = project_id AND p.org_id = public.get_my_org_id()));

-- 4. STANDARDIZE AIRPORTS TABLE (Safe Incremental Alter)
ALTER TABLE public.airports ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid();
ALTER TABLE public.airports ADD COLUMN IF NOT EXISTS icao_code TEXT;
ALTER TABLE public.airports ADD COLUMN IF NOT EXISTS city_code TEXT;
ALTER TABLE public.airports ADD COLUMN IF NOT EXISTS city_name TEXT;
ALTER TABLE public.airports ADD COLUMN IF NOT EXISTS country_code TEXT;
ALTER TABLE public.airports ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'lovable';
ALTER TABLE public.airports ADD COLUMN IF NOT EXISTS source_version TEXT DEFAULT '1.0';
ALTER TABLE public.airports ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 5. AIRLINE CHECKIN REGISTRY (Links profundos e templates de check-in)
CREATE TABLE IF NOT EXISTS public.airline_checkin_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  airline_iata TEXT NOT NULL,
  airline_name TEXT NOT NULL,
  landing_url TEXT NOT NULL,
  deep_link_template TEXT,
  required_fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  supports_prefill BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  source_url TEXT,
  verified_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'draft'
);

ALTER TABLE public.airline_checkin_registry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "airline_checkin_registry_select_policy" ON public.airline_checkin_registry
  FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "airline_checkin_registry_all_policy" ON public.airline_checkin_registry
  FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
