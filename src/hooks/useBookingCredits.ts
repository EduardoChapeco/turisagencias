import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';

export type BookingCredit = {
 id: string;
 org_id: string;
 booking_id: string | null;
 client_email: string | null;
 client_name: string | null;
 amount: number;
 used_amount: number;
 currency: string;
 source: string | null; // 'cancellation' | 'manual' | 'refund'
 cancellation_id: string | null;
 expires_at: string | null;
 notes: string | null;
 created_at: string;
 updated_at: string;
};

/** List credits for a specific booking */
export function useBookingCreditsForBooking(bookingId: string | undefined) {
 return useQuery<BookingCredit[]>({
 queryKey: ['booking_credits', 'booking', bookingId],
 queryFn: async () => {
 if (!bookingId) return [];
 const { data, error } = await supabase
 .from('booking_credits')
 .select('*')
 .eq('booking_id', bookingId)
 .order('created_at', { ascending: false });
 if (error) throw error;
 return (data || []) as BookingCredit[];
 },
 enabled: !!bookingId,
 });
}

/** List all credits for the organization */
export function useOrgBookingCredits() {
 const { organization } = useAuthStore();
 return useQuery<BookingCredit[]>({
 queryKey: ['booking_credits', 'org', organization?.id],
 queryFn: async () => {
 if (!organization?.id) return [];
 const { data, error } = await supabase
 .from('booking_credits')
 .select('*')
 .eq('org_id', organization.id)
 .order('created_at', { ascending: false });
 if (error) throw error;
 return (data || []) as BookingCredit[];
 },
 enabled: !!organization?.id,
 });
}

/** Create a manual credit */
export function useCreateBookingCredit() {
 const qc = useQueryClient();
 const { organization } = useAuthStore();
 const { toast } = useToast();
 return useMutation({
 mutationFn: async (payload: Partial<BookingCredit>) => {
 if (!organization?.id) throw new Error('Sem organização');
 const { data, error } = await supabase
 .from('booking_credits')
 .insert({ ...payload, org_id: organization.id, used_amount: 0 })
 .select()
 .single();
 if (error) throw error;
 return data as BookingCredit;
 },
 onSuccess: () => {
 qc.invalidateQueries({ queryKey: ['booking_credits'] });
 toast({ title: 'Crédito registrado com sucesso' });
 },
 onError: (e: Error) => toast({ title: 'Erro ao criar crédito', description: e.message, variant: 'destructive' }),
 });
}
