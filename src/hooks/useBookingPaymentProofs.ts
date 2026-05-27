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
 const { data, error } = await supabase
 .from('booking_payment_proofs')
 .select('*')
 .eq('booking_id', bookingId!)
 .order('created_at', { ascending: false });
 if (error) throw error;
 return (data ?? []) as unknown as PaymentProof[];
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
 const { data, error } = await supabase
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
 const { error: e1 } = await supabase
 .from('booking_payment_proofs')
 .update({
 status: action,
 reviewed_at: new Date().toISOString(),
 rejection_reason: action === 'rejected' ? (rejectionReason ?? null) : null,
 } as any)
 .eq('id', proofId);
 if (e1) throw e1;

 // 2. If approved and has installmentId → mark installment as paid
 if (action === 'approved' && installmentId) {
 const { data: currentInst } = await supabase
 .from('booking_installments')
 .select('status, amount, due_date, booking_id')
 .eq('id', installmentId)
 .single();
 const wasPaid = currentInst?.status === 'paid';

 const { error: e2 } = await supabase
 .from('booking_installments')
 .update({
 status: 'paid',
 paid_at: new Date().toISOString(),
 payment_method: 'comprovante_cliente',
 } as any)
 .eq('id', installmentId);
 if (e2) throw e2;

 if (!wasPaid && currentInst) {
 const { data: booking } = await supabase
 .from('group_bookings')
 .select('group_trip_id, org_id, lead_name')
 .eq('id', currentInst.booking_id)
 .single();

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
 paid_at: new Date().toISOString(),
 payment_method: 'comprovante_cliente',
 description: `Recebimento Parcela ${installmentId.split('-')[0].toUpperCase()} - ${booking.lead_name} (Via Comprovante)`,
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
 paid_at: new Date().toISOString(),
 description: `Recebimento Passageiro: ${booking.lead_name} (Via Comprovante)`,
 });
 }
 }
 }

 // 3. Keep the canonical booking status in sync when every installment is paid.
 if (action === 'approved') {
 const { data: allInst, error: installmentsError } = await supabase
 .from('booking_installments')
 .select('status')
 .eq('booking_id', bookingId);
 if (installmentsError) throw installmentsError;

 const allPaid = (allInst ?? []).length > 0 && (allInst ?? []).every((i) => (i as any).status === 'paid');
 if (allPaid) {
 const { error: bookingError } = await supabase
 .from('group_bookings')
 .update({ status: 'paid' } as any)
 .eq('id', bookingId);
 if (bookingError) throw bookingError;
 }
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
 const { data, error } = await supabase
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
 } as any)
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
