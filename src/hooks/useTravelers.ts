import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';

export function useTravelers(clientId?: string) {
  const { organization } = useAuthStore();
  return useQuery({
    queryKey: ['travelers', organization?.id, clientId],
    queryFn: async () => {
      let query = supabase
        .from('travelers')
        .select('*')
        .order('created_at', { ascending: false });
      if (clientId) query = query.eq('client_id', clientId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!organization,
    staleTime: 5 * 60 * 1000,
  });
}

export function useTraveler(id: string | undefined) {
  return useQuery({
    queryKey: ['traveler', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('travelers')
        .select('*, traveler_documents(*)')
        .eq('id', id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateTraveler() {
  const queryClient = useQueryClient();
  const { organization } = useAuthStore();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      full_name: string;
      client_id?: string;
      cpf?: string;
      birth_date?: string;
      gender?: string;
      nationality?: string;
      phone?: string;
      email?: string;
      relation?: string;
    }) => {
      const { data: traveler, error } = await supabase
        .from('travelers')
        .insert({ ...data, org_id: organization!.id })
        .select()
        .single();
      if (error) throw error;
      return traveler;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travelers'] });
      toast({ title: 'Viajante criado!' });
    },
    onError: (err: Error) => {
      toast({ title: 'Erro ao criar viajante', description: err.message, variant: 'destructive' });
    },
  });
}

export function useUpdateTraveler() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<{
      full_name: string; cpf: string; birth_date: string; gender: string;
      nationality: string; phone: string; email: string; relation: string; client_id: string;
    }>) => {
      const { data: traveler, error } = await supabase
        .from('travelers')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return traveler;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['travelers'] });
      queryClient.invalidateQueries({ queryKey: ['traveler', vars.id] });
      toast({ title: 'Viajante atualizado!' });
    },
    onError: (err: Error) => {
      toast({ title: 'Erro ao atualizar', description: err.message, variant: 'destructive' });
    },
  });
}

export function useDeleteTraveler() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('travelers').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travelers'] });
      toast({ title: 'Viajante excluído.' });
    },
    onError: (err: Error) => {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    },
  });
}
