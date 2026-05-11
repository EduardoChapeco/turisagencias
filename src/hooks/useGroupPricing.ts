/**
 * src/hooks/useGroupPricing.ts
 *
 * CRUD para precificação de grupos.
 * Toda a lógica de cálculo é feita no frontend (sem RPCs) para dar feedback imediato.
 * O resultado calculado é persistido no banco ao salvar.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useOrganization } from '@/hooks/useOrganization';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface GroupPricingInputs {
  custo_passagem: number;
  taxa_embarque: number;
  custo_hotel_unit: number;
  total_diarias: number;
  custo_transfer: number;
  custo_passeios: number;
  custo_seguro: number;
  custo_outros: number;
  markup_percent: number;
  reserva_inadimplencia_percent: number;
  taxa_admin_parcelamento: number;
  taxa_viagem_flexivel_percent: number;
  max_parcelas: number;
  valor_entrada_percent: number;
  meta_pax: number;
  pax_minimo: number;
  notas: string | null;
}

export interface GroupPricingCalculated {
  custo_hotel_total: number;
  custo_total_pax: number;
  preco_base: number;
  preco_com_reserva: number;
  preco_final: number;
  preco_com_flexivel: number;
  entrada_valor: number;
  parcela_valor: number;
  receita_projetada: number;
  custo_total_grupo: number;
  lucro_projetado: number;
  margem_percentual: number;
}

export interface GroupPricing extends GroupPricingInputs, GroupPricingCalculated {
  id: string;
  org_id: string;
  group_trip_id: string;
  seat_block_id: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Calcula todos os valores derivados da precificação.
 * Chamado localmente para feedback em tempo real.
 */
export function calculateGroupPricing(inputs: GroupPricingInputs): GroupPricingCalculated {
  const custo_hotel_total = inputs.custo_hotel_unit * inputs.total_diarias;

  const custo_total_pax =
    inputs.custo_passagem +
    inputs.taxa_embarque +
    custo_hotel_total +
    inputs.custo_transfer +
    inputs.custo_passeios +
    inputs.custo_seguro +
    inputs.custo_outros;

  // Reserva de segurança para inadimplência
  const reserva = custo_total_pax * (inputs.reserva_inadimplencia_percent / 100);
  const preco_com_reserva = custo_total_pax + reserva;

  // Markup da agência aplicado sobre o custo + reserva
  const preco_base = preco_com_reserva * (1 + inputs.markup_percent / 100);

  // Taxa de administração do parcelamento (se houver)
  const preco_final = preco_base * (1 + inputs.taxa_admin_parcelamento / 100);

  // Produto Viagem Flexível (+X%)
  const preco_com_flexivel = preco_final * (1 + inputs.taxa_viagem_flexivel_percent / 100);

  // Entrada e parcelas
  const entrada_valor = preco_final * (inputs.valor_entrada_percent / 100);
  const restante = preco_final - entrada_valor;
  const parcelas_restantes = Math.max(inputs.max_parcelas - 1, 1);
  const parcela_valor = restante / parcelas_restantes;

  // Análise do grupo
  const receita_projetada = preco_final * inputs.meta_pax;
  const custo_total_grupo = custo_total_pax * inputs.meta_pax;
  const lucro_projetado = receita_projetada - custo_total_grupo;
  const margem_percentual = receita_projetada > 0
    ? (lucro_projetado / receita_projetada) * 100
    : 0;

  return {
    custo_hotel_total,
    custo_total_pax,
    preco_base,
    preco_com_reserva,
    preco_final,
    preco_com_flexivel,
    entrada_valor,
    parcela_valor,
    receita_projetada,
    custo_total_grupo,
    lucro_projetado,
    margem_percentual,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Default inputs
// ─────────────────────────────────────────────────────────────────────────────

export const DEFAULT_PRICING_INPUTS: GroupPricingInputs = {
  custo_passagem: 0,
  taxa_embarque: 0,
  custo_hotel_unit: 0,
  total_diarias: 1,
  custo_transfer: 0,
  custo_passeios: 0,
  custo_seguro: 0,
  custo_outros: 0,
  markup_percent: 25,
  reserva_inadimplencia_percent: 15,
  taxa_admin_parcelamento: 0,
  taxa_viagem_flexivel_percent: 15,
  max_parcelas: 8,
  valor_entrada_percent: 15,
  meta_pax: 20,
  pax_minimo: 15,
  notas: null,
};

// ─────────────────────────────────────────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────────────────────────────────────────

const QK = (groupTripId: string | undefined) => ['group_pricing', groupTripId] as const;

export const useGroupPricing = (groupTripId: string | undefined) => {
  return useQuery({
    queryKey: QK(groupTripId),
    queryFn: async () => {
      if (!groupTripId) return null;
      const { data, error } = await (supabase as any)
        .from('group_pricing')
        .select('*')
        .eq('group_trip_id', groupTripId)
        .maybeSingle();
      if (error) throw error;
      return data as GroupPricing | null;
    },
    enabled: !!groupTripId,
  });
};

export const useSaveGroupPricing = () => {
  const qc = useQueryClient();
  const { organization } = useOrganization();

  return useMutation({
    mutationFn: async ({
      groupTripId,
      seatBlockId,
      inputs,
    }: {
      groupTripId: string;
      seatBlockId?: string | null;
      inputs: GroupPricingInputs;
    }) => {
      const calc = calculateGroupPricing(inputs);

      const payload = {
        org_id: organization?.id,
        group_trip_id: groupTripId,
        seat_block_id: seatBlockId ?? null,
        ...inputs,
        ...calc,
      };

      // Upsert: cria se não existe, atualiza se existe
      const { data, error } = await (supabase as any)
        .from('group_pricing')
        .upsert(payload, { onConflict: 'group_trip_id' })
        .select()
        .single();

      if (error) throw error;
      return data as GroupPricing;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: QK(data.group_trip_id) });
      toast.success('Precificação salva!');
    },
    onError: (err: Error) => {
      toast.error(`Erro ao salvar precificação: ${err.message}`);
    },
  });
};
