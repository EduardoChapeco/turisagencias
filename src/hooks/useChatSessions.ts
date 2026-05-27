import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';

const chatDb = supabase;

export type ChatMessage = {
 id: string;
 role: 'user' | 'assistant';
 content: string;
 created_at: string;
};

export type ChatSession = {
 id: string;
 org_id: string;
 user_id: string;
 title: string | null;
 context: string | null;
 messages: ChatMessage[];
 is_archived: boolean;
 created_at: string;
 updated_at: string;
};

export function useChatSessions() {
 const { organization, user } = useAuthStore();
 return useQuery({
 queryKey: ['chat_sessions', user?.id],
 queryFn: async () => {
 if (!user?.id) return [];
 const { data, error } = await chatDb
 .from('chat_sessions')
 .select('id, title, updated_at, is_archived, messages')
 .eq('user_id', user.id)
 .eq('is_archived', false)
 .order('updated_at', { ascending: false })
 .limit(20);
 if (error) throw error;
 return data as Partial<ChatSession>[];
 },
 enabled: !!user?.id,
 staleTime: 30_000,
 });
}

export function useChatSession(id: string | null) {
 return useQuery({
 queryKey: ['chat_session', id],
 queryFn: async () => {
 if (!id) return null;
 const { data, error } = await chatDb
 .from('chat_sessions')
 .select('*')
 .eq('id', id)
 .single();
 if (error) throw error;
 return data as ChatSession;
 },
 enabled: !!id,
 });
}

export function useCreateChatSession() {
 const qc = useQueryClient();
 const { organization, user } = useAuthStore();

 return useMutation({
 mutationFn: async (params: { title?: string; context?: string; initialMessage?: ChatMessage }) => {
 if (!organization?.id || !user?.id) throw new Error('Usuário não autenticado');
 const messages = params.initialMessage ? [params.initialMessage] : [];
 const { data, error } = await chatDb
 .from('chat_sessions')
 .insert({
 org_id: organization.id,
 user_id: user.id,
 title: params.title ?? 'Nova Conversa',
 context: params.context ?? null,
 messages,
 })
 .select()
 .single();
 if (error) throw error;
 return data as ChatSession;
 },
 onSuccess: () => qc.invalidateQueries({ queryKey: ['chat_sessions'] }),
 });
}

export function useAppendMessage() {
 const qc = useQueryClient();

 return useMutation({
 mutationFn: async ({
 sessionId,
 messages,
 title,
 }: {
 sessionId: string;
 messages: ChatMessage[];
 title?: string;
 }) => {
 const updatePayload: any = { messages };
 if (title) updatePayload.title = title;

 const { data, error } = await chatDb
 .from('chat_sessions')
 .update(updatePayload)
 .eq('id', sessionId)
 .select()
 .single();
 if (error) throw error;
 return data as ChatSession;
 },
 onSuccess: (_, vars) => {
 qc.invalidateQueries({ queryKey: ['chat_sessions'] });
 qc.invalidateQueries({ queryKey: ['chat_session', vars.sessionId] });
 },
 });
}

export function useArchiveChatSession() {
 const qc = useQueryClient();
 const { toast } = useToast();

 return useMutation({
 mutationFn: async (id: string) => {
 const { error } = await chatDb
 .from('chat_sessions')
 .update({ is_archived: true })
 .eq('id', id);
 if (error) throw error;
 },
 onSuccess: () => {
 qc.invalidateQueries({ queryKey: ['chat_sessions'] });
 toast({ title: 'Conversa arquivada.' });
 },
 });
}
