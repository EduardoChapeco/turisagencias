import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';

export type ProposalResult = {
 success: boolean;
 proposal_markdown: string;
 provider: string;
 word_count: number;
};

export function useBuildProposal() {
 const { organization } = useAuthStore();
 const { toast } = useToast();

 return useMutation({
 mutationFn: async ({
 quotationId,
 scenarioId,
 }: {
 quotationId: string;
 scenarioId?: string;
 }): Promise<ProposalResult> => {
 if (!organization?.id) throw new Error('Organização não encontrada');

 const { data, error } = await supabase.functions.invoke('build-proposal', {
 body: {
 quotation_id: quotationId,
 org_id: organization.id,
 scenario_id: scenarioId ?? null,
 },
 });

 if (error) throw new Error(error.message);
 if (data?.error) throw new Error(data.error);
 return data as ProposalResult;
 },
 onSuccess: (data) => {
 toast({
 title: '📄 Proposta gerada!',
 description: `${data.word_count} palavras via ${data.provider}. Abaixo o Markdown pronto.`,
 });
 },
 onError: (e: Error) =>
 toast({ title: 'Erro ao gerar proposta', description: e.message, variant: 'destructive' }),
 });
}
