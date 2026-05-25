import { useNavigate } from 'react-router-dom';
import {
  PlaneTakeoff, Users, FileText, TrendingUp, Zap,
  ArrowRight, Plus, Activity, DollarSign, Clock,
  AlertCircle, CheckCircle2, BarChart2, Headphones,
  Building2, Loader2, Newspaper
} from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { useAuthStore } from '@/stores/authStore';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { QuotationBuilderSheet } from '@/components/QuotationBuilderSheet';
import { useState, useEffect } from 'react';
import { useRadarNews } from '@/hooks/useAiRadar';
import { Skeleton } from '@/components/ui/skeleton';
import { GlobalRadarMapWidget, RadarMarker } from '@/components/GlobalRadarMapWidget';
import { geocodeCity } from '@/utils/geocoder';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';
import { Badge } from '@/components/ui/badge';

type OrganizationRow = Tables<'organizations'>;

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

function greeting(name?: string | null) {
  const h = new Date().getHours();
  const saudacao = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
  return name ? `${saudacao}, ${name}` : saudacao;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { organization, profile, roles, setOrganization, setProfile, user } = useAuthStore();
  const [quotationOpen, setQuotationOpen] = useState(false);
  const { data: news, isLoading: newsLoading } = useRadarNews();
  const isMasterRecovery = !organization?.id && roles.includes('super_admin');

  const { data: visibleOrganizations, isLoading: organizationsLoading } = useQuery({
    queryKey: ['master_recovery_organizations'],
    enabled: isMasterRecovery,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      return (data ?? []).sort((a, b) => {
        const aPriority = a.slug === 'excelencia-tour-chapeco' ? 0 : 1;
        const bPriority = b.slug === 'excelencia-tour-chapeco' ? 0 : 1;
        return aPriority - bPriority || a.name.localeCompare(b.name);
      });
    },
  });

  const handleSelectOrganization = async (org: OrganizationRow) => {
    if (!user?.id) return;

    const payload = {
      user_id: user.id,
      email: user.email ?? profile?.email ?? null,
      first_name: profile?.first_name ?? '',
      last_name: profile?.last_name ?? '',
      org_id: org.id,
    };

    const { data: updatedProfile, error } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'user_id' })
      .select('*')
      .single();

    if (error) {
      toast({
        title: 'Não foi possível vincular a organização',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    setProfile(updatedProfile);
    setOrganization(org);
    await queryClient.invalidateQueries();
    toast({ title: 'Organização vinculada', description: org.name });
  };

  /* ── KPIs ── */
  const { data: kpi } = useQuery({
    queryKey: ['dashboard_kpi', organization?.id],
    queryFn: async () => {
      const id = organization!.id;
      const today = new Date().toISOString().split('T')[0];

      const [
        { data: trips },
        { data: quotations },
        { data: tickets },
        { data: clients },
      ] = await Promise.all([
        supabase.from('group_trips').select('id,title,destination,current_pax,status,departure_date,return_date').eq('org_id', id),
        supabase.from('quotations').select('id,total_value,status,created_at').eq('org_id', id),
        supabase.from('tickets').select('id,status').eq('org_id', id),
        supabase.from('clients').select('id,created_at').eq('org_id', id),
      ]);

      const T = trips || [], Q = quotations || [], TK = tickets || [], C = clients || [];

      const traveling = T.filter(t => {
        if (!t.departure_date) return false;
        const ret = (t as any).return_date || t.departure_date;
        return t.departure_date <= today && ret >= today && ['published', 'closed'].includes(t.status);
      });
      const paxNow = traveling.reduce((s, t) => s + (t.current_pax || 0), 0);

      const embarquesHoje = T.filter(t =>
        t.departure_date === today && ['published', 'closed'].includes(t.status)
      ).length;

      const gruposAtivos = T.filter(t => t.status === 'published').length;

      const atendimentosAbertos = TK.filter(t => ['open', 'pending'].includes(t.status)).length;

      const openQ = Q.filter(q => !['rejected', 'cancelled'].includes((q.status || '')));
      const pipeline = openQ.reduce((s, q) => s + (Number((q as any).total_value) || 0), 0);

      const mesInicio = new Date(); mesInicio.setDate(1); mesInicio.setHours(0, 0, 0, 0);
      const cotacoesMes = Q.filter(q => new Date(q.created_at) >= mesInicio).length;

      const next30Str = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
      const upcoming = T
        .filter(t =>
          t.departure_date &&
          t.departure_date >= today &&
          t.departure_date <= next30Str &&
          t.status === 'published'
        )
        .sort((a, b) => (a.departure_date || '').localeCompare(b.departure_date || ''))
        .slice(0, 5);

      return {
        paxNow, embarquesHoje, gruposAtivos, atendimentosAbertos,
        pipeline, cotacoesMes, totalClientes: C.length,
        traveling, upcoming,
      };
    },
    enabled: !!organization?.id,
    refetchInterval: 60_000,
  });

  const [markers, setMarkers] = useState<RadarMarker[]>([]);
  useEffect(() => {
    if (!kpi?.traveling?.length) { setMarkers([]); return; }
    const colors = ['#10b981', '#3b82f6', '#f43f5e', '#f59e0b', '#8b5cf6'];
    (async () => {
      const m: RadarMarker[] = [];
      for (let i = 0; i < kpi.traveling.length; i++) {
        const t = kpi.traveling[i];
        const r = await geocodeCity(t.destination?.split(',')[0] || t.title, t.destination);
        if (r && r.lat !== 0)
          m.push({ id: t.id, lat: r.lat, lng: r.lng, name: t.destination || t.title, pax: t.current_pax || 1, color: colors[i % colors.length] });
      }
      setMarkers(m);
    })();
  }, [kpi?.traveling]);

  if (isMasterRecovery) {
    return (
      <AppLayout>
        <div className="mx-auto flex min-h-[70vh] w-full max-w-4xl items-center justify-center px-2">
          <section className="w-full rounded-2xl border border-vj-border bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="max-w-2xl">
                <p className="mb-2 text-xs font-black uppercase tracking-[0.25em] text-vj-blue">
                  Recuperação master
                </p>
                <h1 className="text-2xl font-black tracking-tight text-vj-txt">
                  Selecionar organização
                </h1>
                <p className="mt-2 text-sm font-medium text-vj-txt3">
                  Seu acesso administrativo está ativo, mas nenhuma organização foi carregada para esta sessão.
                </p>
              </div>
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-vj-blue-bg border border-vj-blue/10">
                <Building2 className="h-5 w-5 text-vj-blue" />
              </div>
            </div>

            <div className="mt-6 space-y-2">
              {organizationsLoading ? (
                <div className="flex items-center gap-3 rounded-xl border border-vj-border bg-zinc-50 px-4 py-3 text-sm font-bold text-vj-txt3">
                  <Loader2 className="h-4 w-4 animate-spin text-vj-blue" />
                  Carregando organizações...
                </div>
              ) : !visibleOrganizations?.length ? (
                <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700">
                  <AlertCircle className="h-4 w-4" />
                  Nenhuma organização visível para este usuário.
                </div>
              ) : (
                visibleOrganizations.map((org) => (
                  <button
                    key={org.id}
                    type="button"
                    onClick={() => void handleSelectOrganization(org)}
                    className="flex w-full items-center justify-between gap-4 rounded-xl border border-vj-border bg-white px-4 py-3 text-left transition-colors hover:border-vj-blue/50 hover:bg-vj-blue-bg"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-black text-vj-txt">{org.name}</span>
                      <span className="block truncate text-xs font-bold text-vj-txt3">{org.slug}</span>
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-vj-blue" />
                  </button>
                ))
              )}
            </div>
          </section>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* ── CABEÇALHO DA PÁGINA ── */}
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <p className="text-xs font-bold text-vj-txt3 uppercase tracking-[0.25em] mb-1">Visão Geral</p>
          <h1 className="text-2xl font-black text-vj-txt tracking-tight leading-none">
            {greeting(profile?.first_name)}
          </h1>
          <p className="text-sm text-vj-txt3 font-medium mt-1.5">
            {organization?.name || 'Agência'} · Painel de Controle
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl border-vj-border bg-white text-vj-txt font-bold text-xs h-9 px-4 hover:bg-zinc-50"
            onClick={() => navigate('/group-trips')}
          >
            <Activity className="h-3.5 w-3.5 mr-2 text-vj-blue" />
            Grupos &amp; Viagens
          </Button>
          <Button
            size="sm"
            className="rounded-xl bg-vj-blue hover:bg-vj-blue/90 text-white font-bold text-xs h-9 px-4"
            onClick={() => setQuotationOpen(true)}
          >
            <Plus className="h-3.5 w-3.5 mr-2" />
            Nova Cotação
          </Button>
        </div>
      </div>

      <div className="space-y-5">
        {/* ── LINHA 1: 4 KPIs OPERACIONAIS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Passageiros Embarcados */}
          <div
            className="bento-card p-5 bg-white cursor-pointer group hover:border-vj-blue/40"
            onClick={() => navigate('/group-trips')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="h-9 w-9 rounded-xl bg-vj-blue-bg border border-vj-blue/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <PlaneTakeoff className="w-4 h-4 text-vj-blue" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-vj-blue bg-vj-blue-bg border border-vj-blue/10 px-2 py-0.5 rounded-full">
                Ao Vivo
              </span>
            </div>
            <p className="text-3xl font-black tracking-tighter text-vj-txt">{kpi?.paxNow ?? '–'}</p>
            <p className="text-[11px] font-bold text-vj-txt3 mt-1 uppercase tracking-wide">Passageiros Embarcados</p>
          </div>

          {/* Embarques Hoje */}
          <div
            className="bento-card p-5 bg-white cursor-pointer group hover:border-amber-400/40"
            onClick={() => navigate('/group-trips')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="h-9 w-9 rounded-xl bg-amber-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <ArrowRight className="w-4 h-4 text-vj-txt3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-3xl font-black tracking-tighter text-vj-txt">{kpi?.embarquesHoje ?? '–'}</p>
            <p className="text-[11px] font-bold text-vj-txt3 mt-1 uppercase tracking-wide">Embarques Hoje</p>
          </div>

          {/* Grupos Ativos */}
          <div
            className="bento-card p-5 bg-white cursor-pointer group hover:border-blue-400/40"
            onClick={() => navigate('/group-trips')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-4 h-4 text-blue-500" />
              </div>
              <ArrowRight className="w-4 h-4 text-vj-txt3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-3xl font-black tracking-tighter text-vj-txt">{kpi?.gruposAtivos ?? '–'}</p>
            <p className="text-[11px] font-bold text-vj-txt3 mt-1 uppercase tracking-wide">Grupos Ativos</p>
          </div>

          {/* Atendimentos Abertos */}
          <div
            className="bento-card p-5 bg-white cursor-pointer group hover:border-red-400/40"
            onClick={() => navigate('/tickets')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="h-9 w-9 rounded-xl bg-red-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Headphones className="w-4 h-4 text-red-500" />
              </div>
              {(kpi?.atendimentosAbertos ?? 0) > 0 && (
                <span className="text-[9px] font-black uppercase tracking-widest text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                  Pendente
                </span>
              )}
            </div>
            <p className="text-3xl font-black tracking-tighter text-vj-txt">{kpi?.atendimentosAbertos ?? '–'}</p>
            <p className="text-[11px] font-bold text-vj-txt3 mt-1 uppercase tracking-wide">Atendimentos Abertos</p>
          </div>
        </div>

        {/* ── LINHA 2: MAPA + PIPELINE + PRÓXIMOS EMBARQUES ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Mapa ao vivo */}
          <div className="lg:col-span-7 bento-card bg-zinc-950 h-[340px] overflow-hidden relative border-none">
            <GlobalRadarMapWidget markers={markers} interactive={false} />
            <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md border border-white/10 px-4 py-3 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-vj-blue animate-pulse" />
                <span className="text-white font-black text-[10px] uppercase tracking-[0.3em]">Grupos em Viagem</span>
              </div>
              <p className="text-zinc-400 text-xs font-medium mt-0.5">
                {kpi?.paxNow || 0} passageiros · {kpi?.traveling?.length || 0} destinos ativos
              </p>
            </div>
          </div>

          {/* Pipeline + Próximos */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Pipeline Comercial */}
            <div
              className="bento-card p-5 bg-white cursor-pointer group relative overflow-hidden hover:border-vj-blue/40"
              onClick={() => navigate('/quotations')}
            >
              <div className="absolute -right-6 -bottom-6 opacity-[0.05] group-hover:opacity-[0.10] transition-opacity duration-500">
                <BarChart2 className="w-32 h-32 text-vj-blue" />
              </div>
              <div className="flex items-start justify-between mb-3">
                <div className="h-9 w-9 rounded-xl bg-vj-blue-bg border border-vj-blue/10 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-vj-blue" />
                </div>
                <ArrowRight className="w-4 h-4 text-vj-txt3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-vj-txt3 mb-1">Pipeline Comercial</p>
              <p className="text-2xl font-black tracking-tighter text-vj-txt">
                {fmt(kpi?.pipeline || 0)}
              </p>
              <p className="text-[10px] font-bold text-vj-txt3 mt-0.5 flex items-center gap-1">
                <Zap className="w-3 h-3 text-vj-blue" /> Total em cotações abertas
              </p>
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-vj-border">
                <div>
                  <p className="text-[9px] font-black uppercase text-vj-txt3 tracking-widest">Cotações este mês</p>
                  <p className="text-lg font-black text-vj-txt mt-0.5">{kpi?.cotacoesMes ?? 0}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase text-vj-txt3 tracking-widest">Base de Clientes</p>
                  <p className="text-lg font-black text-vj-txt mt-0.5">{kpi?.totalClientes ?? 0}</p>
                </div>
              </div>
            </div>

            {/* Próximos Embarques */}
            <div className="bento-card bg-white p-5 flex flex-col gap-3 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-vj-txt">
                  Próximos Embarques <span className="text-vj-txt3 font-bold">(30 dias)</span>
                </h3>
                <button
                  className="text-[10px] font-black text-vj-blue hover:underline"
                  onClick={() => navigate('/group-trips')}
                >
                  Ver todos
                </button>
              </div>
              <div className="space-y-1.5">
                {!kpi ? (
                  [1, 2, 3].map(i => <Skeleton key={i} className="h-10 rounded-xl" />)
                ) : !kpi.upcoming?.length ? (
                  <div className="flex items-center gap-2 py-3 text-vj-txt3">
                    <CheckCircle2 className="w-4 h-4 text-vj-blue shrink-0" />
                    <span className="text-xs font-medium">Nenhum embarque nos próximos 30 dias</span>
                  </div>
                ) : (
                  kpi.upcoming.map((g: any) => (
                    <div
                      key={g.id}
                      className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-zinc-50 cursor-pointer transition-colors"
                      onClick={() => navigate('/group-trips')}
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-vj-txt truncate">{g.title}</p>
                        <p className="text-[10px] text-vj-txt3 truncate">{g.destination}</p>
                      </div>
                      <div className="shrink-0 text-right ml-3">
                        <p className="text-[10px] font-black text-vj-txt uppercase">
                          {new Date(g.departure_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                        </p>
                        <p className="text-[10px] text-vj-blue font-bold">{g.current_pax || 0} pax</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── LINHA 3: NOTÍCIAS DO SETOR (BENTO GRID OMEGA) ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-vj-blue" />
              <h2 className="text-sm font-black text-vj-txt uppercase tracking-tight">Notícias do Setor</h2>
            </div>
            <button
              onClick={() => navigate('/radar')}
              className="text-xs font-bold text-vj-blue hover:underline flex items-center gap-1"
            >
              Ver Radar Completo <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {newsLoading ? (
              [1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-56 rounded-2xl bg-zinc-100 border border-zinc-200 animate-pulse" />
              ))
            ) : !news || news.length === 0 ? (
              <div className="col-span-full p-8 text-center border-2 border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50">
                <p className="text-sm text-zinc-500 font-medium">Nenhuma notícia curada no radar.</p>
                <button
                  onClick={() => navigate('/radar')}
                  className="mt-3 text-xs font-bold text-vj-blue hover:underline"
                >
                  Sincronizar feeds agora
                </button>
              </div>
            ) : (
              <>
                {/* Destaque Bento */}
                {news.slice(0, 1).map((n: any) => (
                  <div
                    key={n.id}
                    onClick={() => navigate(`/noticias/${n.slug}`)}
                    className="md:col-span-2 p-5 rounded-2xl border border-zinc-800 bg-zinc-950 text-white flex flex-col justify-between group cursor-pointer relative overflow-hidden transition-all duration-300 hover:border-zinc-700"
                  >
                    <div className="absolute top-0 right-0 w-48 h-48 bg-vj-blue/10 blur-[80px] pointer-events-none" />
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded-full">
                          {n.ai_category || 'geral'}
                        </span>
                        <span className="text-[8px] font-black uppercase text-vj-blue">
                          Destaque
                        </span>
                      </div>
                      <h4 className="font-bold text-lg leading-tight mb-2 group-hover:text-vj-blue transition-colors">{n.title}</h4>
                      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                        {n.ai_short_summary || n.ai_summary || n.raw_excerpt}
                      </p>
                      {n.ai_travel_agency_insight && (
                        <div className="mt-3 p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300 leading-snug">
                          <strong className="text-vj-blue font-bold uppercase tracking-wider block text-[9px] mb-0.5">Insight Comercial:</strong>
                          {n.ai_travel_agency_insight}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-900">
                      <span className="text-[10px] text-zinc-500 font-semibold">Fonte: {n.source_name}</span>
                      <ArrowRight className="w-4 h-4 text-vj-blue opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}

                {/* Secundárias Bento */}
                {news.slice(1, 3).map((n: any) => (
                  <div
                    key={n.id}
                    onClick={() => navigate(`/noticias/${n.slug}`)}
                    className="p-5 rounded-2xl border border-zinc-200 bg-white flex flex-col justify-between group cursor-pointer transition-all duration-300 hover:border-vj-blue/40"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded-full">
                          {n.ai_category || 'geral'}
                        </span>
                        <span className="h-4 text-[9px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full shrink-0">
                          {n.ai_relevance_score || 50}%
                        </span>
                      </div>
                      <h4 className="font-bold text-sm leading-snug line-clamp-3 text-zinc-900 group-hover:text-vj-blue transition-colors">{n.title}</h4>
                      <p className="text-xs text-zinc-500 line-clamp-2 mt-2 leading-relaxed">
                        {n.ai_short_summary || n.ai_summary || n.raw_excerpt}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-50">
                      <span className="text-[10px] text-zinc-400 font-semibold truncate">Fonte: {n.source_name}</span>
                      <ArrowRight className="w-4 h-4 text-vj-blue opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      <QuotationBuilderSheet open={quotationOpen} onClose={() => setQuotationOpen(false)} />
    </AppLayout>
  );
}
