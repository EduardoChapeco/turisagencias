/**
 * src/hooks/useGroupClients.ts
 *
 * CRUD para clientes do grupo (CRM especial para viagens sem SPC).
 * Cada registro é um cliente matriculado em um group_trip específico.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type GroupClientStatusPagamento =
 | 'pendente'
 | 'em_dia'
 | 'atrasado'
 | 'quitado'
 | 'cancelado';

export type GroupClientStatusNominacao =
 | 'nao_nominado'
 | 'nominado'
 | 'embarcado';

export interface GroupClient {
 id: string;
 org_id: string;
 group_trip_id: string;
 client_id: string | null;

 nome_completo: string;
 cpf: string | null;
 rg: string | null;
 nascimento: string | null;
 telefone: string | null;
 email: string | null;

 assento_numero: number | null;
 status_pagamento: GroupClientStatusPagamento;
 status_nominacao: GroupClientStatusNominacao;

 valor_total: number | null;
 valor_entrada: number | null;
 max_parcelas: number;
 produto_flexivel: boolean;

 doc_identidade_url: string | null;
 doc_contrato_url: string | null;

 parcelas_atrasadas: number;
 dias_atraso: number;
 ultima_cobranca_at: string | null;

 notas: string | null;
 created_at: string;
 updated_at: string;
}

const QK = (groupTripId: string | undefined) =>
 ['group_clients', groupTripId] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────────────────────────────────────────

export const useGroupClients = (groupTripId: string | undefined) => {
 return useQuery({
 queryKey: QK(groupTripId),
 queryFn: async () => {
 if (!groupTripId) return [];
 const { data, error } = await supabase
 .from('group_clients')
 .select('*')
 .eq('group_trip_id', groupTripId)
 .order('nome_completo');
 if (error) throw error;
 return data as GroupClient[];
 },
 enabled: !!groupTripId,
 });
};

export const useCreateGroupClient = () => {
 const qc = useQueryClient();
 const { organization } = useAuthStore();

 return useMutation({
 mutationFn: async (
 payload: Omit<Partial<GroupClient>, 'id' | 'org_id' | 'created_at' | 'updated_at'>
 ) => {
 const { data, error } = await supabase
 .from('group_clients')
 .insert({ ...payload, org_id: organization?.id })
 .select()
 .single();
 if (error) throw error;
 return data as GroupClient;
 },
 onSuccess: (data) => {
 qc.invalidateQueries({ queryKey: QK(data.group_trip_id) });
 toast.success('Cliente adicionado ao grupo!');
 },
 onError: (err: Error) => {
 toast.error(`Erro ao adicionar cliente: ${err.message}`);
 },
 });
};

export const useUpdateGroupClient = () => {
 const qc = useQueryClient();

 return useMutation({
 mutationFn: async ({ id, ...payload }: Partial<GroupClient> & { id: string }) => {
 const { data, error } = await supabase
 .from('group_clients')
 .update(payload)
 .eq('id', id)
 .select()
 .single();
 if (error) throw error;
 return data as GroupClient;
 },
 onSuccess: (data) => {
 qc.invalidateQueries({ queryKey: QK(data.group_trip_id) });
 toast.success('Cliente atualizado!');
 },
 onError: (err: Error) => {
 toast.error(`Erro ao atualizar: ${err.message}`);
 },
 });
};

export const useDeleteGroupClient = () => {
 const qc = useQueryClient();

 return useMutation({
 mutationFn: async ({ id, group_trip_id }: { id: string; group_trip_id: string }) => {
 const { error } = await supabase.from('group_clients' as any).delete().eq('id', id);
 if (error) throw error;
 return group_trip_id;
 },
 onSuccess: (group_trip_id) => {
 qc.invalidateQueries({ queryKey: QK(group_trip_id) });
 toast.success('Cliente removido do grupo.');
 },
 });
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Retorna o semáforo de inadimplência baseado no status e dias de atraso */
export function getInadimplenciaColor(
 status: GroupClientStatusPagamento,
 diasAtraso: number
): 'green' | 'yellow' | 'red' | 'gray' {
 if (status === 'quitado') return 'green';
 if (status === 'cancelado') return 'gray';
 if (status === 'pendente' && diasAtraso === 0) return 'green';
 if (diasAtraso > 0 && diasAtraso <= 15) return 'yellow';
 if (diasAtraso > 15) return 'red';
 return 'green';
}

/** Gera link WhatsApp de cobrança */
export function gerarLinkCobrancaWhatsapp(cliente: GroupClient, destino: string): string {
 const telefone = (cliente.telefone ?? '').replace(/\D/g, '');
 const msg = encodeURIComponent(
 `Olá ${cliente.nome_completo.split(' ')[0]}! 😊✈️\n` +
 `Sua próxima parcela da viagem para ${destino} está vencendo em breve.\n` +
 `Valor: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((cliente.valor_total ?? 0) / (cliente.max_parcelas || 1))}\n\n` +
 `Dúvidas? Me chama aqui! 👋`
 );
 return `https://wa.me/55${telefone}?text=${msg}`;
}

/** Gera link WhatsApp de cobrança com link seguro do portal do passageiro */
export function gerarLinkCobrancaComPortalWhatsapp(
 cliente: GroupClient,
 destino: string,
 valor: number,
 numeroParcela: number,
 token: string | null
): string {
 const telefone = (cliente.telefone ?? '').replace(/\D/g, '');
 const primeironome = cliente.nome_completo.split(' ')[0];
 const fmtValor = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
 
 let msg = `Olá ${primeironome}! 😊✈️\n` +
 `Identificamos que a sua ${numeroParcela === 0 ? 'entrada' : `${numeroParcela}ª parcela`} da viagem para ${destino} está em aberto no valor de ${fmtValor}.\n\n`;

 if (token) {
 msg += `Para sua comodidade, você pode acessar o seu portal seguro do passageiro para consultar o carnê e enviar o comprovante de pagamento diretamente por este link:\n` +
 `${window.location.origin}/minha-viagem/${token}\n\n`;
 } else {
 msg += `Por favor, efetue o pagamento e nos envie o comprovante de pagamento respondendo diretamente aqui nesta conversa do WhatsApp da agência.\n\n`;
 }

 msg += `Qualquer dúvida ou se precisar de suporte, estamos à disposição! 👋`;

 return `https://wa.me/55${telefone}?text=${encodeURIComponent(msg)}`;
}

