import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';

export function useKanbanBoard(slug: string) {
  const { organization } = useAuthStore();

  return useQuery({
    queryKey: ['kanban-board', organization?.id, slug],
    queryFn: async () => {
      const { data: board, error: boardError } = await supabase
        .from('kanban_boards')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (boardError) throw boardError;
      if (!board && organization?.id) {
        await supabase.rpc('ensure_default_kanban_boards', { _org_id: organization.id });
        const { data: seededBoard, error: seededBoardError } = await supabase
          .from('kanban_boards')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();
        if (seededBoardError) throw seededBoardError;
        if (!seededBoard) throw new Error('Board não encontrado');

        const [{ data: columns, error: columnsError }, { data: cards, error: cardsError }] = await Promise.all([
          supabase.from('kanban_columns').select('*').eq('board_id', seededBoard.id).order('position'),
          supabase.from('kanban_cards').select('*, clients(name), quotations(destination), trips(title)').eq('board_id', seededBoard.id).order('position'),
        ]);

        if (columnsError) throw columnsError;
        if (cardsError) throw cardsError;
        return { board: seededBoard, columns: columns ?? [], cards: cards ?? [] };
      }

      if (!board) throw new Error('Board não encontrado');

      const [{ data: columns, error: columnsError }, { data: cards, error: cardsError }] = await Promise.all([
        supabase.from('kanban_columns').select('*').eq('board_id', board.id).order('position'),
        supabase.from('kanban_cards').select('*, clients(name), quotations(destination), trips(title)').eq('board_id', board.id).order('position'),
      ]);

      if (columnsError) throw columnsError;
      if (cardsError) throw cardsError;

      return { board, columns: columns ?? [], cards: cards ?? [] };
    },
    enabled: !!organization,
    staleTime: 60 * 1000,
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
    }) => {
      const { data, error } = await supabase
        .from('kanban_cards')
        .insert({
          ...payload,
        })
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
