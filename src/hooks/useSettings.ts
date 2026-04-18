import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';

/* ─── Agents / Team Members ─────────────────── */

export function useTeamMembers() {
  const { organization } = useAuthStore();

  return useQuery({
    queryKey: ['team-members', organization?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, first_name, last_name, email, role, is_active, avatar_url, last_seen_at, created_at')
        .eq('org_id', organization!.id)
        .order('created_at');
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!organization?.id,
  });
}

export function useInviteAgent() {
  const { organization } = useAuthStore();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ email, role }: { email: string; role: string }) => {
      // Calls a Supabase edge function that uses admin.inviteUserByEmail
      const { data, error } = await supabase.functions.invoke('invite-agent', {
        body: { email, role, org_id: organization!.id },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: '✉️ Convite enviado!', description: 'O agente receberá um email para criar sua conta.' });
    },
    onError: (err: Error) => {
      toast({ title: 'Erro ao enviar convite', description: err.message, variant: 'destructive' });
    },
  });
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient();
  const { organization } = useAuthStore();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ profileId, role, is_active }: { profileId: string; role?: string; is_active?: boolean }) => {
      const updates: Record<string, any> = {};
      if (role !== undefined) updates.role = role;
      if (is_active !== undefined) updates.is_active = is_active;

      const { error } = await supabase.from('profiles').update(updates).eq('id', profileId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members', organization?.id] });
      toast({ title: 'Membro atualizado.' });
    },
    onError: (err: Error) => {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    },
  });
}

/* ─── Kanban Column Management ──────────────── */

export function useKanbanBoardColumns(boardSlug: string | null) {
  const { organization } = useAuthStore();

  return useQuery({
    queryKey: ['kanban-columns-settings', organization?.id, boardSlug],
    queryFn: async () => {
      if (!boardSlug) return { board: null, columns: [] };

      const { data: board } = await supabase
        .from('kanban_boards')
        .select('id, name, slug')
        .eq('org_id', organization!.id)
        .eq('slug', boardSlug)
        .maybeSingle();

      if (!board) return { board: null, columns: [] };

      const { data: columns, error } = await supabase
        .from('kanban_columns')
        .select('id, name, color, position')
        .eq('board_id', board.id)
        .order('position');

      if (error) throw error;
      return { board, columns: columns ?? [] };
    },
    enabled: !!organization?.id && !!boardSlug,
  });
}

export function useCreateKanbanColumnInBoard() {
  const queryClient = useQueryClient();
  const { organization } = useAuthStore();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      board_id,
      name,
      color,
      position,
    }: {
      board_id: string;
      name: string;
      color?: string;
      position: number;
    }) => {
      const { data, error } = await supabase
        .from('kanban_columns')
        .insert({ board_id, name, color: color ?? '#6B7280', position })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanban-columns-settings'] });
      queryClient.invalidateQueries({ queryKey: ['kanban-board'] });
      toast({ title: 'Coluna criada!' });
    },
    onError: (err: Error) => {
      toast({ title: 'Erro ao criar coluna', description: err.message, variant: 'destructive' });
    },
  });
}

export function useUpdateKanbanColumn() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      name,
      color,
      position,
    }: {
      id: string;
      name?: string;
      color?: string;
      position?: number;
    }) => {
      const { error } = await supabase.from('kanban_columns').update({ name, color, position }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanban-columns-settings'] });
      queryClient.invalidateQueries({ queryKey: ['kanban-board'] });
    },
    onError: (err: Error) => {
      toast({ title: 'Erro ao atualizar coluna', description: err.message, variant: 'destructive' });
    },
  });
}

export function useDeleteKanbanColumn() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('kanban_columns').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanban-columns-settings'] });
      queryClient.invalidateQueries({ queryKey: ['kanban-board'] });
      toast({ title: 'Coluna removida.' });
    },
    onError: (err: Error) => {
      toast({ title: 'Erro ao remover coluna', description: err.message, variant: 'destructive' });
    },
  });
}
