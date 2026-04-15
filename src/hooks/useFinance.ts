import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// --- Suppliers ---

export type Supplier = {
  id: string;
  org_id: string;
  name: string;
  type: 'hotel' | 'insurance' | 'airline' | 'operator' | 'other';
  contact_info: string | null;
  bank_details: string | null;
  default_commission_rate: number;
};

export const useSuppliers = (orgId: string | undefined) => {
  return useQuery({
    queryKey: ['financial_suppliers', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await supabase
        .from('financial_suppliers')
        .select('*')
        .eq('org_id', orgId)
        .order('name');
      if (error) throw error;
      return data as Supplier[];
    },
    enabled: !!orgId,
  });
};

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<Supplier, 'id' | 'org_id' | 'created_at' | 'updated_at'> & { org_id: string }) => {
      const { data, error } = await supabase.from('financial_suppliers').insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['financial_suppliers', data.org_id] });
      toast.success('Fornecedor adicionado com sucesso!');
    },
    onError: (error) => {
      console.error(error);
      toast.error('Erro ao adicionar fornecedor.');
    },
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<Supplier> & { id: string }) => {
      const { data, error } = await supabase.from('financial_suppliers').update(payload).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['financial_suppliers', data.org_id] });
      toast.success('Fornecedor atualizado!');
    },
  });
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error, data } = await supabase.from('financial_suppliers').delete().eq('id', id).select('org_id').single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data) queryClient.invalidateQueries({ queryKey: ['financial_suppliers', data.org_id] });
      toast.success('Fornecedor excluído!');
    },
  });
};

// --- Transactions ---

export type Transaction = {
  id: string;
  org_id: string;
  trip_id: string | null;
  client_id: string | null;
  supplier_id: string | null;
  type: 'receivable' | 'payable';
  status: 'pending' | 'paid' | 'overdue' | 'canceled';
  amount: number;
  due_date: string;
  paid_date: string | null;
  payment_method: string | null;
  notes: string | null;
  suppliers?: { name: string } | null;
  clients?: { name: string } | null;
  trips?: { title: string } | null;
};

export const useTransactions = (orgId: string | undefined, filters?: { type?: 'receivable' | 'payable'; trip_id?: string }) => {
  return useQuery({
    queryKey: ['financial_transactions', orgId, filters],
    queryFn: async () => {
      if (!orgId) return [];
      let query = supabase
        .from('financial_transactions')
        .select(`
          *,
          suppliers:supplier_id(name),
          clients:client_id(name),
          trips:trip_id(title)
        `)
        .eq('org_id', orgId)
        .order('due_date', { ascending: true });

      if (filters?.type) query = query.eq('type', filters.type);
      if (filters?.trip_id) query = query.eq('trip_id', filters.trip_id);

      const { data, error } = await query;
      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!orgId,
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<Transaction, 'id' | 'org_id' | 'suppliers' | 'clients' | 'trips'> & { org_id: string }) => {
      const { data, error } = await supabase.from('financial_transactions').insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['financial_transactions', data.org_id] });
      toast.success('Lançamento adicionado!');
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<Transaction> & { id: string }) => {
      const { data, error } = await supabase.from('financial_transactions').update(payload).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['financial_transactions', data.org_id] });
      toast.success('Lançamento atualizado!');
    },
  });
};
