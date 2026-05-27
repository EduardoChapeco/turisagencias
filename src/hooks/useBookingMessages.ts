import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';

export type BookingMessage = {
 id: string;
 org_id: string;
 booking_id: string;
 sender_type: 'agent' | 'client' | 'system';
 sender_id: string | null;
 body: string;
 read_at: string | null;
 created_at: string;
};

export function useBookingMessages(bookingId: string | undefined) {
 return useQuery<BookingMessage[]>({
 queryKey: ['booking_messages', bookingId],
 queryFn: async () => {
 if (!bookingId) return [];
 const { data, error } = await supabase
 .from('booking_messages')
 .select('*')
 .eq('booking_id', bookingId)
 .order('created_at', { ascending: true });
 if (error) throw error;
 return (data || []) as BookingMessage[];
 },
 enabled: !!bookingId,
 refetchInterval: 10_000, // poll every 10s for real-time feel
 });
}

export function useSendBookingMessage() {
 const qc = useQueryClient();
 const { organization, user } = useAuthStore();
 const { toast } = useToast();
 return useMutation({
 mutationFn: async ({
 bookingId,
 body,
 }: {
 bookingId: string;
 body: string;
 }) => {
 if (!organization?.id) throw new Error('Sem organização');
 const { data, error } = await supabase
 .from('booking_messages')
 .insert({
 org_id: organization.id,
 booking_id: bookingId,
 sender_type: 'agent',
 sender_id: (user as any)?.id ?? null,
 body,
 })
 .select()
 .single();
 if (error) throw error;
 return data as BookingMessage;
 },
 onSuccess: (_, vars) => {
 qc.invalidateQueries({ queryKey: ['booking_messages', vars.bookingId] });
 },
 onError: (e: Error) => toast({ title: 'Erro ao enviar', description: e.message, variant: 'destructive' }),
 });
}

export function useMarkMessagesRead() {
 const qc = useQueryClient();
 return useMutation({
 mutationFn: async (bookingId: string) => {
 const { error } = await supabase
 .from('booking_messages')
 .update({ read_at: new Date().toISOString() })
 .eq('booking_id', bookingId)
 .is('read_at', null)
 .neq('sender_type', 'agent');
 if (error) throw error;
 },
 onSuccess: (_, bookingId) => {
 qc.invalidateQueries({ queryKey: ['booking_messages', bookingId] });
 },
 });
}
