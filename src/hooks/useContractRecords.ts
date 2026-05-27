/**
 * src/hooks/useContractRecords.ts
 *
 * Hook para CRUD de contratos jurídicos gerados (tabela `contracts`).
 * Distinto de useContracts.ts que gerencia `contract_templates`.
 * Usa React Query + Supabase, com org_id resolvido automaticamente via RLS.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ContractRecord {
  id: string;
  org_id: string;
  client_id: string | null;
  trip_id: string | null;
  template_id: string | null;
  numero: string | null;
  status: 'rascunho' | 'emitido' | 'assinado' | 'cancelado';
  titular: string | null;
  pacote: string | null;
  destino: string | null;
  data_inicio: string | null;
  data_fim: string | null;
  valor_total: number | null;
  contratante: Record<string, unknown>;
  pagantes: unknown[];
  passageiros: unknown[];
  voos: unknown[];
  hospedagem: unknown[];
  financeiro: Record<string, unknown>;
  pdf_url: string | null;
  ocr_raw_text: string | null;
  created_at: string;
  updated_at: string;
}

export type ContractRecordUpsert = Partial<
  Omit<ContractRecord, 'id' | 'org_id' | 'created_at' | 'updated_at'>
>;

const QK = 'contract_records';

// ─────────────────────────────────────────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────────────────────────────────────────

export function useContractRecords() {
  const { organization } = useAuthStore();

  return useQuery<ContractRecord[]>({
    queryKey: [QK, organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];
      const db = supabase as any;
      const { data, error } = await db
        .from('contracts')
        .select('*')
        .eq('org_id', organization.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as ContractRecord[];
    },
    enabled: !!organization?.id,
  });
}

export function useCreateContractRecord() {
  const qc = useQueryClient();
  const { organization } = useAuthStore();

  return useMutation({
    mutationFn: async (payload: ContractRecordUpsert) => {
      if (!organization?.id) throw new Error('Organização não autenticada');
      const now = new Date();
      const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
      const randPart = Math.random().toString(36).substring(2, 6).toUpperCase();
      const numero = payload.numero || `CT-${datePart}-${randPart}`;

      const db = supabase as any;
      const { data, error } = await db
        .from('contracts')
        .insert({ ...payload, org_id: organization.id, numero, status: payload.status ?? 'emitido' })
        .select()
        .single();
      if (error) throw error;
      return data as ContractRecord;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [QK] });
      toast.success('Contrato salvo!');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateContractRecord() {
  const qc = useQueryClient();
  const { organization } = useAuthStore();

  return useMutation({
    mutationFn: async ({ id, ...payload }: ContractRecordUpsert & { id: string }) => {
      if (!organization?.id) throw new Error('Organização não autenticada');
      const db = supabase as any;
      const { data: current, error: fetchErr } = await db
        .from('contracts')
        .select('status')
        .eq('id', id)
        .eq('org_id', organization.id)
        .single();
      
      if (fetchErr) throw fetchErr;
      if (current?.status === 'assinado') {
        throw new Error('Não é permitido alterar um contrato já assinado.');
      }

      const { data, error } = await db
        .from('contracts')
        .update(payload)
        .eq('id', id)
        .eq('org_id', organization.id)
        .select()
        .single();
      if (error) throw error;
      return data as ContractRecord;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [QK] });
      toast.success('Contrato atualizado!');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteContractRecord() {
  const qc = useQueryClient();
  const { organization } = useAuthStore();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!organization?.id) throw new Error('Organização não autenticada');
      const db = supabase as any;
      const { data: current, error: fetchErr } = await db
        .from('contracts')
        .select('status')
        .eq('id', id)
        .eq('org_id', organization.id)
        .single();
      
      if (fetchErr) throw fetchErr;
      if (current?.status === 'assinado') {
        throw new Error('Não é permitido excluir um contrato já assinado.');
      }

      const { error } = await db
        .from('contracts')
        .delete()
        .eq('id', id)
        .eq('org_id', organization.id);
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [QK] });
      toast.success('Contrato excluído.');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
