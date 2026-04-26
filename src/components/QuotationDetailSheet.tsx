import { useState, useEffect } from 'react';
import { useQuotation, useUpdateQuotation } from '@/hooks/useQuotations';
import { useQuotationScenarios, useScoreQuotation } from '@/hooks/useQuotationScenarios';
import { useSendQuotation } from '@/hooks/useSendQuotation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  Copy, ExternalLink, Send, MapPin, Hotel,
  Sparkles, TrendingDown,
  TrendingUp, CheckCircle2, ChevronDown, ChevronUp,
  Check, FileSearch
} from 'lucide-react';
import { parseInstallments, cn } from '@/lib/utils';
import { useBuildProposal } from '@/hooks/useBuildProposal';
import { EmailTrackingBadge } from '@/components/ui/EmailTrackingBadge';
import { SheetPage } from '@/components/ui/SheetPage';
import { logger } from '@/utils/logger';

const statusLabels: Record<string, string> = {
  draft: 'Rascunho', sent: 'Enviada', viewed: 'Visualizada',
  confirmed: 'Confirmada', expired: 'Expirada', cancelled: 'Cancelada',
};

const statusColors: Record<string, string> = {
  draft: 'bg-zinc-100 text-zinc-600', sent: 'bg-blue-50 text-blue-700',
  viewed: 'bg-amber-50 text-amber-700', confirmed: 'bg-green-50 text-green-700',
  expired: 'bg-red-50 text-red-500', cancelled: 'bg-zinc-100 text-zinc-500',
};

const mealLabels: Record<string, string> = {
  all_inclusive: 'All Inclusive', half_board: 'Meia Pensão',
  bed_breakfast: 'Café da Manhã', room_only: 'Só Hospedagem',
};

const scenarioIcons: Record<string, string> = {
  direct: '✈️', gateway: '🔄', date_shift: '📅', upgrade: '⬆️', budget: '💰',
};

const scenarioColors: Record<string, string> = {
  direct: 'border-blue-200 bg-blue-50/30',
  gateway: 'border-purple-200 bg-purple-50/30',
  date_shift: 'border-amber-200 bg-amber-50/30',
  upgrade: 'border-green-200 bg-green-50/30',
  budget: 'border-emerald-200 bg-emerald-50/30',
};

function ScoreBar({ label, value }: { label: string; value?: number }) {
  const pct = value ?? 0;
  return (
    <div className="space-y-0.5">
      <div className="flex justify-between text-[9px] text-zinc-500">
        <span className="uppercase tracking-wider">{label}</span>
        <span className="font-bold">{pct}</span>
      </div>
      <div className="h-1.5 rounded-full bg-zinc-100 overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700',
            pct >= 80 ? 'bg-green-400' : pct >= 60 ? 'bg-amber-400' : 'bg-red-400'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function ScenarioCard({ scenario, isBest, idx }: { scenario: any; isBest: boolean; idx: number }) {
  const [expanded, setExpanded] = useState(false);
  const score = scenario.score ?? 0;
  const scoreColor = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-amber-600' : 'text-red-500';

  return (
    <div className={cn(
      'rounded-2xl border-2 p-5 transition-all duration-300',
      scenarioColors[scenario.scenario_type] ?? 'border-zinc-200 bg-zinc-50/30',
      isBest ? 'ring-2 ring-vj-green/30 ring-offset-1' : ''
    )}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{scenarioIcons[scenario.scenario_type] ?? '🔷'}</span>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-bold text-zinc-800">
                {scenario.title ?? scenario.scenario_label ?? `Cenário ${idx + 1}`}
              </p>
              {isBest && (
                <span className="text-[9px] bg-vj-green text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  ✨ Recomendado
                </span>
              )}
            </div>
            <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
              {scenario.scenario_type}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className={cn('text-2xl font-black', scoreColor)}>{score}</div>
          <div className="text-[8px] text-zinc-400 uppercase tracking-widest">score</div>
        </div>
      </div>

      {scenario.description && (
        <p className="text-xs text-zinc-600 leading-relaxed mb-3">{scenario.description}</p>
      )}

      {(scenario.estimated_savings_brl || scenario.estimated_extra_cost_brl) && (
        <div className="flex gap-2 mb-3">
          {scenario.estimated_savings_brl > 0 && (
            <div className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
              <TrendingDown className="w-3 h-3" />
              Economia: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(scenario.estimated_savings_brl)}
            </div>
          )}
          {scenario.estimated_extra_cost_brl > 0 && (
            <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              <TrendingUp className="w-3 h-3" />
              + {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(scenario.estimated_extra_cost_brl)}
            </div>
          )}
        </div>
      )}

      {scenario.score_breakdown && (
        <div className="grid grid-cols-2 gap-2 mb-3">
          <ScoreBar label="Logística" value={scenario.score_breakdown.logistic_viability} />
          <ScoreBar label="Preço" value={scenario.score_breakdown.price_competitiveness} />
          <ScoreBar label="Experiência" value={scenario.score_breakdown.client_experience} />
          <ScoreBar label="Risco op." value={scenario.score_breakdown.operational_risk} />
        </div>
      )}

      <div>
        <button
          onClick={() => setExpanded(v => !v)}
          className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {expanded ? 'Ocultar raciocínio da IA' : 'Ver raciocínio da IA'}
        </button>
        {expanded && (
          <div className="mt-2 p-3 rounded-xl bg-white/80 border border-zinc-100 text-xs text-zinc-600 leading-relaxed">
            {scenario.agent_rationale || scenario.ai_reasoning}
          </div>
        )}
      </div>
    </div>
  );
}

export interface QuotationDetailSheetProps {
  id: string | null;
  open: boolean;
  onClose: () => void;
}

export function QuotationDetailSheet({ id, open, onClose }: QuotationDetailSheetProps) {
  const { data: quotation, isLoading } = useQuotation(id);
  const updateQuotation = useUpdateQuotation();
  const { toast } = useToast();
  const { data: scenarios, isLoading: scenariosLoading } = useQuotationScenarios(id);
  const scoreQuotation = useScoreQuotation();
  const buildProposal = useBuildProposal();
  const sendQuotation = useSendQuotation();
  const [proposalMarkdown, setProposalMarkdown] = useState<string | null>(null);

  useEffect(() => {
    if (quotation?.notes_internal && !proposalMarkdown) {
      setProposalMarkdown(quotation.notes_internal);
    }
  }, [quotation?.notes_internal, proposalMarkdown]);

  const copyWhatsApp = () => {
    if (quotation?.whatsapp_text) {
      navigator.clipboard.writeText(quotation.whatsapp_text);
      toast({ title: 'Texto copiado!' });
    }
  };

  const copyPublicLink = () => {
    if (quotation?.public_token) {
      navigator.clipboard.writeText(`${window.location.origin}/q/${quotation.public_token}`);
      toast({ title: 'Link da página pública copiado!' });
    }
  };

  const handleFeedbackLoop = async (status: 'confirmed' | 'cancelled') => {
    if (!id) return;
    await updateQuotation.mutateAsync({ id, status });
    toast({ title: status === 'confirmed' ? 'Venda confirmada!' : 'Cotacao cancelada' });
  };

  const formatCurrency = (value: number | null, currency = 'BRL') => {
    if (!value) return '-';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(value);
  };

  const installments = parseInstallments(quotation?.installments);
  const bestScenarioIdx = scenarios && scenarios.length > 0
    ? scenarios.reduce((bestIdx, s, i) => (s.score ?? 0) > (scenarios[bestIdx].score ?? 0) ? i : bestIdx, 0)
    : -1;

  if (!open) return null;

  return (
    <SheetPage
      open={open}
      onClose={onClose}
      title={quotation?.destination || 'Detalhes da Cotação'}
      subtitle={quotation ? `Referência: #${quotation.id.slice(0, 8).toUpperCase()}` : 'Carregando...'}
      icon={FileSearch}
      sections={[
        { id: 'resumo', label: 'Resumo & Ações' },
        { id: 'cenarios', label: 'Análise IA' },
        { id: 'proposta', label: 'Proposta Persuasiva' },
      ]}
      footer={
        <div className="flex items-center gap-3 w-full justify-end">
          <Button variant="outline" onClick={onClose}>Fechar</Button>
          {quotation?.status === 'draft' && (
            <Button
              onClick={() => sendQuotation.mutate(id!)}
              disabled={sendQuotation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Send className="mr-2 h-4 w-4" /> Enviar Cotação
            </Button>
          )}
        </div>
      }
    >
      {(activeSection) => {
        if (isLoading) return <div className="space-y-4"><Skeleton className="h-40 w-full" /><Skeleton className="h-40 w-full" /></div>;
        if (!quotation) return <p>Cotação não encontrada.</p>;

        return (
          <>
            {activeSection === 'resumo' && (
              <div className="space-y-6">
                <div className="flex flex-wrap gap-2">
                   <Badge className={cn('px-3 py-1', statusColors[quotation.status])}>
                     {statusLabels[quotation.status] || quotation.status}
                   </Badge>
                   <EmailTrackingBadge entityId={quotation.id} />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Card className="premium-card">
                    <CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground font-bold">Destino & Hotel</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <p className="flex items-center gap-2 font-medium"><MapPin className="h-3.5 w-3.5 text-vj-green" /> {quotation.destination}</p>
                      {quotation.hotel_name && <p className="flex items-center gap-2 text-zinc-600"><Hotel className="h-3.5 w-3.5" /> {quotation.hotel_name}</p>}
                      <p className="text-zinc-500">👥 {quotation.num_adults ?? quotation.pax_adultos} adultos {(quotation.num_children ?? quotation.pax_criancas ?? 0) > 0 && `, ${quotation.num_children} crianças`}</p>
                    </CardContent>
                  </Card>
                  <Card className="premium-card">
                    <CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground font-bold">Investimento</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-2xl font-black text-vj-green">{formatCurrency(quotation.total_value, quotation.currency)}</p>
                      {installments.length > 0 && <p className="text-xs text-zinc-500">{installments[0].installment_count}x de {formatCurrency(installments[0].value)}</p>}
                    </CardContent>
                  </Card>
                </div>

                <div className="flex flex-wrap gap-2 pt-4 border-t border-vj-border">
                  <Button variant="outline" size="sm" onClick={copyPublicLink} className="rounded-xl"><ExternalLink className="mr-2 h-3.5 w-3.5" /> Link Público</Button>
                  <Button variant="outline" size="sm" onClick={copyWhatsApp} className="rounded-xl"><Copy className="mr-2 h-3.5 w-3.5" /> Copiar Texto WhatsApp</Button>
                  {quotation.status === 'sent' && (
                    <Button size="sm" onClick={() => handleFeedbackLoop('confirmed')} className="bg-vj-green text-white rounded-xl"><Check className="mr-2 h-3.5 w-3.5" /> Marcar como Vendido</Button>
                  )}
                </div>
              </div>
            )}

            {activeSection === 'cenarios' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold flex items-center gap-2"><Sparkles className="text-vj-green w-4 h-4" /> Inteligência de Cenários</h3>
                  <Button size="sm" onClick={() => scoreQuotation.mutate(id!)} disabled={scoreQuotation.isPending}>
                    {scoreQuotation.isPending ? 'Analisando...' : 'Regerar Análise'}
                  </Button>
                </div>
                {scenariosLoading ? <div className="grid grid-cols-2 gap-4"><Skeleton className="h-40" /><Skeleton className="h-40" /></div> : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {scenarios?.map((s, i) => (
                      <ScenarioCard key={s.id} scenario={s} isBest={i === bestScenarioIdx} idx={i} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeSection === 'proposta' && (
              <div className="space-y-6">
                 {quotation.whatsapp_text && (
                   <div className="p-4 rounded-2xl bg-[#dcf8c6] border border-green-200">
                     <p className="text-xs font-bold uppercase text-green-700 mb-2">Sugestão de abordagem WhatsApp:</p>
                     <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">{quotation.whatsapp_text}</pre>
                   </div>
                 )}
                 {proposalMarkdown ? (
                    <Card className="border-blue-100 bg-blue-50/20">
                      <CardHeader><CardTitle className="text-xs font-bold text-blue-600 uppercase">Proposta Markdown (IA)</CardTitle></CardHeader>
                      <CardContent>
                        <pre className="whitespace-pre-wrap text-[10px] text-zinc-600 font-mono bg-white p-4 rounded-xl border border-blue-50">{proposalMarkdown}</pre>
                      </CardContent>
                    </Card>
                 ) : (
                   <div className="text-center py-10 border-2 border-dashed rounded-2xl">
                     <Button onClick={async () => {
                       const res = await buildProposal.mutateAsync({ quotationId: id! });
                       if (res?.proposal_markdown) setProposalMarkdown(res.proposal_markdown);
                     }}>Gerar Proposta Persuasiva com IA</Button>
                   </div>
                 )}
              </div>
            )}
          </>
        );
      }}
    </SheetPage>
  );
}
