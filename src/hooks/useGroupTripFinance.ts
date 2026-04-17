import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface FinancialSummary {
  total_bookings: number;
  total_pax: number;
  total_expected: number;
  total_received: number;
  total_pending: number;
  total_late: number;
  bookings_paid: number;
  bookings_partial: number;
  bookings_pending: number;
  proofs_pending: number;
  cancellations: number;
}

export interface TripLedgerEntry {
  id: string;
  type: 'income' | 'expense' | 'refund' | 'fine' | 'credit';
  category: string;
  description: string;
  amount: number;
  currency: string;
  reference_booking_id: string | null;
  planned_date: string | null;
  paid_at: string | null;
  status: 'planned' | 'paid' | 'cancelled';
  created_at: string;
}

export interface BookingWithInstallments {
  id: string;
  lead_name: string;
  lead_phone: string | null;
  lead_email: string | null;
  pax_count: number;
  total_amount: number;
  payment_status: string;
  status: string;
  seat_numbers: string[] | null;
  created_at: string;
  public_token: string;
  installments: {
    id: string;
    installment_number: number;
    due_date: string;
    amount: number;
    status: string;
    paid_at: string | null;
    payment_method: string | null;
    notes_finance: string | null;
    whatsapp_attempts: number;
  }[];
  proofs_count: number;
  proofs_pending_count: number;
}

// ── Financial Summary (KPIs) ─────────────────────────────────────────────────
export function useGroupTripFinancialSummary(tripId: string | undefined) {
  return useQuery({
    queryKey: ['group_trip_finance_summary', tripId],
    enabled: !!tripId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .rpc('get_group_trip_financial_summary', { _trip_id: tripId });
      if (error) throw error;
      return data as FinancialSummary;
    },
    refetchInterval: 30_000, // refresh a cada 30s
  });
}

// ── Bookings with installments list ──────────────────────────────────────────
export function useGroupTripBookings(tripId: string | undefined) {
  return useQuery({
    queryKey: ['group_trip_bookings_full', tripId],
    enabled: !!tripId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('group_bookings')
        .select(`
          id, lead_name, lead_phone, lead_email, pax_count, total_amount,
          payment_status, status, seat_numbers, created_at, public_token,
          booking_installments (
            id, installment_number, due_date, amount, status,
            paid_at, payment_method, notes_finance, whatsapp_attempts
          ),
          booking_payment_proofs ( id, status )
        `)
        .eq('group_trip_id', tripId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map((b: any) => ({
        ...b,
        installments: b.booking_installments ?? [],
        proofs_count: b.booking_payment_proofs?.length ?? 0,
        proofs_pending_count: b.booking_payment_proofs?.filter((p: any) => p.status === 'pending_review').length ?? 0,
      })) as BookingWithInstallments[];
    },
  });
}

// ── Ledger entries ────────────────────────────────────────────────────────────
export function useGroupTripLedger(tripId: string | undefined) {
  return useQuery({
    queryKey: ['group_trip_ledger', tripId],
    enabled: !!tripId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('group_trip_ledger')
        .select('*')
        .eq('group_trip_id', tripId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as TripLedgerEntry[];
    },
  });
}

export function useCreateLedgerEntry(tripId: string) {
  const qc = useQueryClient();
  const { organization } = useAuthStore();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (payload: Partial<TripLedgerEntry>) => {
      const { data, error } = await (supabase as any)
        .from('group_trip_ledger')
        .insert({ ...payload, group_trip_id: tripId, org_id: organization!.id })
        .select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['group_trip_ledger', tripId] });
      qc.invalidateQueries({ queryKey: ['group_trip_finance_summary', tripId] });
      toast({ title: 'Lançamento adicionado' });
    },
    onError: (e: Error) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });
}

// ── Mark installment paid/late/dispensed ─────────────────────────────────────
export function useUpdateInstallmentStatus(tripId: string) {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({
      installmentId,
      status,
      paid_at,
      payment_method,
      notes_finance,
    }: {
      installmentId: string;
      status: 'paid' | 'pending' | 'late' | 'cancelled';
      paid_at?: string | null;
      payment_method?: string | null;
      notes_finance?: string | null;
    }) => {
      const update: any = { status };
      if (paid_at !== undefined) update.paid_at = paid_at;
      if (payment_method !== undefined) update.payment_method = payment_method;
      if (notes_finance !== undefined) update.notes_finance = notes_finance;
      const { error } = await (supabase as any)
        .from('booking_installments')
        .update(update)
        .eq('id', installmentId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['group_trip_bookings_full', tripId] });
      qc.invalidateQueries({ queryKey: ['group_trip_finance_summary', tripId] });
      toast({ title: 'Parcela atualizada' });
    },
    onError: (e: Error) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });
}

// ── Assign seats manually ─────────────────────────────────────────────────────
export function useAssignSeats(tripId: string) {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ bookingId, seats }: { bookingId: string; seats: string[] }) => {
      // 1. Update booking seat_numbers
      const { error: e1 } = await (supabase as any)
        .from('group_bookings')
        .update({ seat_numbers: seats })
        .eq('id', bookingId);
      if (e1) throw e1;
      // 2. Upsert seat assignments
      const assignments = seats.map(s => ({
        group_trip_id: tripId,
        booking_id: bookingId,
        seat_label: s,
        floor_number: 1,
        assigned_by: 'agent',
        assigned_at: new Date().toISOString(),
      }));
      const { error: e2 } = await (supabase as any)
        .from('bus_seat_assignments')
        .upsert(assignments, { onConflict: 'group_trip_id,seat_label,floor_number' });
      if (e2) throw e2;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['group_trip_bookings_full', tripId] });
      toast({ title: 'Assentos atribuídos!' });
    },
    onError: (e: Error) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });
}

// ── Publish seat map (visibility toggle) ────────────────────────────────────
export function useToggleSeatMapVisibility() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ tripId, visible }: { tripId: string; visible: boolean }) => {
      const { error } = await (supabase as any)
        .from('group_trips')
        .update({ seat_map_visible_to_client: visible })
        .eq('id', tripId);
      if (error) throw error;
    },
    onSuccess: (_, { visible }) => {
      qc.invalidateQueries({ queryKey: ['group_trips'] });
      toast({ title: visible ? 'Mapa publicado para clientes' : 'Mapa ocultado dos clientes' });
    },
    onError: (e: Error) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });
}
