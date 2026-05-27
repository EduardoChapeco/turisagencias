import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';

const kanbanDb = supabase;

const normalizeKanbanCard = (card: Record<string, any>): Record<string, any> => {
 const meta = (card.meta ?? card.metadata ?? {}) as Record<string, any>;
 return {
 ...card,
 metadata: meta,
 task_type: card.task_type ?? meta.task_type ?? null,
 due_date: card.due_date ?? meta.due_date ?? null,
 priority: card.priority ?? meta.priority ?? null,
 ticket_id: card.ticket_id ?? meta.ticket_id ?? null,
 linked_card_ids: card.linked_card_ids ?? meta.linked_card_ids ?? null,
 };
};

/* ─────────────────────────────────────────────
 Board + Columns + Cards (hook original expandido)
 ───────────────────────────────────────────── */

/** Força a criação dos boards padrão (sales, departures, tasks) e refaz a consulta. */
export function useEnsureDefaultBoards() {
 const queryClient = useQueryClient();
 const { organization } = useAuthStore();
 const { toast } = useToast();

 return useMutation({
 mutationFn: async () => {
 if (!organization?.id) throw new Error('Organização não carregada');
 const { error } = await supabase.rpc('ensure_default_kanban_boards', { _org_id: organization.id });
 if (error) throw error;
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['kanban-board'] });
 toast({ title: 'Quadros recriados!', description: 'As colunas padrão foram restauradas.' });
 },
 onError: (err: Error) => {
 toast({ title: 'Erro ao recriar quadros', description: err.message, variant: 'destructive' });
 },
 });
}

export function useKanbanBoard(slug: string) {
 const { organization } = useAuthStore();

 return useQuery({
 queryKey: ['kanban-board', organization?.id, slug],
 queryFn: async () => {
 if (!organization?.id) return null; // Guard: org not loaded yet

 // Step 1: Try to find the board
 let { data: board, error: boardError } = await supabase
 .from('kanban_boards')
 .select('*')
 .eq('org_id', organization.id)
 .eq('slug', slug)
 .maybeSingle();

 if (boardError) throw boardError;

 // Step 2: If no board, try RPC seeding (best effort)
 if (!board) {
 try {
 await supabase.rpc('ensure_default_kanban_boards', { _org_id: organization.id });
 } catch (rpcErr) {
 // [SENTINEL] Log explicitly — never silently discard errors
 console.error('[useKanbanBoard] ensure_default_kanban_boards RPC failed:', rpcErr);
 }

 const { data: seededBoard } = await supabase
 .from('kanban_boards')
 .select('*')
 .eq('org_id', organization.id)
 .eq('slug', slug)
 .maybeSingle();

 board = seededBoard;
 }

 if (!board) {
 const boardName =
 slug === 'departures' ? 'Embarques' :
 slug === 'tasks' ? 'Tarefas do Dia' :
 'CRM — Pipeline de Vendas';
 const { data: newBoard, error: createErr } = await supabase
 .from('kanban_boards')
 .insert({ org_id: organization.id, name: boardName, slug, board_type: slug })
 .select()
 .maybeSingle();

 if (createErr && createErr.code !== '23505') {
 console.error('[useKanbanBoard] Erro ao criar board:', createErr);
 throw createErr;
 }

 board = newBoard;

 if (!board) {
 const { data: existingBoard } = await supabase
 .from('kanban_boards')
 .select('*')
 .eq('org_id', organization.id)
 .eq('slug', slug)
 .maybeSingle();
 board = existingBoard;
 }

 if (!board) {
 throw new Error('Falha crítica ao carregar ou criar o quadro (verifique as permissões de RLS).');
 }

 // Seed default columns
 const defaultColumns =
 slug === 'departures'
 ? [
 { name: 'Documentação Pendente', color: '#F59E0B', position: 0 },
 { name: 'Check-in Aberto', color: '#3B82F6', position: 1 },
 { name: 'Prontos para Embarcar', color: '#10B981', position: 2 },
 { name: 'Em Viagem', color: '#8B5CF6', position: 3 },
 { name: 'Retornaram', color: '#94a3b8', position: 4 },
 ]
 : slug === 'tasks'
 ? [
 { name: 'A Fazer', color: '#6B7280', position: 0 },
 { name: 'Em Progresso', color: '#3B82F6', position: 1 },
 { name: 'Revisão', color: '#F59E0B', position: 2 },
 { name: 'Concluído', color: '#10B981', position: 3 },
 ]
 : [
 { name: 'Novo Lead', color: '#6B7280', position: 0 },
 { name: 'Em Contato', color: '#3B82F6', position: 1 },
 { name: 'Proposta Enviada', color: '#F59E0B', position: 2 },
 { name: 'Negociando', color: '#8B5CF6', position: 3 },
 { name: 'Fechado', color: '#10B981', position: 4 },
 { name: 'Perdido', color: '#EF4444', position: 5 },
 ];

 const { error: colsInsertErr } = await supabase
 .from('kanban_columns')
 .insert(defaultColumns.map((c) => ({ ...c, board_id: board!.id, org_id: organization.id })));
 
 if (colsInsertErr && colsInsertErr.code !== '23505') {
 console.error('[useKanbanBoard] Erro colunas:', colsInsertErr);
 }
 }

 // Step 4: Fetch columns + cards
 const [{ data: columns, error: columnsError }, { data: cards, error: cardsError }] = await Promise.all([
 supabase.from('kanban_columns').select('*').eq('board_id', board.id).order('position'),
 supabase
 .from('kanban_cards')
 .select(`
 id, board_id, column_id, title, description, client_id, quotation_id, 
 trip_id, group_trip_id, position, meta, assigned_to, whatsapp, email, 
 tags, estimated_value, created_at, updated_at, 
 clients(name, phone), 
 quotations(destination), 
 group_trips(title)
 `)
 .eq('board_id', board.id)
 .order('position'),
 ]);

 if (columnsError) {
 console.error('[useKanbanBoard] Columns Error:', columnsError);
 throw columnsError;
 }
 if (cardsError) {
 console.error('[useKanbanBoard] Cards Error:', cardsError);
 throw cardsError;
 }

 return { board, columns: columns ?? [], cards: (cards ?? []).map((card) => normalizeKanbanCard(card as Record<string, any>)) };
 },
 enabled: !!organization?.id,
 staleTime: 60 * 1000,
 retry: 1,
 });
}

export function useKanbanCard(id?: string) {
 return useQuery({
 queryKey: ['kanban-card', id],
 queryFn: async () => {
 if (!id) return null;
 const { data: card, error: cardError } = await supabase
 .from('kanban_cards')
 .select(`
 id, board_id, column_id, title, description, client_id, quotation_id, 
 trip_id, group_trip_id, position, meta, assigned_to, whatsapp, email, 
 tags, estimated_value, created_at, updated_at, 
 clients(name, phone), 
 quotations(destination), 
 group_trips(title)
 `)
 .eq('id', id)
 .maybeSingle();

 if (cardError) throw cardError;
 if (!card) throw new Error('Card not found');

 // Fetch the columns for this board to populate the status dropdown
 const { data: columns, error: colError } = await supabase
 .from('kanban_columns')
 .select('*')
 .eq('board_id', card.board_id)
 .order('position');

 if (colError) throw colError;

 return { card: normalizeKanbanCard(card as Record<string, any>), columns: columns ?? [] };
 },
 enabled: !!id,
 staleTime: 60 * 1000,
 });
}

export function useCreateKanbanCard() {
 const queryClient = useQueryClient();
 const { organization } = useAuthStore();
 const { toast } = useToast();

 return useMutation({
 mutationFn: async (payload: Record<string, any>) => {
 if (!organization?.id) throw new Error('Organizacao nao carregada');
 const insertPayload: Record<string, any> = { ...payload, org_id: organization.id };
 if (insertPayload.metadata !== undefined) {
 if (insertPayload.meta === undefined) insertPayload.meta = insertPayload.metadata;
 delete insertPayload.metadata;
 }
 const { data, error } = await kanbanDb
 .from('kanban_cards')
 .insert(insertPayload)
 .select()
 .single();
 if (error) throw error;
 return data;
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['kanban-board'] });
 toast({ title: 'Card criado!' });
 },
 onError: (err: Error) => {
 toast({ title: 'Erro ao criar card', description: err.message, variant: 'destructive' });
 },
 });
}

export function useUpdateKanbanCard() {
 const queryClient = useQueryClient();
 const { toast } = useToast();

 return useMutation({
 mutationFn: async ({
 id,
 ...updates
 }: {
 id: string;
 column_id?: string;
 title?: string;
 description?: string | null;
 estimated_value?: number | null;
 whatsapp?: string | null;
 email?: string | null;
 tags?: string[];
 client_id?: string | null;
 quotation_id?: string | null;
 trip_id?: string | null;
 group_trip_id?: string | null;
 task_type?: string | null;
 linked_card_ids?: string[];
 assigned_to?: string | null;
 meta?: Record<string, any> | null;
 metadata?: Record<string, any> | null;
 priority?: string | null;
 due_date?: string | null;
 ticket_id?: string | null;
 }) => {
 const finalUpdates: Record<string, unknown> = { ...updates };
 if (finalUpdates.metadata !== undefined) {
 if (finalUpdates.meta === undefined) {
 finalUpdates.meta = finalUpdates.metadata;
 }
 delete finalUpdates.metadata;
 }

 const { data, error } = await kanbanDb
 .from('kanban_cards')
 .update(finalUpdates)
 .eq('id', id)
 .select()
 .single();
 if (error) throw error;
 return data;
 },
 // ── OPTIMISTIC: card moves instantly, no waiting for server ──
 onMutate: async (variables) => {
 await queryClient.cancelQueries({ queryKey: ['kanban-board'] });
 const previousData = queryClient.getQueriesData<{
 board: unknown; columns: unknown[]; cards: Record<string, unknown>[];
 }>({ queryKey: ['kanban-board'] });
 queryClient.setQueriesData(
 { queryKey: ['kanban-board'] },
 (old: { board: unknown; columns: unknown[]; cards: Record<string, unknown>[] } | undefined) => {
 if (!old?.cards) return old;
 return { ...old, cards: old.cards.map((c) => c.id === variables.id ? { ...c, ...variables } : c) };
 }
 );
 return { previousData };
 },
 onError: (err: Error, _vars, context) => {
 if (context?.previousData) {
 for (const [qk, d] of context.previousData) queryClient.setQueryData(qk, d);
 }
 toast({ title: 'Erro ao mover card', description: err.message, variant: 'destructive' });
 },
 onSettled: () => {
 queryClient.invalidateQueries({ queryKey: ['kanban-board'] });
 queryClient.invalidateQueries({ queryKey: ['kanban-card'] });
 },
 });
}

export function useDeleteKanbanCard() {
 const queryClient = useQueryClient();
 const { toast } = useToast();

 return useMutation({
 mutationFn: async (id: string) => {
 const { error } = await supabase.from('kanban_cards').delete().eq('id', id);
 if (error) throw error;
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['kanban-board'] });
 toast({ title: 'Card removido.' });
 },
 onError: (err: Error) => {
 toast({ title: 'Erro ao remover card', description: err.message, variant: 'destructive' });
 },
 });
}

/* ─────────────────────────────────────────────
 NOTAS
 ───────────────────────────────────────────── */

export function useKanbanNotes(cardId: string | null) {
 return useQuery({
 queryKey: ['kanban-notes', cardId],
 queryFn: async () => {
 const { data, error } = await supabase
 .from('kanban_notes')
 .select('*, author:profiles(first_name, last_name, avatar_url)')
 .eq('card_id', cardId!)
 .order('created_at', { ascending: false });
 if (error) throw error;
 return data;
 },
 enabled: !!cardId,
 staleTime: 30 * 1000,
 });
}

export function useCreateKanbanNote() {
 const queryClient = useQueryClient();
 const { organization, user } = useAuthStore();
 const { toast } = useToast();

 return useMutation({
 mutationFn: async ({ card_id, body }: { card_id: string; body: string }) => {
 const { data: profile } = await supabase
 .from('profiles')
 .select('id')
 .eq('user_id', user!.id)
 .maybeSingle();

 const { data, error } = await supabase
 .from('kanban_notes')
 .insert({ card_id, body, org_id: organization!.id, author_id: profile?.id ?? null })
 .select()
 .single();
 if (error) throw error;
 return data;
 },
 onSuccess: (_, vars) => {
 queryClient.invalidateQueries({ queryKey: ['kanban-notes', vars.card_id] });
 },
 onError: (err: Error) => {
 toast({ title: 'Erro ao salvar nota', description: err.message, variant: 'destructive' });
 },
 });
}

export function useUpdateKanbanNote() {
 const queryClient = useQueryClient();
 const { toast } = useToast();

 return useMutation({
 mutationFn: async ({ id, card_id, body }: { id: string; card_id: string; body: string }) => {
 const { data, error } = await supabase
 .from('kanban_notes')
 .update({ body })
 .eq('id', id)
 .select()
 .single();
 if (error) throw error;
 return { ...data, card_id };
 },
 onSuccess: (data) => {
 queryClient.invalidateQueries({ queryKey: ['kanban-notes', data.card_id] });
 },
 onError: (err: Error) => {
 toast({ title: 'Erro ao editar nota', description: err.message, variant: 'destructive' });
 },
 });
}

export function useDeleteKanbanNote() {
 const queryClient = useQueryClient();
 const { toast } = useToast();

 return useMutation({
 mutationFn: async ({ id, card_id }: { id: string; card_id: string }) => {
 const { error } = await supabase.from('kanban_notes').delete().eq('id', id);
 if (error) throw error;
 return card_id;
 },
 onSuccess: (card_id) => {
 queryClient.invalidateQueries({ queryKey: ['kanban-notes', card_id] });
 },
 onError: (err: Error) => {
 toast({ title: 'Erro ao excluir nota', description: err.message, variant: 'destructive' });
 },
 });
}

/* ─────────────────────────────────────────────
 CHECKLISTS
 ───────────────────────────────────────────── */

export function useKanbanChecklists(cardId: string | null) {
 return useQuery({
 queryKey: ['kanban-checklists', cardId],
 queryFn: async () => {
 const { data, error } = await supabase
 .from('kanban_checklists')
 .select('*, items:kanban_checklist_items(*)')
 .eq('card_id', cardId!)
 .order('created_at');
 if (error) throw error;
 return data;
 },
 enabled: !!cardId,
 });
}

export function useCreateKanbanChecklist() {
 const queryClient = useQueryClient();
 const { organization } = useAuthStore();
 const { toast } = useToast();

 return useMutation({
 mutationFn: async ({ card_id, title }: { card_id: string; title?: string }) => {
 const { data, error } = await supabase
 .from('kanban_checklists')
 .insert({ card_id, org_id: organization!.id, title: title ?? 'Checklist' })
 .select()
 .single();
 if (error) throw error;
 return data;
 },
 onSuccess: (data) => {
 queryClient.invalidateQueries({ queryKey: ['kanban-checklists', data.card_id] });
 },
 onError: (err: Error) => {
 toast({ title: 'Erro ao criar checklist', description: err.message, variant: 'destructive' });
 },
 });
}

export function useToggleChecklistItem() {
 const queryClient = useQueryClient();

 return useMutation({
 mutationFn: async ({
 item_id,
 is_checked,
 card_id,
 }: {
 item_id: string;
 is_checked: boolean;
 card_id: string;
 }) => {
 const { data, error } = await supabase
 .from('kanban_checklist_items')
 .update({ is_checked, checked_at: is_checked ? new Date().toISOString() : null })
 .eq('id', item_id)
 .select()
 .single();
 if (error) throw error;
 return { ...data, card_id };
 },
 onSuccess: (data) => {
 queryClient.invalidateQueries({ queryKey: ['kanban-checklists', data.card_id] });
 },
 });
}

export function useAddChecklistItem() {
 const queryClient = useQueryClient();
 const { toast } = useToast();

 return useMutation({
 mutationFn: async ({
 checklist_id,
 title,
 card_id,
 }: {
 checklist_id: string;
 title: string;
 card_id: string;
 }) => {
 const { data, error } = await supabase
 .from('kanban_checklist_items')
 .insert({ checklist_id, title, position: 0 })
 .select()
 .single();
 if (error) throw error;
 return { ...data, card_id };
 },
 onSuccess: (data) => {
 queryClient.invalidateQueries({ queryKey: ['kanban-checklists', data.card_id] });
 },
 onError: (err: Error) => {
 toast({ title: 'Erro ao adicionar item', description: err.message, variant: 'destructive' });
 },
 });
}

export function useDeleteChecklistItem() {
 const queryClient = useQueryClient();

 return useMutation({
 mutationFn: async ({ item_id, card_id }: { item_id: string; card_id: string }) => {
 const { error } = await supabase.from('kanban_checklist_items').delete().eq('id', item_id);
 if (error) throw error;
 return card_id;
 },
 onSuccess: (card_id) => {
 queryClient.invalidateQueries({ queryKey: ['kanban-checklists', card_id] });
 },
 });
}

/* ─────────────────────────────────────────────
 TAGS
 ───────────────────────────────────────────── */

export function useKanbanTags() {
 const { organization } = useAuthStore();

 return useQuery({
 queryKey: ['kanban-tags', organization?.id],
 queryFn: async () => {
 const { data, error } = await supabase
 .from('kanban_tags')
 .select('*')
 .eq('org_id', organization!.id)
 .order('name');
 if (error) throw error;
 return data;
 },
 enabled: !!organization?.id,
 staleTime: 5 * 60 * 1000,
 });
}

const TAG_COLORS = [
 '#2E86AB', '#1E3A5F', '#27AE60', '#F39C12',
 '#E74C3C', '#8E44AD', '#2980B9', '#16A085',
];

export function useCreateKanbanTag() {
 const queryClient = useQueryClient();
 const { organization } = useAuthStore();
 const { toast } = useToast();

 return useMutation({
 mutationFn: async ({ name }: { name: string }) => {
 const existingTags = queryClient.getQueryData<{ color: string }[]>(['kanban-tags', organization?.id]) ?? [];
 const color = TAG_COLORS[existingTags.length % TAG_COLORS.length];

 const { data, error } = await supabase
 .from('kanban_tags')
 .insert({ name: name.trim(), org_id: organization!.id, color })
 .select()
 .single();
 if (error) throw error;
 return data;
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['kanban-tags'] });
 },
 onError: (err: Error) => {
 toast({ title: 'Erro ao criar tag', description: err.message, variant: 'destructive' });
 },
 });
}

/* ─────────────────────────────────────────────
 REALTIME SUBSCRIPTIONS
 ───────────────────────────────────────────── */

export function useKanbanRealtime(boardId?: string) {
 const queryClient = useQueryClient();

 useEffect(() => {
 if (!boardId) return;

 type CardPayload = {
 eventType: 'INSERT' | 'UPDATE' | 'DELETE';
 new: Record<string, unknown>;
 old: Record<string, unknown>;
 };

 type ColumnPayload = {
 eventType: 'INSERT' | 'UPDATE' | 'DELETE';
 new: Record<string, unknown>;
 old: Record<string, unknown>;
 };

 // ── Granular card update — avoids full board reload ──
 const handleCardChange = (payload: CardPayload) => {
 const boardQueryKey = ['kanban-board', undefined, undefined];

 // Try to update the cache surgically
 const updated = queryClient.setQueriesData(
 { queryKey: ['kanban-board'] },
 (old: { board: unknown; columns: unknown[]; cards: Record<string, unknown>[] } | undefined) => {
 if (!old?.cards) return old;

 if (payload.eventType === 'DELETE') {
 // Remove the deleted card from cache
 return {
 ...old,
 cards: old.cards.filter((c) => c.id !== payload.old.id),
 };
 }

 if (payload.eventType === 'INSERT') {
 // Add new card only if it belongs to this board and not already present
 const incoming = payload.new;
 if (incoming.board_id !== boardId) return old;
 const alreadyExists = old.cards.some((c) => c.id === incoming.id);
 if (alreadyExists) return old;
 return { ...old, cards: [...old.cards, normalizeKanbanCard(incoming)] };
 }

 if (payload.eventType === 'UPDATE') {
 // Merge updated fields into existing card
 return {
 ...old,
 cards: old.cards.map((c) =>
 c.id === payload.new.id
 ? normalizeKanbanCard({ ...c, ...payload.new })
 : c
 ),
 };
 }

 return old;
 }
 );

 // Fallback: if no cache was found to update, do a full refetch
 if (!updated || updated.length === 0) {
 queryClient.invalidateQueries({ queryKey: ['kanban-board'] });
 }
 };

 // ── Column changes require full board reload (structure changed) ──
 const handleColumnChange = (_payload: ColumnPayload) => {
 queryClient.invalidateQueries({ queryKey: ['kanban-board'] });
 };

 const channel = supabase
 .channel(`kanban_realtime_${boardId}`)
 .on(
 'postgres_changes',
 { event: '*', schema: 'public', table: 'kanban_cards', filter: `board_id=eq.${boardId}` },
 handleCardChange as any
 )
 .on(
 'postgres_changes',
 { event: '*', schema: 'public', table: 'kanban_columns', filter: `board_id=eq.${boardId}` },
 handleColumnChange as any
 )
 .subscribe();

 return () => {
 supabase.removeChannel(channel);
 };
 }, [boardId, queryClient]);
}
