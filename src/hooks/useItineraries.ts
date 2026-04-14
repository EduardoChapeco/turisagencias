import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import { StopCoordinate } from '@/components/itinerary/ItineraryMap';

export interface Itinerary {
  id: string;
  org_id: string;
  quotation_id?: string;
  title: string;
  subtitle?: string;
  destination?: string;
  origin?: string;
  destination_lat?: number;
  destination_lng?: number;
  departure_date?: string;
  return_date?: string;
  num_days?: number;
  is_public: boolean;
  public_token: string;
  is_group_itinerary: boolean;
  group_name?: string;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
}

export function useItineraries(orgId: string | undefined) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: itineraries, isLoading } = useQuery({
    queryKey: ['itineraries', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('itineraries')
        .select('*')
        .eq('org_id', orgId!)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Itinerary[];
    },
    enabled: !!orgId,
  });

  const createMutation = useMutation({
    mutationFn: async (newItinerary: Partial<Itinerary>) => {
      const { data, error } = await supabase
        .from('itineraries')
        .insert([{ ...newItinerary, org_id: orgId }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['itineraries'] });
      toast({ title: 'Roteiro criado com sucesso!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao criar roteiro', description: error.message, variant: 'destructive' });
    }
  });

  return { itineraries, isLoading, createItinerary: createMutation.mutateAsync };
}

export function useItineraryDetail(itineraryId: string | undefined) {
  return useQuery({
    queryKey: ['itinerary', itineraryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('itineraries')
        .select('*')
        .eq('id', itineraryId!)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!itineraryId,
  });
}

export function useItineraryStops(itineraryId: string | undefined) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stops, isLoading } = useQuery({
    queryKey: ['itinerary_stops', itineraryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('itinerary_stops')
        .select('*')
        .eq('itinerary_id', itineraryId!)
        .order('day_number', { ascending: true })
        .order('position', { ascending: true });

      if (error) throw error;
      return data as any[];
    },
    enabled: !!itineraryId,
  });

  const addStopMutation = useMutation({
     mutationFn: async (newStop: any) => {
       const { data, error } = await supabase
         .from('itinerary_stops')
         .insert([{ ...newStop, itinerary_id: itineraryId }])
         .select()
         .single();
       if (error) throw error;
       return data;
     },
     onSuccess: () => queryClient.invalidateQueries({ queryKey: ['itinerary_stops', itineraryId] })
  });

  const generateWithAiMutation = useMutation({
     mutationFn: async ({ prompt, orgId }: { prompt: string; orgId: string }) => {
        const { data, error } = await supabase.functions.invoke('generate-itinerary', {
           body: { prompt, org_id: orgId }
        });
        if (error) throw error;
        
        // Se a IA retorna { trip: { stops: [] } }, nós inserimos no banco
        const aiStops = data.trip?.stops || [];
        
        // Em paralelo faz geocoding e insere
        const stopsToInsert = await Promise.all(aiStops.map(async (stop: any, index: number) => {
           let geocode = null;
           if (stop.address) {
              const { data: geo } = await supabase.functions.invoke('geocode-address', { body: { address: stop.address }});
              geocode = geo;
           }

           const day = Math.ceil((index + 1) / 3); // rough guess for days

           return {
             itinerary_id: itineraryId,
             day_number: day,
             position: index,
             name: stop.name,
             address: stop.address,
             lat: geocode?.lat || null,
             lng: geocode?.lng || null,
             duration_minutes: stop.duration_minutes,
             stop_type: stop.type,
             emoji: stop.emoji,
             category: stop.category,
             description: stop.description,
             time_start: stop.time
           };
        }));

        if (stopsToInsert.length > 0) {
           const { error: insErr } = await supabase.from('itinerary_stops').insert(stopsToInsert);
           if (insErr) throw insErr;
        }
        
        return stopsToInsert;
     },
     onSuccess: () => {
        toast({ title: 'Roteiro gerado com sucesso!' });
        queryClient.invalidateQueries({ queryKey: ['itinerary_stops', itineraryId] });
     },
     onError: (error) => {
        toast({ title: 'Erro ao gerar', description: error.message, variant: 'destructive' });
     }
  });

  return { stops, isLoading, addStop: addStopMutation.mutateAsync, generateAI: generateWithAiMutation.mutateAsync, generateAILoading: generateWithAiMutation.isPending };
}
