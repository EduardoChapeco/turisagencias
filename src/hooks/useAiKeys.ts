import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import { useAuthStore } from '@/stores/authStore';

export const useAiKeys = () => {
  const { organization } = useAuthStore();
  
  return useQuery({
    queryKey: ['ai_keys', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];
      
      const { data, error } = await supabase
        .from('ai_keys_pool')
        .select('*')
        .eq('org_id', organization.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!organization?.id,
  });
};

export const useSaveAiKey = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { organization } = useAuthStore();

  return useMutation({
    mutationFn: async (payload: { provider: string; api_key: string; monthly_limit_usd?: number }) => {
      if (!organization?.id) throw new Error('Organização não encontrada');

      const { data, error } = await supabase
        .from('ai_keys_pool')
        .insert({
          org_id: organization.id,
          provider: payload.provider,
          api_key_encrypted: payload.api_key,
          monthly_limit: payload.monthly_limit_usd || null,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai_keys'] });
      toast({
        title: 'Chave salva!',
        description: 'A chave foi adicionada ao pool com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar chave',
        description: error.message,
      });
    },
  });
};

export const useDeleteAiKey = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('ai_keys_pool').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai_keys'] });
      toast({ title: 'Chave removida do pool.' });
    },
    onError: (error: any) => {
      toast({ variant: 'destructive', title: 'Erro ao remover', description: error.message });
    },
  });
};
