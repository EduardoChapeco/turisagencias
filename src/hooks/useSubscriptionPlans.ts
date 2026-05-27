import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SubscriptionPlan {
 id: string;
 name: string;
 description: string;
 price_monthly: number;
 currency: string;
 features: string[];
 missing_features: string[];
 is_popular: boolean;
 stripe_product_id: string | null;
}

export function useSubscriptionPlans() {
 return useQuery({
 queryKey: ['subscription-plans'],
 queryFn: async () => {
 const { data, error } = await supabase
 .from('subscription_plans')
 .select('*')
 .order('price_monthly', { ascending: true });

 if (error) {
 if (error.code === '42P01') {
 return [];
 }
 throw error;
 }
 return data as SubscriptionPlan[];
 },
 });
}

export function useUpdatePlan() {
 const queryClient = useQueryClient();
 return useMutation({
 mutationFn: async (plan: Partial<SubscriptionPlan> & { id: string }) => {
 const { data, error } = await supabase
 .from('subscription_plans')
 .update(plan)
 .eq('id', plan.id)
 .select()
 .single();
 
 if (error) throw error;
 return data;
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
 },
 });
}
