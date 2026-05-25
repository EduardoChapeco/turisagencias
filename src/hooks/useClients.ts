import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';

const clientsDb = supabase as any;

export function useClients(search?: string) {
  const { organization } = useAuthStore();
  return useQuery({
    queryKey: ['clients', organization?.id, search],
    queryFn: async () => {
      if (!organization?.id) return [];
      let query = supabase
        .from('clients')
        .select('*')
        .eq('org_id', organization.id)
        .order('created_at', { ascending: false });

      if (search) {
        query = query.ilike('name', `%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!organization?.id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useClient(id: string | undefined) {
  const { organization } = useAuthStore();
  return useQuery({
    queryKey: ['client', id, organization?.id],
    queryFn: async () => {
      if (!organization?.id) return null;
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id!)
        .eq('org_id', organization.id)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error('Cliente não encontrado');
      return data;
    },
    enabled: !!id && !!organization?.id,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  const { organization, user } = useAuthStore();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      name: string; email?: string | null; phone?: string | null; cpf?: string | null; birth_date?: string | null;
      address?: string | null; city?: string | null; state?: string | null; zip_code?: string | null; country?: string | null;
      origin?: string | null; tags?: string[]; notes?: string | null; documents?: any[]; photo_url?: string | null;
      cover_url?: string | null;
      // Passaporte — colunas flat
      passport_number?: string | null; passport_expiry?: string | null; passport_url?: string | null;
      // Fidelidade — colunas flat
      is_member?: boolean; loyalty_points?: number; member_tier?: string | null;
      portal_access_enabled?: boolean; preferences?: any;
    }) => {
      const { documents, preferences, ...restData } = data;
      const insertData: Record<string, unknown> = { ...restData, org_id: organization!.id, created_by: user!.id };

      const newPreferences = { ...(preferences || {}) };
      if (documents && documents.length > 0) newPreferences.documents = documents;

      if (Object.keys(newPreferences).length > 0) {
        insertData.preferences = newPreferences;
      }

      const { data: client, error } = await clientsDb
        .from('clients')
        .insert(insertData)
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
  const { organization } = useAuthStore();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<{
      name: string; email: string; phone: string; cpf: string; birth_date: string;
      address: string; city: string; state: string; zip_code: string; country: string;
      origin: string; tags: string[]; notes: string; documents: any[]; photo_url: string;
      cover_url: string;
      // Passaporte — colunas flat
      passport_number: string; passport_expiry: string; passport_url: string;
      // Fidelidade — colunas flat
      is_member: boolean; loyalty_points: number; member_tier: string;
      preferences: any;
    }>) => {
      if (!organization?.id) throw new Error('Organização não autenticada');
      const { documents, preferences, ...restData } = data;
      // Todas as colunas flat são espalhadas diretamente (address, city, state, zip_code, country,
      // passport_number, passport_expiry, passport_url, is_member, loyalty_points, member_tier, cover_url)
      const updateData: Record<string, unknown> = { ...restData };

      if (documents !== undefined) {
        updateData.preferences = { ...(preferences || {}) };
        (updateData.preferences as any).documents = documents;
      } else if (preferences !== undefined) {
        updateData.preferences = preferences;
      }

      const { data: client, error } = await clientsDb
        .from('clients')
        .update(updateData)
        .eq('id', id)
        .eq('org_id', organization.id)
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
  const { organization } = useAuthStore();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!organization?.id) throw new Error('Organização não autenticada');
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id)
        .eq('org_id', organization.id);
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
