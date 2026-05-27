import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import { useAuthStore } from '@/stores/authStore';

export const useGuides = () => {
 const { organization } = useAuthStore();
 
 return useQuery({
 queryKey: ['guides', organization?.id],
 queryFn: async () => {
 if (!organization?.id) return [];
 
 const { data, error } = await supabase
 .from('destination_guides')
 .select('*')
 .eq('org_id', organization.id)
 .order('country', { ascending: true })
 .order('city', { ascending: true });

 if (error) throw error;
 return data;
 },
 enabled: !!organization?.id,
 });
};

export const useGuide = (id: string | undefined) => {
 const { organization } = useAuthStore();

 return useQuery({
 queryKey: ['guides', id],
 queryFn: async () => {
 if (!id || !organization?.id) return null;
 
 const { data, error } = await supabase
 .from('destination_guides')
 .select('*')
 .eq('id', id)
 .eq('org_id', organization.id)
 .single();

 if (error) throw error;
 return data;
 },
 enabled: !!id && !!organization?.id,
 });
};

export const useSaveGuide = () => {
 const queryClient = useQueryClient();
 const { toast } = useToast();
 const { organization } = useAuthStore();

 return useMutation({
 mutationFn: async (payload: any) => {
 if (!organization?.id) throw new Error('Organização não encontrada');

 const isUpdate = !!payload.id;
 const dbPayload = {
 org_id: organization.id,
 city: payload.city,
 country: payload.country,
 intro: payload.intro || null,
 cover_image_url: payload.cover_image_url || null,
 currency_info: payload.currency_info || null,
 climate_info: payload.climate_info || null,
 transportation: payload.transportation || null,
 language_tips: payload.language_tips || null,
 is_published: payload.is_published || false,
 tips: payload.tips || [],
 useful_contacts: payload.useful_contacts || [],
 emergency_numbers: payload.emergency_numbers || [],
 };

 if (isUpdate) {
 const { data, error } = await supabase
 .from('destination_guides')
 .update(dbPayload)
 .eq('id', payload.id)
 .eq('org_id', organization.id)
 .select()
 .single();
 if (error) throw error;
 return data;
 } else {
 const { data, error } = await supabase
 .from('destination_guides')
 .insert([dbPayload])
 .select()
 .single();
 if (error) throw error;
 return data;
 }
 },
 onSuccess: (data) => {
 queryClient.invalidateQueries({ queryKey: ['guides'] });
 queryClient.invalidateQueries({ queryKey: ['guides', data.id] });
 toast({
 title: 'Guia salvo com sucesso!',
 description: 'As alterações foram sincronizadas com o banco de conhecimento.',
 });
 },
 onError: (error: any) => {
 toast({
 variant: 'destructive',
 title: 'Erro ao salvar gia',
 description: error.message,
 });
 },
 });
};

export const useDeleteGuide = () => {
 const queryClient = useQueryClient();
 const { toast } = useToast();
 const { organization } = useAuthStore();

 return useMutation({
 mutationFn: async (id: string) => {
 if (!organization?.id) throw new Error('Organização não encontrada');
 const { error } = await supabase
 .from('destination_guides')
 .delete()
 .eq('id', id)
 .eq('org_id', organization.id);
 if (error) throw error;
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['guides'] });
 toast({ title: 'Guia removido.' });
 },
 onError: (error: any) => {
 toast({ variant: 'destructive', title: 'Erro ao remover', description: error.message });
 },
 });
};
