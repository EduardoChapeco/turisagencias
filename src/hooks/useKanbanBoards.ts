import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';

/* ─────────────────────────────────────────────
   Board + Columns + Cards (hook original expandido)
   ───────────────────────────────────────────── */

export function useKanbanBoard(slug: string) {
  const { organization } = useAuthStore();

  return useQuery({
    queryKey: ['kanban-board', organization?.id, slug],
    queryFn: async () => {
      if (!organization?.id) return null;  // Guard: org not loaded yet

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
        } catch (_) {
          // RPC might not exist yet — proceed gracefully
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
          slug === 'tasks'      ? 'Tarefas do Dia' :
                                  'CRM — Pipeline de Vendas';
        const { data: newBoard, error: createErr } = await supabase
          .from('kanban_boards')
          .insert({ org_id: organization.id, name: boardName, slug, board_type: slug })
          .select()
          .single();
        if (createErr) throw createErr;
        board = newBoard;

        // Seed default columns
        const defaultColumns =
          slug === 'departures'
            ? [
                { name: 'Documentação Pendente', color: '#F59E0B', position: 0 },
                { name: 'Check-in Aberto',        color: '#3B82F6', position: 1 },
                { name: 'Prontos para Embarcar',  color: '#10B981', position: 2 },
                { name: 'Em Viagem',              color: '#8B5CF6', position: 3 },
                { name: 'Retornaram',             color: '#94a3b8', position: 4 },
              ]
            : slug === 'tasks'
            ? [
                { name: 'A Fazer',      color: '#6B7280', position: 0 },
                { name: 'Em Progresso', color: '#3B82F6', position: 1 },
                { name: 'Revisão',      color: '#F59E0B', position: 2 },
                { name: 'Concluído',    color: '#10B981', position: 3 },
              ]
            : [
                { name: 'Novo Lead',        color: '#6B7280', position: 0 },
                { name: 'Em Contato',       color: '#3B82F6', position: 1 },
                { name: 'Proposta Enviada', color: '#F59E0B', position: 2 },
                { name: 'Negociando',       color: '#8B5CF6', position: 3 },
                { name: 'Fechado',          color: '#10B981', position: 4 },
                { name: 'Perdido',          color: '#EF4444', position: 5 },
              ];

        await supabase
          .from('kanban_columns')
          .insert(defaultColumns.map((c) => ({ ...c, board_id: board!.id, org_id: organization.id })));
      }

      // Step 4: Fetch columns + cards
      const [{ data: columns, error: columnsError }, { data: cards, error: cardsError }] = await Promise.all([
        supabase.from('kanban_columns').select('*').eq('board_id', board.id).order('position'),
        supabase
          .from('kanban_cards')
          .select('id, board_id, column_id, org_id, title, description, client_id, quotation_id, trip_id, ticket_id, linked_card_ids, task_type, due_date, priority, position, meta, metadata, assigned_to, whatsapp, email, tags, estimated_value, created_at, updated_at, clients(name, phone), quotations(destination), trips(title)')
          .eq('board_id', board.id)
          .order('position'),
      ]);

      if (columnsError) throw columnsError;
      if (cardsError) throw cardsError;

      return { board, columns: columns ?? [], cards: cards ?? [] };
    },
    enabled: !!organization?.id,
    staleTime: 60 * 1000,
    retry: 1,
  });
}

export function useCreateKanbanCard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (payload: {
      board_id: string;
      column_id: string;
      title: string;
      description?: string;
      client_id?: string | null;
      quotation_id?: string | null;
      trip_id?: string | null;
      ticket_id?: string | null;
      task_type?: string | null;
      linked_card_ids?: string[];
      estimated_value?: number | null;
      whatsapp?: string | null;
      email?: string | null;
      tags?: string[];
    }) => {
      const { data, error } = await supabase
        .from('kanban_cards')
        .insert({ ...payload })
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
      ticket_id?: string | null;
      task_type?: string | null;
      linked_card_ids?: string[];
      assigned_to?: string | null;
    }) => {
      const { data, error } = await supabase
        .from('kanban_cards')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanban-board'] });
      queryClient.invalidateQueries({ queryKey: ['kanban-card'] });
    },
    onError: (err: Error) => {
      toast({ title: 'Erro ao atualizar card', description: err.message, variant: 'destructive' });
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
