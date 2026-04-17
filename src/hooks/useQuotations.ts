import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';
import type { QuotationFormValues } from '@/types';

export function useQuotations(filters?: { status?: string; search?: string }) {
  const { organization } = useAuthStore();
  return useQuery({
    queryKey: ['quotations', organization?.id, filters],
    queryFn: async () => {
      if (!organization?.id) return [];
      let query = supabase
        .from('quotations')
        .select('*, clients(name)')
        .eq('org_id', organization.id)
        .order('created_at', { ascending: false });
      if (filters?.status) query = query.eq('status', filters.status);
      if (filters?.search) query = query.or(`destination.ilike.%${filters.search}%,hotel_name.ilike.%${filters.search}%`);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!organization?.id,
    staleTime: 2 * 60 * 1000,
  });
}

export function useQuotation(id: string | undefined) {
  return useQuery({
    queryKey: ['quotation', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quotations')
        .select('*, clients(name, phone, email)')
        .eq('id', id!)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error('Cotação não encontrada');
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateQuotation() {
  const queryClient = useQueryClient();
  const { organization, user } = useAuthStore();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: QuotationFormValues) => {
      const { installments, ...rest } = data;
      const payload = {
        ...rest,
        installments: installments ? JSON.parse(JSON.stringify(installments)) : null,
        org_id: organization!.id,
        agent_id: user!.id,
      };
      const { data: quotation, error } = await supabase
        .from('quotations')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return quotation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      toast({ title: 'Cotação criada!' });
    },
    onError: (err: Error) => {
      toast({ title: 'Erro ao criar cotação', description: err.message, variant: 'destructive' });
    },
  });
}

export function useUpdateQuotation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<QuotationFormValues>) => {
      const { installments, ...rest } = data;
      const payload = installments !== undefined
        ? { ...rest, installments: JSON.parse(JSON.stringify(installments)) }
        : rest;
      const { data: quotation, error } = await supabase
        .from('quotations')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return quotation;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['quotation', vars.id] });
      toast({ title: 'Cotação atualizada!' });
    },
    onError: (err: Error) => {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    },
  });
}

export function useDeleteQuotation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('quotations').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      toast({ title: 'Cotação excluída.' });
    },
    onError: (err: Error) => {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    },
  });
}
