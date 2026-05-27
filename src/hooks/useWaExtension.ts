import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useWaSession(clientId?: string | null, phone?: string | null) {
 return useQuery({
 queryKey: ['wa_session', clientId, phone],
 queryFn: async () => {
 if (!clientId && !phone) return null;

 let query = supabase
 .from('wa_session_metrics')
 .select('*')
 .order('last_seen_at', { ascending: false });

 if (clientId) {
 // Find by client
 const { data, error } = await query.eq('client_id', clientId).limit(1).maybeSingle();
 if (error) throw error;
 if (data) return data;
 }
 
 if (phone) {
 // Clean phone
 const cleanPhone = phone.replace(/\D/g, '');
 // Find by phone
 const { data, error } = await supabase
 .from('wa_session_metrics')
 .select('*')
 .like('contact_phone', `%${cleanPhone}%`)
 .order('last_seen_at', { ascending: false })
 .limit(1)
 .maybeSingle();

 if (error) throw error;
 return data;
 }

 return null;
 },
 enabled: !!(clientId || phone),
 });
}

export function useWaLogs(sessionId?: string | null) {
 return useQuery({
 queryKey: ['wa_logs', sessionId],
 queryFn: async () => {
 if (!sessionId) return [];
 
 const { data, error } = await supabase
 .from('wa_conversation_logs')
 .select('*')
 .eq('wa_session_id', sessionId)
 .order('message_time', { ascending: true })
 .limit(100);
 
 if (error) throw error;
 return data;
 },
 enabled: !!sessionId,
 refetchInterval: 5000, // Re-fetch every 5 seconds to get new messages from extension
 });
}
