import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';

export interface PaymentProof {
  id: string;
  booking_id: string;
  installment_id: string | null;
  org_id: string;
  file_url: string;
  file_name: string | null;
  amount_declared: number | null;
  notes_client: string | null;
  status: 'pending_review' | 'approved' | 'rejected' | 'cancelled';
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
}

// ── List proofs for a booking ─────────────────────────────────────────────────
export function useBookingPaymentProofs(bookingId: string | undefined) {
  return useQuery({
    queryKey: ['payment_proofs', bookingId],
    enabled: !!bookingId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('booking_payment_proofs')
        .select('*')
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as PaymentProof[];
    },
  });
}

// ── List all pending proofs for org (finance queue) ──────────────────────────
export function useOrgPendingProofs() {
  const { organization } = useAuthStore();
  return useQuery({
    queryKey: ['org_pending_proofs', organization?.id],
    enabled: !!organization?.id,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('booking_payment_proofs')
        .select(`
          *,
          group_bookings (
            lead_name, lead_phone, group_trip_id,
            group_trips ( title )
          )
        `)
        .eq('org_id', organization!.id)
        .eq('status', 'pending_review')
        .order('created_at', { ascending: true }); // oldest first
      if (error) throw error;
      return data ?? [];
    },
    refetchInterval: 20_000,
  });
}

// ── Review proof (approve / reject) ──────────────────────────────────────────
export function useReviewPaymentProof() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({
      proofId,
      bookingId,
      installmentId,
      action,
      rejectionReason,
    }: {
      proofId: string;
      bookingId: string;
      installmentId: string | null;
      action: 'approved' | 'rejected';
      rejectionReason?: string;
    }) => {
      // 1. Update proof status
      const { error: e1 } = await (supabase as any)
        .from('booking_payment_proofs')
        .update({
          status: action,
          reviewed_at: new Date().toISOString(),
          rejection_reason: action === 'rejected' ? rejectionReason : null,
        })
        .eq('id', proofId);
      if (e1) throw e1;

      // 2. If approved and has installmentId → mark installment as paid
      if (action === 'approved' && installmentId) {
        const { error: e2 } = await (supabase as any)
          .from('booking_installments')
          .update({
            status: 'paid',
            paid_at: new Date().toISOString(),
            payment_method: 'comprovante_cliente',
          })
          .eq('id', installmentId);
        if (e2) throw e2;
      }

      // 3. Refresh booking payment_status
      if (action === 'approved') {
        const { data: allInst } = await (supabase as any)
          .from('booking_installments')
          .select('status')
          .eq('booking_id', bookingId);

        const allPaid = allInst?.every((i: any) => i.status === 'paid');
        await (supabase as any)
          .from('group_bookings')
          .update({ payment_status: allPaid ? 'fully_paid' : 'partial' })
          .eq('id', bookingId);
      }
    },
    onSuccess: (_, { action }) => {
      qc.invalidateQueries({ queryKey: ['payment_proofs'] });
      qc.invalidateQueries({ queryKey: ['org_pending_proofs'] });
      qc.invalidateQueries({ queryKey: ['group_trip_bookings_full'] });
      qc.invalidateQueries({ queryKey: ['group_trip_finance_summary'] });
      toast({
        title: action === 'approved' ? '✅ Comprovante aprovado' : '❌ Comprovante rejeitado',
      });
    },
    onError: (e: Error) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });
}

// ── Upload proof by agent (on behalf of client) ───────────────────────────────
export function useUploadPaymentProof() {
  const { organization } = useAuthStore();
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({
      bookingId,
      installmentId,
      file,
      amountDeclared,
      notesClient,
    }: {
      bookingId: string;
      installmentId: string | null;
      file: File;
      amountDeclared?: number;
      notesClient?: string;
    }) => {
      // Upload to storage
      const path = `payment-proofs/${bookingId}/${Date.now()}_${file.name}`;
      const { data: upload, error: uploadErr } = await supabase.storage
        .from('client-media')
        .upload(path, file, { upsert: false });
      if (uploadErr) throw uploadErr;

      const { data: pub } = supabase.storage.from('client-media').getPublicUrl(upload.path);

      // Insert proof record
      const { data, error } = await (supabase as any)
        .from('booking_payment_proofs')
        .insert({
          booking_id: bookingId,
          installment_id: installmentId,
          org_id: organization!.id,
          file_url: pub.publicUrl,
          file_name: file.name,
          amount_declared: amountDeclared ?? null,
          notes_client: notesClient ?? null,
          status: 'approved', // uploaded by agent → already approved
          reviewed_at: new Date().toISOString(),
        })
        .select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payment_proofs'] });
      qc.invalidateQueries({ queryKey: ['group_trip_bookings_full'] });
      toast({ title: 'Comprovante registrado' });
    },
    onError: (e: Error) => toast({ title: 'Erro no upload', description: e.message, variant: 'destructive' }),
  });
}
