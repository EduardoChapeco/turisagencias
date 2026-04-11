
-- Add slug to destination_guides
ALTER TABLE public.destination_guides
  ADD COLUMN IF NOT EXISTS slug text UNIQUE;

-- Create traveler_info_pages
CREATE TABLE IF NOT EXISTS public.traveler_info_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  author_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  title text NOT NULL,
  slug text UNIQUE,
  description text,
  cover_image_url text,
  content_blocks jsonb DEFAULT '[]'::jsonb,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.traveler_info_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "traveler_info_pages_org" ON public.traveler_info_pages FOR ALL TO authenticated
  USING (org_id = public.get_my_org_id())
  WITH CHECK (org_id = public.get_my_org_id());

-- Allow public read for published pages
CREATE POLICY "traveler_info_pages_public_read" ON public.traveler_info_pages FOR SELECT TO anon
  USING (is_published = true);

CREATE TRIGGER set_traveler_info_pages_updated_at BEFORE UPDATE ON public.traveler_info_pages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
