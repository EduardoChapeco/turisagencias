import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';

export interface NewsArticle {
  id: string;
  org_id: string | null;
  source_scope: 'master' | 'user';
  source_feed_id: string | null;
  source_name: string;
  title: string;
  slug: string;
  original_url: string;
  canonical_url: string | null;
  author: string | null;
  published_at: string;
  fetched_at: string;
  raw_excerpt: string | null;
  raw_content: string | null;
  image_url: string | null;
  ai_summary: string | null;
  ai_short_summary: string | null;
  ai_bullets: string[] | any;
  ai_tags: string[] | any;
  ai_category: string | null;
  ai_sentiment: string | null;
  ai_relevance_score: number | null;
  ai_travel_agency_insight: string | null;
  ai_recommended_action: string | null;
  safe_to_publish: boolean;
  status: 'draft' | 'curated' | 'published' | 'archived' | 'rejected' | 'ai_pending' | 'ai_failed';
  is_featured: boolean;
  reading_time_minutes: number | null;
  created_at: string;
  updated_at: string;
}

export interface NewsFeed {
  id: string;
  name: string;
  url: string | null;
  feed_url: string;
  category: string;
  is_active: boolean;
  scope: 'master' | 'user';
  org_id?: string;
  last_fetched_at?: string | null;
  last_success_at?: string | null;
  last_error?: string | null;
}

export interface SyncRun {
  id: string;
  org_id: string | null;
  started_at: string;
  finished_at: string | null;
  status: 'running' | 'success' | 'partial' | 'failed';
  triggered_by: string;
  total_feeds: number;
  total_fetched: number;
  total_new: number;
  total_duplicates: number;
  total_failed: number;
  error_log: any;
}

// Hook para buscar notícias enriquecidas do Radar (combina master e user org)
export function useRadarNews() {
  const { organization } = useAuthStore();

  return useQuery({
    queryKey: ['radar-news', organization?.id],
    queryFn: async () => {
      let query = supabase
        .from('news_articles')
        .select('*')
        .eq('safe_to_publish', true)
        .order('published_at', { ascending: false });

      // Filtrar master ou os da organização logada
      if (organization?.id) {
        query = query.or(`org_id.is.null,org_id.eq.${organization.id}`);
      } else {
        query = query.is('org_id', null);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data ?? []) as unknown as NewsArticle[];
    },
    staleTime: 2 * 60 * 1000,
  });
}

// Hook para buscar todas as notícias (incluindo rascunhos e arquivadas para o CMS)
export function useAllNewsCMS() {
  const { organization } = useAuthStore();

  return useQuery({
    queryKey: ['news-cms-list', organization?.id],
    queryFn: async () => {
      let query = supabase
        .from('news_articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (organization?.id) {
        query = query.or(`org_id.is.null,org_id.eq.${organization.id}`);
      } else {
        query = query.is('org_id', null);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as unknown as NewsArticle[];
    }
  });
}

// Hook para buscar um artigo único por slug
export function useNewsArticleBySlug(slug: string) {
  return useQuery({
    queryKey: ['news-article', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (error) throw error;
      return data as unknown as NewsArticle | null;
    },
    enabled: !!slug,
  });
}

// Mutação para curadoria no CMS (atualizar status, insights ou dados da notícia)
export function useUpdateNewsArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<NewsArticle> }) => {
      const { data, error } = await supabase
        .from('news_articles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['radar-news'] });
      queryClient.invalidateQueries({ queryKey: ['news-cms-list'] });
    }
  });
}

// Hook para buscar os feeds ativos e inativos
export function useNewsFeeds() {
  const { organization } = useAuthStore();

  return useQuery({
    queryKey: ['news-feeds', organization?.id],
    queryFn: async () => {
      // 1. Feeds master
      const { data: masterData, error: masterErr } = await supabase
        .from('feeds_master')
        .select('*');

      if (masterErr) throw masterErr;

      const masterFeeds = (masterData ?? []).map(f => ({ ...f, scope: 'master' })) as NewsFeed[];

      // 2. Feeds do usuário (se houver organização)
      let userFeeds: NewsFeed[] = [];
      if (organization?.id) {
        const { data: userData, error: userErr } = await supabase
          .from('feeds_user')
          .select('*')
          .eq('org_id', organization.id);

        if (userErr) throw userErr;
        userFeeds = (userData ?? []).map(f => ({ ...f, scope: 'user' })) as NewsFeed[];
      }

      return [...masterFeeds, ...userFeeds];
    }
  });
}

// CRUD para Feeds do Usuário
export function useCreateUserFeed() {
  const { organization, user } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (feed: Omit<NewsFeed, 'id' | 'scope' | 'org_id'>) => {
      if (!organization?.id) throw new Error('Organização não identificada');

      const { data, error } = await supabase
        .from('feeds_user')
        .insert({
          org_id: organization.id,
          user_id: user?.id,
          name: feed.name,
          url: feed.url,
          feed_url: feed.feed_url,
          category: feed.category,
          is_active: feed.is_active
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-feeds'] });
    }
  });
}

export function useUpdateUserFeed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates, scope }: { id: string; updates: Partial<NewsFeed>; scope: 'master' | 'user' }) => {
      const table = scope === 'master' ? 'feeds_master' : 'feeds_user';
      const { data, error } = await supabase
        .from(table)
        .update({
          name: updates.name,
          url: updates.url,
          feed_url: updates.feed_url,
          category: updates.category,
          is_active: updates.is_active
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-feeds'] });
    }
  });
}

export function useDeleteUserFeed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, scope }: { id: string; scope: 'master' | 'user' }) => {
      const table = scope === 'master' ? 'feeds_master' : 'feeds_user';
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-feeds'] });
    }
  });
}

// Hook para buscar o histórico de sincronização
export function useSyncRuns() {
  const { organization } = useAuthStore();

  return useQuery({
    queryKey: ['news-sync-runs', organization?.id],
    queryFn: async () => {
      let query = supabase
        .from('news_sync_runs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(20);

      if (organization?.id) {
        query = query.or(`org_id.is.null,org_id.eq.${organization.id}`);
      } else {
        query = query.is('org_id', null);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as SyncRun[];
    }
  });
}

// Mutação para disparar a sincronização resiliente
export function useTriggerRadarSync() {
  const { organization, user } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        const { data, error } = await supabase.functions.invoke('radar-crawler-squad', {
          body: {
            org_id: organization?.id,
            user_id: user?.id,
            triggered_by: 'user'
          }
        });

        if (error) throw error;
        return data;
      } catch (err: any) {
        console.error("Erro na Edge Function de sincronização:", err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['radar-news'] });
      queryClient.invalidateQueries({ queryKey: ['news-feeds'] });
      queryClient.invalidateQueries({ queryKey: ['news-sync-runs'] });
      queryClient.invalidateQueries({ queryKey: ['news-cms-list'] });
    }
  });
}
