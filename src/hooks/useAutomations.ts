import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type CommunicationRule = {
 id: string;
 org_id: string;
 event_type: 'trip_created' | 'payment_due' | '1_week_before_travel' | 'welcome_back';
 template_subject: string;
 template_body: string;
 is_active: boolean;
};

export const useCommunicationRules = (orgId: string | undefined) => {
 return useQuery({
 queryKey: ['communication_rules', orgId],
 queryFn: async () => {
 if (!orgId) return [];
 const { data, error } = await supabase
 .from('communication_rules')
 .select('*')
 .eq('org_id', orgId)
 .order('event_type');
 if (error) throw error;
 return data as CommunicationRule[];
 },
 enabled: !!orgId,
 });
};

export const useUpdateCommunicationRule = () => {
 const queryClient = useQueryClient();
 return useMutation({
 mutationFn: async ({ id, ...payload }: Partial<CommunicationRule> & { id: string }) => {
 const { data, error } = await supabase.from('communication_rules').update(payload).eq('id', id).select().single();
 if (error) throw error;
 return data;
 },
 onSuccess: (data) => {
 queryClient.invalidateQueries({ queryKey: ['communication_rules', data.org_id] });
 toast.success('Regra de automação salva!');
 },
 });
};
