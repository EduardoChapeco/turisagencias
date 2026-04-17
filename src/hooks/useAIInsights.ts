import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';

export function useAIInsights() {
  const { organization } = useAuthStore();

  return useQuery({
    queryKey: ['dashboard-ai-insights', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];
      
      const { data, error } = await supabase
        .from('ai_knowledge_base')
        .select(`id, title, content, tags, created_at`)
        .eq('org_id', organization.id)
        // .eq('source_type', 'quotation_feedback') // Or we just take any recent insights
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) {
        console.error('Error fetching AI insights:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!organization?.id,
  });
}
