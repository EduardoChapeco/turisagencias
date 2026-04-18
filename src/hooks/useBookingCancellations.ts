import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface CancellationRequest {
  id: string;
  booking_id: string;
  org_id: string;
  group_trip_id: string;
  requested_by: 'client' | 'agency';
  reason_code: string;
  reason_notes: string | null;
  cancellation_date: string;
  total_paid: number;
  fine_pct: number;
  fine_amount: number;
  refund_amount: number;
  credit_amount: number;
  status: 'requested' | 'approved' | 'rejected' | 'processed' | 'withdrawn';
  finance_resolution: string | null;
  approved_by: string | null;
  approved_at: string | null;
  refund_processed_at: string | null;
  notes_finance: string | null;
  created_at: string;
}

export interface TravelCredit {
  id: string;
  amount: number;
  used_amount: number;
  expires_at: string | null;
  status: 'active' | 'used' | 'expired' | 'cancelled';
  notes: string | null;
  created_at: string;
}

// ── Fine preview (calls RPC) ──────────────────────────────────────────────────
export function useCancellationFinePreview(
  bookingId: string | null,
  cancellationDate?: string,
) {
  return useQuery({
    queryKey: ['cancellation_fine_preview', bookingId, cancellationDate],
    enabled: !!bookingId,
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('calculate_cancellation_fine', {
          _booking_id: bookingId!,
          _cancellation_date: cancellationDate ?? new Date().toISOString().split('T')[0],
        });
      if (error) throw error;
      // RPC returns array (RETURNS TABLE)
      const row = Array.isArray(data) ? data[0] : data;
      return row as {
        total_paid: number;
        fine_pct: number;
        fine_amount: number;
        refund_amount: number;
        policy_desc: string;
      };
    },
    staleTime: 60_000,
  });
}

// ── List cancellations for a trip ─────────────────────────────────────────────
export function useTripCancellations(tripId: string | undefined) {
  return useQuery({
    queryKey: ['trip_cancellations', tripId],
    enabled: !!tripId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('booking_cancellations')
        .select(`
          *,
          group_bookings ( lead_name, lead_phone )
        `)
        .eq('group_trip_id', tripId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as (CancellationRequest & { group_bookings: any })[];
    },
  });
}

// ── Org-wide pending cancellations queue ──────────────────────────────────────
export function useOrgPendingCancellations() {
  const { organization } = useAuthStore();
  return useQuery({
    queryKey: ['org_pending_cancellations', organization?.id],
    enabled: !!organization?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('booking_cancellations')
        .select(`
          *,
          group_bookings ( lead_name, lead_phone ),
          group_trips ( title )
        `)
        .eq('org_id', organization!.id)
        .eq('status', 'requested')
        .order('created_at');
      if (error) throw error;
      return data ?? [];
    },
    refetchInterval: 30_000,
  });
}

// ── Submit cancellation request ────────────────────────────────────────────────
export function useRequestCancellation() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (payload: {
      bookingId: string;
      orgId: string;
      tripId: string;
      reasonCode: string;
      reasonNotes: string;
      totalPaid: number;
      finePct: number;
      fineAmount: number;
      refundAmount: number;
      creditAmount: number;
      financeResolution: 'full_refund' | 'full_credit' | 'partial_refund_partial_credit';
      requestedBy?: 'client' | 'agency';
    }) => {
      const { data, error } = await supabase
        .from('booking_cancellations')
        .insert({
          booking_id:         payload.bookingId,
          org_id:             payload.orgId,
          group_trip_id:      payload.tripId,
          requested_by:       payload.requestedBy ?? 'client',
          reason_code:        payload.reasonCode,
          reason_notes:       payload.reasonNotes || null,
          total_paid:         payload.totalPaid,
          fine_pct:           payload.finePct,
          fine_amount:        payload.fineAmount,
          refund_amount:      payload.refundAmount,
          credit_amount:      payload.creditAmount,
          finance_resolution: payload.financeResolution,
          status:             'requested',
        } as any)
        .select('id')
        .single();
      if (error) throw error;

      // Mark booking with cancellation reference
      const { error: e2 } = await supabase
        .from('group_bookings')
        .update({ cancellation_id: data.id } as any)
        .eq('id', payload.bookingId);
      if (e2) throw e2;

      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trip_cancellations'] });
      qc.invalidateQueries({ queryKey: ['org_pending_cancellations'] });
      qc.invalidateQueries({ queryKey: ['group_trip_bookings_full'] });
      toast({ title: 'Solicitação de cancelamento enviada' });
    },
    onError: (e: Error) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });
}

// ── Approve / Reject cancellation ─────────────────────────────────────────────
export function useProcessCancellation() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({
      cancellationId,
      bookingId,
      action,
      notesFinance,
      refundMethod,
      generateCredit,
      creditAmount,
      orgId,
      leadEmail,
      leadName,
    }: {
      cancellationId: string;
      bookingId: string;
      action: 'approved' | 'rejected';
      notesFinance?: string;
      refundMethod?: string;
      generateCredit?: boolean;
      creditAmount?: number;
      orgId: string;
      leadEmail?: string | null;
      leadName?: string;
    }) => {
      const now = new Date().toISOString();

      // 1. Update cancellation status
      const { error: e1 } = await supabase
        .from('booking_cancellations')
        .update({
          status: action === 'approved' ? 'approved' : 'rejected',
          approved_at: action === 'approved' ? now : null,
          notes_finance: notesFinance ?? null,
          refund_method: refundMethod ?? null,
        } as any)
        .eq('id', cancellationId);
      if (e1) throw e1;

      if (action === 'approved') {
        // 2. Cancel booking
        const { error: e2 } = await supabase
          .from('group_bookings')
          .update({ status: 'cancelled', cancelled_at: now } as any)
          .eq('id', bookingId);
        if (e2) throw e2;

        // 3. Cancel pending installments
        const { error: e3 } = await supabase
          .from('booking_installments')
          .update({ status: 'cancelled' } as any)
          .eq('booking_id', bookingId)
          .in('status', ['pending', 'late']);
        if (e3) throw e3;

        // 4. Generate credit if requested
        if (generateCredit && creditAmount && creditAmount > 0) {
          const { error: e4 } = await supabase
            .from('client_travel_credits')
            .insert({
              org_id: orgId,
              originating_cancellation_id: cancellationId,
              amount: creditAmount,
              lead_email: leadEmail ?? null,
              lead_name: leadName ?? null,
            } as any);
          if (e4) throw e4;
        }

        // 5. Mark cancellation as processed
        const { error: e5 } = await supabase
          .from('booking_cancellations')
          .update({ status: 'processed', refund_processed_at: now } as any)
          .eq('id', cancellationId);
        if (e5) throw e5;
      }
    },
    onSuccess: (_, { action }) => {
      qc.invalidateQueries({ queryKey: ['trip_cancellations'] });
      qc.invalidateQueries({ queryKey: ['org_pending_cancellations'] });
      qc.invalidateQueries({ queryKey: ['group_trip_bookings_full'] });
      qc.invalidateQueries({ queryKey: ['group_trip_finance_summary'] });
      toast({ title: action === 'approved' ? '✅ Cancelamento aprovado' : '❌ Cancelamento rejeitado' });
    },
    onError: (e: Error) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });
}

// ── Client travel credits ─────────────────────────────────────────────────────
export function useClientTravelCredits(email: string | null | undefined) {
  const { organization } = useAuthStore();
  return useQuery({
    queryKey: ['travel_credits', organization?.id, email],
    enabled: !!organization?.id && !!email,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_travel_credits')
        .select('*')
        .eq('org_id', organization!.id)
        .eq('lead_email', email!)
        .eq('status', 'active')
        .order('expires_at');
      if (error) throw error;
      return (data ?? []) as unknown as TravelCredit[];
    },
  });
}
