import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';

export function useClients(search?: string) {
  const { organization } = useAuthStore();
  return useQuery({
    queryKey: ['clients', organization?.id, search],
    queryFn: async () => {
      let query = supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (search) {
        query = query.ilike('name', `%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!organization,
    staleTime: 5 * 60 * 1000,
  });
}

export function useClient(id: string | undefined) {
  return useQuery({
    queryKey: ['client', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id!)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error('Cliente não encontrado');
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  const { organization, user } = useAuthStore();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      email?: string;
      phone?: string;
      cpf?: string;
      birth_date?: string;
      address?: string;
      city?: string;
      state?: string;
      zip_code?: string;
      country?: string;
      origin?: string;
      tags?: string[];
      notes?: string;
    }) => {
      const { data: client, error } = await supabase
        .from('clients')
        .insert({ ...data, org_id: organization!.id, created_by: user!.id })
        .select()
        .single();
      if (error) throw error;
      return client;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({ title: 'Cliente criado com sucesso!' });
    },
    onError: (err: Error) => {
      toast({ title: 'Erro ao criar cliente', description: err.message, variant: 'destructive' });
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<{
      name: string; email: string; phone: string; cpf: string; birth_date: string;
      address: string; city: string; state: string; zip_code: string; country: string;
      origin: string; tags: string[]; notes: string;
    }>) => {
      const { data: client, error } = await supabase
        .from('clients')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return client;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client', vars.id] });
      toast({ title: 'Cliente atualizado!' });
    },
    onError: (err: Error) => {
      toast({ title: 'Erro ao atualizar', description: err.message, variant: 'destructive' });
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('clients').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({ title: 'Cliente excluído.' });
    },
    onError: (err: Error) => {
      toast({ title: 'Erro ao excluir', description: err.message, variant: 'destructive' });
    },
  });
}
