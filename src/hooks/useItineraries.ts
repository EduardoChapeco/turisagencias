import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

// Full Itinerary interface matching the DB schema
export interface Itinerary {
  id: string;
  org_id: string;
  quotation_id?: string;
  created_by?: string;
  title: string;
  subtitle?: string;
  cover_image_url?: string;
  cover_emoji?: string;
  destination?: string;
  origin?: string;
  destination_lat?: number;
  destination_lng?: number;
  departure_date?: string;
  return_date?: string;
  num_days?: number;
  is_public: boolean;
  public_token: string;
  pdf_requires_lead?: boolean;
  pdf_url?: string;
  is_group_itinerary: boolean;
  group_name?: string;
  max_pax?: number;
  current_pax?: number;
  includes_text?: string[];
  excludes_text?: string[];
  important_notes?: string;
  ai_generated?: boolean;
  ai_prompt_used?: string;
  view_count?: number;
  share_count?: number;
  lead_count?: number;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at?: string;
}

// ItineraryStop matching the DB schema
export interface ItineraryStop {
  id: string;
  itinerary_id: string;
  day_number: number;
  position: number;
  stop_type?: string;
  emoji?: string;
  category?: string;
  name: string;
  address?: string;
  city?: string;
  country?: string;
  lat?: number;
  lng?: number;
  time_start?: string;
  duration_minutes?: number;
  description?: string;
  tips?: string[];
  photo_url?: string;
  rating?: number;
  experience_id?: string;
  hotel_id?: string;
  destination_id?: string;
  is_optional?: boolean;
  created_at?: string;
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
      return data as Itinerary;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['itineraries'] });
      toast({ title: 'Roteiro criado com sucesso!' });
    },
    onError: (error: any) => {
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
      return data as Itinerary;
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
      return data as ItineraryStop[];
    },
    enabled: !!itineraryId,
  });

  const addStopMutation = useMutation({
    mutationFn: async (newStop: Partial<ItineraryStop>) => {
      const { data, error } = await supabase
        .from('itinerary_stops')
        .insert([{ ...newStop, itinerary_id: itineraryId } as any])
        .select()
        .single();
      if (error) throw error;
      return data as ItineraryStop;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['itinerary_stops', itineraryId] })
  });

  const generateWithAiMutation = useMutation({
    mutationFn: async ({ prompt, orgId }: { prompt: string; orgId: string }) => {
      const { data, error } = await supabase.functions.invoke('generate-itinerary', {
        body: { prompt, org_id: orgId }
      });
      if (error) throw error;

      const aiStops = data?.trip?.stops || [];
      if (aiStops.length === 0) throw new Error('A IA não retornou paradas. Tente descrever a viagem com mais detalhes.');

      // Geocode all stops (in sequence to avoid rate-limiting by Nominatim)
      const stopsToInsert: Partial<ItineraryStop>[] = [];
      for (let index = 0; index < aiStops.length; index++) {
        const stop = aiStops[index];
        let lat: number | null = null;
        let lng: number | null = null;

        if (stop.address) {
          try {
            const { data: geo } = await supabase.functions.invoke('geocode-address', {
              body: { address: stop.address }
            });
            if (geo && geo.lat) {
              lat = geo.lat;
              lng = geo.lng;
            }
          } catch {
            // geocoding failure is non-fatal
          }
        }

        // Assign day number from AI if provided, otherwise distribute 3 stops per day
        const day = stop.day || Math.ceil((index + 1) / 3);

        stopsToInsert.push({
          itinerary_id: itineraryId!,
          day_number: day,
          position: index,
          name: stop.name,
          address: stop.address,
          lat: lat ?? undefined,
          lng: lng ?? undefined,
          duration_minutes: stop.duration_minutes,
          stop_type: stop.type,
          emoji: stop.emoji,
          category: stop.category,
          description: stop.description,
          tips: stop.tips || [],
          rating: stop.rating,
          time_start: stop.time
        });
      }

      if (stopsToInsert.length > 0) {
        const { error: insErr } = await supabase.from('itinerary_stops').insert(stopsToInsert as any);
        if (insErr) throw insErr;
      }

      return stopsToInsert;
    },
    onSuccess: () => {
      toast({ title: '✅ Roteiro gerado com sucesso!' });
      queryClient.invalidateQueries({ queryKey: ['itinerary_stops', itineraryId] });
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao gerar roteiro', description: error.message, variant: 'destructive' });
    }
  });

  return {
    stops,
    isLoading,
    addStop: addStopMutation.mutateAsync,
    generateAI: generateWithAiMutation.mutateAsync,
    generateAILoading: generateWithAiMutation.isPending
  };
}
