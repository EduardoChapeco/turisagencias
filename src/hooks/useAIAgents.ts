import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface AIAgent {
 id: string;
 org_id: string;
 agent_type: string;
 name: string;
 description: string | null;
 version: string;
 memory_store: Record<string, unknown>;
 rules_config: Record<string, unknown>;
 status: 'idle' | 'running' | 'error' | 'paused' | 'disabled';
 active_tasks: string[];
 last_action_at: string | null;
 last_error: string | null;
 error_count: number;
 total_tasks_run: number;
 success_rate: number | null;
 python_endpoint: string | null;
 created_at: string;
 updated_at: string;
}

export interface AITask {
 id: string;
 org_id: string;
 ai_agent_id: string;
 task_type: string;
 task_payload: Record<string, unknown>;
 status: 'queued' | 'running' | 'awaiting_approval' | 'completed' | 'failed' | 'cancelled';
 execution_log: Array<{ timestamp: string; level: string; message: string; data?: unknown }>;
 result: unknown;
 error_message: string | null;
 retry_count: number;
 queued_at: string;
 started_at: string | null;
 completed_at: string | null;
 requires_approval: boolean;
 approval_prompt: string | null;
 approved_by: string | null;
 approved_at: string | null;
 rejected_at: string | null;
 rejection_reason: string | null;
 entity_type: string | null;
 entity_id: string | null;
 triggered_by: string | null;
 triggered_source: string | null;
 created_at: string;
 updated_at: string;
}

export interface AIDashboardSummary {
 org_id: string;
 agent_id: string;
 agent_type: string;
 agent_name: string;
 agent_status: string;
 last_action_at: string | null;
 total_tasks_run: number;
 success_rate: number;
 error_count: number;
 tasks_running: number;
 tasks_queued: number;
 tasks_awaiting: number;
 tasks_failed: number;
 tasks_completed: number;
}

// ── Hooks: AI Agents ───────────────────────────────────────────────────────────

export function useAIAgents() {
 return useQuery({
 queryKey: ['ai-agents'],
 queryFn: async () => {
 const { data, error } = await supabase
 .from('ai_agents')
 .select('*')
 .order('agent_type');
 if (error) throw error;
 return (data ?? []) as unknown as AIAgent[];
 },
 refetchInterval: 5000, // polling fallback
 });
}

export function useAIDashboardSummary() {
 return useQuery({
 queryKey: ['ai-dashboard-summary'],
 queryFn: async () => {
 const { data, error } = await supabase
 .from('ai_dashboard_summary')
 .select('*');
 if (error) throw error;
 return (data ?? []) as unknown as AIDashboardSummary[];
 },
 refetchInterval: 5000,
 });
}

// ── Hooks: AI Tasks ────────────────────────────────────────────────────────────

export function useAITasks(filter?: { status?: string; agent_id?: string }) {
 return useQuery({
 queryKey: ['ai-tasks', filter],
 queryFn: async () => {
 let query = supabase
 .from('ai_tasks')
 .select('*')
 .order('queued_at', { ascending: false })
 .limit(50);

 if (filter?.status) query = query.eq('status', filter.status);
 if (filter?.agent_id) query = query.eq('ai_agent_id', filter.agent_id);

 const { data, error } = await query;
 if (error) throw error;
 return (data ?? []) as unknown as AITask[];
 },
 refetchInterval: 3000,
 });
}

export function usePendingApprovals() {
 return useQuery({
 queryKey: ['ai-tasks-approvals'],
 queryFn: async () => {
 const { data, error } = await supabase
 .from('ai_tasks')
 .select('*')
 .eq('status', 'awaiting_approval')
 .eq('requires_approval', true)
 .order('queued_at', { ascending: true });
 if (error) throw error;
 return (data ?? []) as unknown as AITask[];
 },
 refetchInterval: 2000,
 });
}

// ── Hook: Realtime subscription para AI Tasks ──────────────────────────────────

export function useAITasksRealtime(onTaskUpdate?: (task: AITask) => void) {
 const queryClient = useQueryClient();
 const [connected, setConnected] = useState(false);

 useEffect(() => {
 const channel = supabase
 .channel('ai-tasks-realtime')
 .on(
 'postgres_changes',
 { event: '*', schema: 'public', table: 'ai_tasks' },
 (payload) => {
 queryClient.invalidateQueries({ queryKey: ['ai-tasks'] });
 queryClient.invalidateQueries({ queryKey: ['ai-tasks-approvals'] });
 queryClient.invalidateQueries({ queryKey: ['ai-agents'] });
 queryClient.invalidateQueries({ queryKey: ['ai-dashboard-summary'] });
 if (onTaskUpdate && payload.new) {
 onTaskUpdate(payload.new as unknown as AITask);
 }
 }
 )
 .on(
 'postgres_changes',
 { event: '*', schema: 'public', table: 'ai_agents' },
 () => {
 queryClient.invalidateQueries({ queryKey: ['ai-agents'] });
 queryClient.invalidateQueries({ queryKey: ['ai-dashboard-summary'] });
 }
 )
 .subscribe((status) => {
 setConnected(status === 'SUBSCRIBED');
 });

 return () => {
 supabase.removeChannel(channel);
 };
 }, [queryClient, onTaskUpdate]);

 return { connected };
}

// ── Mutations: Approve / Reject ────────────────────────────────────────────────

export function useApproveTask() {
 const queryClient = useQueryClient();
 return useMutation({
 mutationFn: async ({ task_id, approved, reason }: { task_id: string; approved: boolean; reason?: string }) => {
 const { data, error } = await supabase.rpc('approve_ai_task', {
 p_task_id: task_id,
 p_approved: approved,
 p_reason: reason ?? null,
 });
 if (error) throw error;
 return data;
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['ai-tasks'] });
 queryClient.invalidateQueries({ queryKey: ['ai-tasks-approvals'] });
 },
 });
}

export function useCancelTask() {
 const queryClient = useQueryClient();
 return useMutation({
 mutationFn: async (taskId: string) => {
 const { error } = await supabase
 .from('ai_tasks')
 .update({ status: 'cancelled' })
 .eq('id', taskId);
 if (error) throw error;
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['ai-tasks'] });
 },
 });
}

export function useEnqueueTask() {
 const queryClient = useQueryClient();
 return useMutation({
 mutationFn: async (params: {
 agent_type: string;
 task_type: string;
 task_payload?: Record<string, unknown>;
 requires_approval?: boolean;
 approval_prompt?: string;
 entity_type?: string;
 entity_id?: string;
 }) => {
 const { data, error } = await supabase.rpc('enqueue_ai_task', {
 p_agent_type: params.agent_type,
 p_task_type: params.task_type,
 p_task_payload: (params.task_payload ?? {}) as Json,
 p_requires_approval: params.requires_approval ?? false,
 p_approval_prompt: params.approval_prompt ?? null,
 p_entity_type: params.entity_type ?? null,
 p_entity_id: params.entity_id ?? null,
 });
 if (error) throw error;
 return data;
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['ai-tasks'] });
 },
 });
}
