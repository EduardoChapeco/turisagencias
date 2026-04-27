import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';

const settingsDb = supabase as any;

/* ─── Agents / Team Members ─────────────────── */

export function useTeamMembers() {
  const { organization } = useAuthStore();

  return useQuery({
    queryKey: ['team-members', organization?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, first_name, last_name, email, is_active, avatar_url, last_seen_at, created_at')
        .eq('org_id', organization!.id)
        .order('created_at');
      if (error) throw error;
      
      const profiles = data ?? [];
      if (profiles.length === 0) return profiles;
      
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', profiles.map(p => p.user_id));
        
      if (rolesError) throw rolesError;
      
      return profiles.map(p => {
        const userRole = rolesData?.find(r => r.user_id === p.user_id);
        return { ...p, role: userRole?.role ?? 'agent' };
      });
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
    mutationFn: async ({ profileId, userId, role, is_active }: { profileId: string; userId?: string; role?: string; is_active?: boolean }) => {
      if (role !== undefined && userId) {
        const { error: delError } = await supabase.from('user_roles').delete().eq('user_id', userId);
        if (delError) throw delError;
        
        const { error: insError } = await supabase.from('user_roles').insert({ user_id: userId, role });
        if (insError) throw insError;
      }

      if (is_active !== undefined) {
        const { error } = await settingsDb.from('profiles').update({ is_active }).eq('id', profileId);
        if (error) throw error;
      }
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
      const { data, error } = await settingsDb
        .from('kanban_columns')
        .insert({ board_id, name, color: color ?? '#6B7280', position, org_id: organization!.id })
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
