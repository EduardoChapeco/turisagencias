import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const paymentsDb = supabase as any;

// ── Types ──────────────────────────────────────────────────────────────────────

export interface Booking {
  id: string;
  org_id: string;
  trip_id: string | null;
  quotation_id: string | null;
  client_id: string | null;
  agent_id: string | null;
  status: 'pending_payment' | 'partial_payment' | 'paid' | 'confirmed' | 'cancelled' | 'completed' | 'refunded';
  total_value: number;
  paid_value: number;
  pending_value: number;
  installment_config: {
    total_installments: number;
    installment_value: number;
    deposit_amount: number;
    interest_rate: number;
    pix_discount_percent: number;
    payment_deadline: 'boarding_date' | 'fixed_date';
  };
  boarding_date: string | null;
  return_date: string | null;
  contract_signed_at: string | null;
  contract_pdf_url: string | null;
  passengers: unknown[];
  services: unknown[];
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  booking_id: string;
  client_id: string | null;
  installment_number: number;
  total_installments: number;
  description: string | null;
  amount: number;
  interest_amount: number;
  total_amount: number;
  interest_rate: number;
  due_date: string;
  paid_at: string | null;
  method: 'pix' | 'credit_card' | 'boleto' | 'transfer' | 'cash' | 'other' | null;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled' | 'refunded';
  proof_url: string | null;
  proof_verified_at: string | null;
  gateway_name: string | null;
  gateway_id: string | null;
  payment_link_url: string | null;
  notes: string | null;
  created_at: string;
}

export interface InstallmentCalculation {
  deposit: number;
  remaining: number;
  installments_count: number;
  installment_value: number;
  total_with_interest: number;
  payment_dates: string[];
  last_payment_date: string;
  is_valid: boolean;
  adjusted_from: number;
  was_adjusted: boolean;
}

// ── Hooks: Bookings ────────────────────────────────────────────────────────────

export function useBookings(filters?: { status?: string; client_id?: string }) {
  return useQuery({
    queryKey: ['bookings', filters],
    queryFn: async () => {
      let query = paymentsDb
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status) query = query.eq('status', filters.status);
      if (filters?.client_id) query = query.eq('client_id', filters.client_id);

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Booking[];
    },
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (booking: Partial<Booking>) => {
      const { data, error } = await paymentsDb
        .from('bookings')
        .insert(booking)
        .select()
        .single();
      if (error) throw error;
      return data as Booking;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useUpdateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Booking> & { id: string }) => {
      const { data, error } = await paymentsDb
        .from('bookings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Booking;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

// ── Hooks: Payments ────────────────────────────────────────────────────────────

export function usePayments(bookingId: string) {
  return useQuery({
    queryKey: ['payments', bookingId],
    queryFn: async () => {
      const { data, error } = await paymentsDb
        .from('payments')
        .select('*')
        .eq('booking_id', bookingId)
        .order('installment_number', { ascending: true });
      if (error) throw error;
      return data as Payment[];
    },
    enabled: Boolean(bookingId),
  });
}

export function useMarkPaymentPaid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, proof_url, method }: { id: string; proof_url?: string; method: Payment['method'] }) => {
      const { data, error } = await paymentsDb
        .from('payments')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
          method,
          ...(proof_url ? { proof_url } : {}),
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Payment;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payments', data.booking_id] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useUploadProof() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ paymentId, bookingId, file }: { paymentId: string; bookingId: string; file: File }) => {
      const ext = file.name.split('.').pop();
      const path = `${bookingId}/${paymentId}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(path);

      const { data, error } = await paymentsDb
        .from('payments')
        .update({ proof_url: publicUrl })
        .eq('id', paymentId)
        .select()
        .single();
      if (error) throw error;
      return data as Payment;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payments', data.booking_id] });
    },
  });
}

// ── RPC: Calculadora de Parcelas ────────────────────────────────────────────────

export async function calculateInstallments(params: {
  total_value: number;
  deposit_pct?: number;
  installments?: number;
  interest_rate?: number;
  boarding_date?: string;
}): Promise<InstallmentCalculation> {
  const { data, error } = await paymentsDb.rpc('calculate_installments', {
    p_total_value: params.total_value,
    p_deposit_pct: params.deposit_pct ?? 0,
    p_installments: params.installments ?? 1,
    p_interest_rate: params.interest_rate ?? 0,
    p_boarding_date: params.boarding_date ?? null,
  });
  if (error) throw error;
  return data as InstallmentCalculation;
}

// ── RPC: Gerar parcelas automaticamente para um booking ────────────────────────

export function useGenerateInstallments() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      booking_id,
      org_id,
      client_id,
      calculation,
    }: {
      booking_id: string;
      org_id: string;
      client_id?: string;
      calculation: InstallmentCalculation & { deposit: number; payment_dates: string[] };
    }) => {
      const rows: Partial<Payment>[] = [];

      if (calculation.deposit > 0) {
        rows.push({
          booking_id,
          org_id,
          client_id: client_id || null,
          installment_number: 0,
          total_installments: calculation.installments_count,
          description: 'Entrada',
          amount: calculation.deposit,
          interest_amount: 0,
          due_date: new Date().toISOString().split('T')[0],
          status: 'pending',
        } as Partial<Payment>);
      }

      calculation.payment_dates.forEach((date, idx) => {
        rows.push({
          booking_id,
          org_id,
          client_id: client_id || null,
          installment_number: idx + 1,
          total_installments: calculation.installments_count,
          description: `${idx + 1}ª Parcela`,
          amount: calculation.installment_value,
          interest_amount: 0,
          due_date: date,
          status: 'pending',
        } as Partial<Payment>);
      });

      const { data, error } = await paymentsDb
        .from('payments')
        .insert(rows)
        .select();
      if (error) throw error;
      return data as Payment[];
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['payments', vars.booking_id] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}
