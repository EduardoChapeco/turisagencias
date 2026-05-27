import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useEmailTracking(entityId?: string) {
 const { toast } = useToast();

 const { data: logs, isLoading, refetch } = useQuery({
 queryKey: ['email_tracking', entityId],
 queryFn: async () => {
 if (!entityId) return [];
 const { data, error } = await supabase
 .from('email_tracking_logs')
 .select('*')
 .eq('entity_id', entityId)
 .order('created_at', { ascending: false });
 
 if (error) throw error;
 return data;
 },
 enabled: !!entityId
 });

 const createTrackingLog = useMutation({
 mutationFn: async ({ 
 entityType, 
 recipientEmail, 
 subject,
 orgId 
 }: { 
 entityType: string; 
 recipientEmail?: string; 
 subject?: string;
 orgId: string;
 }) => {
 const { data, error } = await supabase
 .from('email_tracking_logs')
 .insert({
 org_id: orgId,
 entity_type: entityType,
 entity_id: entityId,
 recipient_email: recipientEmail,
 subject: subject
 })
 .select()
 .single();
 
 if (error) throw error;
 return data;
 },
 onSuccess: () => {
 refetch();
 toast({ title: 'Rastreador gerado com sucesso!' });
 }
 });

 return {
 logs,
 isLoading,
 createTrackingLog
 };
}
