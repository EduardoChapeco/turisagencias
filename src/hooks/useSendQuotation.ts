import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';

export type SendQuotationResult = {
 success: boolean;
 public_token: string;
 public_url: string;
 status: 'sent';
 quotation: unknown;
};

export function useSendQuotation() {
 const qc = useQueryClient();
 const { organization } = useAuthStore();
 const { toast } = useToast();

 return useMutation({
 mutationFn: async (quotationId: string): Promise<SendQuotationResult> => {
 if (!organization?.id) throw new Error('Organizacao nao encontrada');
 const { data, error } = await supabase.functions.invoke('send-quotation', {
 body: { quotation_id: quotationId, org_id: organization.id },
 });
 if (error) throw new Error(error.message);
 if (data?.error) throw new Error(data.error);
 return data as SendQuotationResult;
 },
 onSuccess: (data, quotationId) => {
 qc.invalidateQueries({ queryKey: ['quotation', quotationId] });
 qc.invalidateQueries({ queryKey: ['quotations'] });
 navigator.clipboard.writeText(data.public_url).catch(() => {});
 toast({
 title: 'Cotacao enviada!',
 description: 'Link publico copiado para a area de transferencia.',
 });
 },
 onError: (e: Error) =>
 toast({ title: 'Erro ao enviar', description: e.message, variant: 'destructive' }),
 });
}
