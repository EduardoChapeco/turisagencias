import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type ContractTemplate = {
  id: string;
  org_id: string;
  name: string;
  content_html: string;
};

export const useContractTemplates = (orgId: string | undefined) => {
  return useQuery({
    queryKey: ['contract_templates', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await supabase
        .from('contract_templates')
        .select('*')
        .eq('org_id', orgId)
        .order('name');
      if (error) throw error;
      return data as ContractTemplate[];
    },
    enabled: !!orgId,
  });
};

export const useCreateContractTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<ContractTemplate, 'id' | 'org_id' | 'created_at' | 'updated_at'> & { org_id: string }) => {
      const { data, error } = await supabase.from('contract_templates').insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['contract_templates', data.org_id] });
      toast.success('Modelo de contrato salvo com sucesso!');
    },
  });
};

export const useUpdateContractTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<ContractTemplate> & { id: string }) => {
      const { data, error } = await supabase.from('contract_templates').update(payload).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['contract_templates', data.org_id] });
      toast.success('Modelo de contrato atualizado!');
    },
  });
};

export const useDeleteContractTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error, data } = await supabase.from('contract_templates').delete().eq('id', id).select('org_id').single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data) queryClient.invalidateQueries({ queryKey: ['contract_templates', data.org_id] });
      toast.success('Modelo excluído!');
    },
  });
};
