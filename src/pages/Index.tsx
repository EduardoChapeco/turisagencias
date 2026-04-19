import { useNavigate } from 'react-router-dom';
import {
  FileText, Plane, PlaneTakeoff, CalendarHeart,
  Globe2, Newspaper, ArrowRight, DollarSign, Users2, CheckCircle2, Ticket, MapPin, Search
} from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
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

export default function Dashboard() {
  const navigate = useNavigate();
  const { organization, profile } = useAuthStore();
  const [quotationBuilderOpen, setQuotationBuilderOpen] = useState(false);
  const { data: realNews, isLoading: isNewsLoading } = useRadarNews();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  const { data: opsStats } = useQuery({
    queryKey: ['dashboard_ops_stats', organization?.id],
    queryFn: async () => {
      const { data: trips } = await supabase.from('trips').select('id, title, destination_city, destination_country, pax_count, status, departure_date').eq('org_id', organization!.id);
      const { data: qts } = await supabase.from('quotations').select('id, status').eq('org_id', organization!.id);

      const todayStr = new Date().toISOString().split('T')[0];
      const todayDepartures = (trips || []).filter(t => t.departure_date === todayStr).length;
      
      const traveling = (trips || []).filter(t => t.status === 'traveling');
      const paxTraveling = traveling.reduce((acc, t) => acc + (t.pax_count || 1), 0);

      const activeQuotations = (qts || []).filter(q => q.status === 'sent' || q.status === 'viewed').length;

      return {
        todayDepartures,
        activeQuotations,
        traveling,
        paxTraveling
      };
    },
    enabled: !!organization?.id
  });

  const [radarMarkers, setRadarMarkers] = useState<RadarMarker[]>([]);

  useEffect(() => {
    if (!opsStats?.traveling) return;
    let isActive = true;

    const buildMarkers = async () => {
      const markers: RadarMarker[] = [];
      const colors = ['#10b981', '#3b82f6', '#f43f5e', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
      
      for (let i = 0; i < opsStats.traveling.length; i++) {
        const t = opsStats.traveling[i];
        const res = await geocodeCity(t.destination_city || t.title, t.destination_country);
        if (res && res.lat !== 0) {
          markers.push({
            id: t.id,
            lat: res.lat,
            lng: res.lng,
            name: t.destination_city || t.title || 'Passageiro',
            pax: t.pax_count || 1,
            color: colors[i % colors.length]
          });
        }
      }
      if (isActive) setRadarMarkers(markers);
    };

    buildMarkers();

    return () => { isActive = false; };
  }, [opsStats?.traveling]);

  // Map real news to fit the existing UI, taking top 4 most critical
  const aiNews = (realNews || []).slice(0, 4).map(n => ({
    id: n.id,
    tag: n.ai_classification_tags?.[0] || 'Geral',
    source: n.source,
    title: n.title,
    date: new Date(n.published_at).toLocaleDateString('pt-BR'),
    rating: n.ai_relevance_score,
    verified: true,
    alert: n.is_alert,
    url: n.url
  }));

  return (
    <AppLayout>
      <div className="space-y-6 max-w-[1500px] mx-auto pb-10 px-4 sm:px-6 mt-4">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
          <div>
            <h1 className="font-heading text-4xl font-extrabold tracking-tight">
              {greeting}, <span className="highlight-text">{profile?.first_name || 'Agente'}</span>
            </h1>
            <p className="text-muted-foreground text-sm mt-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Operações normais. {opsStats?.paxTraveling || 0} passageiros em viagem no momento.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="premium-button border-vj-border bg-white" onClick={() => navigate('/trips/new')}>
              <Plane className="h-4 w-4 mr-2 text-vj-green" /> Nova Viagem
            </Button>
            <Button className="premium-button" onClick={() => setQuotationBuilderOpen(true)}>
              <FileText className="h-4 w-4 mr-2" /> Nova Cotação
            </Button>
          </div>
        </div>

        {/* BENTO GRID: Operations & Map */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
          
          {/* Quick Ops Panel */}
          <div className="col-span-1 md:col-span-2 lg:col-span-2 grid grid-rows-3 gap-4">
            <div className="bg-white border text-vj-txt border-vj-border rounded-[24px] p-5 flex items-center justify-between hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/kanban/departures')}>
               <div className="flex items-center gap-4">
                  <div className="bg-amber-100 text-amber-600 p-3 rounded-2xl"><PlaneTakeoff size={24} /></div>
                  <div>
                     <p className="text-2xl font-bold">{opsStats?.todayDepartures || 0}</p>
                     <p className="text-xs uppercase tracking-wider text-vj-txt3 font-semibold">Embarques Hoje</p>
                  </div>
               </div>
               <ArrowRight className="text-vj-txt3" />
            </div>

            <div className="bg-white border text-vj-txt border-vj-border rounded-[24px] p-5 flex items-center justify-between hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/quotations')}>
               <div className="flex items-center gap-4">
                  <div className="bg-blue-100 text-blue-600 p-3 rounded-2xl"><FileText size={24} /></div>
                  <div>
                     <p className="text-2xl font-bold">{opsStats?.activeQuotations || 0}</p>
                     <p className="text-xs uppercase tracking-wider text-vj-txt3 font-semibold flex items-center gap-1">Cotações Abertas</p>
                  </div>
               </div>
               <ArrowRight className="text-vj-txt3" />
            </div>

            <div className="bg-white border text-vj-txt border-vj-border rounded-[24px] p-5 flex items-center justify-between hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/trips')}>
               <div className="flex items-center gap-4">
                  <div className="bg-green-100 text-green-600 p-3 rounded-2xl"><Globe2 size={24} /></div>
                  <div>
                     <p className="text-2xl font-bold">{opsStats?.traveling?.length || 0}</p>
                     <p className="text-xs uppercase tracking-wider text-vj-txt3 font-semibold flex items-center gap-1">Viagens em Curso <span className="bg-vj-green/20 text-vj-green text-[9px] px-1.5 py-0.5 rounded-full ml-1">{opsStats?.paxTraveling || 0} pax</span></p>
                  </div>
               </div>
               <ArrowRight className="text-vj-txt3" />
            </div>
          </div>

          {/* Interactive World Map Block */}
          <div className="col-span-1 md:col-span-2 lg:col-span-4 bg-zinc-950 rounded-[32px] overflow-hidden relative min-h-[350px] group flex flex-col justify-between p-1">
            <div className="absolute inset-0 z-0">
               <GlobalRadarMapWidget markers={radarMarkers} interactive={false} />
            </div>
            
            <div className="relative z-10 p-5 flex justify-between items-start pointer-events-none">
               <div>
                  <h3 className="text-white font-bold tracking-widest text-sm uppercase flex items-center gap-2 drop-shadow-md">
                      <Globe2 className="w-4 h-4 text-green-400" /> Radares de Passageiros
                  </h3>
                  <p className="text-zinc-200 text-xs mt-1 drop-shadow-md">{opsStats?.paxTraveling || 0} pax no exterior hoje</p>
               </div>
               <div className="flex gap-2 pointer-events-auto">
                 <Button size="sm" variant="outline" className="bg-zinc-950/50 backdrop-blur-md border-zinc-700 text-white hover:bg-zinc-800 h-8" onClick={() => navigate('/radar-global')}>Tela Cheia 🌍</Button>
               </div>
            </div>
            <div className="relative z-10 p-5 pointer-events-auto">
                <div className="flex items-center gap-3">
                   <div className="bg-zinc-800/50 backdrop-blur-md rounded-full px-4 py-2 border border-zinc-700/50 max-w-sm flex items-center gap-2 w-full">
                       <Search className="w-4 h-4 text-zinc-400" />
                       <Input placeholder="Buscar voo ou passageiro..." className="bg-transparent border-none text-white focus-visible:ring-0 placeholder:text-zinc-500 h-6 p-0 text-sm" />
                   </div>
                </div>
            </div>
          </div>
        </div>

        {/* BENTO GRID: AI Curated News Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
           {/* Header / Sidebar for News */}
           <div className="bg-white border border-vj-border rounded-[32px] p-6 lg:row-span-2">
              <div className="flex items-center gap-2 mb-2">
                  <div className="bg-vj-green/10 text-vj-green p-2 rounded-xl"><Newspaper className="w-5 h-5" /></div>
                  <h3 className="font-bold text-lg text-vj-txt">Portal de Notícias</h3>
              </div>
              <p className="text-sm text-vj-txt3 mb-6">Atualizações estratégicas e comunicados importantes do setor de turismo B2B.</p>

              <div className="space-y-4">
                 <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-vj-txt3 mb-2">Filtros Ativos</p>
                    <div className="flex flex-wrap gap-2">
                       <span className="bg-zinc-100 text-vj-txt text-xs px-3 py-1 rounded-full font-medium">Turismo de Lazer</span>
                       <span className="bg-zinc-100 text-vj-txt text-xs px-3 py-1 rounded-full font-medium">Companhias Aéreas</span>
                       <span className="bg-zinc-100 text-vj-txt text-xs px-3 py-1 rounded-full font-medium">Vistos</span>
                    </div>
                 </div>
                 <Button variant="outline" className="w-full justify-between group h-12 rounded-xl border-vj-border hover:bg-zinc-50">
                     <span>Acessar Portal Completo</span>
                     <ArrowRight className="w-4 h-4 text-vj-txt3 group-hover:translate-x-1 transition-transform" />
                 </Button>
              </div>
           </div>

           {/* News Cards */}
           {isNewsLoading ? (
             [1,2,3,4].map(i => <Skeleton key={i} className="h-48 rounded-[32px]" />)
           ) : aiNews.length === 0 ? (
             <div className="col-span-full xl:col-span-3 text-center py-10 italic text-vj-txt3 text-sm">
                Portal aguardando novas informações corporativas.
             </div>
           ) : aiNews.map((news) => (
               <div key={news.id} onClick={() => navigate('/radar')} className={`p-6 rounded-[32px] border flex flex-col justify-between cursor-pointer transition-transform hover:-translate-y-1 ${news.alert ? 'bg-red-50 border-red-200' : 'bg-white border-vj-border'}`}>
                  <div>
                      <div className="flex items-center justify-between mb-4">
                         <div className="flex items-center gap-2">
                             <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg ${news.alert ? 'bg-red-100 text-red-600' : 'bg-zinc-100 text-zinc-600'}`}>{news.tag}</span>
                             <span className="text-xs text-vj-txt3">{news.source}</span>
                         </div>
                         {news.verified && (
                             <div className="flex flex-col items-end">
                                <span className="text-[9px] font-bold text-vj-green uppercase">Validado - AI</span>
                                <span className="text-[10px] text-vj-txt3">{news.rating}% relevância</span>
                             </div>
                         )}
                      </div>
                      <h4 className={`font-bold leading-snug line-clamp-3 ${news.alert ? 'text-red-950 text-base' : 'text-vj-txt text-sm'}`}>
                          {news.title}
                      </h4>
                  </div>
                  <div className="mt-4 pt-4 border-t border-black/5 flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-vj-txt3">{news.date}</span>
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-vj-green hover:bg-vj-green/10 -mr-2">Detalhes</Button>
                  </div>
               </div>
           ))}
        </div>
      </div>

      <QuotationBuilderSheet 
        open={quotationBuilderOpen} 
        onClose={() => setQuotationBuilderOpen(false)} 
      />
    </AppLayout>
  );
}
