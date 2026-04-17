import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';

export type SendQuotationResult = {
  success: boolean;
  share_token: string;
  public_url: string;
  status: 'sent';
  quotation: any;
};

export function useSendQuotation() {
  const qc = useQueryClient();
  const { organization } = useAuthStore();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (quotationId: string): Promise<SendQuotationResult> => {
      if (!organization?.id) throw new Error('Organização não encontrada');
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
      // Copia o link público automaticamente
      navigator.clipboard.writeText(data.public_url).catch(() => {});
      toast({
        title: '🚀 Cotação enviada!',
        description: `Link público copiado para a área de transferência.`,
      });
    },
    onError: (e: Error) =>
      toast({ title: 'Erro ao enviar', description: e.message, variant: 'destructive' }),
  });
}
