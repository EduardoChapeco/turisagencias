import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';

export type KnowledgeEntry = { id: string; content: string; metadata?: any; created_at: string };

export function useKnowledgeBase() {
  const { organization } = useAuthStore();
  return useQuery({
    queryKey: ['ai_knowledge_base', organization?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_knowledge_base')
        .select('*')
        .eq('org_id', organization!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!organization?.id,
  });
}

export function useUpsertKnowledge() {
  const qc = useQueryClient();
  const { organization } = useAuthStore();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (payload: { id?: string; content: string; metadata?: any }) => {
      const { data, error } = await supabase
        .from('ai_knowledge_base')
        .upsert({
          ...payload,
          org_id: organization!.id,
          // Note: embedding is handled by DB triggers or edge functions usually
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ai_knowledge_base'] });
      toast({ title: 'Cérebro da IA atualizado!' });
    },
    onError: (e: Error) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });
}

export function useDeleteKnowledge() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('ai_knowledge_base').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ai_knowledge_base'] });
      toast({ title: 'Conhecimento removido.' });
    },
    onError: (e: Error) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });
}
