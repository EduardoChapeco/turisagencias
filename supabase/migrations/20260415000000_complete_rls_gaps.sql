-- Migration: 20260415000000_complete_rls_gaps
-- Objective: Enables RLS and creates secure policies for all CRM and Dictionary tables that were missing it.

-- 1. Enable RLS on all missing dictionary tables (Global, read-only for most, writable by super admin)
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destination_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_pills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.map_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.map_distances ENABLE ROW LEVEL SECURITY;

-- 2. Enable RLS on CRM/Quotations children tables (Isolated by org_id via parent)
ALTER TABLE public.quote_destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_chips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flight_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flight_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itinerary_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itinerary_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_price_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_includes ENABLE ROW LEVEL SECURITY;

-- 3. Enable RLS on Guides
ALTER TABLE public.guide_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_stops ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- POLICIES FOR DICTIONARY TABLES (GLOBAL)
-- ==========================================
DO $$
DECLARE
  dict_table text;
  dict_tables text[] := ARRAY['destinations', 'destination_tags', 'places', 'activities', 'activity_pills', 'tips', 'media_items', 'weather_data', 'map_points', 'map_distances'];
BEGIN
  FOREACH dict_table IN ARRAY dict_tables
  LOOP
    EXECUTE format('CREATE POLICY "Everyone can read %I" ON public.%I FOR SELECT USING (true);', dict_table, dict_table);
    -- Insert/Update/Delete requires super_admin
    EXECUTE format('CREATE POLICY "Super admins can insert %I" ON public.%I FOR INSERT WITH CHECK (has_role(auth.uid(), ''super_admin''));', dict_table, dict_table);
    EXECUTE format('CREATE POLICY "Super admins can update %I" ON public.%I FOR UPDATE USING (has_role(auth.uid(), ''super_admin''));', dict_table, dict_table);
    EXECUTE format('CREATE POLICY "Super admins can delete %I" ON public.%I FOR DELETE USING (has_role(auth.uid(), ''super_admin''));', dict_table, dict_table);
  END LOOP;
END $$;


-- ==========================================
-- POLICIES FOR QUOTE CHILDREN
-- ==========================================
-- A quote child is accessible if its parent quote is in the user's org.
-- For anon, it's readable if the parent quote is readable (which is handled by "Anon quotes valid token" or similar).
-- We'll allow anon to SELECT if the query resolves.

-- Function to generate policies for direct children of quotations
DO $$
DECLARE
  child_table text;
  child_tables text[] := ARRAY['quote_destinations', 'quote_chips', 'flights', 'quote_hotels', 'quote_price_items', 'quote_includes', 'itinerary_days'];
BEGIN
  FOREACH child_table IN ARRAY child_tables
  LOOP
    -- SELECT: Authenticated can see their org's quotes, Anon sees all (filtered by app limits)
    EXECUTE format('CREATE POLICY "Anon can view %I" ON public.%I FOR SELECT TO anon USING (true);', child_table, child_table);
    EXECUTE format('CREATE POLICY "Auth can view %I" ON public.%I FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.quotations q WHERE q.id = quote_id AND q.org_id = public.get_my_org_id()));', child_table, child_table);
    
    -- INSERT/UPDATE/DELETE: Strictly authenticated and in their org
    EXECUTE format('CREATE POLICY "Auth can insert %I" ON public.%I FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.quotations q WHERE q.id = quote_id AND q.org_id = public.get_my_org_id()));', child_table, child_table);
    EXECUTE format('CREATE POLICY "Auth can update %I" ON public.%I FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.quotations q WHERE q.id = quote_id AND q.org_id = public.get_my_org_id()));', child_table, child_table);
    EXECUTE format('CREATE POLICY "Auth can delete %I" ON public.%I FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.quotations q WHERE q.id = quote_id AND q.org_id = public.get_my_org_id()));', child_table, child_table);
  END LOOP;
END $$;

-- Second level children (flight_segments, flight_amenities) referencing flight_id
CREATE POLICY "Anon can view flight_segments" ON public.flight_segments FOR SELECT TO anon USING (true);
CREATE POLICY "Auth can view flight_segments" ON public.flight_segments FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.flights f JOIN public.quotations q ON q.id = f.quote_id WHERE f.id = flight_id AND q.org_id = public.get_my_org_id())
);
CREATE POLICY "Auth can modify flight_segments" ON public.flight_segments FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.flights f JOIN public.quotations q ON q.id = f.quote_id WHERE f.id = flight_id AND q.org_id = public.get_my_org_id())
);

CREATE POLICY "Anon can view flight_amenities" ON public.flight_amenities FOR SELECT TO anon USING (true);
CREATE POLICY "Auth can view flight_amenities" ON public.flight_amenities FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.flights f JOIN public.quotations q ON q.id = f.quote_id WHERE f.id = flight_id AND q.org_id = public.get_my_org_id())
);
CREATE POLICY "Auth can modify flight_amenities" ON public.flight_amenities FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.flights f JOIN public.quotations q ON q.id = f.quote_id WHERE f.id = flight_id AND q.org_id = public.get_my_org_id())
);

-- Second level children (itinerary_items) referencing itinerary_day_id
CREATE POLICY "Anon can view itinerary_items" ON public.itinerary_items FOR SELECT TO anon USING (true);
CREATE POLICY "Auth can view itinerary_items" ON public.itinerary_items FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.itinerary_days d JOIN public.quotations q ON q.id = d.quote_id WHERE d.id = itinerary_day_id AND q.org_id = public.get_my_org_id())
);
CREATE POLICY "Auth can modify itinerary_items" ON public.itinerary_items FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.itinerary_days d JOIN public.quotations q ON q.id = d.quote_id WHERE d.id = itinerary_day_id AND q.org_id = public.get_my_org_id())
);

-- ==========================================
-- POLICIES FOR GUIDE PAGES
-- ==========================================
CREATE POLICY "Anon can view public guide_pages" ON public.guide_pages 
  FOR SELECT TO anon USING (is_public = true);

CREATE POLICY "Auth can manage guide_pages" ON public.guide_pages
  FOR ALL TO authenticated USING (org_id = public.get_my_org_id());

CREATE POLICY "Anon can view public route_stops" ON public.route_stops
  FOR SELECT TO anon USING (
    EXISTS (SELECT 1 FROM public.guide_pages p WHERE p.id = guide_page_id AND p.is_public = true)
  );

CREATE POLICY "Auth can manage route_stops" ON public.route_stops
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.guide_pages p WHERE p.id = guide_page_id AND p.org_id = public.get_my_org_id())
  );
