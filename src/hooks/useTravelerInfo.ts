import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from './use-toast';

const useAuth = () => {
  const { organization, user } = useAuthStore();
  return { currentOrg: organization, session: { user } };
};

export const useTravelerInfoPages = () => {
  const { currentOrg } = useAuth();

  return useQuery({
    queryKey: ['traveler_info_pages', currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg?.id) throw new Error('No organization selected');
      
      const { data, error } = await (supabase
        .from('traveler_info_pages' as any)
        .select('*')
        .eq('org_id', currentOrg.id)
        .order('created_at', { ascending: false }) as any);
        
      if (error) throw error;
      return data;
    },
    enabled: !!currentOrg?.id,
  });
};

export const useTravelerInfoPage = (id?: string) => {
  const { currentOrg } = useAuth();
  
  return useQuery({
    queryKey: ['traveler_info_pages', id],
    queryFn: async () => {
      if (!id) return null;
      if (!currentOrg?.id) throw new Error('No organization selected');
      
      const { data, error } = await (supabase
        .from('traveler_info_pages' as any)
        .select('*')
        .eq('id', id)
        .single() as any);
        
      if (error) throw error;
      return data;
    },
    enabled: !!id && !!currentOrg?.id,
  });
};

export const useSaveTravelerInfoPage = () => {
  const { currentOrg, session } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (pageData: any) => {
      if (!currentOrg?.id) throw new Error('No organization selected');
      
      const isUpdate = !!pageData.id;
      
      if (isUpdate) {
        const { id, ...updateData } = pageData;
        const { data, error } = await (supabase
          .from('traveler_info_pages' as any)
          .update(updateData)
          .eq('id', id)
          .select()
          .single() as any);
          
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await (supabase
          .from('traveler_info_pages' as any)
          .insert({
            ...pageData,
            org_id: currentOrg.id,
            author_id: session?.user?.id,
          })
          .select()
          .single() as any);
          
        if (error) throw error;
        return data;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['traveler_info_pages'] });
      toast({
        title: 'Página salva!',
        description: `Informações de viajante gravadas com sucesso.`,
      });
    },
    onError: (error: Error) => {
      console.error('Error saving traveler info page:', error);
      toast({
        title: 'Erro ao salvar',
        description: error.message || 'Verifique sua conexão ou formato dos dados.',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteTravelerInfoPage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase
        .from('traveler_info_pages' as any)
        .delete()
        .eq('id', id) as any);
        
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['traveler_info_pages'] });
      toast({
        title: 'Página removida',
        description: 'A página foi excluída permanentemente.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao remover',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
