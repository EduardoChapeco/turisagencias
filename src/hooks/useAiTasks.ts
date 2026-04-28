import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const db = supabase as any;

export type AiTask = {
  id: string;
  org_id: string;
  ai_agent_id: string;          // correct column name per schema
  task_type: string;
  task_payload: Record<string, any>;
  result: Record<string, any> | null;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'awaiting_approval' | 'cancelled';
  requires_approval: boolean;
  approved_by: string | null;
  approved_at: string | null;
  rejected_at: string | null;
  error_message: string | null;
  execution_log: Record<string, any>[];
  entity_type: string | null;
  entity_id: string | null;
  triggered_by: string | null;
  triggered_source: string | null;
  queued_at: string;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  ai_agents?: { agent_type: string; status: string; name: string } | null;
};

export type AiAgent = {
  id: string;
  org_id: string;
  agent_type: string;
  name: string;
  status: 'idle' | 'running' | 'error' | 'paused' | 'disabled';
  memory_store: Record<string, any>;
  rules_config: Record<string, any>;
  last_action_at: string | null;
  total_tasks_run: number;
  success_rate: number;
  error_count: number;
  created_at: string;
  updated_at: string;
};

export const useAiTasks = (orgId: string | undefined, limit = 50) => {
  return useQuery({
    queryKey: ['ai_tasks', orgId, limit],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await db
        .from('ai_tasks')
        .select(`
          *,
          ai_agents:ai_agent_id(agent_type, status, name)
        `)
        .eq('org_id', orgId)
        .order('queued_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as AiTask[];
    },
    enabled: !!orgId,
    refetchInterval: 5000,
  });
};

export const useAiAgents = (orgId: string | undefined) => {
  return useQuery({
    queryKey: ['ai_agents', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await db
        .from('ai_agents')
        .select('*')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as AiAgent[];
    },
    enabled: !!orgId,
    refetchInterval: 5000,
  });
};

export const useApproveAiTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, userId }: { taskId: string; userId: string }) => {
      const { data, error } = await db
        .from('ai_tasks')
        .update({
          status: 'completed',
          approved_by: userId,
          approved_at: new Date().toISOString(),
        })
        .eq('id', taskId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ai_tasks', data.org_id] });
      toast.success('Tarefa aprovada com sucesso!');
    },
    onError: () => toast.error('Erro ao aprovar tarefa.'),
  });
};

export const useCancelAiTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: string) => {
      const { data, error } = await db
        .from('ai_tasks')
        .update({ status: 'failed', error_message: 'Cancelado manualmente pelo usuário.' })
        .eq('id', taskId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ai_tasks', data.org_id] });
      toast.success('Tarefa cancelada.');
    },
  });
};
