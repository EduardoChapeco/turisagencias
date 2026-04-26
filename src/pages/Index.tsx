import { useNavigate } from 'react-router-dom';
import {
  FileText, PlaneTakeoff, Globe2, Newspaper, ArrowRight, TrendingUp, Zap, ShieldCheck, Activity, Plus, Search, LayoutDashboard
} from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { useAuthStore } from '@/stores/authStore';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { QuotationBuilderSheet } from '@/components/QuotationBuilderSheet';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { useRadarNews } from '@/hooks/useAiRadar';
import { Skeleton } from '@/components/ui/skeleton';
import { GlobalRadarMapWidget, RadarMarker } from '@/components/GlobalRadarMapWidget';
import { geocodeCity } from '@/utils/geocoder';
import { useAiInsights } from '@/hooks/useAiInsights';

export default function Dashboard() {
  const navigate = useNavigate();
  const { organization } = useAuthStore();
  const [quotationBuilderOpen, setQuotationBuilderOpen] = useState(false);
  const { data: realNews, isLoading: isNewsLoading } = useRadarNews();
  const { insights, isLoading: isAiLoading } = useAiInsights();

  const { data: opsStats } = useQuery({
    queryKey: ['dashboard_ops_stats', organization?.id],
    queryFn: async () => {
      const { data: groupTrips } = await supabase.from('group_trips').select('id, title, destination, current_pax, status, departure_date').eq('org_id', organization!.id);
      const { data: qts } = await supabase.from('quotations').select('id, total_amount').eq('org_id', organization!.id);

      const todayStr = new Date().toISOString().split('T')[0];
      const todayDepartures = (groupTrips || []).filter(t => t.departure_date === todayStr).length;
      const traveling = (groupTrips || []).filter(t => t.status === 'traveling');
      const paxTraveling = traveling.reduce((acc, t) => acc + (t.current_pax || 1), 0);
      const pipelineValue = (qts || []).reduce((acc, q) => acc + (Number(q.total_amount) || 0), 0);

      return { todayDepartures, traveling, paxTraveling, pipelineValue };
    },
    enabled: !!organization?.id
  });

  const [radarMarkers, setRadarMarkers] = useState<RadarMarker[]>([]);

  useEffect(() => {
    if (!opsStats?.traveling) return;
    const buildMarkers = async () => {
      const markers: RadarMarker[] = [];
      const colors = ['#10b981', '#3b82f6', '#f43f5e', '#f59e0b', '#8b5cf6'];
      for (let i = 0; i < opsStats.traveling.length; i++) {
        const t = opsStats.traveling[i];
        const res = await geocodeCity(t.destination?.split(',')[0] || t.title, t.destination);
        if (res && res.lat !== 0) {
          markers.push({ id: t.id, lat: res.lat, lng: res.lng, name: t.destination || t.title, pax: t.current_pax || 1, color: colors[i % colors.length] });
        }
      }
      setRadarMarkers(markers);
    };
    buildMarkers();
  }, [opsStats?.traveling]);

  return (
    <AppLayout>
      <PageHeader
        title="Command Cockpit"
        description="Monitoramento da operação global e indicadores comerciais do Turis Squad."
        icon={LayoutDashboard}
        actions={
          <div className="flex items-center gap-4">
            <Button variant="outline" size="lg" className="h-12 rounded-2xl border-vj-border bg-white px-6 font-black text-xs uppercase tracking-widest hover:bg-zinc-50 transition-all" onClick={() => navigate('/group-trips')}>
              <Activity className="h-4 w-4 mr-3 text-vj-green" /> Ver Operação
            </Button>
            <Button size="lg" className="h-12 rounded-full bg-vj-green hover:bg-vj-green/90 text-white px-8 font-black text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-none" onClick={() => setQuotationBuilderOpen(true)}>
              <Plus className="h-4 w-4 mr-3" /> Nova Cotação
            </Button>
          </div>
        }
      />

      <div className="space-y-10 no-scrollbar">
        
        {/* DASHBOARD GRID - PREMIUM BENTO (SHADOWLESS) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-0">
          
          {/* Radar Map */}
          <div className="md:col-span-8 bento-card bg-zinc-950 h-[500px] overflow-hidden relative border-none">
            <GlobalRadarMapWidget markers={radarMarkers} interactive={false} />
            <div className="absolute top-6 left-6 bg-black/60 backdrop-blur-xl border border-white/10 p-6 rounded-3xl">
               <h3 className="text-white font-black text-[10px] uppercase tracking-[0.4em] flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-vj-green animate-pulse" /> Radar Global
               </h3>
               <p className="text-zinc-400 text-xs font-bold mt-2">{opsStats?.paxTraveling || 0} passageiros ativos em trânsito.</p>
            </div>
          </div>

          {/* AI Insights Sidebar */}
          <div className="md:col-span-4 flex flex-col gap-8">
            <div className="bento-card p-8 flex-1 bg-white">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-vj-txt mb-8">Notificações Intel</h3>
              <div className="space-y-6">
                {isAiLoading ? [1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-3xl" />) : 
                  insights.map(insight => (
                    <div key={insight.id} className="flex gap-4 p-4 rounded-2xl border border-zinc-50 bg-zinc-50/50 group hover:bg-white hover:border-vj-green/20 transition-all duration-300 cursor-help">
                      <div className={insight.color + " h-10 w-10 shrink-0 rounded-xl flex items-center justify-center transition-transform group-hover:rotate-6"}>
                        <insight.icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-black text-vj-txt uppercase tracking-wider truncate">{insight.title}</p>
                        <p className="text-xs text-vj-txt3 font-bold line-clamp-2 mt-1 leading-relaxed opacity-60">{insight.content}</p>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>

            <div className="bento-card bg-vj-bg-dark text-white p-8 border-none overflow-hidden relative group">
               <div className="absolute -right-10 -bottom-10 p-20 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-700">
                  <TrendingUp className="w-60 h-60 text-white" />
               </div>
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Pipeline Comercial</span>
               <p className="text-4xl font-black mt-3 tracking-tighter text-vj-green">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(opsStats?.pipelineValue || 0)}
               </p>
               <p className="text-[10px] font-bold text-zinc-600 mt-4 uppercase tracking-widest flex items-center gap-2">
                  <Zap className="w-3 h-3" /> Valor Potencial de Conversão
               </p>
            </div>
          </div>

          {/* Bottom Metrics */}
          <div className="md:col-span-3 bento-card p-8 bg-white flex flex-col justify-between group hover:border-amber-500/20 transition-all">
             <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <PlaneTakeoff className="w-6 h-6 text-amber-500" />
             </div>
             <div>
                <p className="text-4xl font-black tracking-tighter">{opsStats?.todayDepartures || 0}</p>
                <p className="text-[10px] font-black uppercase text-vj-txt3 tracking-[0.2em] mt-2">Check-ins Hoje</p>
             </div>
          </div>

          <div className="md:col-span-3 bento-card p-8 bg-vj-green text-white border-none flex flex-col justify-between group">
             <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6 text-white" />
             </div>
             <div>
                <p className="text-4xl font-black tracking-tighter">Status Ativo</p>
                <p className="text-[10px] font-black uppercase text-white/60 tracking-[0.2em] mt-2">Monitoramento IA</p>
             </div>
          </div>

          <div className="md:col-span-6 bento-card p-8 bg-white border-vj-border flex items-center justify-between group hover:border-vj-green/20 transition-all">
             <div>
                <span className="text-[9px] font-black uppercase text-vj-txt3 tracking-[0.4em]">Sincronização de Rede</span>
                <p className="text-sm font-bold text-vj-txt mt-2 flex items-center gap-2">
                   <div className="h-1.5 w-1.5 rounded-full bg-vj-green" /> Conectado ao GDS Global v4.0
                </p>
             </div>
             <Activity className="w-8 h-8 text-vj-green/30 group-hover:text-vj-green transition-colors" />
          </div>

        </div>

        {/* Market News */}
        <div className="pt-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-vj-txt tracking-tighter uppercase">Radar de Mercado</h2>
            <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-vj-green hover:bg-vj-green/5">Sincronizar Notícias</Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
             {isNewsLoading ? [1,2,3,4].map(i => <Skeleton key={i} className="h-56 rounded-[2rem]" />) : 
               (realNews || []).slice(0, 4).map((news: any) => (
                 <div key={news.id} className="bento-card p-8 bg-white hover:border-vj-green/40 hover:-translate-y-2 transition-all duration-500">
                    <span className="text-[8px] font-black uppercase px-3 py-1 bg-zinc-100 text-vj-txt3 rounded-full mb-6 inline-block tracking-widest">
                       {news.source}
                    </span>
                    <h4 className="font-bold text-base leading-tight line-clamp-3 mb-6 tracking-tight">{news.title}</h4>
                    <div className="flex items-center justify-between mt-auto">
                       <span className="text-[10px] font-bold text-vj-txt3">{new Date(news.published_at).toLocaleDateString('pt-BR')}</span>
                       <ArrowRight className="w-4 h-4 text-vj-green opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                 </div>
               ))
             }
          </div>
        </div>
      </div>

      <QuotationBuilderSheet open={quotationBuilderOpen} onClose={() => setQuotationBuilderOpen(false)} />
    </AppLayout>
  );
}
