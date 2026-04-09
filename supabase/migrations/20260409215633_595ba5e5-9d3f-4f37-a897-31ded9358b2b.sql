
-- trips: add missing columns
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS destination_city text;
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS destination_country text;
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS hotel_name text;
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS hotel_regime text;
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS notes_internal text;
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS assigned_agent_id uuid;

-- tickets: add missing columns
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS type text DEFAULT 'general';
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS trip_id uuid REFERENCES public.trips(id) ON DELETE SET NULL;

-- ticket_messages: add missing column
ALTER TABLE public.ticket_messages ADD COLUMN IF NOT EXISTS sender_type text DEFAULT 'agent';

-- hotels_bank: add missing columns
ALTER TABLE public.hotels_bank ADD COLUMN IF NOT EXISTS category integer;
ALTER TABLE public.hotels_bank ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.hotels_bank ADD COLUMN IF NOT EXISTS regime_options text[];
ALTER TABLE public.hotels_bank ADD COLUMN IF NOT EXISTS tags text[];

-- checklists: add missing columns
ALTER TABLE public.checklists ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL;
ALTER TABLE public.checklists ADD COLUMN IF NOT EXISTS created_by uuid;
ALTER TABLE public.checklists ADD COLUMN IF NOT EXISTS type text DEFAULT 'general';
ALTER TABLE public.checklists ADD COLUMN IF NOT EXISTS is_visible_to_client boolean DEFAULT true;

-- trip_flights
CREATE TABLE public.trip_flights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  airline_name text,
  flight_number text,
  origin_city text,
  destination_city text,
  departure_datetime timestamptz,
  arrival_datetime timestamptz,
  sequence integer NOT NULL DEFAULT 0,
  booking_code text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.trip_flights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view flights via trip org" ON public.trip_flights FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_flights.trip_id AND t.org_id = get_my_org_id()));
CREATE POLICY "Users can create flights via trip org" ON public.trip_flights FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_flights.trip_id AND t.org_id = get_my_org_id()));
CREATE POLICY "Users can update flights via trip org" ON public.trip_flights FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_flights.trip_id AND t.org_id = get_my_org_id()));
CREATE POLICY "Users can delete flights via trip org" ON public.trip_flights FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_flights.trip_id AND t.org_id = get_my_org_id()));

-- trip_documents
CREATE TABLE public.trip_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  title text NOT NULL,
  doc_type text,
  file_url text,
  is_visible_to_client boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.trip_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view docs via trip org" ON public.trip_documents FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_documents.trip_id AND t.org_id = get_my_org_id()));
CREATE POLICY "Users can create docs via trip org" ON public.trip_documents FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_documents.trip_id AND t.org_id = get_my_org_id()));
CREATE POLICY "Users can update docs via trip org" ON public.trip_documents FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_documents.trip_id AND t.org_id = get_my_org_id()));
CREATE POLICY "Users can delete docs via trip org" ON public.trip_documents FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_documents.trip_id AND t.org_id = get_my_org_id()));

-- trip_travelers
CREATE TABLE public.trip_travelers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  traveler_id uuid NOT NULL REFERENCES public.travelers(id) ON DELETE CASCADE,
  ticket_number text,
  seat_number text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.trip_travelers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view trip travelers via trip org" ON public.trip_travelers FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_travelers.trip_id AND t.org_id = get_my_org_id()));
CREATE POLICY "Users can create trip travelers via trip org" ON public.trip_travelers FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_travelers.trip_id AND t.org_id = get_my_org_id()));
CREATE POLICY "Users can update trip travelers via trip org" ON public.trip_travelers FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_travelers.trip_id AND t.org_id = get_my_org_id()));
CREATE POLICY "Users can delete trip travelers via trip org" ON public.trip_travelers FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_travelers.trip_id AND t.org_id = get_my_org_id()));

-- RPC: get_public_organization_by_slug
CREATE OR REPLACE FUNCTION public.get_public_organization_by_slug(_slug text)
RETURNS TABLE(
  id uuid,
  name text,
  logo_url text,
  primary_color text,
  whatsapp text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT o.id, o.name, o.logo_url, o.primary_color, o.whatsapp
  FROM public.organizations o
  WHERE o.slug = _slug AND o.is_active = true;
END;
$$;
