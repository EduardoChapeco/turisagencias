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
 .from('group_trips')
 .select('*')
 .eq('org_id', organization.id)
 .eq('is_public', true)
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
 .from('group_trips')
 .select('*, group_trip_days(*)')
 .eq('org_id', organization.id)
 .eq('id', tripId!)
 .maybeSingle();

 if (error) throw error;
 if (!data) throw new Error('Viagem não encontrada');

 // The new structure maps itinerary directly in `group_trip_days`
 const itineraryStops = (data.group_trip_days || []).sort((a: any, b: any) => a.day_number - b.day_number);

 return { organization, trip: data, itineraryStops };
 },
 enabled: !!slug && !!tripId,
 });
}
