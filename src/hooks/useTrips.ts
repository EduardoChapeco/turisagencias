import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';
import type { TripFormValues } from '@/types';

export function useTrips() {
  const { organization } = useAuthStore();

  return useQuery({
    queryKey: ['trips', organization?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trips')
        .select('*, clients:primary_client_id(name)')
        .order('departure_date', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!organization,
    staleTime: 2 * 60 * 1000,
  });
}

export function useTrip(id: string | undefined) {
  return useQuery({
    queryKey: ['trip', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trips')
        .select('*, clients:primary_client_id(name), trip_flights(*), trip_documents(*), trip_travelers(*, travelers(full_name))')
        .eq('id', id!)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Viagem não encontrada');
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateTrip() {
  const queryClient = useQueryClient();
  const { organization, user } = useAuthStore();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (payload: TripFormValues) => {
      const { data, error } = await supabase
        .from('trips')
        .insert({
          ...payload,
          org_id: organization!.id,
          assigned_agent_id: payload.assigned_agent_id ?? user?.id ?? null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      toast({ title: 'Viagem criada!' });
    },
    onError: (err: Error) => {
      toast({ title: 'Erro ao criar viagem', description: err.message, variant: 'destructive' });
    },
  });
}

export function useTripFlights(tripId: string | undefined) {
  return useQuery({
    queryKey: ['trip-flights', tripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trip_flights')
        .select('*')
        .eq('trip_id', tripId!)
        .order('sequence', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!tripId,
  });
}

export function useTripDocuments(tripId: string | undefined) {
  return useQuery({
    queryKey: ['trip-documents', tripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trip_documents')
        .select('*')
        .eq('trip_id', tripId!)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!tripId,
  });
}
