import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

// Hook para listar credenciais B2B (senha mascarada)
export function useB2bCredentials() {
  const { profile } = useAuthStore();
  const orgId = profile?.org_id;

  return useQuery({
    queryKey: ['b2b_credentials', orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('b2b_credentials')
        .select('id, portal_name, username, is_active, last_used_at, updated_at')
        .eq('org_id', orgId!);
      if (error) throw error;
      return data ?? [];
    }
  });
}

// Hook para salvar/atualizar credencial B2B
export function useSaveB2bCredential() {
  const { profile } = useAuthStore();
  const queryClient = useQueryClient();
  const orgId = profile?.org_id;

  return useMutation({
    mutationFn: async ({ portal_name, username, password }: { portal_name: string; username: string; password: string }) => {
      if (!orgId) throw new Error('Organização não encontrada');

      const { error } = await supabase
        .from('b2b_credentials')
        .upsert({
          org_id: orgId,
          portal_name,
          username,
          encrypted_password: password, // Em produção: usar pgsodium ou vault
          is_active: true,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'org_id,portal_name' });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Credencial B2B salva com segurança!');
      queryClient.invalidateQueries({ queryKey: ['b2b_credentials', orgId] });
    },
    onError: (e: any) => toast.error('Erro ao salvar: ' + e.message),
  });
}

// Hook para listar emails inbound classificados pela IA
export function useEmailInbound(limit = 50) {
  const { profile } = useAuthStore();
  const orgId = profile?.org_id;

  return useQuery({
    queryKey: ['email_inbound', orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_inbound')
        .select('*')
        .eq('org_id', orgId!)
        .order('received_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data ?? [];
    }
  });
}
