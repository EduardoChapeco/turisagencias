import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type Destination = {
  id: string;
  slug: string;
  name: string;
  country: string;
  region?: string;
  iata_gateway?: string;
  gateway_rules?: {
    gateway_city?: string;
    gateway_iata?: string;
    transfer_type?: string;
    transfer_notes?: string;
    min_connection_hours?: number;
  };
  transfer_time_hours?: number;
  best_season?: string[];
  avoid_season?: string[];
  is_active?: boolean;
  created_at: string;
};

export function useDestinations() {
  return useQuery({
    queryKey: ['destinations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .order('country', { ascending: true })
        .order('name', { ascending: true });
      if (error) throw error;
      return data as Destination[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpsertDestination() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (payload: Partial<Destination> & { slug: string; name: string; country: string }) => {
      const { id, ...rest } = payload;
      if (id) {
        const { data, error } = await supabase
          .from('destinations')
          .update(rest)
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('destinations')
          .insert(rest)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['destinations'] });
      toast({ title: vars.id ? 'Destino atualizado!' : 'Destino criado!', description: vars.name });
    },
    onError: (e: Error) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });
}

export function useDeleteDestination() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('destinations').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['destinations'] });
      toast({ title: 'Destino removido.' });
    },
    onError: (e: Error) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });
}

export function useToggleDestinationActive() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('destinations')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['destinations'] }),
    onError: (e: Error) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });
}
