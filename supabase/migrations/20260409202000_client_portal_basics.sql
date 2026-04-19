-- Basic client portal support

DROP FUNCTION IF EXISTS public.get_public_organization_by_slug CASCADE;
DROP FUNCTION IF EXISTS public.get_public_organization_by_slug CASCADE;
CREATE OR REPLACE FUNCTION public.get_public_organization_by_slug(_slug TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  logo_url TEXT,
  primary_color TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT o.id, o.name, o.slug, o.logo_url, o.primary_color
  FROM public.organizations o
  WHERE o.slug = _slug
    AND o.is_active = true
  LIMIT 1
$$;

DROP POLICY IF EXISTS "Clients can view own trips by email" ON public.trips;
DROP POLICY IF EXISTS "Clients can view own trips by email" ON public.trips;
DROP POLICY IF EXISTS "Clients can view own trips by email" ON public.trips;
DROP POLICY IF EXISTS "Clients can view own trips by email" ON public.trips;
DROP POLICY IF EXISTS "Clients can view own trips by email" ON public.trips;
CREATE POLICY "Clients can view own trips by email" ON public.trips FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.clients c
      WHERE c.id = trips.primary_client_id
        AND c.portal_access_enabled = true
        AND c.email = auth.jwt() ->> 'email'
    )
  );

DROP POLICY IF EXISTS "Clients can view own trip flights by email" ON public.trip_flights;
DROP POLICY IF EXISTS "Clients can view own trip flights by email" ON public.trip_flights;
DROP POLICY IF EXISTS "Clients can view own trip flights by email" ON public.trip_flights;
DROP POLICY IF EXISTS "Clients can view own trip flights by email" ON public.trip_flights;
DROP POLICY IF EXISTS "Clients can view own trip flights by email" ON public.trip_flights;
CREATE POLICY "Clients can view own trip flights by email" ON public.trip_flights FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.trips t
      JOIN public.clients c ON c.id = t.primary_client_id
      WHERE t.id = trip_flights.trip_id
        AND c.portal_access_enabled = true
        AND c.email = auth.jwt() ->> 'email'
    )
  );

DROP POLICY IF EXISTS "Clients can view own trip travelers by email" ON public.trip_travelers;
DROP POLICY IF EXISTS "Clients can view own trip travelers by email" ON public.trip_travelers;
DROP POLICY IF EXISTS "Clients can view own trip travelers by email" ON public.trip_travelers;
DROP POLICY IF EXISTS "Clients can view own trip travelers by email" ON public.trip_travelers;
DROP POLICY IF EXISTS "Clients can view own trip travelers by email" ON public.trip_travelers;
CREATE POLICY "Clients can view own trip travelers by email" ON public.trip_travelers FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.trips t
      JOIN public.clients c ON c.id = t.primary_client_id
      WHERE t.id = trip_travelers.trip_id
        AND c.portal_access_enabled = true
        AND c.email = auth.jwt() ->> 'email'
    )
  );

DROP POLICY IF EXISTS "Clients can view visible trip documents by email" ON public.trip_documents;
DROP POLICY IF EXISTS "Clients can view visible trip documents by email" ON public.trip_documents;
DROP POLICY IF EXISTS "Clients can view visible trip documents by email" ON public.trip_documents;
DROP POLICY IF EXISTS "Clients can view visible trip documents by email" ON public.trip_documents;
DROP POLICY IF EXISTS "Clients can view visible trip documents by email" ON public.trip_documents;
CREATE POLICY "Clients can view visible trip documents by email" ON public.trip_documents FOR SELECT TO authenticated
  USING (
    is_visible_to_client = true
    AND EXISTS (
      SELECT 1
      FROM public.trips t
      JOIN public.clients c ON c.id = t.primary_client_id
      WHERE t.id = trip_documents.trip_id
        AND c.portal_access_enabled = true
        AND c.email = auth.jwt() ->> 'email'
    )
  );
