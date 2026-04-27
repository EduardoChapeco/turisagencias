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

function getBookingPaymentStatus(
  booking: Pick<BookingWithInstallments, 'status' | 'total_amount' | 'installments'>,
) {
  if (booking.status === 'cancelled') return 'cancelled';

  const paidAmount = booking.installments
    .filter((installment) => installment.status === 'paid')
    .reduce((sum, installment) => sum + Number(installment.amount || 0), 0);

  if (booking.total_amount > 0 && paidAmount >= booking.total_amount) return 'fully_paid';
  if (paidAmount > 0) return 'partial';
  return 'pending';
}

// ── Financial Summary (KPIs) ─────────────────────────────────────────────────
export function useGroupTripFinancialSummary(tripId: string | undefined) {
  return useQuery({
    queryKey: ['group_trip_finance_summary', tripId],
    enabled: !!tripId,
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_group_trip_financial_summary', { _trip_id: tripId! });
      if (error) throw error;
      return data as unknown as FinancialSummary;
    },
    refetchInterval: 30_000,
  });
}

// ── Bookings with installments list ──────────────────────────────────────────
export function useGroupTripBookings(tripId: string | undefined) {
  return useQuery({
    queryKey: ['group_trip_bookings_full', tripId],
    enabled: !!tripId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('group_bookings')
        .select(`
          id, lead_name, lead_phone, lead_email, pax_count, total_amount,
          status, seat_numbers, created_at, public_token,
          booking_installments (
            id, installment_number, due_date, amount, status,
            paid_at, payment_method, notes_finance, whatsapp_attempts
          ),
          booking_payment_proofs ( id, status )
        `)
        .eq('group_trip_id', tripId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map((b) => {
        const installments = (b as any).booking_installments ?? [];
        const booking = {
          ...b,
          installments,
          proofs_count: (b as any).booking_payment_proofs?.length ?? 0,
          proofs_pending_count: (b as any).booking_payment_proofs?.filter((p: any) => p.status === 'pending_review').length ?? 0,
        } as unknown as BookingWithInstallments;

        return {
          ...booking,
          payment_status: getBookingPaymentStatus(booking),
        };
      });
    },
  });
}

// ── Ledger entries ────────────────────────────────────────────────────────────
export function useGroupTripLedger(tripId: string | undefined) {
  return useQuery({
    queryKey: ['group_trip_ledger', tripId],
    enabled: !!tripId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('group_trip_ledger')
        .select('*')
        .eq('group_trip_id', tripId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as TripLedgerEntry[];
    },
  });
}

export function useCreateLedgerEntry(tripId: string) {
  const qc = useQueryClient();
  const { organization } = useAuthStore();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (payload: Partial<TripLedgerEntry>) => {
      const { data, error } = await supabase
        .from('group_trip_ledger')
        .insert({ ...(payload as any), group_trip_id: tripId, org_id: organization!.id })
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
      // 1. Check current status to prevent duplicate inserts
      const { data: currentInst } = await supabase.from('booking_installments').select('status, amount, due_date, booking_id').eq('id', installmentId).single();
      const wasPaid = currentInst?.status === 'paid';

      const update: Record<string, unknown> = { status };
      if (paid_at !== undefined) update.paid_at = paid_at;
      if (payment_method !== undefined) update.payment_method = payment_method;
      if (notes_finance !== undefined) update.notes_finance = notes_finance;
      
      const { error } = await supabase
        .from('booking_installments')
        .update(update as any)
        .eq('id', installmentId);
      if (error) throw error;

      // 2. Synchronize with Global Finance and Trip Ledger if it became Paid
      if (status === 'paid' && !wasPaid && currentInst) {
        const { data: booking } = await supabase.from('group_bookings').select('group_trip_id, org_id, lead_name').eq('id', currentInst.booking_id).single();
        if (booking) {
          // Sync with Global Agency Finance
          await supabase.from('financial_transactions').insert({
            org_id: booking.org_id,
            group_trip_id: booking.group_trip_id,
            type: 'receivable',
            status: 'paid',
            amount: currentInst.amount,
            currency: 'BRL',
            due_date: currentInst.due_date,
            paid_at: paid_at || new Date().toISOString(),
            payment_method: payment_method || 'transferencia',
            description: `Recebimento Parcela ${installmentId.split('-')[0].toUpperCase()} - ${booking.lead_name}`,
          });

          // Sync with Internal Trip Ledger
          await supabase.from('group_trip_ledger').insert({
            org_id: booking.org_id,
            group_trip_id: booking.group_trip_id,
            type: 'income',
            category: 'venda_pacote',
            amount: currentInst.amount,
            currency: 'BRL',
            status: 'paid',
            paid_at: paid_at || new Date().toISOString(),
            description: `Recebimento Passageiro: ${booking.lead_name}`,
          });
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['group_trip_bookings_full', tripId] });
      qc.invalidateQueries({ queryKey: ['group_trip_finance_summary', tripId] });
      qc.invalidateQueries({ queryKey: ['group_trip_ledger', tripId] });
      qc.invalidateQueries({ queryKey: ['financial_transactions'] });
      toast({ title: 'Parcela atualizada e Sincronizada no Financeiro Geral!' });
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
      const { data: booking, error: bookingError } = await supabase
        .from('group_bookings')
        .select('lead_name')
        .eq('id', bookingId)
        .maybeSingle();
      if (bookingError) throw bookingError;

      // 1. Update booking seat_numbers
      const { error: e1 } = await supabase
        .from('group_bookings')
        .update({ seat_numbers: seats })
        .eq('id', bookingId);
      if (e1) throw e1;

      // 2. Replace seat assignments. The unique constraint protects seats already in use.
      const { error: deleteError } = await supabase
        .from('bus_seat_assignments')
        .delete()
        .eq('booking_id', bookingId);
      if (deleteError) throw deleteError;

      if (seats.length === 0) return;

      const assignments = seats.map(s => ({
        group_trip_id: tripId,
        booking_id: bookingId,
        seat_label: s,
        traveler_name: booking?.lead_name ?? null,
      }));
      const { error: e2 } = await supabase
        .from('bus_seat_assignments')
        .insert(assignments);
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
      const { error } = await supabase
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
