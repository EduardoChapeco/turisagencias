import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';
import type { HotelFormValues } from '@/types';

export function useHotels(search?: string) {
  const { organization } = useAuthStore();

  return useQuery({
    queryKey: ['hotels', organization?.id, search],
    queryFn: async () => {
      let query = supabase
        .from('hotels_bank')
        .select('*')
        .eq('org_id', organization!.id)
        .eq('is_active', true)
        .order('name');
      if (search) {
        query = query.or(`name.ilike.%${search}%,city.ilike.%${search}%,state.ilike.%${search}%`);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!organization,
    staleTime: 5 * 60 * 1000,
  });
}

export function useHotel(id: string | undefined) {
  return useQuery({
    queryKey: ['hotel', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hotels_bank')
        .select('*')
        .eq('id', id!)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error('Hotel não encontrado');
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateHotel() {
  const queryClient = useQueryClient();
  const { organization } = useAuthStore();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (payload: HotelFormValues) => {
      const { gallery_urls, photo_url, ...dbPayload } = payload as any;
      const gallery = gallery_urls || [];
      const cover = photo_url || null;

      const { data, error } = await supabase
        .from('hotels_bank')
        .insert({ 
          ...dbPayload, 
          photos: gallery,
          gallery_urls: gallery,
          cover_image_url: cover,
          cover_photo_url: cover,
          org_id: organization!.id 
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      toast({ title: 'Hotel criado!' });
    },
    onError: (err: Error) => {
      toast({ title: 'Erro ao criar hotel', description: err.message, variant: 'destructive' });
    },
  });
}

export function useUpdateHotel() {
  const queryClient = useQueryClient();
  const { organization } = useAuthStore();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, gallery_urls, photo_url, ...dbPayload }: any) => {
      if (!organization?.id) throw new Error('Organização não encontrada');
      
      const payloadToUpdate: any = { ...dbPayload };
      if (gallery_urls !== undefined) {
        payloadToUpdate.photos = gallery_urls;
        payloadToUpdate.gallery_urls = gallery_urls;
      }
      if (photo_url !== undefined) {
        payloadToUpdate.cover_image_url = photo_url;
        payloadToUpdate.cover_photo_url = photo_url;
      }

      const { data, error } = await supabase
        .from('hotels_bank')
        .update(payloadToUpdate)
        .eq('id', id)
        .eq('org_id', organization.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      queryClient.invalidateQueries({ queryKey: ['hotel', data.id] });
      toast({ title: 'Hotel atualizado com sucesso!' });
    },
    onError: (err: Error) => {
      toast({ title: 'Erro ao atualizar hotel', description: err.message, variant: 'destructive' });
    },
  });
}

export function useDeleteHotel() {
  const queryClient = useQueryClient();
  const { organization } = useAuthStore();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!organization?.id) throw new Error('Organização não encontrada');
      const { error } = await supabase
        .from('hotels_bank')
        .delete()
        .eq('id', id)
        .eq('org_id', organization.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      toast({ title: 'Hotel removido do banco.' });
    },
    onError: (err: Error) => {
      toast({ title: 'Erro ao remover hotel', description: err.message, variant: 'destructive' });
    },
  });
}
