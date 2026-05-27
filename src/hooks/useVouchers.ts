/**
 * src/hooks/useVouchers.ts
 *
 * Hook para CRUD de vouchers / boarding passes (tabela `vouchers`).
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

export interface VoucherRecord {
  id: string;
  org_id: string;
  client_id: string | null;
  trip_id: string | null;
  destino: string | null;
  localizador: string | null;
  passageiros: string | null;
  data_checkin: string | null;
  data_checkout: string | null;
  hotel: string | null;
  voos: string | null;
  transfer: string | null;
  emergencia: string | null;
  media_url: string | null;
  media_name: string | null;
  pdf_url: string | null;
  ocr_raw_text: string | null;
  created_at: string;
  updated_at: string;
}

export type VoucherUpsert = Partial<
  Omit<VoucherRecord, 'id' | 'org_id' | 'created_at' | 'updated_at'>
>;

const QK = 'vouchers';

export function useVouchers() {
  const { organization } = useAuthStore();

  return useQuery<VoucherRecord[]>({
    queryKey: [QK, organization?.id],
    queryFn: async () => {
      const db = supabase as any;
      const { data, error } = await db
        .from('vouchers')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as VoucherRecord[];
    },
    enabled: !!organization?.id,
  });
}

export function useCreateVoucher() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: VoucherUpsert) => {
      const db = supabase as any;
      const { data, error } = await db
        .from('vouchers')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data as VoucherRecord;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [QK] });
      toast.success('Voucher salvo!');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateVoucher() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...payload }: VoucherUpsert & { id: string }) => {
      const db = supabase as any;
      const { data, error } = await db
        .from('vouchers')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as VoucherRecord;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [QK] });
      toast.success('Voucher atualizado!');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteVoucher() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const db = supabase as any;
      const { error } = await db.from('vouchers').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [QK] });
      toast.success('Voucher excluído.');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
