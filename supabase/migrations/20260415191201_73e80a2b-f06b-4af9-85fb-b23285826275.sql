
-- 1. itineraries
CREATE TABLE IF NOT EXISTS public.itineraries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  quotation_id UUID REFERENCES public.quotations(id) ON DELETE SET NULL,
  created_by UUID,
  title TEXT NOT NULL DEFAULT '',
  subtitle TEXT,
  cover_image_url TEXT,
  cover_emoji TEXT,
  destination TEXT,
  origin TEXT,
  destination_lat DOUBLE PRECISION,
  destination_lng DOUBLE PRECISION,
  departure_date DATE,
  return_date DATE,
  num_days INTEGER,
  is_public BOOLEAN NOT NULL DEFAULT false,
  public_token TEXT NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  pdf_requires_lead BOOLEAN DEFAULT false,
  pdf_url TEXT,
  is_group_itinerary BOOLEAN NOT NULL DEFAULT false,
  group_name TEXT,
  max_pax INTEGER,
  current_pax INTEGER DEFAULT 0,
  includes_text TEXT[],
  excludes_text TEXT[],
  important_notes TEXT,
  ai_generated BOOLEAN DEFAULT false,
  ai_prompt_used TEXT,
  view_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  lead_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org members manage itineraries" ON public.itineraries
  FOR ALL USING (org_id = public.get_my_org_id()) WITH CHECK (org_id = public.get_my_org_id());

CREATE INDEX idx_itineraries_org ON public.itineraries(org_id);
CREATE UNIQUE INDEX idx_itineraries_token ON public.itineraries(public_token);

-- 2. itinerary_stops
CREATE TABLE IF NOT EXISTS public.itinerary_stops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  itinerary_id UUID NOT NULL REFERENCES public.itineraries(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL DEFAULT 1,
  position INTEGER NOT NULL DEFAULT 0,
  stop_type TEXT,
  emoji TEXT,
  category TEXT,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  country TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  time_start TEXT,
  duration_minutes INTEGER,
  description TEXT,
  tips TEXT[],
  photo_url TEXT,
  rating NUMERIC(2,1),
  experience_id UUID,
  hotel_id UUID,
  destination_id UUID,
  is_optional BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.itinerary_stops ENABLE ROW LEVEL SECURITY;

-- Stops accessible if user can access the parent itinerary
CREATE POLICY "org members manage itinerary_stops" ON public.itinerary_stops
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.itineraries i WHERE i.id = itinerary_id AND i.org_id = public.get_my_org_id())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.itineraries i WHERE i.id = itinerary_id AND i.org_id = public.get_my_org_id())
  );

CREATE INDEX idx_stops_itinerary ON public.itinerary_stops(itinerary_id);

-- Triggers
CREATE TRIGGER update_itineraries_updated_at BEFORE UPDATE ON public.itineraries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
