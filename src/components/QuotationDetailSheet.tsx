import { useState, useEffect } from 'react';
import { useQuotation, useUpdateQuotation } from '@/hooks/useQuotations';
import { useQuotationScenarios, useScoreQuotation } from '@/hooks/useQuotationScenarios';
import { useSendQuotation } from '@/hooks/useSendQuotation';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { 
  Copy, ExternalLink, Send, MapPin, Hotel, 
  Sparkles, TrendingDown, 
  ChevronDown, ChevronUp,
  Zap, BrainCircuit, Activity, Users, MessageCircle, Terminal, Calendar
} from 'lucide-react';
import { parseInstallments, cn } from '@/lib/utils';
import { useBuildProposal } from '@/hooks/useBuildProposal';
import { EmailTrackingBadge } from '@/components/ui/EmailTrackingBadge';
import { SheetPage } from '@/components/ui/SheetPage';
import { Badge } from '@/components/ui/badge';
import { SquadRationale } from '@/components/SquadRationale';

const statusLabels: Record<string, string> = {
  draft: 'Rascunho', sent: 'Enviada', viewed: 'Visualizada',
  confirmed: 'Confirmada', expired: 'Expirada', cancelled: 'Cancelada',
};

const statusColors: Record<string, string> = {
  draft: 'bg-zinc-100 text-zinc-600', sent: 'bg-blue-50 text-blue-700 border-blue-200',
  viewed: 'bg-amber-50 text-amber-700 border-amber-200', confirmed: 'bg-vj-green/10 text-vj-green border-vj-green/20',
  expired: 'bg-red-50 text-red-500 border-red-200', cancelled: 'bg-zinc-100 text-zinc-500',
};

function ScoreBar({ label, value }: { label: string; value?: number }) {
  const pct = value ?? 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[8px] text-vj-txt3 font-black uppercase tracking-widest">
        <span>{label}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1 rounded-full bg-zinc-100 overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-1000 ease-out',
            pct >= 80 ? 'bg-vj-green' : pct >= 60 ? 'bg-amber-400' : 'bg-red-400'
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
  const Icon = isBest ? Sparkles : Zap;

  return (
    <div className={cn(
      'bento-card bg-white p-5 border-vj-border transition-colors',
      isBest ? 'border-vj-green bg-zinc-50/30' : ''
    )}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center border', isBest ? 'bg-vj-green text-white border-vj-green' : 'bg-zinc-50 text-vj-txt3 border-vj-border')}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-black text-vj-txt tracking-tight leading-none">
                {scenario.title || `Cenário Ops ${idx + 1}`}
              </p>
              {isBest && (
                <span className="text-[7px] bg-vj-green text-white px-1.5 py-0.5 rounded font-black uppercase tracking-widest">
                  Best
                </span>
              )}
            </div>
            <p className="text-[8px] uppercase tracking-widest text-vj-txt3 font-black mt-1">
              REF: {scenario.scenario_type}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className={cn('text-2xl font-black tracking-tighter', score >= 80 ? 'text-vj-green' : 'text-amber-500')}>{score}</div>
          <div className="text-[7px] text-vj-txt3 font-black uppercase tracking-widest">RANK</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <ScoreBar label="Logística" value={scenario.score_breakdown?.logistic_viability} />
        <ScoreBar label="Preço" value={scenario.score_breakdown?.price_competitiveness} />
        <ScoreBar label="Exp" value={scenario.score_breakdown?.client_experience} />
        <ScoreBar label="Risco" value={scenario.score_breakdown?.operational_risk} />
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-2 py-1.5 rounded-lg bg-zinc-50 border border-vj-border text-[8px] font-black uppercase tracking-widest text-vj-txt3 hover:bg-zinc-100 transition-colors"
      >
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        Racional
      </button>

      {expanded && (
        <SquadRationale rationaleText={scenario.agent_rationale || scenario.ai_reasoning} className="mt-3" />
      )}
    </div>
  );
}

export function QuotationDetailSheet({ id, open, onClose }: { id: string | null; open: boolean; onClose: () => void }) {
  const { data: quotation, isLoading } = useQuotation(id);
  const { toast } = useToast();
  const { data: scenarios } = useQuotationScenarios(id);
  const scoreQuotation = useScoreQuotation();
  const buildProposal = useBuildProposal();
  const sendQuotation = useSendQuotation();
  const [proposalMarkdown, setProposalMarkdown] = useState<string | null>(null);

  useEffect(() => {
    if (quotation?.notes_internal && !proposalMarkdown) setProposalMarkdown(quotation.notes_internal);
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
      toast({ title: 'Link público copiado!' });
    }
  };

  const installments = parseInstallments(quotation?.installments);
  const bestScenarioIdx = scenarios?.reduce((bestIdx, s, i) => (s.score ?? 0) > (scenarios[bestIdx].score ?? 0) ? i : bestIdx, 0) ?? -1;

  if (!open) return null;

  return (
    <SheetPage
      open={open} onClose={onClose}
      title={quotation?.destination || 'Cockpit'}
      subtitle={quotation ? `Operação Nexus #${quotation.id.slice(0, 8).toUpperCase()}` : 'Processando...'}
      icon={Zap}
      sections={[
        { id: 'resumo', label: 'Resumo' },
        { id: 'cenarios', label: 'Análise Squad' },
        { id: 'proposta', label: 'Pitch' },
      ]}
      footer={
        <div className="flex items-center gap-2 w-full justify-end">
          <Button variant="outline" className="rounded-lg font-bold h-9 text-xs" onClick={onClose}>Fechar</Button>
          {quotation?.status === 'draft' && (
            <Button
              onClick={() => sendQuotation.mutate(id!)}
              disabled={sendQuotation.isPending}
              className="bg-vj-green hover:bg-vj-green/90 text-white rounded-lg h-9 px-6 text-xs font-bold shadow-none"
            >
              <Send className="mr-2 h-3.5 w-3.5" /> Enviar Proposta
            </Button>
          )}
        </div>
      }
    >
      {(activeSection) => {
        if (isLoading) return <div className="space-y-4"><Skeleton className="h-32 w-full rounded-xl" /><Skeleton className="h-48 w-full rounded-xl" /></div>;
        if (!quotation) return <p className="text-xs text-vj-txt3">Falha na rede.</p>;

        return (
          <div className="animate-in fade-in slide-in-from-right-2 duration-300 no-scrollbar">
            {activeSection === 'resumo' && (
              <div className="space-y-8">
                <div className="flex items-center gap-2">
                   <Badge className={cn('px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-none', statusColors[quotation.status])}>
                     {statusLabels[quotation.status] || quotation.status}
                   </Badge>
                   <EmailTrackingBadge entityId={quotation.id} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bento-card p-5 bg-white">
                    <h4 className="text-[9px] font-black uppercase tracking-widest text-vj-txt3 mb-4">Dados Principais</h4>
                    <div className="space-y-3">
                       <div className="flex items-center gap-3">
                          <MapPin className="w-3.5 h-3.5 text-vj-green" />
                          <span className="text-xs font-bold text-vj-txt">{quotation.destination}</span>
                       </div>
                       <div className="flex items-center gap-3">
                          <Hotel className="w-3.5 h-3.5 text-vj-txt3" />
                          <span className="text-xs font-medium text-vj-txt2">{quotation.hotel_name || 'Hospedagem Premium'}</span>
                       </div>
                       <div className="flex items-center gap-3">
                          <Users className="w-3.5 h-3.5 text-vj-txt3" />
                          <span className="text-xs font-medium text-vj-txt2">
                            {Number(quotation.pax_adultos || 0)} Ad + {Number(quotation.pax_criancas || 0)} Ch
                          </span>
                       </div>
                    </div>
                  </div>

                  <div className="bento-card bg-vj-bg-dark text-white p-5 border-none">
                    <h4 className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-3">Valor Estimado</h4>
                    <p className="text-3xl font-black tracking-tighter text-vj-green">
                       {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(quotation.total_value || 0)}
                    </p>
                    {installments.length > 0 && (
                      <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-2">
                         {installments[0].installment_count}x {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(installments[0].value)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-vj-border flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={copyPublicLink} className="rounded-lg border-vj-border hover:bg-zinc-50 gap-2 h-9 font-bold text-xs">
                    <ExternalLink className="w-3.5 h-3.5 text-vj-green" /> Link Público
                  </Button>
                  <Button variant="outline" size="sm" onClick={copyWhatsApp} className="rounded-lg border-vj-border hover:bg-zinc-50 gap-2 h-9 font-bold text-xs">
                    <Copy className="w-3.5 h-3.5 text-blue-500" /> WhatsApp
                  </Button>
                </div>
              </div>
            )}

            {activeSection === 'cenarios' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-vj-txt uppercase tracking-tight flex items-center gap-2">
                    <BrainCircuit className="text-vj-green w-4 h-4" /> Análise Nexus
                  </h3>
                  <Button variant="ghost" className="text-[9px] font-black uppercase tracking-widest h-8 text-vj-green" onClick={() => scoreQuotation.mutate(id!)} disabled={scoreQuotation.isPending}>
                    Recalcular
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {scenarios?.map((s, i) => (
                    <ScenarioCard key={s.id} scenario={s} isBest={i === bestScenarioIdx} idx={i} />
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'proposta' && (
              <div className="space-y-6">
                 <div className="bento-card bg-zinc-50 p-5">
                    <p className="text-[9px] font-black uppercase tracking-widest text-vj-txt3 mb-3">Draft Sugerido</p>
                    <div className="bg-white p-4 rounded-xl border border-vj-border overflow-hidden">
                       <pre className="whitespace-pre-wrap text-[11px] text-vj-txt2 font-sans italic no-scrollbar">
                         {quotation.whatsapp_text || "Aguardando geração..."}
                       </pre>
                    </div>
                 </div>
                 
                 <div className="bento-card bg-vj-bg-dark p-5 border-none">
                    <div className="flex items-center justify-between mb-4">
                       <h3 className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Markdown Core</h3>
                       <Button size="sm" variant="ghost" className="h-7 text-[8px] font-black uppercase text-vj-green" onClick={() => buildProposal.mutate({ quotationId: id! })}>
                          Regerar
                       </Button>
                    </div>
                    <div className="bg-zinc-900 p-4 rounded-xl border border-white/5 font-mono text-[10px] text-zinc-400 leading-relaxed max-h-[300px] overflow-y-auto no-scrollbar">
                       {proposalMarkdown || "..."}
                    </div>
                 </div>
              </div>
            )}
          </div>
        );
      }}
    </SheetPage>
  );
}
