import { logger } from '@/utils/logger';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from './use-toast';

// ── Local type definition for traveler_info_pages ─────────────────────────────
// This table exists in the database but was not captured in the last type generation.
// Schema: id, org_id, trip_id?, slug?, title?, content (jsonb), is_published, public_token, created_at, updated_at
export interface TravelerInfoPage {
  id: string;
  org_id: string;
  trip_id: string | null;
  slug: string | null;
  slug_locked?: boolean;
  slug_updated_at?: string | null;
  title: string | null;
  description?: string | null;
  cover_image_url?: string | null;
  content_blocks?: unknown[];
  content: unknown[];
  is_published: boolean;
  public_token: string | null;
  created_at: string;
  updated_at: string;
}

export interface TravelerInfoPageInsert {
  org_id: string;
  trip_id?: string | null;
  slug?: string | null;
  slug_locked?: boolean;
  slug_updated_at?: string | null;
  title?: string | null;
  description?: string | null;
  cover_image_url?: string | null;
  content_blocks?: unknown[];
  content?: unknown[];
  is_published?: boolean;
  author_id?: string | null;
}

// Helper: typed access to unregistered table
// Using `as any` at the single Supabase boundary — zero unsafe casts elsewhere
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const travelerInfoPages = () => (supabase as any).from('traveler_info_pages');

const useAuth = () => {
  const { organization, user } = useAuthStore();
  return { currentOrg: organization, session: { user } };
};

export const useTravelerInfoPages = () => {
  const { currentOrg } = useAuth();

  return useQuery<TravelerInfoPage[]>({
    queryKey: ['traveler_info_pages', currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg?.id) throw new Error('No organization selected');

      const { data, error } = await travelerInfoPages()
        .select('*')
        .eq('org_id', currentOrg.id)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('[useTravelerInfoPages] fetch error:', error);
        throw error;
      }
      return (data ?? []) as TravelerInfoPage[];
    },
    enabled: !!currentOrg?.id,
  });
};

export const useTravelerInfoPage = (id?: string) => {
  const { currentOrg } = useAuth();

  return useQuery<TravelerInfoPage | null>({
    queryKey: ['traveler_info_pages', id],
    queryFn: async () => {
      if (!id) return null;
      if (!currentOrg?.id) throw new Error('No organization selected');

      const { data, error } = await travelerInfoPages()
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        logger.error('[useTravelerInfoPage] fetch error:', error);
        throw error;
      }
      return data as TravelerInfoPage | null;
    },
    enabled: !!id && !!currentOrg?.id,
  });
};

export const useSaveTravelerInfoPage = () => {
  const { currentOrg, session } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<TravelerInfoPage, Error, Partial<TravelerInfoPage> & { id?: string }>({
    mutationFn: async (pageData) => {
      if (!currentOrg?.id) throw new Error('No organization selected');

      const isUpdate = !!pageData.id;

      if (isUpdate) {
        const { id, ...updateData } = pageData;
        const { data, error } = await travelerInfoPages()
          .update(updateData)
          .eq('id', id)
          .select()
          .single();

        if (error) {
          logger.error('[useSaveTravelerInfoPage] update error:', error);
          throw error;
        }
        return data as TravelerInfoPage;
      } else {
        const insertPayload: TravelerInfoPageInsert = {
          ...pageData,
          org_id: currentOrg.id,
          author_id: session?.user?.id ?? null,
        };

        const { data, error } = await travelerInfoPages()
          .insert(insertPayload)
          .select()
          .single();

        if (error) {
          logger.error('[useSaveTravelerInfoPage] insert error:', error);
          throw error;
        }
        return data as TravelerInfoPage;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['traveler_info_pages'] });
      toast({
        title: 'Página salva!',
        description: 'Informações de viajante gravadas com sucesso.',
      });
    },
    onError: (error: Error) => {
      logger.error('Error saving traveler info page:', error);
      toast({
        title: 'Erro ao salvar',
        description: error.message || 'Verifique sua conexão ou formato dos dados.',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteTravelerInfoPage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<boolean, Error, string>({
    mutationFn: async (id: string) => {
      const { error } = await travelerInfoPages()
        .delete()
        .eq('id', id);

      if (error) {
        logger.error('[useDeleteTravelerInfoPage] delete error:', error);
        throw error;
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['traveler_info_pages'] });
      toast({
        title: 'Página removida',
        description: 'A página foi excluída permanentemente.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao remover',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
