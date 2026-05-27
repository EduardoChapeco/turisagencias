import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';
import type { SeatCell } from '@/components/group-trips/BusSeatMap';
import { generateDefaultBusLayout } from '@/components/group-trips/BusSeatMap';

export interface BusLayoutRecord {
 id: string;
 org_id: string;
 name: string;
 vehicle_type: string;
 rows: number;
 cols: number;
 seat_map: SeatCell[][];
 notes: string | null;
 created_at: string;
 updated_at: string;
}

// ── LIST ──────────────────────────────────────────────────────────────────────
export function useBusLayouts() {
 const { organization } = useAuthStore();
 return useQuery({
 queryKey: ['bus_layouts', organization?.id],
 enabled: !!organization?.id,
 queryFn: async () => {
 const { data, error } = await supabase
 .from('bus_layouts')
 .select('*')
 .eq('org_id', organization!.id)
 .order('created_at', { ascending: false });
 if (error) throw error;
 return (data ?? []) as BusLayoutRecord[];
 },
 });
}

// ── CREATE ────────────────────────────────────────────────────────────────────
export function useCreateBusLayout() {
 const { organization } = useAuthStore();
 const queryClient = useQueryClient();
 const { toast } = useToast();

 return useMutation({
 mutationFn: async (payload: {
 name: string;
 vehicle_type: string;
 rows: number;
 cols: number;
 notes?: string | null;
 }) => {
 const layout = generateDefaultBusLayout(payload.rows - 1, payload.cols > 4 ? payload.cols - 1 : payload.cols);
 const { data, error } = await supabase
 .from('bus_layouts')
 .insert({
 org_id: organization!.id,
 name: payload.name,
 vehicle_type: payload.vehicle_type,
 rows: layout.rows,
 cols: layout.cols,
 seat_map: layout.seat_map as any, // Cast JSON compatibility for insertion
 notes: payload.notes ?? null,
 })
 .select()
 .single();
 if (error) throw error;
 return data as BusLayoutRecord;
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['bus_layouts'] });
 toast({ title: 'Layout criado!' });
 },
 onError: (e: Error) => toast({ title: 'Erro ao criar layout', description: e.message, variant: 'destructive' }),
 });
}

// ── UPDATE ────────────────────────────────────────────────────────────────────
export function useUpdateBusLayout() {
 const queryClient = useQueryClient();
 const { toast } = useToast();

 return useMutation({
 mutationFn: async ({
 id,
 name,
 vehicle_type,
 rows,
 cols,
 seat_map,
 notes,
 }: {
 id: string;
 name: string;
 vehicle_type: string;
 rows: number;
 cols: number;
 seat_map: SeatCell[][];
 notes?: string | null;
 }) => {
 const { data, error } = await supabase
 .from('bus_layouts')
 .update({
 name,
 vehicle_type,
 rows,
 cols,
 seat_map: seat_map as any,
 notes: notes ?? null,
 })
 .eq('id', id)
 .select()
 .single();
 if (error) throw error;
 return data as BusLayoutRecord;
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['bus_layouts'] });
 toast({ title: 'Layout atualizado' });
 },
 onError: (e: Error) => toast({ title: 'Erro ao atualizar layout', description: e.message, variant: 'destructive' }),
 });
}

// ── DELETE ────────────────────────────────────────────────────────────────────
export function useDeleteBusLayout() {
 const queryClient = useQueryClient();
 const { toast } = useToast();

 return useMutation({
 mutationFn: async (id: string) => {
 const { error } = await supabase.from('bus_layouts').delete().eq('id', id);
 if (error) throw error;
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['bus_layouts'] });
 toast({ title: 'Layout removido' });
 },
 onError: (e: Error) => toast({ title: 'Erro ao remover', description: e.message, variant: 'destructive' }),
 });
}
