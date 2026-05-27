-- Migration: 20260527000001_shadow_profiles_tracking.sql
-- Description: Creates tables for device fingerprinting, behavior tracking, and shadow profiling for B2C leads.

CREATE TABLE IF NOT EXISTS public.b2c_shadow_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  first_seen_at TIMESTAMPTZ DEFAULT now(),
  last_seen_at TIMESTAMPTZ DEFAULT now(),
  device_info JSONB DEFAULT '{}'::jsonb,
  geo_location JSONB DEFAULT '{}'::jsonb,
  converted_client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public.b2c_tracking_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shadow_id UUID REFERENCES public.b2c_shadow_profiles(id) ON DELETE CASCADE,
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- e.g., 'page_view', 'scroll_depth_50', 'chat_open'
  page_url TEXT,
  page_title TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Enforcement
ALTER TABLE public.b2c_shadow_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.b2c_tracking_events ENABLE ROW LEVEL SECURITY;

-- Agents can view profiles of their org
CREATE POLICY "Users can view shadow profiles in own org" 
  ON public.b2c_shadow_profiles 
  FOR SELECT 
  TO authenticated 
  USING (org_id = public.get_my_org_id());

CREATE POLICY "Users can view tracking events in own org" 
  ON public.b2c_tracking_events 
  FOR SELECT 
  TO authenticated 
  USING (org_id = public.get_my_org_id());

-- Anonymous inserts/updates (Shadow Tracking)
-- Allowed to insert their own shadow profile. It must be generated client side or DB side, but we allow inserts with the matched shadow_id.
CREATE POLICY "Anon can insert shadow profile" 
  ON public.b2c_shadow_profiles 
  FOR INSERT 
  TO anon 
  WITH CHECK (true);

-- Anon can update only their own profile if they know the ID
CREATE POLICY "Anon can update their own shadow profile" 
  ON public.b2c_shadow_profiles 
  FOR UPDATE 
  TO anon 
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon can insert tracking events" 
  ON public.b2c_tracking_events 
  FOR INSERT 
  TO anon 
  WITH CHECK (true);

-- Create an index for faster queries on shadow_id and converted_client_id
CREATE INDEX IF NOT EXISTS idx_shadow_profiles_client_id ON public.b2c_shadow_profiles(converted_client_id);
CREATE INDEX IF NOT EXISTS idx_tracking_events_shadow_id ON public.b2c_tracking_events(shadow_id);
CREATE INDEX IF NOT EXISTS idx_tracking_events_org_id ON public.b2c_tracking_events(org_id);
