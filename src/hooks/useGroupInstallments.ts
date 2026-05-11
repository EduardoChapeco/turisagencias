/**
 * src/hooks/useGroupInstallments.ts
 *
 * CRUD para parcelas individuais dos clientes do grupo.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useOrganization } from '@/hooks/useOrganization';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type GroupInstallmentStatus = 'pendente' | 'pago' | 'atrasado' | 'cancelado';
export type GroupInstallmentMethod = 'pix' | 'cartao' | 'boleto' | 'transferencia' | 'dinheiro';

export interface GroupInstallment {
  id: string;
  org_id: string;
  group_client_id: string;
  group_trip_id: string;

  numero_parcela: number;
  valor: number;
  data_vencimento: string; // YYYY-MM-DD
  data_pagamento: string | null; // YYYY-MM-DD

  status: GroupInstallmentStatus;
  metodo_pagamento: GroupInstallmentMethod | null;
  comprovante_url: string | null;
  notas: string | null;

  created_at: string;
  updated_at: string;
}

const QK_TRIP = (groupTripId: string | undefined) => ['group_installments_trip', groupTripId] as const;
const QK_CLIENT = (groupClientId: string | undefined) => ['group_installments_client', groupClientId] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────────────────────────────────────────

export const useGroupInstallmentsByTrip = (groupTripId: string | undefined) => {
  return useQuery({
    queryKey: QK_TRIP(groupTripId),
    queryFn: async () => {
      if (!groupTripId) return [];
      const { data, error } = await (supabase as any)
        .from('group_installments')
        .select('*')
        .eq('group_trip_id', groupTripId)
        .order('data_vencimento', { ascending: true });
      if (error) throw error;
      return data as GroupInstallment[];
    },
    enabled: !!groupTripId,
  });
};

export const useGroupInstallmentsByClient = (groupClientId: string | undefined) => {
  return useQuery({
    queryKey: QK_CLIENT(groupClientId),
    queryFn: async () => {
      if (!groupClientId) return [];
      const { data, error } = await (supabase as any)
        .from('group_installments')
        .select('*')
        .eq('group_client_id', groupClientId)
        .order('numero_parcela', { ascending: true });
      if (error) throw error;
      return data as GroupInstallment[];
    },
    enabled: !!groupClientId,
  });
};

export const useCreateGroupInstallment = () => {
  const qc = useQueryClient();
  const { organization } = useOrganization();

  return useMutation({
    mutationFn: async (
      payload: Omit<Partial<GroupInstallment>, 'id' | 'org_id' | 'created_at' | 'updated_at'>
    ) => {
      const { data, error } = await (supabase as any)
        .from('group_installments')
        .insert({ ...payload, org_id: organization?.id })
        .select()
        .single();
      if (error) throw error;
      return data as GroupInstallment;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: QK_TRIP(data.group_trip_id) });
      qc.invalidateQueries({ queryKey: QK_CLIENT(data.group_client_id) });
    },
    onError: (err: Error) => {
      toast.error(`Erro ao criar parcela: ${err.message}`);
    },
  });
};

export const useUpdateGroupInstallment = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<GroupInstallment> & { id: string }) => {
      const { data, error } = await (supabase as any)
        .from('group_installments')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as GroupInstallment;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: QK_TRIP(data.group_trip_id) });
      qc.invalidateQueries({ queryKey: QK_CLIENT(data.group_client_id) });
      toast.success('Parcela atualizada!');
    },
    onError: (err: Error) => {
      toast.error(`Erro ao atualizar parcela: ${err.message}`);
    },
  });
};

export const useDeleteGroupInstallment = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, group_client_id, group_trip_id }: { id: string; group_client_id: string; group_trip_id: string }) => {
      const { error } = await supabase.from('group_installments' as any).delete().eq('id', id);
      if (error) throw error;
      return { group_client_id, group_trip_id };
    },
    onSuccess: ({ group_client_id, group_trip_id }) => {
      qc.invalidateQueries({ queryKey: QK_TRIP(group_trip_id) });
      qc.invalidateQueries({ queryKey: QK_CLIENT(group_client_id) });
    },
  });
};
