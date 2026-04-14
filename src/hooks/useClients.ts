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
      name: string; email?: string; phone?: string; cpf?: string; birth_date?: string;
      address?: string; city?: string; state?: string; zip_code?: string; country?: string;
      origin?: string; tags?: string[]; notes?: string; documents?: any[]; photo_url?: string;
      passport_url?: string; portal_access_enabled?: boolean; preferences?: any;
      passport_number?: string; passport_expiry?: string;
    }) => {
      const { documents, passport_url, preferences, address, city, state, zip_code, country, ...restData } = data;
      const insertData = { ...restData, org_id: organization!.id, created_by: user!.id } as any;
      
      const newPreferences = { ...(preferences || {}) };
      if (documents && documents.length > 0) newPreferences.documents = documents;
      if (passport_url) newPreferences.passport_url = passport_url;
      
      if (Object.keys(newPreferences).length > 0) {
        insertData.preferences = newPreferences;
      }

      if (address || city || state || zip_code || country) {
        insertData.address = { street: address || null, city: city || null, state: state || null, zip_code: zip_code || null, country: country || null };
      }

      const { data: client, error } = await supabase
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
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<{
      name: string; email: string; phone: string; cpf: string; birth_date: string;
      address: string; city: string; state: string; zip_code: string; country: string;
      origin: string; tags: string[]; notes: string; documents: any[]; photo_url: string; 
      passport_number: string; passport_expiry: string;
      cover_url: string;
    }>) => {
      const { documents, passport_url, preferences, address, city, state, zip_code, country, ...restData } = data;
      const updateData = { ...restData } as any;

      if (documents !== undefined || passport_url !== undefined) {
        updateData.preferences = { ...(preferences || {}) };
        if (documents !== undefined) updateData.preferences.documents = documents;
        if (passport_url !== undefined) updateData.preferences.passport_url = passport_url;
      } else if (preferences !== undefined) {
        updateData.preferences = preferences;
      }

      if (address !== undefined || city !== undefined || state !== undefined || zip_code !== undefined || country !== undefined) {
        // Fetch existing address to preserve unmodified JSONB keys if needed, but since form overrides all:
        updateData.address = { 
          street: address !== undefined ? address : null, 
          city: city !== undefined ? city : null, 
          state: state !== undefined ? state : null, 
          zip_code: zip_code !== undefined ? zip_code : null, 
          country: country !== undefined ? country : null 
        };
      }

      const { data: client, error } = await supabase
        .from('clients')
        .update(updateData)
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
