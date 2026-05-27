import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSaveGroupPricing, useGroupPricing, DEFAULT_PRICING_INPUTS, GroupPricingInputs } from '@/hooks/useGroupPricing';
import { useSeatBlocks } from '@/hooks/useSeatBlocks';
import { Plane, Hotel, ShieldCheck, MapPin, Bus, Calculator, Save, AlertCircle, Percent, BarChart2 } from 'lucide-react';

interface PricingCalculatorProps {
  groupTripId: string;
}

export function PricingCalculator({ groupTripId }: PricingCalculatorProps) {
  const { data: pricing } = useGroupPricing(groupTripId);
  const { data: seatBlocks } = useSeatBlocks(groupTripId);
  const savePricing = useSaveGroupPricing();

  const [inputs, setInputs] = useState<GroupPricingInputs>(
    pricing ? { ...pricing } : { ...DEFAULT_PRICING_INPUTS }
  );

  const activeSeatBlock = seatBlocks?.[0]; // Pega o primeiro bloqueio vinculado

  // Sincroniza custo aéreo se houver bloqueio vinculado
  useMemo(() => {
    if (activeSeatBlock && inputs.custo_passagem === 0 && activeSeatBlock.custo_passagem_unit) {
      setInputs(prev => ({ ...prev, custo_passagem: activeSeatBlock.custo_passagem_unit! }));
    }
  }, [activeSeatBlock]);

  const handleChange = (field: keyof GroupPricingInputs, value: number) => {
    setInputs((prev) => ({ ...prev, [field]: value || 0 }));
  };

  const handleSave = () => {
    savePricing.mutate({
      groupTripId,
      seatBlockId: activeSeatBlock?.id,
      inputs,
    });
  };

  // Cálculo local em tempo real
  const custoHotel = inputs.custo_hotel_unit * inputs.total_diarias;
  const custoTotalPax =
    inputs.custo_passagem +
    inputs.taxa_embarque +
    custoHotel +
    inputs.custo_transfer +
    inputs.custo_passeios +
    inputs.custo_seguro +
    inputs.custo_outros;

  const reservaSeguranca = custoTotalPax * (inputs.reserva_inadimplencia_percent / 100);
  const precoComReserva = custoTotalPax + reservaSeguranca;
  const precoBase = precoComReserva * (1 + inputs.markup_percent / 100);
  const precoFinal = precoBase * (1 + inputs.taxa_admin_parcelamento / 100);
  const precoFlexivel = precoFinal * (1 + inputs.taxa_viagem_flexivel_percent / 100);

  const entrada = precoFinal * (inputs.valor_entrada_percent / 100);
  const valorParcela = (precoFinal - entrada) / Math.max(inputs.max_parcelas - 1, 1);

  const receitaProjetada = precoFinal * inputs.meta_pax;
  const lucroProjetado = receitaProjetada - (custoTotalPax * inputs.meta_pax);
  const margem = receitaProjetada > 0 ? (lucroProjetado / receitaProjetada) * 100 : 0;

  const fmtCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
      
      {/* ── PAINEL DE INPUTS (ESQUERDA) ── */}
      <div className="space-y-6">
        
        {/* BLOCO 1: Custos Diretos */}
        <Card className="p-8 rounded-[2rem] border-white/60 bg-white/60 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex items-center gap-2 mb-4 border-b border-zinc-100 pb-3">
            <Calculator size={18} className="text-zinc-400" />
            <h3 className="font-semibold text-vj-txt">Custos Diretos (por pessoa)</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs text-zinc-500"><Plane size={14}/> Passagem Aérea</Label>
              <Input type="number" value={inputs.custo_passagem} onChange={e => handleChange('custo_passagem', Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs text-zinc-500"><Percent size={14}/> Taxa Embarque</Label>
              <Input type="number" value={inputs.taxa_embarque} onChange={e => handleChange('taxa_embarque', Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs text-zinc-500"><Hotel size={14}/> Diária Hotel</Label>
              <Input type="number" value={inputs.custo_hotel_unit} onChange={e => handleChange('custo_hotel_unit', Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs text-zinc-500">Nº de Diárias</Label>
              <Input type="number" value={inputs.total_diarias} onChange={e => handleChange('total_diarias', Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs text-zinc-500"><Bus size={14}/> Transfer/Ônibus</Label>
              <Input type="number" value={inputs.custo_transfer} onChange={e => handleChange('custo_transfer', Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs text-zinc-500"><MapPin size={14}/> Passeios</Label>
              <Input type="number" value={inputs.custo_passeios} onChange={e => handleChange('custo_passeios', Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs text-zinc-500"><ShieldCheck size={14}/> Seguro Viagem</Label>
              <Input type="number" value={inputs.custo_seguro} onChange={e => handleChange('custo_seguro', Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs text-zinc-500">Outros Custos</Label>
              <Input type="number" value={inputs.custo_outros} onChange={e => handleChange('custo_outros', Number(e.target.value))} />
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-zinc-50 rounded-lg flex justify-between items-center border border-zinc-100">
            <span className="text-sm font-medium text-zinc-600">Custo Total por Pessoa:</span>
            <span className="font-bold text-lg">{fmtCurrency(custoTotalPax)}</span>
          </div>
        </Card>

        {/* BLOCO 2: Markup e Segurança */}
        <Card className="p-8 rounded-[2rem] border-white/60 bg-white/60 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex items-center gap-2 mb-4 border-b border-zinc-100 pb-3">
            <ShieldCheck size={18} className="text-zinc-400" />
            <h3 className="font-semibold text-vj-txt">Composição de Preço & Risco</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-500">Reserva Inadimplência (%)</Label>
              <Input type="number" value={inputs.reserva_inadimplencia_percent} onChange={e => handleChange('reserva_inadimplencia_percent', Number(e.target.value))} />
              <p className="text-[10px] text-zinc-400">Proteção contra cancelamentos sem SPC</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-500">Markup Lucro (%)</Label>
              <Input type="number" value={inputs.markup_percent} onChange={e => handleChange('markup_percent', Number(e.target.value))} />
              <p className="text-[10px] text-zinc-400">Margem aplicada sobre Custo + Reserva</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-500">Taxa Cartão/Boleto (%)</Label>
              <Input type="number" value={inputs.taxa_admin_parcelamento} onChange={e => handleChange('taxa_admin_parcelamento', Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-500">Acréscimo Viagem Flexível (%)</Label>
              <Input type="number" value={inputs.taxa_viagem_flexivel_percent} onChange={e => handleChange('taxa_viagem_flexivel_percent', Number(e.target.value))} />
              <p className="text-[10px] text-zinc-400">Preço p/ clientes c/ proteção extra</p>
            </div>
          </div>
        </Card>

        {/* BLOCO 3: Parcelamento e Viabilidade */}
        <Card className="p-8 rounded-[2rem] border-white/60 bg-white/60 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-500">Máx. Parcelas</Label>
              <Input type="number" value={inputs.max_parcelas} onChange={e => handleChange('max_parcelas', Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-500">Entrada Mínima (%)</Label>
              <Input type="number" value={inputs.valor_entrada_percent} onChange={e => handleChange('valor_entrada_percent', Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-500">Meta Pax (vendas)</Label>
              <Input type="number" value={inputs.meta_pax} onChange={e => handleChange('meta_pax', Number(e.target.value))} />
            </div>
          </div>
        </Card>

      </div>

      {/* ── PAINEL DE RESULTADOS (DIREITA) ── */}
      <div className="space-y-4">
        
        <Card className="p-8 rounded-[2rem] border-white/60 bg-white/80 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.06)] sticky top-20">
          <h3 className="font-heading font-black text-xl mb-6 text-vj-txt border-b border-vj-border pb-3">Resumo da Precificação</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-dashed border-zinc-200">
              <span className="text-sm text-zinc-500">Custo Base (pax)</span>
              <span className="font-medium text-zinc-700">{fmtCurrency(custoTotalPax)}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-dashed border-zinc-200">
              <span className="text-sm text-zinc-500">Fundo Reserva ({inputs.reserva_inadimplencia_percent}%)</span>
              <span className="font-medium text-amber-600">+{fmtCurrency(reservaSeguranca)}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-dashed border-zinc-200">
              <span className="text-sm text-zinc-500">Lucro Bruto ({inputs.markup_percent}%)</span>
              <span className="font-medium text-vj-green">+{fmtCurrency(precoBase - precoComReserva)}</span>
            </div>

            <div className="pt-2">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Preço Final de Venda</p>
              <p className="text-3xl font-black text-vj-txt leading-none">{fmtCurrency(precoFinal)}</p>
              <p className="text-sm font-medium text-vj-blue mt-1 border-t border-zinc-100 pt-2">
                Viagem Flexível: {fmtCurrency(precoFlexivel)}
              </p>
            </div>
            
            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 mt-4 space-y-2">
              <p className="text-xs font-semibold text-zinc-600 mb-2 uppercase tracking-wider">Carnê de Pagamento</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-500">Entrada ({inputs.valor_entrada_percent}%)</span>
                <span className="font-bold text-zinc-800">{fmtCurrency(entrada)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-500">Restante</span>
                <span className="font-bold text-zinc-800">{inputs.max_parcelas - 1}x de {fmtCurrency(valorParcela)}</span>
              </div>
            </div>

            <div className="p-4 bg-vj-green/10 border border-vj-green/20 rounded-xl mt-4">
              <p className="text-xs font-semibold text-vj-green mb-2 uppercase tracking-wider flex items-center gap-1">
                <BarChart2 size={12}/> Viabilidade (Meta: {inputs.meta_pax} pax)
              </p>
              <div className="flex justify-between items-center text-sm mb-1">
                <span className="text-vj-green/70">Receita Total</span>
                <span className="font-semibold text-vj-green">{fmtCurrency(receitaProjetada)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-vj-green/70">Lucro Estimado</span>
                <span className="font-bold text-vj-green">{fmtCurrency(lucroProjetado)} ({margem.toFixed(1)}%)</span>
              </div>
            </div>
          </div>

          <Button 
            className="w-full mt-6 h-12 rounded-xl text-md font-bold hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-[0_4px_20px_rgb(0,0,0,0.1)]" 
            size="lg" 
            onClick={handleSave} 
            disabled={savePricing.isPending}
          >
            {savePricing.isPending ? 'Salvando...' : <><Save size={16} className="mr-2"/> Salvar Precificação</>}
          </Button>

          {activeSeatBlock && (
            <div className="mt-4 p-3 bg-amber-50 rounded-lg flex gap-2 items-start text-xs text-amber-700 border border-amber-200">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <p>Custos aéreos sincronizados com o bloqueio ativo <strong>{activeSeatBlock.localizador_bloco}</strong> ({activeSeatBlock.companhia}).</p>
            </div>
          )}
        </Card>

      </div>
    </div>
  );
}
