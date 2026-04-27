-- ─────────────────────────────────────────────
-- OMEGA v5.0 Sprint 3 - Airports & Hotel Reviews
-- ─────────────────────────────────────────────

-- 1. AIRPORTS (Open Data Cache)
CREATE TABLE IF NOT EXISTS public.airports (
    iata_code TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    country TEXT NOT NULL,
    lat DOUBLE PRECISION,
    lon DOUBLE PRECISION,
    timezone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Note: Airports is a global reference table, so we use a simpler RLS (read-only for all authenticated)
ALTER TABLE public.airports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Airports are readable by all authenticated users"
    ON public.airports FOR SELECT
    TO authenticated
    USING (true);

-- 2. HOTEL REVIEWS
-- Link to hotels_bank
CREATE TABLE IF NOT EXISTS public.hotel_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    hotel_id UUID NOT NULL REFERENCES public.hotels_bank(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL, -- optional, if client left it
    rating NUMERIC(3,1) NOT NULL CHECK (rating >= 1.0 AND rating <= 5.0),
    title TEXT,
    comment TEXT,
    stay_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.hotel_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their org hotel reviews"
    ON public.hotel_reviews
    FOR ALL
    TO authenticated
    USING (org_id = public.get_my_org_id())
    WITH CHECK (org_id = public.get_my_org_id());

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_airports_iata ON public.airports(iata_code);
CREATE INDEX IF NOT EXISTS idx_airports_city ON public.airports(city);
CREATE INDEX IF NOT EXISTS idx_hotel_reviews_org_hotel ON public.hotel_reviews(org_id, hotel_id);
