import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';

// ── Policy Cache ─────────────────────────────────────────────────────────────

export function usePolicies(operadora?: string) {
  const { organization } = useAuthStore();
  return useQuery({
    queryKey: ['policy_cache', organization?.id, operadora],
    queryFn: async () => {
      let q = supabase
        .from('policy_cache')
        .select('*')
        .eq('org_id', organization!.id)
        .order('criado_em', { ascending: false });
      if (operadora) q = q.eq('operadora', operadora);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
    enabled: !!organization?.id,
  });
}

export function useCreatePolicy() {
  const qc = useQueryClient();
  const { organization, user } = useAuthStore();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (payload: {
      operadora: string; operadora_display?: string;
      tipo?: string; conteudo: any; notas_internas?: string;
    }) => {
      const { data, error } = await supabase.from('policy_cache').insert({
        org_id: organization!.id,
        criado_por: user!.id,
        operadora: payload.operadora.toLowerCase(),
        operadora_display: payload.operadora_display,
        tipo: payload.tipo || 'condicoes_gerais',
        conteudo: payload.conteudo,
        notas_internas: payload.notas_internas,
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['policy_cache'] });
      toast({ title: 'Política salva no cache!' });
    },
    onError: (e: Error) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });
}

export function useDeletePolicy() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('policy_cache').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['policy_cache'] });
      toast({ title: 'Política removida.' });
    },
    onError: (e: Error) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });
}

// ── Experiences ──────────────────────────────────────────────────────────────

export function useExperiences(search?: string, tipo?: string) {
  const { organization } = useAuthStore();
  return useQuery({
    queryKey: ['experiences', organization?.id, search, tipo],
    queryFn: async () => {
      let q = supabase
        .from('experiences')
        .select('*')
        .eq('org_id', organization!.id)
        .eq('is_active', true)
        .order('nome');
      if (search) q = q.ilike('nome', `%${search}%`);
      if (tipo) q = q.eq('tipo', tipo);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
    enabled: !!organization?.id,
  });
}

export function useCreateExperience() {
  const qc = useQueryClient();
  const { organization } = useAuthStore();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data, error } = await supabase.from('experiences').insert({
        ...payload,
        org_id: organization!.id,
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['experiences'] });
      toast({ title: 'Passeio/Serviço criado!' });
    },
    onError: (e: Error) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });
}

export function useUpdateExperience() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string } & any) => {
      const { data, error } = await supabase.from('experiences').update(payload).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['experiences'] });
      toast({ title: 'Atualizado!' });
    },
    onError: (e: Error) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });
}

export function useDeleteExperience() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('experiences').update({ is_active: false }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['experiences'] });
      toast({ title: 'Removido do banco.' });
    },
    onError: (e: Error) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });
}
