-- Migration: Builder Canonical Schema Reality Sync
-- Garante que as tabelas do Builder têm todos os campos necessários
-- Usa IF NOT EXISTS para ser idempotente

-- Garantir que builder_projects tem campos necessários
ALTER TABLE public.builder_projects
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS published_version_id UUID,
  ADD COLUMN IF NOT EXISTS seo_title TEXT,
  ADD COLUMN IF NOT EXISTS seo_description TEXT,
  ADD COLUMN IF NOT EXISTS custom_domain TEXT,
  ADD COLUMN IF NOT EXISTS password_protected BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Garantir que builder_versions tem campos necessários
ALTER TABLE public.builder_versions
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS published_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS change_summary TEXT;

-- Criar tabela de formulários submetidos pelo Builder (se não existir)
CREATE TABLE IF NOT EXISTS public.builder_form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.builder_projects(id) ON DELETE SET NULL,
  form_type TEXT NOT NULL DEFAULT 'contact',
  payload JSONB NOT NULL DEFAULT '{}',
  submitter_email TEXT,
  submitter_name TEXT,
  submitter_phone TEXT,
  ip_address TEXT,
  user_agent TEXT,
  lead_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela de analytics do Builder (se não existir)
CREATE TABLE IF NOT EXISTS public.builder_analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.builder_projects(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL, -- 'page_view', 'click', 'form_submit', 'scroll_depth'
  event_data JSONB DEFAULT '{}',
  session_id TEXT,
  ip_address TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='builder_form_submissions' AND column_name='project_id') THEN
    ALTER TABLE public.builder_form_submissions ADD COLUMN project_id UUID REFERENCES public.builder_projects(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='builder_analytics_events' AND column_name='project_id') THEN
    ALTER TABLE public.builder_analytics_events ADD COLUMN project_id UUID REFERENCES public.builder_projects(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='builder_sites' AND column_name='is_published') THEN
    ALTER TABLE public.builder_sites ADD COLUMN is_published BOOLEAN DEFAULT FALSE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='builder_pages' AND column_name='status') THEN
    ALTER TABLE public.builder_pages ADD COLUMN status TEXT DEFAULT 'draft';
  END IF;
END $$;

-- Índices
CREATE INDEX IF NOT EXISTS idx_builder_projects_org_id ON public.builder_projects(org_id);
CREATE INDEX IF NOT EXISTS idx_builder_projects_slug ON public.builder_projects(slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_builder_versions_project_id ON public.builder_versions(project_id);
CREATE INDEX IF NOT EXISTS idx_builder_form_submissions_org_id ON public.builder_form_submissions(org_id);
CREATE INDEX IF NOT EXISTS idx_builder_analytics_events_org_id ON public.builder_analytics_events(org_id);
CREATE INDEX IF NOT EXISTS idx_builder_analytics_events_project_id ON public.builder_analytics_events(project_id);

-- RLS
ALTER TABLE public.builder_form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.builder_analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.builder_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.builder_blocks_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.builder_versions ENABLE ROW LEVEL SECURITY;

-- SECURING PUBLIC READS (ANON)
-- Ensure 'anon' role can only select published sites and pages
DROP POLICY IF EXISTS "Public can view sites by domain" ON public.builder_sites;
CREATE POLICY "Public can view sites by domain" ON public.builder_sites 
  FOR SELECT TO anon 
  USING (is_published = true);

DROP POLICY IF EXISTS "Public can view published pages" ON public.builder_pages;
CREATE POLICY "Public can view published pages" ON public.builder_pages 
  FOR SELECT TO anon 
  USING (status = 'published');

-- Policies: builder_form_submissions
DROP POLICY IF EXISTS "org_read_form_submissions" ON public.builder_form_submissions;
CREATE POLICY "org_read_form_submissions" ON public.builder_form_submissions
  FOR SELECT USING (org_id = (SELECT get_my_org_id()));

DROP POLICY IF EXISTS "public_insert_form_submissions" ON public.builder_form_submissions;
CREATE POLICY "public_insert_form_submissions" ON public.builder_form_submissions
  FOR INSERT WITH CHECK (true);

-- Policies: builder_analytics_events
DROP POLICY IF EXISTS "org_read_analytics_events" ON public.builder_analytics_events;
CREATE POLICY "org_read_analytics_events" ON public.builder_analytics_events
  FOR SELECT USING (org_id = (SELECT get_my_org_id()));

DROP POLICY IF EXISTS "public_insert_analytics_events" ON public.builder_analytics_events;
CREATE POLICY "public_insert_analytics_events" ON public.builder_analytics_events
  FOR INSERT WITH CHECK (true);
