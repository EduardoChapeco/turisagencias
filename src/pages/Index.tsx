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
      const { data: groupTrips } = await supabase.from('group_trips').select('id, title, destination, current_pax, status, departure_date').eq('org_id', organization!.id);
      const { data: qts } = await supabase.from('quotations').select('id, status').eq('org_id', organization!.id);

      const todayStr = new Date().toISOString().split('T')[0];
      const todayDepartures = (groupTrips || []).filter(t => t.departure_date === todayStr).length;
      
      const traveling = (groupTrips || []).filter(t => t.status === 'traveling');
      const paxTraveling = traveling.reduce((acc, t) => acc + (t.current_pax || 1), 0);

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
        // Split destination to separate city and country approx if needed (e.g. "Paris, France")
        const destParts = t.destination ? t.destination.split(',') : [];
        const res = await geocodeCity(destParts[0] || t.title, destParts[1]?.trim() || t.destination);
        if (res && res.lat !== 0) {
          markers.push({
            id: t.id,
            lat: res.lat,
            lng: res.lng,
            name: t.destination || t.title || 'Passageiro',
            pax: t.current_pax || 1,
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
              {greeting}, <span className="highlight-text">{profile?.first_name || 'Gestor'}</span>
            </h1>
            <p className="text-muted-foreground text-sm mt-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Operações em tempo real. {opsStats?.paxTraveling || 0} viajantes espalhados pelo mundo hoje.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="premium-button border-vj-border bg-white" onClick={() => navigate('/group-trips/new')}>
              <Plane className="h-4 w-4 mr-2 text-vj-green" /> Emitir Voucher
            </Button>
            <Button className="premium-button" onClick={() => setQuotationBuilderOpen(true)}>
              <FileText className="h-4 w-4 mr-2" /> Iniciar Cotação
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
                     <p className="text-3xl font-extrabold">{opsStats?.todayDepartures || 0}</p>
                     <p className="text-xs uppercase tracking-wider text-vj-txt3 font-bold mt-1">Check-ins Liberados Hoje</p>
                  </div>
               </div>
               <ArrowRight className="text-vj-txt3" />
            </div>

            <div className="bg-white border text-vj-txt border-vj-border rounded-[24px] p-5 flex items-center justify-between hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/quotations')}>
               <div className="flex items-center gap-4">
                  <div className="bg-blue-100 text-blue-600 p-3 rounded-2xl"><FileText size={24} /></div>
                  <div>
                     <p className="text-3xl font-extrabold">{opsStats?.activeQuotations || 0}</p>
                     <p className="text-xs uppercase tracking-wider text-vj-txt3 font-bold mt-1">Cotações em Andamento</p>
                  </div>
               </div>
               <ArrowRight className="text-vj-txt3" />
            </div>

            <div className="bg-white border text-vj-txt border-vj-border rounded-[24px] p-5 flex items-center justify-between hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/group-trips')}>
               <div className="flex items-center gap-4">
                  <div className="bg-green-100 text-green-600 p-3 rounded-2xl"><CheckCircle2 size={24} /></div>
                  <div>
                     <p className="text-3xl font-extrabold">{opsStats?.traveling?.length || 0}</p>
                     <p className="text-xs uppercase tracking-wider text-vj-txt3 font-bold mt-1 flex items-center gap-1">Vouchers Emitidos (Em viagem)</p>
                  </div>
               </div>
               <ArrowRight className="text-vj-txt3" />
            </div>
          </div>

          {/* Interactive World Map Block */}
          <div className="col-span-1 md:col-span-2 lg:col-span-4 bg-zinc-950 rounded-[32px] overflow-hidden relative min-h-[350px] group flex flex-col justify-between p-1 shadow-inner">
            <div className="absolute inset-0 z-0">
               <GlobalRadarMapWidget markers={radarMarkers} interactive={false} />
            </div>
            
            <div className="relative z-10 p-5 flex justify-between items-start pointer-events-none">
               <div className="bg-zinc-950/40 backdrop-blur-md p-4 rounded-2xl border border-zinc-800/50">
                  <h3 className="text-white font-bold tracking-widest text-sm uppercase flex items-center gap-2 drop-shadow-md">
                      <Plane className="w-5 h-5 text-green-400" /> Malha de Passageiros
                  </h3>
                  <p className="text-zinc-200 text-xs mt-1 drop-shadow-md">{opsStats?.paxTraveling || 0} viajantes posicionados globalmente.</p>
               </div>
               <div className="flex gap-2 pointer-events-auto">
                 <Button size="sm" variant="outline" className="bg-zinc-950/50 backdrop-blur-md border-zinc-700 text-white hover:bg-zinc-800 h-8" onClick={() => navigate('/radar-global')}>Expandir Mapa 🌍</Button>
               </div>
            </div>
            <div className="relative z-10 p-5 pointer-events-auto">
                <div className="flex items-center gap-3">
                   <div className="bg-zinc-800/80 backdrop-blur-md rounded-2xl px-4 py-2.5 border border-zinc-700/50 max-w-sm flex items-center gap-2 w-full hover:bg-zinc-800 transition-colors">
                       <Search className="w-5 h-5 text-zinc-400" />
                       <Input placeholder="Buscar por cliente, localizador ou voo..." className="bg-transparent border-none text-white focus-visible:ring-0 placeholder:text-zinc-400 h-6 p-0 text-sm font-medium" />
                   </div>
                </div>
            </div>
          </div>
        </div>

        {/* BENTO GRID: Blog & Daily Context */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-8">
           {/* Header / Sidebar for Content Hub */}
           <div className="bg-gradient-to-br from-zinc-50 to-white border border-vj-border rounded-[32px] p-8 lg:row-span-2 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                 <Newspaper className="w-32 h-32 text-vj-green" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                    <div className="bg-vj-green text-white p-2.5 rounded-xl shadow-lg shadow-vj-green/20"><Globe2 className="w-5 h-5" /></div>
                    <h3 className="font-extrabold tracking-tight text-xl text-vj-txt">Daily Digest</h3>
                </div>
                <p className="text-sm font-medium text-vj-txt3 mb-8 leading-relaxed">
                  Conteúdos curados por IA, atualizações e alertas do mercado de turismo B2B e Lazer para pautar o seu dia.
                </p>

                <div className="space-y-6">
                   <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-vj-txt3 mb-3">Acompanhamento Específico</p>
                      <div className="flex flex-wrap gap-2">
                         <span className="bg-white border border-zinc-200 text-vj-txt text-xs px-3.5 py-1.5 rounded-full font-semibold shadow-sm cursor-pointer hover:border-vj-green transition-colors">Mercado Aéreo</span>
                         <span className="bg-white border border-zinc-200 text-vj-txt text-xs px-3.5 py-1.5 rounded-full font-semibold shadow-sm cursor-pointer hover:border-vj-green transition-colors">Destinos Nacionais</span>
                         <span className="bg-white border border-zinc-200 text-vj-txt text-xs px-3.5 py-1.5 rounded-full font-semibold shadow-sm cursor-pointer hover:border-vj-green transition-colors">Regulação</span>
                      </div>
                   </div>
                   
                   <div className="pt-4 border-t border-zinc-100">
                     <p className="text-[11px] font-bold uppercase tracking-wider text-vj-txt3 mb-3">Materiais Úteis</p>
                     <div className="bg-white border border-dashed border-zinc-300 p-4 rounded-xl text-center cursor-pointer hover:bg-zinc-50 transition-colors">
                        <Book className="w-5 h-5 text-vj-txt3 mx-auto mb-2" />
                        <span className="text-xs font-semibold text-vj-txt line-clamp-1">Guia: Melhores práticas Comerciais</span>
                     </div>
                   </div>
                </div>
              </div>
           </div>

           {/* Curated Blog Articles */}
           {isNewsLoading ? (
             [1,2,3,4].map(i => <Skeleton key={i} className="h-[260px] rounded-[32px]" />)
           ) : aiNews.length === 0 ? (
             <div className="col-span-full lg:col-span-3 text-center py-20 bg-zinc-50/50 rounded-[32px] border border-dashed border-zinc-200 flex flex-col items-center justify-center">
                <Newspaper className="w-8 h-8 text-zinc-300 mb-3" />
                <p className="text-sm font-semibold text-vj-txt3">Nenhum informe setorial consolidado até o momento.</p>
             </div>
           ) : aiNews.map((news) => (
               <div key={news.id} onClick={() => navigate('/radar')} className={`p-6 rounded-[32px] border flex flex-col justify-between cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${news.alert ? 'bg-gradient-to-b from-red-50 to-white border-red-200' : 'bg-white border-vj-border'}`}>
                  <div>
                      <div className="flex items-center justify-between mb-4">
                         <div className="flex items-center gap-2">
                             <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-lg ${news.alert ? 'bg-red-500 text-white' : 'bg-zinc-100 text-vj-txt'}`}>{news.tag}</span>
                         </div>
                         <div className="flex items-center gap-1.5 text-xs font-medium text-vj-txt3 bg-zinc-50 px-2.5 py-1 rounded-full border border-zinc-100">
                             <span className="w-1.5 h-1.5 rounded-full bg-vj-green animate-pulse" />
                             {news.source}
                         </div>
                      </div>
                      <h4 className={`font-bold leading-tight ${news.alert ? 'text-red-950 text-xl' : 'text-vj-txt text-lg'} line-clamp-3 mb-3`}>
                          {news.title}
                      </h4>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-zinc-100 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-vj-txt3 tracking-wider uppercase">{news.date}</span>
                      <Button variant="ghost" size="sm" className="h-8 px-3 text-sm font-semibold hover:bg-zinc-100">Ler na íntegra</Button>
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
