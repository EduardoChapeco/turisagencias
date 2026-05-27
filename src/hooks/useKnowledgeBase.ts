import { logger } from '@/utils/logger';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';

export type KnowledgeEntry = {
 id: string;
 content: string;
 metadata?: any;
 embedding?: number[] | null;
 created_at: string;
};

export function useKnowledgeBase() {
 const { organization } = useAuthStore();
 return useQuery({
 queryKey: ['ai_knowledge_base', organization?.id],
 queryFn: async () => {
 if (!organization?.id) return [];
 const { data, error } = await supabase
 .from('ai_knowledge_base')
 .select('id, content, title, category, tags, created_at')
 .eq('org_id', organization.id)
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
 if (!organization?.id) throw new Error('Organização não encontrada');

 // 1. Salvar o texto no banco primeiro
 const { data, error } = await supabase
 .from('ai_knowledge_base')
 .upsert({
 id: payload.id,
 content: payload.content,
 title: payload.metadata?.title ?? payload.content.slice(0, 80),
 category: payload.metadata?.category ?? 'general',
 tags: payload.metadata?.tags ?? null,
 org_id: organization.id,
 })
 .select()
 .single();
 if (error) throw error;

 // 2. Gerar embedding via edge function (real — não simulado)
 try {
 const { error: embError } = await supabase.functions.invoke('generate-embedding', {
 body: {
 record_id: data.id,
 content: payload.content,
 org_id: organization.id,
 },
 });
 if (embError) {
 // Não bloqueia: salva sem embedding, RAG por texto ainda funciona
 logger.warn('[useUpsertKnowledge] Embedding não gerado:', embError.message);
 }
 } catch (embErr) {
 logger.warn('[useUpsertKnowledge] Falha na edge fn de embedding:', embErr);
 }

 return data;
 },
 onSuccess: () => {
 qc.invalidateQueries({ queryKey: ['ai_knowledge_base'] });
 toast({ title: 'Cérebro da IA atualizado!', description: 'Conhecimento indexado com embedding vetorial.' });
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
