DROP FUNCTION IF EXISTS public.get_public_group_trip(text);

CREATE OR REPLACE FUNCTION public.get_public_group_trip(_slug text)
 RETURNS TABLE(id uuid, org_id uuid, title text, subtitle text, slug text, cover_image_url text, gallery_urls text[], destination text, origin_city text, departure_date date, return_date date, num_days integer, num_nights integer, price_per_pax numeric, currency text, max_pax integer, current_pax integer, description_md text, includes text[], excludes text[], important_notes text, transport_type text, installments_count integer, org_name text, org_logo text, org_whatsapp text, org_primary_color text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.group_trips SET view_count = view_count + 1
  WHERE group_trips.slug = _slug AND is_public = true AND status = 'published';

  RETURN QUERY
  SELECT
    gt.id, gt.org_id, gt.title, gt.subtitle, gt.slug,
    gt.cover_image_url, gt.gallery_urls,
    gt.destination, gt.origin_city,
    gt.departure_date, gt.return_date, gt.num_days, gt.num_nights,
    gt.price_per_pax, gt.currency, gt.max_pax, gt.current_pax,
    gt.description_md, gt.includes, gt.excludes, gt.important_notes,
    gt.transport_type, gt.installments_count,
    o.name, o.logo_url, o.whatsapp, o.primary_color
  FROM public.group_trips gt
  JOIN public.organizations o ON o.id = gt.org_id
  WHERE gt.slug = _slug AND gt.is_public = true AND gt.status = 'published';
END;
$function$;

DROP POLICY IF EXISTS "public can create bookings for published trips" ON public.group_bookings;
CREATE POLICY "public can create bookings for published trips"
ON public.group_bookings
FOR INSERT
TO anon, authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.group_trips gt
    WHERE gt.id = group_bookings.group_trip_id
      AND gt.is_public = true
      AND gt.status = 'published'
      AND gt.org_id = group_bookings.org_id
  )
);

DROP POLICY IF EXISTS "public read booking by token" ON public.group_bookings;
CREATE POLICY "public read booking by token"
ON public.group_bookings
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "public read installments via booking" ON public.booking_installments;
CREATE POLICY "public read installments via booking"
ON public.booking_installments
FOR SELECT
TO anon, authenticated
USING (true);