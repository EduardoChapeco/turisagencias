import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function usePortalOrganization(slug: string | undefined) {
  return useQuery({
    queryKey: ['portal-org', slug],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_public_organization_by_slug', { _slug: slug! });
      if (error) throw error;
      return data?.[0] ?? null;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePortalTrips(slug: string | undefined) {
  return useQuery({
    queryKey: ['portal-trips', slug],
    queryFn: async () => {
      const { data: org, error: orgError } = await supabase.rpc('get_public_organization_by_slug', { _slug: slug! });
      if (orgError) throw orgError;
      const organization = org?.[0];
      if (!organization) return [];

      const { data, error } = await supabase
        .from('trips')
        .select('*, trip_documents(*), trip_flights(*)')
        .eq('org_id', organization.id)
        .order('departure_date', { ascending: true });

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!slug,
  });
}

export function usePortalTrip(slug: string | undefined, tripId: string | undefined) {
  return useQuery({
    queryKey: ['portal-trip', slug, tripId],
    queryFn: async () => {
      const { data: org, error: orgError } = await supabase.rpc('get_public_organization_by_slug', { _slug: slug! });
      if (orgError) throw orgError;
      const organization = org?.[0];
      if (!organization) throw new Error('Organização não encontrada');

      const { data, error } = await supabase
        .from('trips')
        .select('*, trip_documents(*), trip_flights(*), trip_travelers(*, travelers(full_name))')
        .eq('org_id', organization.id)
        .eq('id', tripId!)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Viagem não encontrada');

      // If the trip has an itinerary_id, fetch its stops
      let itineraryStops: any[] = [];
      let itineraryData: any = null;
      if (data.itinerary_id) {
        const [itin, stops] = await Promise.all([
          supabase
            .from('itineraries')
            .select('*')
            .eq('id', data.itinerary_id)
            .maybeSingle(),
          supabase
            .from('itinerary_stops')
            .select('*')
            .eq('itinerary_id', data.itinerary_id)
            .order('day_number', { ascending: true })
            .order('position', { ascending: true })
        ]);
        itineraryData = itin.data;
        itineraryStops = stops.data ?? [];
      }

      return { organization, trip: data, itinerary: itineraryData, itineraryStops };
    },
    enabled: !!slug && !!tripId,
  });
}
