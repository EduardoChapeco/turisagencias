import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';

export function useNotifications() {
 const { user } = useAuthStore();

 return useQuery({
 queryKey: ['notifications', user?.id],
 queryFn: async () => {
 const { data, error } = await supabase
 .from('notifications')
 .select('*')
 .order('created_at', { ascending: false })
 .limit(20);

 if (error) throw error;
 return data;
 },
 enabled: !!user,
 staleTime: 30 * 1000,
 });
}

export function useMarkNotificationAsRead() {
 const queryClient = useQueryClient();

 return useMutation({
 mutationFn: async (id: string) => {
 const { error } = await supabase
 .from('notifications')
 .update({ read_at: new Date().toISOString() })
 .eq('id', id);

 if (error) throw error;
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['notifications'] });
 },
 });
}
