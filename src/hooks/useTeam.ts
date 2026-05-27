import { logger } from '@/utils/logger';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type TeamMember = {
 id: string;
 org_id: string;
 user_id: string | null;
 email: string;
 full_name: string;
 role: 'admin' | 'agent' | 'viewer';
 commission_rate: number;
 status: 'active' | 'suspended' | 'pending';
};

export const useTeamMembers = (orgId: string | undefined) => {
 return useQuery({
 queryKey: ['team_members', orgId],
 queryFn: async () => {
 if (!orgId) return [];
 const { data, error } = await supabase
 .from('team_members')
 .select('*')
 .eq('org_id', orgId)
 .order('full_name');
 if (error) throw error;
 return data as TeamMember[];
 },
 enabled: !!orgId,
 });
};

export const useCreateTeamMember = () => {
 const queryClient = useQueryClient();
 return useMutation({
 mutationFn: async (payload: Omit<TeamMember, 'id' | 'org_id' | 'user_id'> & { org_id: string }) => {
 const { data, error } = await supabase.from('team_members').insert(payload).select().single();
 if (error) throw error;
 return data;
 },
 onSuccess: (data) => {
 queryClient.invalidateQueries({ queryKey: ['team_members', data.org_id] });
 toast.success('Membro convidado com sucesso!');
 },
 onError: (error) => {
 toast.error('Erro ao adicionar membro à equipe.');
 logger.error(error);
 }
 });
};

export const useUpdateTeamMember = () => {
 const queryClient = useQueryClient();
 return useMutation({
 mutationFn: async ({ id, ...payload }: Partial<TeamMember> & { id: string }) => {
 const { data, error } = await supabase.from('team_members').update(payload).eq('id', id).select().single();
 if (error) throw error;
 return data;
 },
 onSuccess: (data) => {
 queryClient.invalidateQueries({ queryKey: ['team_members', data.org_id] });
 toast.success('Perfil atualizado com sucesso!');
 },
 });
};

export const useDeleteTeamMember = () => {
 const queryClient = useQueryClient();
 return useMutation({
 mutationFn: async (id: string) => {
 const { error, data } = await supabase.from('team_members').delete().eq('id', id).select('org_id').single();
 if (error) throw error;
 return data;
 },
 onSuccess: (data) => {
 if (data) queryClient.invalidateQueries({ queryKey: ['team_members', data.org_id] });
 toast.success('Membro removido permanentemente.');
 },
 });
};
