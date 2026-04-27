import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';

export interface RadarNews {
  id: string;
  title: string;
  source: string;
  url: string;
  published_at: string;
  content_summary: string | null;
  full_extracted_content: string | null;
  ai_classification_tags: string[];
  ai_relevance_score: number;
  ai_validation_reason: string | null;
  is_alert: boolean;
  status: string;
}

export function useRadarNews() {
  return useQuery({
    queryKey: ['radar-news'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_radar_news')
        .select('*')
        .order('published_at', { ascending: false });

      if (error) {
        throw error;
      }

      return (data ?? []) as unknown as RadarNews[];
    },
    staleTime: 60 * 1000, 
  });
}

export function useTriggerRadarCrawler() {
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('radar-crawler-squad', {
        method: 'POST'
      });
      if (error) throw error;
      return data;
    }
  });
}
