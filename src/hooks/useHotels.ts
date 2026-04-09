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
      let query = supabase.from('hotels_bank').select('*').order('name');
      if (search) query = query.ilike('name', `%${search}%`);
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
      const { data, error } = await supabase
        .from('hotels_bank')
        .insert({ ...payload, org_id: organization!.id })
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
