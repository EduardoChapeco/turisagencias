import { logger } from '@/utils/logger';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const financeDb = supabase as any;

// --- Suppliers ---

export type Supplier = {
  id: string;
  org_id: string;
  name: string;
  category: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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
    mutationFn: async (payload: Record<string, any>) => {
      const { data, error } = await financeDb.from('financial_suppliers').insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['financial_suppliers', data.org_id] });
      toast.success('Fornecedor adicionado com sucesso!');
    },
    onError: (error) => {
      logger.error(error);
      toast.error('Erro ao adicionar fornecedor.');
    },
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: Record<string, any>) => {
      const { data, error } = await financeDb.from('financial_suppliers').update(payload).eq('id', id).select().single();
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
  trip_id: string | null;        // legacy FK — still in DB, kept for backward compat
  group_trip_id: string | null;  // canonical FK
  client_id: string | null;
  supplier_id: string | null;
  type: string;
  status: string;
  amount: number;
  currency: string;
  category: string | null;
  due_date: string | null;
  paid_at: string | null;
  payment_method: string | null;
  description: string | null;
  reference_number: string | null;
  created_at: string;
  updated_at: string;
  suppliers?: { name: string } | null;
  clients?: { name: string } | null;
  group_trips?: { title: string } | null;
};

export const useTransactions = (orgId: string | undefined, filters?: { type?: 'receivable' | 'payable'; group_trip_id?: string }) => {
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
          group_trips:group_trip_id(title)
        `)
        .eq('org_id', orgId)
        .order('due_date', { ascending: true });

      if (filters?.type) query = query.eq('type', filters.type);
      if (filters?.group_trip_id) query = query.eq('group_trip_id', filters.group_trip_id);

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
    mutationFn: async (payload: Record<string, any>) => {
      const { data, error } = await financeDb.from('financial_transactions').insert(payload).select().single();
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
      // Strip join-enriched fields before DB update
      const { clients: _c, suppliers: _s, group_trips: _gt, ...dbPayload } = payload;
      const { data, error } = await supabase.from('financial_transactions').update(dbPayload).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['financial_transactions', data.org_id] });
      toast.success('Lançamento atualizado!');
    },
  });
};

// --- Bookings & Payments ---

export type Booking = {
  id: string;
  org_id: string;
  trip_id: string | null;
  client_id: string | null;
  agent_id: string | null;
  status: 'pending_payment' | 'confirmed' | 'cancelled' | 'refunded';
  total_amount: number;
  currency: string;
  installment_config: any;
  notes: string | null;
  created_at: string;
  updated_at: string;
  clients?: { name: string } | null;
  trips?: { title: string; destination_city: string } | null;
};

export type Payment = {
  id: string;
  org_id: string;
  booking_id: string;
  trip_id: string | null;
  amount: number;
  currency: string;
  due_date: string;
  paid_at: string | null;
  status: 'pending' | 'paid' | 'overdue' | 'failed' | 'refunded';
  payment_method: string | null;
  proof_url: string | null;
  installment_number: number;
  notes: string | null;
  gateway_transaction_id: string | null;
  created_at: string;
  updated_at: string;
  bookings?: Booking | null;
  trips?: { title: string; destination_city: string } | null;
};

export const usePayments = (orgId: string | undefined, filters?: { status?: string; booking_id?: string }) => {
  return useQuery({
    queryKey: ['payments', orgId, filters],
    queryFn: async () => {
      if (!orgId) return [];
      let query = supabase
        .from('payments')
        .select(`
          *,
          bookings!inner(*, clients(name)),
          trips(title, destination_city)
        `)
        .eq('org_id', orgId)
        .order('due_date', { ascending: true });

      if (filters?.status) query = query.eq('status', filters.status);
      if (filters?.booking_id) query = query.eq('booking_id', filters.booking_id);

      const { data, error } = await query;
      if (error) throw error;
      return data as Payment[];
    },
    enabled: !!orgId,
  });
};

export const useUpdatePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<Payment> & { id: string }) => {
      const { bookings, trips, ...dbPayload } = payload as any;
      const { data, error } = await supabase.from('payments').update(dbPayload).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payments', data.org_id] });
      toast.success('Parcela atualizada!');
    },
  });
};
