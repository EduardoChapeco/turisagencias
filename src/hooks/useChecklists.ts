import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';

export function useChecklists(tripId?: string) {
  const { organization } = useAuthStore();

  return useQuery({
    queryKey: ['checklists', organization?.id, tripId],
    queryFn: async () => {
      let query = supabase
        .from('checklists')
        .select('*, checklist_items(*)')
        .order('created_at', { ascending: false });

      if (tripId) query = query.eq('trip_id', tripId);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!organization,
  });
}

export function useCreateChecklist() {
  const { organization, user } = useAuthStore();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (payload: {
      title: string;
      trip_id?: string | null;
      client_id?: string | null;
      type?: string;
      is_visible_to_client?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('checklists')
        .insert({
          ...payload,
          org_id: organization!.id,
          created_by: user?.id ?? null,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklists'] });
      toast({ title: 'Checklist criado!' });
    },
    onError: (err: Error) => {
      toast({ title: 'Erro ao criar checklist', description: err.message, variant: 'destructive' });
    },
  });
}

export function useCreateChecklistItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (payload: { checklist_id: string; title: string; description?: string; position?: number }) => {
      const { data, error } = await supabase
        .from('checklist_items')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklists'] });
      toast({ title: 'Item adicionado!' });
    },
    onError: (err: Error) => {
      toast({ title: 'Erro ao criar item', description: err.message, variant: 'destructive' });
    },
  });
}

export function usePublicChecklist(token: string | undefined) {
  return useQuery({
    queryKey: ['public-checklist', token],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_public_checklist', { _token: token! });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!token,
  });
}

export function useTogglePublicChecklistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { token: string; itemId: string }) => {
      const { data, error } = await supabase.rpc('toggle_public_checklist_item', {
        _token: payload.token,
        _item_id: payload.itemId,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['public-checklist', vars.token] });
    },
  });
}
