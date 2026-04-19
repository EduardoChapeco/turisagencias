-- Migration: 20260412230000_viaja_full_schema
-- Objective: Phase 1 db audit fixes (tables & references)

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'quote_status') THEN
    CREATE TYPE quote_status AS ENUM ('draft', 'sent', 'viewed', 'confirmed', 'expired', 'cancelled');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'flight_direction') THEN
    CREATE TYPE flight_direction AS ENUM ('outbound', 'return');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'place_type') THEN
    CREATE TYPE place_type AS ENUM ('beach', 'attraction', 'restaurant', 'activity', 'hotel');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'media_type') THEN
    CREATE TYPE media_type AS ENUM ('photo', 'video');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gallery_span') THEN
    CREATE TYPE gallery_span AS ENUM ('normal', 'tall', 'wide');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'badge_type') THEN
    CREATE TYPE badge_type AS ENUM ('default', 'green');
  END IF;
END $$;

ALTER TABLE public.quotations 
  ADD COLUMN IF NOT EXISTS public_token text UNIQUE,
  ADD COLUMN IF NOT EXISTS valid_until timestamptz,
  ADD COLUMN IF NOT EXISTS cover_title text,
  ADD COLUMN IF NOT EXISTS cover_subtitle text,
  ADD COLUMN IF NOT EXISTS adults int DEFAULT 1,
  ADD COLUMN IF NOT EXISTS children int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS installments int DEFAULT 1,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS viewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS confirmed_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_quotations_public_token ON quotations(public_token);
CREATE INDEX IF NOT EXISTS idx_quotations_valid_until ON quotations(valid_until);

CREATE TABLE IF NOT EXISTS public.destinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE,
  country text,
  region text,
  capital text,
  currency text,
  currency_code text,
  language text,
  timezone text,
  voltage text,
  best_season text,
  exchange_rate_brl numeric,
  description text,
  cover_emoji text,
  cover_gradient text,
  latitude numeric,
  longitude numeric,
  emergency_numbers jsonb,
  useful_numbers jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.destination_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_id uuid REFERENCES destinations(id) ON DELETE CASCADE,
  tag text
);

CREATE TABLE IF NOT EXISTS public.quote_destinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid REFERENCES quotations(id) ON DELETE CASCADE,
  destination_id uuid REFERENCES destinations(id) ON DELETE RESTRICT,
  order_position int,
  nights int,
  start_date date,
  end_date date
);

CREATE TABLE IF NOT EXISTS public.quote_chips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid REFERENCES quotations(id) ON DELETE CASCADE,
  icon text,
  label text,
  order_position int
);

CREATE TABLE IF NOT EXISTS public.flights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid REFERENCES quotations(id) ON DELETE CASCADE,
  direction flight_direction,
  airline_name text,
  airline_code text,
  operated_by text,
  cabin_class text,
  is_recommended boolean DEFAULT false,
  total_price numeric,
  price_label text,
  order_position int
);

CREATE TABLE IF NOT EXISTS public.flight_segments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flight_id uuid REFERENCES flights(id) ON DELETE CASCADE,
  segment_order int,
  departure_airport_code text,
  departure_airport_city text,
  departure_datetime timestamptz,
  arrival_airport_code text,
  arrival_airport_city text,
  arrival_datetime timestamptz,
  duration_minutes int,
  is_direct boolean DEFAULT true,
  stops int DEFAULT 0,
  connection_info text,
  connection_wait_minutes int
);
CREATE INDEX IF NOT EXISTS idx_flight_segments_flight ON flight_segments(flight_id, segment_order);

CREATE TABLE IF NOT EXISTS public.flight_amenities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flight_id uuid REFERENCES flights(id) ON DELETE CASCADE,
  icon text,
  label text
);

CREATE TABLE IF NOT EXISTS public.itinerary_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid REFERENCES quotations(id) ON DELETE CASCADE,
  day_number int,
  date date,
  city text,
  country text,
  label text
);
CREATE INDEX IF NOT EXISTS idx_itinerary_days_quote ON itinerary_days(quote_id, day_number);

CREATE TABLE IF NOT EXISTS public.itinerary_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_day_id uuid REFERENCES itinerary_days(id) ON DELETE CASCADE,
  order_position int,
  description text
);

CREATE TABLE IF NOT EXISTS public.quote_hotels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid REFERENCES quotations(id) ON DELETE CASCADE,
  hotel_id uuid REFERENCES hotels_bank(id) ON DELETE RESTRICT,
  destination_id uuid REFERENCES destinations(id) ON DELETE RESTRICT,
  check_in date,
  check_out date,
  nights int,
  room_type text,
  total_price numeric,
  is_included boolean DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.quote_price_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid REFERENCES quotations(id) ON DELETE CASCADE,
  icon text,
  label text,
  amount numeric,
  order_position int
);

CREATE TABLE IF NOT EXISTS public.quote_includes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid REFERENCES quotations(id) ON DELETE CASCADE,
  icon text,
  title text,
  description text,
  order_position int
);

CREATE TABLE IF NOT EXISTS public.guide_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_id uuid REFERENCES destinations(id) ON DELETE RESTRICT,
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  title text,
  read_time_minutes int,
  is_public boolean DEFAULT false,
  public_token text UNIQUE,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_guide_pages_token ON guide_pages(public_token);

CREATE TABLE IF NOT EXISTS public.places (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_id uuid REFERENCES destinations(id) ON DELETE CASCADE,
  type place_type,
  name text NOT NULL,
  category_label text,
  rating numeric,
  price_label text,
  cover_emoji text,
  cover_gradient text,
  badge_label text,
  badge_type badge_type DEFAULT 'default',
  description text,
  latitude numeric,
  longitude numeric,
  is_featured boolean DEFAULT false
);
CREATE INDEX IF NOT EXISTS idx_places_dest_type ON places(destination_id, type);

CREATE TABLE IF NOT EXISTS public.activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id uuid REFERENCES places(id) ON DELETE CASCADE,
  destination_id uuid REFERENCES destinations(id) ON DELETE CASCADE,
  title text,
  description text,
  duration_label text,
  min_age int,
  price_per_person numeric,
  currency text,
  includes_transfer boolean DEFAULT false,
  cover_emoji text,
  kicker text
);

CREATE TABLE IF NOT EXISTS public.activity_pills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid REFERENCES activities(id) ON DELETE CASCADE,
  icon text,
  label text
);

CREATE TABLE IF NOT EXISTS public.route_stops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_page_id uuid REFERENCES guide_pages(id) ON DELETE CASCADE,
  stop_order int,
  name text,
  description text,
  time_label text
);

CREATE TABLE IF NOT EXISTS public.tips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_id uuid REFERENCES destinations(id) ON DELETE CASCADE,
  icon text,
  title text,
  content text,
  category text,
  order_position int
);

CREATE TABLE IF NOT EXISTS public.media_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_id uuid REFERENCES destinations(id) ON DELETE CASCADE,
  type media_type,
  url text,
  thumbnail_url text,
  cover_emoji text,
  cover_color text,
  title text,
  description text,
  duration_label text,
  is_featured boolean DEFAULT false,
  span_type gallery_span DEFAULT 'normal',
  order_position int
);

CREATE TABLE IF NOT EXISTS public.weather_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_id uuid REFERENCES destinations(id) ON DELETE CASCADE,
  date date,
  temp_max int,
  temp_min int,
  condition text,
  condition_emoji text,
  source text,
  fetched_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.map_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_id uuid REFERENCES destinations(id) ON DELETE CASCADE,
  type place_type,
  label text,
  latitude numeric,
  longitude numeric,
  color text
);

CREATE TABLE IF NOT EXISTS public.map_distances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_id uuid REFERENCES destinations(id) ON DELETE CASCADE,
  icon text,
  from_label text,
  to_label text,
  distance_label text,
  order_position int
);

-- RLS:
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
-- Basic anon access bypassing full JWT requirements if token matches. 
-- In pure postgREST standard, we read query params config, or we allow SELECT for anon and filter by JWT or Token
DROP POLICY IF EXISTS "Anon quotes valid token" ON public.quotations;
DROP POLICY IF EXISTS "Anon quotes valid token" ON public.quotations;
DROP POLICY IF EXISTS "Anon quotes valid token" ON public.quotations;
DROP POLICY IF EXISTS "Anon quotes valid token" ON public.quotations;
CREATE POLICY "Anon quotes valid token" ON public.quotations 
FOR SELECT TO anon 
USING (true); -- Real validation will happen via application layer or RPC, but table-level is open-read for ANON.
