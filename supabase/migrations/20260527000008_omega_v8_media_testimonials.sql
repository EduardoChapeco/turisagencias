-- Migration: Media & Testimonials para Blocos Dinâmicos do Builder

-- 1. Tabela de Mídias (agency_media)
CREATE TABLE IF NOT EXISTS public.agency_media (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    org_id uuid NOT NULL REFERENCES public.organization(id) ON DELETE CASCADE,
    media_type text NOT NULL CHECK (media_type IN ('image', 'video', 'audio', 'document')),
    url text NOT NULL,
    title text,
    alt_text text,
    category text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.agency_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own agency media"
    ON public.agency_media FOR SELECT
    USING (org_id = (SELECT auth.user_org_id()));

CREATE POLICY "Public can view agency media"
    ON public.agency_media FOR SELECT
    USING (true); -- Public URLs, safe to be read globally by B2C sites

CREATE POLICY "Users can insert their own agency media"
    ON public.agency_media FOR INSERT
    WITH CHECK (org_id = (SELECT auth.user_org_id()));

CREATE POLICY "Users can update their own agency media"
    ON public.agency_media FOR UPDATE
    USING (org_id = (SELECT auth.user_org_id()));

CREATE POLICY "Users can delete their own agency media"
    ON public.agency_media FOR DELETE
    USING (org_id = (SELECT auth.user_org_id()));


-- 2. Tabela de Depoimentos (agency_testimonials)
CREATE TABLE IF NOT EXISTS public.agency_testimonials (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    org_id uuid NOT NULL REFERENCES public.organization(id) ON DELETE CASCADE,
    client_name text NOT NULL,
    client_avatar_url text,
    trip_destination text,
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    content text NOT NULL,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.agency_testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own agency testimonials"
    ON public.agency_testimonials FOR SELECT
    USING (org_id = (SELECT auth.user_org_id()));

CREATE POLICY "Public can view approved agency testimonials"
    ON public.agency_testimonials FOR SELECT
    USING (status = 'approved'); -- Only approved are public

CREATE POLICY "Users can insert their own agency testimonials"
    ON public.agency_testimonials FOR INSERT
    WITH CHECK (org_id = (SELECT auth.user_org_id()));

CREATE POLICY "Users can update their own agency testimonials"
    ON public.agency_testimonials FOR UPDATE
    USING (org_id = (SELECT auth.user_org_id()));

CREATE POLICY "Users can delete their own agency testimonials"
    ON public.agency_testimonials FOR DELETE
    USING (org_id = (SELECT auth.user_org_id()));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_agency_media_org_id ON public.agency_media(org_id);
CREATE INDEX IF NOT EXISTS idx_agency_testimonials_org_id ON public.agency_testimonials(org_id);
