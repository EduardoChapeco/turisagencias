import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';

/* ─────────────────────────────────────────────
   Types
   ───────────────────────────────────────────── */
export interface Ticket {
  id: string;
  org_id: string;
  title: string;
  description: string;
  type: string;
  priority: string;
  status: string;
  channel: string;
  subject_line: string | null;
  sla_hours: number;
  sla_deadline: string | null;
  last_interaction_at: string | null;
  closed_at: string | null;
  resolution_notes: string | null;
  satisfaction_score: number | null;
  client_id: string | null;
  trip_id: string | null;
  group_trip_id: string | null;
  assigned_to: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joins
  clients?: { id: string; name: string; email: string | null; phone: string | null } | null;
  trips?: { destination: string | null } | null;
  group_trips?: { title: string | null } | null;
  assigned_member?: { full_name: string; email: string } | null;
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  body: string | null;
  content: string | null;
  message_type: string;
  is_internal: boolean;
  sender_id: string | null;
  sender_type: string;
  sender_name: string | null;
  sender_email: string | null;
  created_at: string;
}

export interface TicketEvent {
  id: string;
  ticket_id: string;
  event_type: string;
  payload: Record<string, any>;
  actor_id: string | null;
  actor_type: string;
  created_at: string;
}

export interface TicketAttachment {
  id: string;
  ticket_id: string;
  message_id: string | null;
  file_url: string;
  file_name: string;
  file_size_bytes: number | null;
  file_type: string | null;
  uploaded_by: string | null;
  created_at: string;
}

/* ─────────────────────────────────────────────
   Queries
   ───────────────────────────────────────────── */
export function useTickets(filters?: {
  status?: string;
  priority?: string;
  tripId?: string;
  search?: string;
}) {
  const { organization } = useAuthStore();

  return useQuery({
    queryKey: ['tickets', organization?.id, filters],
    queryFn: async () => {
      let query = supabase
        .from('tickets')
        .select(`
          *,
          clients(id, name, email, phone),
          group_trips(title)
        `)
        .eq('org_id', organization!.id)
        .order('last_interaction_at', { ascending: false, nullsFirst: false });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters?.priority) {
        query = query.eq('priority', filters.priority);
      }
      if (filters?.tripId) {
        query = query.or(`trip_id.eq.${filters.tripId},group_trip_id.eq.${filters.tripId}`);
      }
      if (filters?.search) {
        query = query.ilike('title', `%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Ticket[];
    },
    enabled: !!organization?.id,
  });
}

export function useTicket(id: string | undefined) {
  return useQuery({
    queryKey: ['ticket', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          clients(id, name, email, phone),
          group_trips(title),
          ticket_messages(*),
          ticket_events(*),
          ticket_attachments(*)
        `)
        .eq('id', id!)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error('Protocolo não encontrado');
      return data as Ticket & {
        ticket_messages: TicketMessage[];
        ticket_events: TicketEvent[];
        ticket_attachments: TicketAttachment[];
      };
    },
    enabled: !!id,
    refetchInterval: 30000, // poll every 30s for real-time updates
  });
}

/* ─────────────────────────────────────────────
   Mutations
   ───────────────────────────────────────────── */
export function useCreateTicket() {
  const { organization, user } = useAuthStore();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (payload: {
      title: string;
      description?: string;
      type?: string;
      priority?: string;
      channel?: string;
      subject_line?: string;
      sla_hours?: number;
      trip_id?: string | null;
      group_trip_id?: string | null;
      client_id?: string | null;
      assigned_to?: string | null;
    }) => {
      const { data, error } = await supabase
        .from('tickets')
        .insert({
          ...payload,
          description: payload.description ?? '',
          type: payload.type ?? 'general',
          priority: payload.priority ?? 'medium',
          channel: payload.channel ?? 'manual',
          sla_hours: payload.sla_hours ?? 24,
          org_id: organization!.id,
          created_by: user?.id ?? null,
          assigned_to: payload.assigned_to ?? user?.id ?? null,
          status: 'open',
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast({ title: '✅ Protocolo aberto com sucesso!' });
    },
    onError: (err: Error) => {
      toast({ title: 'Erro ao criar protocolo', description: err.message, variant: 'destructive' });
    },
  });
}

export function useUpdateTicket() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string } & Record<string, any>) => {
      const { data, error } = await supabase
        .from('tickets')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ticket', data.id] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
    onError: (err: Error) => {
      toast({ title: 'Erro ao atualizar protocolo', description: err.message, variant: 'destructive' });
    },
  });
}

export function useCreateTicketMessage() {
  const { user, profile } = useAuthStore();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (payload: {
      ticket_id: string;
      content: string;
      message_type?: string;
      is_internal?: boolean;
      sender_name?: string;
      sender_email?: string;
    }) => {
      const { data, error } = await supabase
        .from('ticket_messages')
        .insert({
          ticket_id: payload.ticket_id,
          body: payload.content,
          content: payload.content,
          message_type: payload.message_type ?? 'public',
          is_internal: payload.is_internal ?? false,
          sender_id: user?.id ?? null,
          sender_type: 'agent',
          sender_name: payload.sender_name ?? (`${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim() || 'Agente'),
          sender_email: payload.sender_email ?? user?.email ?? null,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['ticket', vars.ticket_id] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
    onError: (err: Error) => {
      toast({ title: 'Erro ao enviar mensagem', description: err.message, variant: 'destructive' });
    },
  });
}

export function useDeleteTicket() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tickets').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast({ title: 'Protocolo removido.' });
    },
  });
}

export function useSendTicketEmail() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (payload: {
      ticket_id: string;
      to_email: string;
      to_name: string;
      subject: string;
      body: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('send-ticket-email', {
        body: payload,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['ticket', vars.ticket_id] });
      toast({ title: '📧 Email enviado com sucesso!' });
    },
    onError: (err: Error) => {
      toast({ title: 'Erro ao enviar email', description: err.message, variant: 'destructive' });
    },
  });
}
