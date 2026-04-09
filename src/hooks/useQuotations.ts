import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';

export function useQuotations(filters?: { status?: string; search?: string }) {
  const { organization } = useAuthStore();
  return useQuery({
    queryKey: ['quotations', organization?.id, filters],
    queryFn: async () => {
      let query = supabase
        .from('quotations')
        .select('*, clients(name)')
        .order('created_at', { ascending: false });
      if (filters?.status) query = query.eq('status', filters.status);
      if (filters?.search) query = query.ilike('destination', `%${filters.search}%`);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!organization,
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
        .single();
      if (error) throw error;
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
    mutationFn: async (data: {
      destination?: string;
      hotel_name?: string;
      hotel_stars?: number;
      hotel_photo_url?: string;
      check_in?: string;
      check_out?: string;
      num_nights?: number;
      meal_plan?: string;
      room_type?: string;
      total_value?: number;
      currency?: string;
      installments?: any;
      whatsapp_text?: string;
      client_id?: string;
      source_file_url?: string;
      ai_extracted?: boolean;
      ai_raw_response?: any;
      status?: string;
    }) => {
      const { data: quotation, error } = await supabase
        .from('quotations')
        .insert({ ...data, org_id: organization!.id, agent_id: user!.id })
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
    mutationFn: async ({ id, ...data }: { id: string } & Partial<{
      destination: string; hotel_name: string; hotel_stars: number;
      check_in: string; check_out: string; num_nights: number;
      meal_plan: string; room_type: string; total_value: number;
      currency: string; installments: any; whatsapp_text: string;
      status: string; client_id: string; hotel_photo_url: string;
    }>) => {
      const { data: quotation, error } = await supabase
        .from('quotations')
        .update(data)
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
