import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

/**
 * Knowledge base — tabela ai_knowledge_base ainda não foi provisionada.
 * Hooks neutralizados para não quebrar build. Reativar quando criar a tabela
 * via migration (com coluna `embedding vector(768)`, `content text`, `org_id`, `metadata jsonb`).
 */

export type KnowledgeEntry = { id: string; content: string; metadata?: any; created_at: string };

export function useKnowledgeBase() {
  return useQuery<KnowledgeEntry[]>({
    queryKey: ['ai_knowledge_base'],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useUpsertKnowledge() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (_payload: { id?: string; content: string; metadata?: any }) => {
      throw new Error('Base de conhecimento ainda não habilitada nesta organização.');
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ai_knowledge_base'] });
    },
    onError: (e: Error) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });
}

export function useDeleteKnowledge() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (_id: string) => {
      throw new Error('Base de conhecimento ainda não habilitada nesta organização.');
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ai_knowledge_base'] });
    },
    onError: (e: Error) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });
}
