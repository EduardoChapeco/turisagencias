import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';

export function useTickets(tripId?: string) {
  const { organization } = useAuthStore();

  return useQuery({
    queryKey: ['tickets', organization?.id, tripId],
    queryFn: async () => {
      let query = supabase
        .from('tickets')
        .select('*, clients(name), group_trips(title)')
        .order('created_at', { ascending: false });

      if (tripId) query = query.eq('group_trip_id', tripId);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!organization,
  });
}

export function useTicket(id: string | undefined) {
  return useQuery({
    queryKey: ['ticket', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tickets')
        .select('*, clients(name), group_trips(title), ticket_messages(*), email_messages(*)')
        .eq('id', id!)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error('Ticket não encontrado');
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateTicket() {
  const { organization, user } = useAuthStore();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (payload: {
      title: string;
      description: string;
      type?: string;
      priority?: string;
      trip_id?: string | null;
      client_id?: string | null;
    }) => {
      const { data, error } = await supabase
        .from('tickets')
        .insert({
          subject: payload.title,
          title: payload.title,
          description: payload.description,
          type: payload.type ?? 'general',
          priority: payload.priority ?? 'medium',
          group_trip_id: payload.trip_id ?? null,
          client_id: payload.client_id ?? null,
          org_id: organization!.id,
          created_by: user?.id ?? null,
          assigned_to: user?.id ?? null,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast({ title: 'Ticket criado!' });
    },
    onError: (err: Error) => {
      toast({ title: 'Erro ao criar ticket', description: err.message, variant: 'destructive' });
    },
  });
}

export function useCreateTicketMessage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (payload: { ticket_id: string; content: string; is_internal?: boolean }) => {
      const { data, error } = await supabase
        .from('ticket_messages')
        .insert({
          ticket_id: payload.ticket_id,
          body: payload.content,
          is_internal: payload.is_internal ?? false,
          sender_id: user?.id ?? null,
          sender_type: 'agent',
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['ticket', vars.ticket_id] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast({ title: 'Mensagem enviada!' });
    },
    onError: (err: Error) => {
      toast({ title: 'Erro ao enviar mensagem', description: err.message, variant: 'destructive' });
    },
  });
}
