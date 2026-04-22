import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';

export interface KanbanInsight {
  card_id: string;
  card_title: string;
  alert_type: 'lead_cold' | 'lead_cooling' | 'high_value_no_quote' | 'no_value_estimate' | 'needs_action';
  alert_message: string;
  column_name: string;
  days_stale: number;
  estimated_value: number | null;
  client_name: string | null;
}

export function useAIInsights() {
  const { organization } = useAuthStore();

  return useQuery<KanbanInsight[]>({
    queryKey: ['kanban-ai-insights', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];

      const { data, error } = await supabase.rpc('fn_get_kanban_ai_insights', {
        p_org_id: organization.id,
      });

      if (error) {
        // If function doesn't exist yet or no data, return empty
        console.warn('[useAIInsights] RPC error:', error.message);
        return [];
      }

      return (data as KanbanInsight[]) ?? [];
    },
    enabled: !!organization?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes — real data, no need to refresh too often
    refetchOnWindowFocus: false,
  });
}
