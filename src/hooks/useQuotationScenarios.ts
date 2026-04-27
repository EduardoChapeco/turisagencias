import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';

const scenariosDb = supabase as any;
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

      // Busca dados da cotação para montar o request
      const { data: quotation, error } = await supabase
        .from('quotations')
        .select('destination, check_in, num_adults, pax_adultos')
        .eq('id', quotationId)
        .single();
      if (error || !quotation) throw new Error('Cotação não encontrada');

      // Chama o Motor Python Turis AI v5.0 diretamente (ZERO mock)
      const pythonEngineUrl = import.meta.env.VITE_PYTHON_ENGINE_URL || 'http://localhost:8000';
      const res = await fetch(`${pythonEngineUrl}/api/v1/quotation/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quotation_id:   quotationId,
          org_id:         organization.id,
          destination:    quotation.destination || '',
          departure_date: quotation.check_in || null,
          adults:         quotation.num_adults ?? quotation.pax_adultos ?? 1,
          cabin:          'ECONOMY',
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Erro desconhecido no motor Python.' }));
        // Erro 503 = sem credenciais B2B configuradas
        if (res.status === 503) {
          throw new Error(`⚠️ GDS Gateway: ${err.detail}`);
        }
        throw new Error(err.detail || `Erro HTTP ${res.status}`);
      }

      const data = await res.json();

      // Salva os cenários retornados no Supabase
      if (data.scenarios?.length) {
        for (const scenario of data.scenarios) {
          await scenariosDb.from('quotation_scenarios').upsert({
            quotation_id:            quotationId,
            org_id:                  organization.id,
            scenario_type:           scenario.scenario_type,
            scenario_label:          scenario.title,
            description:             scenario.description,
            score:                   scenario.score,
            agent_rationale:         scenario.agent_rationale,
            recommended:             scenario.recommended ?? false,
            estimated_savings_brl:   scenario.estimated_savings_brl ?? null,
            estimated_extra_cost_brl: scenario.estimated_extra_cost_brl ?? null,
            metadata: {
              policy_status: scenario.policy_status,
              source:        'omega_v5_gds_gateway',
            },
          }, { onConflict: 'quotation_id,scenario_type', ignoreDuplicates: false });
        }
      }

      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['quotation_scenarios'] });
      toast({
        title: '🧠 Turis AI GDS Completo!',
        description: data.executive_summary || `${data.scenarios?.length ?? 0} cenários gerados com dados reais.`,
      });
    },
    onError: (e: Error) =>
      toast({ title: 'Erro no Motor Turis AI', description: e.message, variant: 'destructive' }),
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
