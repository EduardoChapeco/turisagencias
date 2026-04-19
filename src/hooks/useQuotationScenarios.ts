import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';

export type QuotationScenario = {
  id: string;
  quotation_id: string;
  org_id: string;
  scenario_type: string;
  scenario_label?: string;
  title?: string;
  description?: string;
  score?: number;
  score_breakdown?: {
    logistic_viability?: number;
    price_competitiveness?: number;
    client_experience?: number;
    operational_risk?: number;
  };
  flights_json?: any;
  hotels_json?: any;
  total_price?: number;
  flight_score?: number;
  hotel_score?: number;
  logistics_score?: number;
  price_score?: number;
  recommendation?: string;
  ai_reasoning?: string;
  agent_rationale?: string;
  estimated_savings_brl?: number | null;
  estimated_extra_cost_brl?: number | null;
  suggested_changes?: any;
  recommended?: boolean;
  is_selected?: boolean;
  metadata?: any;
  created_at: string;
};

export function useQuotationScenarios(quotationId: string | undefined) {
  return useQuery({
    queryKey: ['quotation_scenarios', quotationId],
    queryFn: async () => {
      if (!quotationId) return [];
      const { data, error } = await supabase
        .from('quotation_scenarios')
        .select('*')
        .eq('quotation_id', quotationId)
        .order('score', { ascending: false });
      if (error) throw error;
      
      return data.map((row: any) => ({
        ...row,
        scenario_type: row.metadata?.scenario_type || 'direct',
        title: row.scenario_label || row.metadata?.title,
        description: row.rationale || row.metadata?.description,
        score_breakdown: row.metadata?.score_breakdown,
        estimated_savings_brl: row.metadata?.estimated_savings_brl || (row.price_delta < 0 ? Math.abs(row.price_delta) : null),
        estimated_extra_cost_brl: row.metadata?.estimated_extra_cost_brl || (row.price_delta > 0 ? row.price_delta : null),
      })) as QuotationScenario[];
    },
    enabled: !!quotationId,
    staleTime: 5 * 60_000,
  });
}

export function useScoreQuotation() {
  const qc = useQueryClient();
  const { organization } = useAuthStore();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (quotationId: string) => {
      if (!organization?.id) throw new Error('Organização não encontrada');
      const { data, error } = await supabase.functions.invoke('score-quotation', {
        body: { quotation_id: quotationId, org_id: organization.id },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data, quotationId) => {
      qc.invalidateQueries({ queryKey: ['quotation_scenarios', quotationId] });
      const bestIdx = (data.best_scenario_index ?? 0) + 1;
      toast({
        title: '🧠 Análise IA concluída!',
        description: `${data.scenarios?.length ?? 3} cenários gerados. Recomendação: opção ${bestIdx}.`,
      });
    },
    onError: (e: Error) =>
      toast({ title: 'Erro na análise IA', description: e.message, variant: 'destructive' }),
  });
}

export function useAiDecisionLogs(limit = 20) {
  const { organization } = useAuthStore();
  return useQuery({
    queryKey: ['ai_decision_logs', organization?.id, limit],
    queryFn: async () => {
      if (!organization?.id) return [];
      const { data, error } = await supabase
        .from('ai_decision_logs')
        .select('id, agent_name, decision_type, input_summary, output_summary, confidence_score, created_at')
        .eq('org_id', organization.id)
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data;
    },
    enabled: !!organization?.id,
    staleTime: 60_000,
  });
}
