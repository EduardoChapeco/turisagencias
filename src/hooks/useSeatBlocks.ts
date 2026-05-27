/**
 * src/hooks/useSeatBlocks.ts
 *
 * CRUD para bloqueios de assentos aéreos (GOL/LATAM/AZUL).
 * Cada bloco representa um contrato de bloqueio de assentos com uma cia aérea.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type SeatBlockCompanhia = 'GOL' | 'LATAM' | 'AZUL' | 'OUTROS';
export type SeatBlockStatus =
 | 'rascunho'
 | 'confirmado'
 | 'em_vendas'
 | 'nominado'
 | 'encerrado'
 | 'cancelado';

export interface SeatBlock {
 id: string;
 org_id: string;
 group_trip_id: string | null;

 companhia: SeatBlockCompanhia;
 codigo_voo: string | null;
 origem: string | null;
 destino: string | null;
 data_ida: string | null;
 data_volta: string | null;
 classe: string | null;

 total_assentos: number;
 assentos_vendidos: number;

 custo_passagem_unit: number | null;

 prazo_nominacao: string | null;
 prazo_pagamento: string | null;
 localizador_bloco: string | null;
 condicoes_bloco: string | null;

 proposta_url: string | null;
 proposta_nome: string | null;
 ocr_raw_text: string | null;

 status: SeatBlockStatus;
 created_at: string;
 updated_at: string;

 // Computed helpers (calculated on frontend)
 assentos_disponiveis?: number;
 custo_total_bloco?: number;
 percentual_vendido?: number;
}

const QK = (orgId: string | undefined) => ['seat_blocks', orgId] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────────────────────────────────────────

export const useSeatBlocks = (groupTripId?: string) => {
 const { organization } = useAuthStore();
 const orgId = organization?.id;

 return useQuery({
 queryKey: [...QK(orgId), groupTripId],
 queryFn: async () => {
 if (!orgId) return [];
 let q = supabase
 .from('seat_blocks')
 .select('*')
 .eq('org_id', orgId)
 .order('created_at', { ascending: false });

 if (groupTripId) {
 q = q.eq('group_trip_id', groupTripId);
 }

 const { data, error } = await q;
 if (error) throw error;

 // Compute derived fields
 return (data as SeatBlock[]).map((b) => ({
 ...b,
 assentos_disponiveis: b.total_assentos - b.assentos_vendidos,
 custo_total_bloco: (b.custo_passagem_unit ?? 0) * b.total_assentos,
 percentual_vendido:
 b.total_assentos > 0
 ? Math.round((b.assentos_vendidos / b.total_assentos) * 100)
 : 0,
 }));
 },
 enabled: !!orgId,
 });
};

export const useCreateSeatBlock = () => {
 const qc = useQueryClient();
 const { organization } = useAuthStore();

 return useMutation({
 mutationFn: async (payload: Omit<Partial<SeatBlock>, 'id' | 'org_id' | 'created_at' | 'updated_at'>) => {
 const { data, error } = await supabase
 .from('seat_blocks')
 .insert({ ...payload, org_id: organization?.id })
 .select()
 .single();
 if (error) throw error;
 return data as SeatBlock;
 },
 onSuccess: () => {
 qc.invalidateQueries({ queryKey: QK(organization?.id) });
 toast.success('Bloqueio criado com sucesso!');
 },
 onError: (err: Error) => {
 toast.error(`Erro ao criar bloqueio: ${err.message}`);
 },
 });
};

export const useUpdateSeatBlock = () => {
 const qc = useQueryClient();
 const { organization } = useAuthStore();

 return useMutation({
 mutationFn: async ({ id, ...payload }: Partial<SeatBlock> & { id: string }) => {
 // Strip computed fields
 const { assentos_disponiveis: _a, custo_total_bloco: _c, percentual_vendido: _p, ...dbPayload } = payload;
 const { data, error } = await supabase
 .from('seat_blocks')
 .update(dbPayload)
 .eq('id', id)
 .select()
 .single();
 if (error) throw error;
 return data as SeatBlock;
 },
 onSuccess: () => {
 qc.invalidateQueries({ queryKey: QK(organization?.id) });
 toast.success('Bloqueio atualizado!');
 },
 onError: (err: Error) => {
 toast.error(`Erro ao atualizar: ${err.message}`);
 },
 });
};

export const useDeleteSeatBlock = () => {
 const qc = useQueryClient();
 const { organization } = useAuthStore();

 return useMutation({
 mutationFn: async (id: string) => {
 const { error } = await supabase.from('seat_blocks' as any).delete().eq('id', id);
 if (error) throw error;
 },
 onSuccess: () => {
 qc.invalidateQueries({ queryKey: QK(organization?.id) });
 toast.success('Bloqueio excluído.');
 },
 });
};
