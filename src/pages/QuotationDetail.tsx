import { logger } from '@/utils/logger';

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { useQuotation, useUpdateQuotation } from '@/hooks/useQuotations';
import { useQuotationScenarios, useScoreQuotation } from '@/hooks/useQuotationScenarios';
import { useCreateGroupTrip } from '@/hooks/useGroupTrips';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft, Copy, ExternalLink, Send, MapPin, Hotel, Calendar,
  DollarSign, Sparkles, Brain, Loader2, Trophy, TrendingDown,
  TrendingUp, CheckCircle2, AlertCircle, ChevronDown, ChevronUp,
  Star, Clock, Plane, FileText, Check, XCircle, PlaneTakeoff
} from 'lucide-react';
import { parseInstallments } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useBuildProposal } from '@/hooks/useBuildProposal';
import { supabase } from '@/integrations/supabase/client';

const statusLabels: Record<string, string> = {
  draft: 'Rascunho', sent: 'Enviada', viewed: 'Visualizada',
  accepted: 'Aceita', expired: 'Expirada',
};
const statusColors: Record<string, string> = {
  draft: 'bg-zinc-100 text-zinc-600', sent: 'bg-blue-50 text-blue-700',
  viewed: 'bg-amber-50 text-amber-700', accepted: 'bg-green-50 text-green-700',
  expired: 'bg-red-50 text-red-500',
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

function ScenarioCard({
  scenario, isBest, idx,
}: { scenario: any; isBest: boolean; idx: number }) {
  const [expanded, setExpanded] = useState(false);
  const score = scenario.score ?? 0;
  const scoreColor = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-amber-600' : 'text-red-500';

  return (
    <div className={cn(
      'rounded-2xl border-2 p-5 transition-all duration-300',
      scenarioColors[scenario.scenario_type] ?? 'border-zinc-200 bg-zinc-50/30',
      isBest ? 'ring-2 ring-vj-green/30 ring-offset-1' : ''
    )}>
      {/* Header */}
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
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="text-right">
            <div className={cn('text-2xl font-black', scoreColor)}>{score}</div>
            <div className="text-[8px] text-zinc-400 uppercase tracking-widest">score</div>
          </div>
        </div>
      </div>

      {/* Description */}
      {scenario.description && (
        <p className="text-xs text-zinc-600 leading-relaxed mb-3">{scenario.description}</p>
      )}

      {/* Economia / custo extra */}
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

      {/* Score breakdown bars */}
      {scenario.score_breakdown && (
        <div className="grid grid-cols-2 gap-2 mb-3">
          <ScoreBar label="Logística" value={scenario.score_breakdown.logistic_viability} />
          <ScoreBar label="Preço" value={scenario.score_breakdown.price_competitiveness} />
          <ScoreBar label="Experiência" value={scenario.score_breakdown.client_experience} />
          <ScoreBar label="Risco op." value={scenario.score_breakdown.operational_risk} />
        </div>
      )}

      {/* Alterações sugeridas */}
      {scenario.suggested_changes && Object.values(scenario.suggested_changes).some(Boolean) && (
        <div className="space-y-1.5 mb-3">
          {scenario.suggested_changes.flight_via && (
            <div className="flex items-center gap-1.5 text-xs text-zinc-600">
              <Plane className="w-3 h-3 text-blue-500 flex-shrink-0" />
              <span>Voo via: <strong>{scenario.suggested_changes.flight_via}</strong></span>
            </div>
          )}
          {scenario.suggested_changes.hotel_alternative && (
            <div className="flex items-center gap-1.5 text-xs text-zinc-600">
              <Hotel className="w-3 h-3 text-green-500 flex-shrink-0" />
              <span>Hotel alternativo: <strong>{scenario.suggested_changes.hotel_alternative}</strong></span>
            </div>
          )}
          {scenario.suggested_changes.date_adjustment_days && (
            <div className="flex items-center gap-1.5 text-xs text-zinc-600">
              <Clock className="w-3 h-3 text-amber-500 flex-shrink-0" />
              <span>Ajuste de {scenario.suggested_changes.date_adjustment_days} dias na data</span>
            </div>
          )}
        </div>
      )}

      {/* Raciocínio expandível */}
      {(scenario.agent_rationale || scenario.ai_reasoning) && (
        <div>
          <button
            onClick={() => setExpanded(v => !v)}
            className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {expanded ? 'Ocultar raciocínio da IA' : 'Ver raciocínio da IA'}
          </button>
          {expanded && (
            <div className="mt-2 p-3 rounded-xl bg-white/80 border border-zinc-100 text-xs text-zinc-600 leading-relaxed animate-in slide-in-from-top-1 duration-200">
              {scenario.agent_rationale || scenario.ai_reasoning}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function QuotationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: quotation, isLoading } = useQuotation(id);
  const updateQuotation = useUpdateQuotation();
  const createGroupTrip = useCreateGroupTrip();
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
  }, [quotation?.notes_internal]);

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
    } else {
      toast({ title: 'Token público não gerado.', variant: 'destructive' });
    }
  };

  const markAsSent = async () => {
    if (!id) return;
    await updateQuotation.mutateAsync({ id, status: 'sent' });
  };

  const handleFeedbackLoop = async (status: 'accepted' | 'lost') => {
    if (!id) return;
    await updateQuotation.mutateAsync({ id, status });
    toast({ title: status === 'accepted' ? 'Venda concluída! 🎉' : 'Negócio perdido marcado' });
    try {
      await supabase.functions.invoke('extract-quotation-feedback', {
        body: { quotation_id: id, org_id: quotation?.org_id, status }
      });
    } catch (e) {
      logger.error('Feedback loop error', e);
    }
  };

  const handleConvertToTrip = async () => {
    if (!quotation) return;
    try {
      const groupTrip = await createGroupTrip.mutateAsync({
        title: `${quotation.destination || quotation.hotel_name || 'Pacote'} — ${(quotation as any).clients?.name ?? 'Grupo'}`,
        destination: quotation.destination ?? '',
        departure_date: quotation.check_in ?? quotation.departure_date ?? null,
        return_date: quotation.check_out ?? quotation.return_date ?? null,
        num_nights: quotation.num_nights ?? null,
        price_per_pax: quotation.total_value ?? 0,
        status: 'draft',
        description_md: quotation.notes_internal ?? null,
      } as Record<string, any>);
      if (groupTrip?.id) {
        toast({ title: 'Pacote de grupo criado! 🎉', description: 'Redirecionando para o módulo de excursões...' });
        navigate(`/group-trips/${groupTrip.id}`);
      }
    } catch (e: any) {
      toast({ title: 'Erro ao converter', description: e.message, variant: 'destructive' });
    }
  };

  const formatCurrency = (value: number | null, currency = 'BRL') => {
    if (!value) return '-';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(value);
  };

  const installments = parseInstallments(quotation?.installments);

  // Determinar índice do melhor cenário
  const bestScenarioIdx = scenarios && scenarios.length > 0
    ? scenarios.reduce((bestIdx, s, i) => (s.score ?? 0) > (scenarios[bestIdx].score ?? 0) ? i : bestIdx, 0)
    : -1;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto space-y-4 px-4">
          <Skeleton className="h-8 w-48" />
          <div className="grid sm:grid-cols-2 gap-4">
            <Skeleton className="h-48 rounded-2xl" />
            <Skeleton className="h-48 rounded-2xl" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!quotation) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Cotação não encontrada.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6 pb-12 px-4 sm:px-6">

        {/* Header */}
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/quotations')} className="mt-0.5">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="font-heading text-2xl font-bold truncate">
              {quotation.destination || quotation.hotel_name || 'Cotação sem destino'}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Criada em {new Date(quotation.created_at).toLocaleDateString('pt-BR')}
              {quotation.viewed_at && ` · Vista em ${new Date(quotation.viewed_at).toLocaleDateString('pt-BR')}`}
            </p>
          </div>
          <span className={cn('text-xs font-bold px-3 py-1.5 rounded-full capitalize', statusColors[quotation.status] ?? 'bg-zinc-100 text-zinc-600')}>
            {statusLabels[quotation.status] ?? quotation.status}
          </span>
        </div>

        {/* Ações */}
        <div className="flex flex-wrap gap-2">
          {quotation.whatsapp_text && (
            <Button variant="outline" size="sm" onClick={copyWhatsApp} className="rounded-xl">
              <Copy className="mr-1.5 h-3.5 w-3.5" /> Copiar WhatsApp
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={copyPublicLink} className="rounded-xl">
            <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> Link Público
          </Button>
          {quotation.status === 'draft' && (
            <Button
              size="sm"
              onClick={() => sendQuotation.mutate(id!)}
              disabled={sendQuotation.isPending}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {sendQuotation.isPending
                ? <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Enviando...</>
                : <><Send className="mr-1.5 h-3.5 w-3.5" /> Enviar Cotação</>
              }
            </Button>
          )}
          {quotation.status === 'sent' && (
            <>
              <Button
                size="sm"
                onClick={() => handleFeedbackLoop('accepted')}
                className="rounded-xl bg-vj-green hover:bg-emerald-700 text-white"
              >
                <Check className="mr-1.5 h-3.5 w-3.5" /> Ganhamos a Venda!
              </Button>
              <Button
                size="sm"
                onClick={() => handleFeedbackLoop('lost')}
                variant="outline"
                className="rounded-xl border-red-200 text-red-600 hover:bg-red-50"
              >
                <XCircle className="mr-1.5 h-3.5 w-3.5" /> Cliente Recusou
              </Button>
            </>
          )}
          {quotation.status === 'accepted' && (
            <Button
              size="sm"
              onClick={handleConvertToTrip}
              disabled={createGroupTrip.isPending}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-90 "
            >
              {createGroupTrip.isPending
                ? <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Criando Pacote...</>
                : <><PlaneTakeoff className="mr-1.5 h-3.5 w-3.5" /> Converter em Pacote de Grupo ✦</>
              }
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              const result = await buildProposal.mutateAsync({ quotationId: id! });
              if (result?.proposal_markdown) setProposalMarkdown(result.proposal_markdown);
            }}
            disabled={buildProposal.isPending}
            className="rounded-xl border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            {buildProposal.isPending ? (
              <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Gerando...</>
            ) : (
              <><FileText className="mr-1.5 h-3.5 w-3.5" /> Gerar Proposta</>
            )}
          </Button>
          {/* Botão principal de análise IA */}
          <Button
            size="sm"
            onClick={() => scoreQuotation.mutate(id!)}
            disabled={scoreQuotation.isPending}
            className="rounded-xl bg-gradient-to-r from-vj-green to-emerald-600 text-white hover:opacity-90 ml-auto "
          >
            {scoreQuotation.isPending ? (
              <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Analisando...</>
            ) : (
              <><Brain className="mr-1.5 h-3.5 w-3.5" /> Analisar com IA</>
            )}
          </Button>
        </div>

        {/* Detalhes da cotação */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="premium-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Destino & Hotel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {quotation.destination && (
                <p className="flex items-center gap-2 font-medium">
                  <MapPin className="h-3.5 w-3.5 text-vj-green" /> {quotation.destination}
                </p>
              )}
              {quotation.hotel_name && (
                <p className="flex items-center gap-2">
                  <Hotel className="h-3.5 w-3.5 text-zinc-400" />
                  {quotation.hotel_name}
                  {quotation.hotel_stars ? ` ${'⭐'.repeat(Math.min(quotation.hotel_stars, 5))}` : ''}
                </p>
              )}
              {quotation.meal_plan && (
                <p className="text-zinc-600">🍽️ {mealLabels[quotation.meal_plan] || quotation.meal_plan}</p>
              )}
              {quotation.room_type && <p className="text-zinc-600">🛏️ {quotation.room_type}</p>}
              {(quotation.num_adults ?? quotation.pax_adultos) && (
                <p className="text-zinc-600">
                  👥 {quotation.num_adults ?? quotation.pax_adultos} adultos
                  {(quotation.num_children ?? quotation.pax_criancas ?? 0) > 0 && `, ${quotation.num_children ?? quotation.pax_criancas} crianças`}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="premium-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Datas & Valores</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {quotation.check_in && quotation.check_out && (
                <p className="flex items-center gap-2 text-zinc-700">
                  <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                  {new Date(quotation.check_in + 'T00:00:00').toLocaleDateString('pt-BR')}
                  {' → '}
                  {new Date(quotation.check_out + 'T00:00:00').toLocaleDateString('pt-BR')}
                  {quotation.num_nights && ` (${quotation.num_nights}n)`}
                </p>
              )}
              <p className="flex items-center gap-2 text-lg font-black text-vj-green">
                <DollarSign className="h-4 w-4" />
                {formatCurrency(quotation.total_value, quotation.currency || 'BRL')}
              </p>
              {quotation.tarifa_base && (
                <p className="text-xs text-zinc-500">
                  Tarifa net: {formatCurrency(quotation.tarifa_base, quotation.currency)} · Taxas: {formatCurrency(quotation.taxas, quotation.currency)}
                </p>
              )}
              {installments.length > 0 && (
                <div className="space-y-1 text-xs text-zinc-500 border-t border-zinc-100 pt-2">
                  {installments.map((inst, i) => (
                    <p key={i}>💳 {inst.type}: {inst.installment_count}× de R$ {inst.value?.toFixed(2)}</p>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="scenarios" className="w-full mt-6 space-y-6">
          <TabsList className="bg-zinc-100/50 p-1.5 rounded-2xl flex gap-1 w-full max-w-sm">
            <TabsTrigger value="scenarios" className="flex-1 rounded-xl text-xs font-bold uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-vj-green data-[state=active]:shadow-sm">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Cenários IA
            </TabsTrigger>
            <TabsTrigger value="proposal" className="flex-1 rounded-xl text-xs font-bold uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
              <FileText className="w-3.5 h-3.5 mr-1.5" /> Proposta
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scenarios" className="animate-in fade-in slide-in-from-bottom-2 duration-300 outline-none">
            {/* ── PAINEL DE CENÁRIOS DA IA ── */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-zinc-800 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-vj-green" /> Análise Inteligente de Cenários
                  </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                {scenarios && scenarios.length > 0
                  ? `${scenarios.length} cenários gerados · Clique em "Analisar com IA" para regenerar`
                  : 'Clique em "Analisar com IA" para gerar cenários alternativos scoring'}
              </p>
            </div>
            {scenarios && scenarios.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-50 px-3 py-1.5 rounded-full border border-zinc-100">
                <CheckCircle2 className="w-3 h-3 text-vj-green" />
                {scenarios.length} cenários ativos
              </div>
            )}
          </div>

          {scenariosLoading ? (
            <div className="grid sm:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />)}
            </div>
          ) : scenarios && scenarios.length > 0 ? (
            <div className="grid sm:grid-cols-3 gap-4">
              {scenarios.map((s, i) => (
                <ScenarioCard
                  key={s.id}
                  scenario={s}
                  isBest={i === bestScenarioIdx}
                  idx={i}
                />
              ))}
            </div>
          ) : (
            <div
              onClick={() => !scoreQuotation.isPending && scoreQuotation.mutate(id!)}
              className="border-2 border-dashed border-zinc-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center gap-3 cursor-pointer hover:border-vj-green/40 hover:bg-vj-green/5 transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-vj-green/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Brain className="w-6 h-6 text-vj-green" />
              </div>
              <p className="font-semibold text-zinc-600 text-sm">Nenhum cenário gerado ainda</p>
              <p className="text-xs text-zinc-400">Clique aqui ou no botão "Analisar com IA" para gerar 3 cenários alternativos com scoring completo</p>
            </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="proposal" className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6 outline-none">
            {/* WhatsApp text preview */}
            {quotation.whatsapp_text ? (
              <Card className="premium-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-muted-foreground uppercase tracking-widest font-bold flex items-center gap-2">
                    💬 Texto WhatsApp
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 rounded-2xl bg-[#dcf8c6] border border-green-200">
                    <pre className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed font-sans">{quotation.whatsapp_text}</pre>
                  </div>
                </CardContent>
              </Card>
            ) : (
               <div className="border border-dashed border-zinc-200 rounded-2xl p-8 text-center text-zinc-400">
                  <p className="text-sm">O texto persuasivo de WhatsApp ainda não foi gerado ou salvo.</p>
               </div>
            )}

            {/* Proposta Comercial Gerada */}
            {proposalMarkdown && (
              <Card className="premium-card border-blue-100">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs text-blue-600 uppercase tracking-widest font-bold flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5" /> Proposta Comercial (IA)
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs rounded-xl"
                        onClick={() => {
                          navigator.clipboard.writeText(proposalMarkdown);
                          toast({ title: 'Proposta copiada!' });
                        }}
                      >
                        <Copy className="w-3 h-3 mr-1" /> Copiar Markdown
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs rounded-xl text-zinc-400"
                        onClick={() => setProposalMarkdown(null)}
                      >
                        Fechar
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-xs text-zinc-700 leading-relaxed font-mono">{proposalMarkdown}</pre>
                  </div>
                  <p className="text-[9px] text-zinc-400 mt-2 text-center">
                    Markdown pronto para colar no WhatsApp, Email ou ferramenta de PDF
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
