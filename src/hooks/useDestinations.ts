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
  created_at: string | null;
};

const parseSeasonList = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === 'string') return value.split(',').map((item) => item.trim()).filter(Boolean);
  return [];
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
      return (data ?? []).map((row: any) => ({
        ...row,
        best_season: parseSeasonList(row.best_season),
        avoid_season: parseSeasonList(row.avoid_season),
        is_active: row.is_active ?? true,
      })) as Destination[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpsertDestination() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (payload: Partial<Destination> & Record<string, any>) => {
      const { id, iata_gateway, gateway_rules, transfer_time_hours, avoid_season, is_active, ...rest } = payload;
      void iata_gateway;
      void gateway_rules;
      void transfer_time_hours;
      void avoid_season;
      void is_active;
      const dbPayload = {
        ...rest,
        best_season: Array.isArray(rest.best_season) ? rest.best_season.join(',') : rest.best_season,
      } as any;
      if (id) {
        const { data, error } = await supabase
          .from('destinations')
          .update(dbPayload)
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('destinations')
          .insert(dbPayload)
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
    mutationFn: async (_payload: { id: string; is_active: boolean }) => {
      throw new Error('O schema atual de destinations nao possui coluna is_active.');
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['destinations'] }),
    onError: (e: Error) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });
}
