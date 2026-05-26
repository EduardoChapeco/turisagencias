-- Migration: OMEGA v7.0 Builder Schema Expansion
-- As requested in the PRD, this implements the core tables for the advanced builder.

-- 1. Sites and Pages Core
CREATE TABLE IF NOT EXISTS public.builder_sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type in ('site','landing','blog','linkbio','catalog','support','public_profile','quote_page','travel_page')),
  slug text NOT NULL,
  custom_domain text,
  status text NOT NULL DEFAULT 'draft',
  brand_kit_id uuid,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(org_id, slug)
);

CREATE TABLE IF NOT EXISTS public.builder_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  site_id uuid REFERENCES public.builder_sites(id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text NOT NULL,
  page_type text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  draft_content jsonb NOT NULL DEFAULT '{}'::jsonb,
  seo_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  settings_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  published_version_id uuid,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(site_id, slug)
);

CREATE TABLE IF NOT EXISTS public.builder_page_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  page_id uuid REFERENCES public.builder_pages(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  content_json jsonb NOT NULL,
  seo_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  settings_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL CHECK (status in ('draft_snapshot','published','archived')),
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  UNIQUE(page_id, version_number)
);

-- Note: Circular dependency builder_pages.published_version_id -> builder_page_versions.id is typical.
-- We can add the foreign key after table creation.
ALTER TABLE public.builder_pages
  ADD CONSTRAINT fk_builder_pages_published_version 
  FOREIGN KEY (published_version_id) REFERENCES public.builder_page_versions(id) ON DELETE SET NULL;


-- 2. Assets and Library
CREATE TABLE IF NOT EXISTS public.builder_blocks_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  block_type text NOT NULL UNIQUE,
  category text NOT NULL,
  label text NOT NULL,
  description text,
  schema_json jsonb NOT NULL,
  default_props jsonb NOT NULL,
  preview_asset_id uuid,
  required_sources text[],
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.builder_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  scope text NOT NULL CHECK (scope in ('global','org')),
  category text NOT NULL,
  name text NOT NULL,
  description text,
  preview_asset_id uuid,
  content_json jsonb NOT NULL,
  tags text[],
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.builder_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  bucket text NOT NULL,
  path text NOT NULL,
  file_name text,
  mime_type text,
  size_bytes bigint,
  width integer,
  height integer,
  alt_text text,
  caption text,
  source text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz DEFAULT now()
);

-- 3. CMS Collections
CREATE TABLE IF NOT EXISTS public.builder_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  key text NOT NULL,
  name text NOT NULL,
  schema_json jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(org_id, key)
);

CREATE TABLE IF NOT EXISTS public.builder_collection_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  collection_id uuid REFERENCES public.builder_collections(id) ON DELETE CASCADE,
  slug text,
  title text,
  data_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text DEFAULT 'draft',
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. Submissions and Tracking
CREATE TABLE IF NOT EXISTS public.builder_form_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  site_id uuid REFERENCES public.builder_sites(id) ON DELETE SET NULL,
  page_id uuid REFERENCES public.builder_pages(id) ON DELETE SET NULL,
  block_id text,
  lead_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  source text,
  utm_json jsonb DEFAULT '{}'::jsonb,
  payload jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.builder_analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  site_id uuid REFERENCES public.builder_sites(id) ON DELETE SET NULL,
  page_id uuid REFERENCES public.builder_pages(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  block_id text,
  visitor_id text,
  session_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.builder_publish_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  site_id uuid REFERENCES public.builder_sites(id) ON DELETE SET NULL,
  page_id uuid REFERENCES public.builder_pages(id) ON DELETE SET NULL,
  version_id uuid REFERENCES public.builder_page_versions(id) ON DELETE SET NULL,
  status text NOT NULL,
  public_url text,
  error_message text,
  published_by uuid,
  created_at timestamptz DEFAULT now()
);

-- 5. Deep Links Registry (Airlines)
CREATE TABLE IF NOT EXISTS public.airline_link_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  airline_iata text NOT NULL,
  airline_name text NOT NULL,
  link_type text NOT NULL CHECK (link_type in ('checkin','boarding_pass','manage_booking','baggage','flight_status')),
  official_url text NOT NULL,
  deep_link_template text,
  required_fields text[] NOT NULL DEFAULT '{}',
  optional_fields text[] NOT NULL DEFAULT '{}',
  window_open_hours_before integer,
  window_close_minutes_before integer,
  supports_prefill boolean DEFAULT false,
  source_url text,
  last_verified_at timestamptz,
  status text NOT NULL DEFAULT 'active',
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(airline_iata, link_type)
);

CREATE TABLE IF NOT EXISTS public.trip_airline_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  trip_id uuid REFERENCES public.group_trips(id) ON DELETE CASCADE,
  traveler_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  flight_segment_id uuid, 
  airline_iata text NOT NULL,
  link_type text NOT NULL,
  generated_url text,
  masked_url text,
  required_payload jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'pending',
  clicked_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.builder_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.builder_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.builder_page_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.builder_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.builder_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.builder_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.builder_collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.builder_form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.builder_analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.builder_publish_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.airline_link_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_airline_links ENABLE ROW LEVEL SECURITY;

-- Standard Org Policies
CREATE POLICY "Users can view their org sites" ON public.builder_sites FOR SELECT USING (org_id = (select auth.get_my_org_id()));
CREATE POLICY "Users can manage their org sites" ON public.builder_sites FOR ALL USING (org_id = (select auth.get_my_org_id()));

CREATE POLICY "Users can view their org pages" ON public.builder_pages FOR SELECT USING (org_id = (select auth.get_my_org_id()));
CREATE POLICY "Users can manage their org pages" ON public.builder_pages FOR ALL USING (org_id = (select auth.get_my_org_id()));

CREATE POLICY "Users can view their org page versions" ON public.builder_page_versions FOR SELECT USING (org_id = (select auth.get_my_org_id()));
CREATE POLICY "Users can manage their org page versions" ON public.builder_page_versions FOR ALL USING (org_id = (select auth.get_my_org_id()));

CREATE POLICY "Users can view org templates" ON public.builder_templates FOR SELECT USING (org_id = (select auth.get_my_org_id()) OR scope = 'global');
CREATE POLICY "Users can manage their org templates" ON public.builder_templates FOR ALL USING (org_id = (select auth.get_my_org_id()));

CREATE POLICY "Users can view their org assets" ON public.builder_assets FOR SELECT USING (org_id = (select auth.get_my_org_id()));
CREATE POLICY "Users can manage their org assets" ON public.builder_assets FOR ALL USING (org_id = (select auth.get_my_org_id()));

CREATE POLICY "Users can view their org collections" ON public.builder_collections FOR SELECT USING (org_id = (select auth.get_my_org_id()));
CREATE POLICY "Users can manage their org collections" ON public.builder_collections FOR ALL USING (org_id = (select auth.get_my_org_id()));

CREATE POLICY "Users can view their org collection items" ON public.builder_collection_items FOR SELECT USING (org_id = (select auth.get_my_org_id()));
CREATE POLICY "Users can manage their org collection items" ON public.builder_collection_items FOR ALL USING (org_id = (select auth.get_my_org_id()));

CREATE POLICY "Users can view their org form submissions" ON public.builder_form_submissions FOR SELECT USING (org_id = (select auth.get_my_org_id()));
CREATE POLICY "Users can manage their org form submissions" ON public.builder_form_submissions FOR ALL USING (org_id = (select auth.get_my_org_id()));

CREATE POLICY "Users can view their org analytics events" ON public.builder_analytics_events FOR SELECT USING (org_id = (select auth.get_my_org_id()));
CREATE POLICY "Users can manage their org analytics events" ON public.builder_analytics_events FOR ALL USING (org_id = (select auth.get_my_org_id()));

CREATE POLICY "Users can view their org publish events" ON public.builder_publish_events FOR SELECT USING (org_id = (select auth.get_my_org_id()));
CREATE POLICY "Users can manage their org publish events" ON public.builder_publish_events FOR ALL USING (org_id = (select auth.get_my_org_id()));

CREATE POLICY "Everyone can read airline link registry" ON public.airline_link_registry FOR SELECT USING (true);
CREATE POLICY "Only super admins can modify airline links" ON public.airline_link_registry FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND user_type = 'super_admin'
    )
);

CREATE POLICY "Users can view their org trip airline links" ON public.trip_airline_links FOR SELECT USING (org_id = (select auth.get_my_org_id()));
CREATE POLICY "Users can manage their org trip airline links" ON public.trip_airline_links FOR ALL USING (org_id = (select auth.get_my_org_id()));
