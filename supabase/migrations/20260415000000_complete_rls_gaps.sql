CREATE POLICY "Anon can view flight_segments" ON public.flight_segments FOR SELECT TO anon USING (true);
DROP POLICY IF EXISTS "Auth can view flight_segments" ON public.flight_segments;
DROP POLICY IF EXISTS "Auth can view flight_segments" ON public.flight_segments;
DROP POLICY IF EXISTS "Auth can view flight_segments" ON public.flight_segments;
DROP POLICY IF EXISTS "Auth can view flight_segments" ON public.flight_segments;
CREATE POLICY "Auth can view flight_segments" ON public.flight_segments FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.flights f JOIN public.quotations q ON q.id = f.quote_id WHERE f.id = flight_id AND q.org_id = public.get_my_org_id())
);
DROP POLICY IF EXISTS "Auth can modify flight_segments" ON public.flight_segments;
DROP POLICY IF EXISTS "Auth can modify flight_segments" ON public.flight_segments;
DROP POLICY IF EXISTS "Auth can modify flight_segments" ON public.flight_segments;
DROP POLICY IF EXISTS "Auth can modify flight_segments" ON public.flight_segments;
CREATE POLICY "Auth can modify flight_segments" ON public.flight_segments FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.flights f JOIN public.quotations q ON q.id = f.quote_id WHERE f.id = flight_id AND q.org_id = public.get_my_org_id())
);

DROP POLICY IF EXISTS "Anon can view flight_amenities" ON public.flight_amenities;
DROP POLICY IF EXISTS "Anon can view flight_amenities" ON public.flight_amenities;
DROP POLICY IF EXISTS "Anon can view flight_amenities" ON public.flight_amenities;
DROP POLICY IF EXISTS "Anon can view flight_amenities" ON public.flight_amenities;
CREATE POLICY "Anon can view flight_amenities" ON public.flight_amenities FOR SELECT TO anon USING (true);
DROP POLICY IF EXISTS "Auth can view flight_amenities" ON public.flight_amenities;
DROP POLICY IF EXISTS "Auth can view flight_amenities" ON public.flight_amenities;
DROP POLICY IF EXISTS "Auth can view flight_amenities" ON public.flight_amenities;
DROP POLICY IF EXISTS "Auth can view flight_amenities" ON public.flight_amenities;
CREATE POLICY "Auth can view flight_amenities" ON public.flight_amenities FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.flights f JOIN public.quotations q ON q.id = f.quote_id WHERE f.id = flight_id AND q.org_id = public.get_my_org_id())
);
DROP POLICY IF EXISTS "Auth can modify flight_amenities" ON public.flight_amenities;
DROP POLICY IF EXISTS "Auth can modify flight_amenities" ON public.flight_amenities;
DROP POLICY IF EXISTS "Auth can modify flight_amenities" ON public.flight_amenities;
DROP POLICY IF EXISTS "Auth can modify flight_amenities" ON public.flight_amenities;
CREATE POLICY "Auth can modify flight_amenities" ON public.flight_amenities FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.flights f JOIN public.quotations q ON q.id = f.quote_id WHERE f.id = flight_id AND q.org_id = public.get_my_org_id())
);

-- Second level children (itinerary_items) referencing itinerary_day_id
DROP POLICY IF EXISTS "Anon can view itinerary_items" ON public.itinerary_items;
DROP POLICY IF EXISTS "Anon can view itinerary_items" ON public.itinerary_items;
DROP POLICY IF EXISTS "Anon can view itinerary_items" ON public.itinerary_items;
DROP POLICY IF EXISTS "Anon can view itinerary_items" ON public.itinerary_items;
CREATE POLICY "Anon can view itinerary_items" ON public.itinerary_items FOR SELECT TO anon USING (true);
DROP POLICY IF EXISTS "Auth can view itinerary_items" ON public.itinerary_items;
DROP POLICY IF EXISTS "Auth can view itinerary_items" ON public.itinerary_items;
DROP POLICY IF EXISTS "Auth can view itinerary_items" ON public.itinerary_items;
DROP POLICY IF EXISTS "Auth can view itinerary_items" ON public.itinerary_items;
CREATE POLICY "Auth can view itinerary_items" ON public.itinerary_items FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.itinerary_days d JOIN public.quotations q ON q.id = d.quote_id WHERE d.id = itinerary_day_id AND q.org_id = public.get_my_org_id())
);
DROP POLICY IF EXISTS "Auth can modify itinerary_items" ON public.itinerary_items;
DROP POLICY IF EXISTS "Auth can modify itinerary_items" ON public.itinerary_items;
DROP POLICY IF EXISTS "Auth can modify itinerary_items" ON public.itinerary_items;
DROP POLICY IF EXISTS "Auth can modify itinerary_items" ON public.itinerary_items;
CREATE POLICY "Auth can modify itinerary_items" ON public.itinerary_items FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.itinerary_days d JOIN public.quotations q ON q.id = d.quote_id WHERE d.id = itinerary_day_id AND q.org_id = public.get_my_org_id())
);

-- ==========================================
-- POLICIES FOR GUIDE PAGES
-- ==========================================
DROP POLICY IF EXISTS "Anon can view public guide_pages" ON public.guide_pages;
DROP POLICY IF EXISTS "Anon can view public guide_pages" ON public.guide_pages;
DROP POLICY IF EXISTS "Anon can view public guide_pages" ON public.guide_pages;
DROP POLICY IF EXISTS "Anon can view public guide_pages" ON public.guide_pages;
CREATE POLICY "Anon can view public guide_pages" ON public.guide_pages 
  FOR SELECT TO anon USING (is_public = true);

DROP POLICY IF EXISTS "Auth can manage guide_pages" ON public.guide_pages;
DROP POLICY IF EXISTS "Auth can manage guide_pages" ON public.guide_pages;
DROP POLICY IF EXISTS "Auth can manage guide_pages" ON public.guide_pages;
DROP POLICY IF EXISTS "Auth can manage guide_pages" ON public.guide_pages;
CREATE POLICY "Auth can manage guide_pages" ON public.guide_pages
  FOR ALL TO authenticated USING (org_id = public.get_my_org_id());

DROP POLICY IF EXISTS "Anon can view public route_stops" ON public.route_stops;
DROP POLICY IF EXISTS "Anon can view public route_stops" ON public.route_stops;
DROP POLICY IF EXISTS "Anon can view public route_stops" ON public.route_stops;
DROP POLICY IF EXISTS "Anon can view public route_stops" ON public.route_stops;
CREATE POLICY "Anon can view public route_stops" ON public.route_stops
  FOR SELECT TO anon USING (
    EXISTS (SELECT 1 FROM public.guide_pages p WHERE p.id = guide_page_id AND p.is_public = true)
  );

DROP POLICY IF EXISTS "Auth can manage route_stops" ON public.route_stops;
DROP POLICY IF EXISTS "Auth can manage route_stops" ON public.route_stops;
DROP POLICY IF EXISTS "Auth can manage route_stops" ON public.route_stops;
DROP POLICY IF EXISTS "Auth can manage route_stops" ON public.route_stops;
CREATE POLICY "Auth can manage route_stops" ON public.route_stops
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.guide_pages p WHERE p.id = guide_page_id AND p.org_id = public.get_my_org_id())
  );
