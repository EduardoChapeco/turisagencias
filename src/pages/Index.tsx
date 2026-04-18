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
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { useRadarNews } from '@/hooks/useAiRadar';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const navigate = useNavigate();
  const { organization, profile } = useAuthStore();
  const [quotationBuilderOpen, setQuotationBuilderOpen] = useState(false);
  const { data: realNews, isLoading: isNewsLoading } = useRadarNews();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  // Mocked Map Points (Simulating travelers around the world)
  const travelersMap = [
    { id: 1, loc: 'Paris, FR', top: '30%', left: '48%', pax: 4 },
    { id: 2, loc: 'Nova York, EUA', top: '35%', left: '26%', pax: 2 },
    { id: 3, loc: 'Santiago, CL', top: '75%', left: '28%', pax: 6 },
    { id: 4, loc: 'Tóquio, JP', top: '38%', left: '85%', pax: 1 },
    { id: 5, loc: 'Rio de Janeiro, BR', top: '65%', left: '34%', pax: 12 },
  ];

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
              Operações normais. 12 passageiros em voo neste momento.
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
            <div className="bg-white border text-vj-txt border-vj-border rounded-[24px] p-5 flex items-center justify-between hover:shadow-lg transition-shadow cursor-pointer">
               <div className="flex items-center gap-4">
                  <div className="bg-amber-100 text-amber-600 p-3 rounded-2xl"><PlaneTakeoff size={24} /></div>
                  <div>
                     <p className="text-2xl font-bold">14</p>
                     <p className="text-xs uppercase tracking-wider text-vj-txt3 font-semibold">Embarques Hoje</p>
                  </div>
               </div>
               <ArrowRight className="text-vj-txt3" />
            </div>

            <div className="bg-white border text-vj-txt border-vj-border rounded-[24px] p-5 flex items-center justify-between hover:shadow-lg transition-shadow cursor-pointer">
               <div className="flex items-center gap-4">
                  <div className="bg-blue-100 text-blue-600 p-3 rounded-2xl"><CheckCircle2 size={24} /></div>
                  <div>
                     <p className="text-2xl font-bold">28</p>
                     <p className="text-xs uppercase tracking-wider text-vj-txt3 font-semibold flex items-center gap-1">Check-ins Liberados <span className="bg-vj-red text-white text-[9px] px-1.5 py-0.5 rounded-full ml-1">5 pendentes</span></p>
                  </div>
               </div>
               <ArrowRight className="text-vj-txt3" />
            </div>

            <div className="bg-white border text-vj-txt border-vj-border rounded-[24px] p-5 flex items-center justify-between hover:shadow-lg transition-shadow cursor-pointer">
               <div className="flex items-center gap-4">
                  <div className="bg-green-100 text-green-600 p-3 rounded-2xl"><Ticket size={24} /></div>
                  <div>
                     <p className="text-2xl font-bold">42</p>
                     <p className="text-xs uppercase tracking-wider text-vj-txt3 font-semibold flex items-center gap-1">Vouchers Prontos <span className="bg-vj-green/20 text-vj-green text-[9px] px-1.5 py-0.5 rounded-full ml-1">Para Envio</span></p>
                  </div>
               </div>
               <ArrowRight className="text-vj-txt3" />
            </div>
          </div>

          {/* Interactive World Map Block */}
          <div className="col-span-1 md:col-span-2 lg:col-span-4 bg-zinc-950 rounded-[32px] overflow-hidden relative min-h-[350px] group flex flex-col justify-between">
            {/* Absolute Map Background Graphic (Simulated for Demo) */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            <div className="absolute -inset-10 opacity-30 bg-center bg-no-repeat bg-contain" style={{ backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')", filter: 'invert(1) grayscale(100%)' }}></div>
            
            {/* Map Pins */}
            {travelersMap.map((pt) => (
                <div key={pt.id} className="absolute group/pin cursor-pointer transform -translate-x-1/2 -translate-y-1/2 hover:z-50 transition-all" style={{ top: pt.top, left: pt.left }}>
                    <div className="relative">
                       <span className="animate-ping absolute -inset-1 rounded-full bg-vj-green opacity-75"></span>
                       <div className="relative bg-vj-green w-3 h-3 rounded-full border-2 border-zinc-950"></div>
                       {/* Tooltip */}
                       <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max bg-white/90 backdrop-blur pb-1 px-3 py-2 rounded-xl text-zinc-950 opacity-0 group-hover/pin:opacity-100 transition-opacity">
                           <p className="text-[10px] font-bold uppercase">{pt.loc}</p>
                           <p className="text-xs font-medium">{pt.pax} passageiros</p>
                       </div>
                    </div>
                </div>
            ))}

            <div className="relative z-10 p-6 flex justify-between items-start">
               <div>
                  <h3 className="text-white font-bold tracking-widest text-sm uppercase flex items-center gap-2">
                      <Globe2 className="w-4 h-4 text-green-400" /> Radares de Passageiros
                  </h3>
                  <p className="text-zinc-400 text-xs mt-1">25 pax no exterior hoje</p>
               </div>
               <div className="flex gap-2">
                 <Button size="sm" variant="outline" className="bg-transparent border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 h-8">Ver Lista</Button>
               </div>
            </div>
            <div className="relative z-10 p-6">
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
                  <h3 className="font-bold text-lg text-vj-txt">Radar de Notícias</h3>
              </div>
              <p className="text-sm text-vj-txt3 mb-6">Notícias filtradas e validadas pela Inteligência Artificial para agentes.</p>

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
                     <span>Personalizar Radar</span>
                     <ArrowRight className="w-4 h-4 text-vj-txt3 group-hover:translate-x-1 transition-transform" />
                 </Button>
              </div>
           </div>

           {/* News Cards */}
           {isNewsLoading ? (
             [1,2,3,4].map(i => <Skeleton key={i} className="h-48 rounded-[32px]" />)
           ) : aiNews.length === 0 ? (
             <div className="col-span-full xl:col-span-3 text-center py-10 italic text-vj-txt3 text-sm">
                Radar limpo. Escaneie as notícias no Portal Radar.
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
