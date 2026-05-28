-- =============================================
-- MIGRATION: TurisYou Multi-Site Support
-- Created: 2026-05-28
-- Purpose: Support multiple projects per org, media library, and WebMCP config
-- =============================================

-- 1. Add cover_image_url and template_category to builder_projects
ALTER TABLE public.builder_projects
  ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
  ADD COLUMN IF NOT EXISTS template_category TEXT DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- 2. Create builder_media table if not exists (may already exist from canonical schema)
CREATE TABLE IF NOT EXISTS public.builder_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.builder_projects(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  width INTEGER,
  height INTEGER,
  alt_text TEXT,
  folder TEXT DEFAULT 'general',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for builder_media
ALTER TABLE public.builder_media ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "builder_media_org_select" ON public.builder_media;
CREATE POLICY "builder_media_org_select" ON public.builder_media
  FOR SELECT USING (org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "builder_media_org_insert" ON public.builder_media;
CREATE POLICY "builder_media_org_insert" ON public.builder_media
  FOR INSERT WITH CHECK (org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "builder_media_org_delete" ON public.builder_media;
CREATE POLICY "builder_media_org_delete" ON public.builder_media
  FOR DELETE USING (org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid()));

-- 3. Add bucket for builder media (separate from org-assets)
-- Using org-assets bucket which already exists
-- Just ensure builder_projects can be queried by anon for published ones

-- 4. Create webmcp_config table
CREATE TABLE IF NOT EXISTS public.webmcp_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID UNIQUE NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  is_enabled BOOLEAN DEFAULT FALSE,
  access_token TEXT,
  token_expires_at TIMESTAMPTZ,
  allowed_tools JSONB DEFAULT '["search_knowledge", "get_packages", "get_destinations"]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.webmcp_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "webmcp_config_org_manage" ON public.webmcp_config;
CREATE POLICY "webmcp_config_org_manage" ON public.webmcp_config
  FOR ALL USING (org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid()));

-- 5. Increment view count function
CREATE OR REPLACE FUNCTION public.increment_site_view(p_site_slug TEXT, p_org_slug TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id UUID;
BEGIN
  SELECT id INTO v_org_id FROM public.organizations WHERE slug = p_org_slug;
  IF v_org_id IS NOT NULL THEN
    UPDATE public.builder_projects
    SET view_count = COALESCE(view_count, 0) + 1
    WHERE slug = p_site_slug AND org_id = v_org_id AND is_published = TRUE;
  END IF;
END;
$$;

-- 6. Index for performance
CREATE INDEX IF NOT EXISTS idx_builder_projects_org_id ON public.builder_projects(org_id) WHERE is_deleted IS NOT TRUE;
CREATE INDEX IF NOT EXISTS idx_builder_media_org_id ON public.builder_media(org_id);
CREATE INDEX IF NOT EXISTS idx_builder_media_project_id ON public.builder_media(project_id);
