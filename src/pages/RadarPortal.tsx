import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { useRadarNews, useTriggerRadarSync } from '@/hooks/useAiRadar';
import { 
  Radar, RefreshCw, AlertTriangle, Newspaper, ExternalLink, 
  ArrowRight, BookOpen, Settings, Lightbulb, CheckSquare 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/ui/PageHeader';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const CATEGORY_COLORS: Record<string, string> = {
  turismo: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  aviacao: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  hotelaria: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
  cruzeiros: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
  vistos: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
  economia: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  marketing: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  geral: 'bg-zinc-500/10 text-zinc-600 border-zinc-500/20',
};

export default function RadarPortal() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: news, isLoading, refetch } = useRadarNews();
  const { mutate: triggerSync, isPending: isSyncing } = useTriggerRadarSync();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const handleSync = () => {
    triggerSync(undefined, {
      onSuccess: (data: any) => {
        toast({
          title: data?.fallback ? 'Sincronização Simulada' : 'Sincronização Concluída',
          description: `Foram importadas ${data?.processed || 0} novas notícias com sucesso.`
        });
        refetch();
      },
      onError: (err: any) => {
        toast({
          title: 'Erro ao sincronizar',
          description: err.message || 'Houve uma falha na sincronização dos feeds.',
          variant: 'destructive'
        });
      }
    });
  };

  const categories = Array.from(new Set(news?.map(n => n.ai_category || 'geral') || []));
  
  const filteredNews = news?.filter(n => {
    if (!activeCategory) return true;
    return (n.ai_category || 'geral') === activeCategory;
  });

  return (
    <AppLayout>
      <div className="space-y-6 max-w-[1600px] mx-auto pb-10 px-4 sm:px-6">
        <PageHeader
          title="Radar do Mercado"
          description="Radar inteligente de notícias, alertas de voos, vistos e análises comerciais B2B."
          icon={Newspaper}
          actions={
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="border-zinc-200" 
                onClick={() => navigate('/news-cms')}
              >
                <Settings className="w-4 h-4 mr-2" />
                CMS & Fontes
              </Button>
              <Button 
                className="bg-vj-green text-white hover:bg-vj-green/90" 
                onClick={handleSync} 
                disabled={isSyncing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}
              </Button>
            </div>
          }
        />

        {/* Filtros por Categoria */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar border-b border-zinc-100">
          <Button
            variant={activeCategory === null ? 'default' : 'outline'}
            className="rounded-full h-8 px-4 text-xs font-bold shrink-0"
            onClick={() => setActiveCategory(null)}
          >
            Tudo
          </Button>
          {categories.map(cat => (
            <Button
              key={cat}
              variant={activeCategory === cat ? 'default' : 'outline'}
              className="rounded-full h-8 px-4 text-xs font-bold shrink-0 capitalize"
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Grid Bento OMEGA */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {isLoading && [1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="rounded-2xl h-[280px] bg-zinc-100 border border-zinc-200" />
          ))}

          {!isLoading && filteredNews?.map((item, index) => {
            const isFeatured = index === 0 && !activeCategory;
            const category = item.ai_category || 'geral';
            const relevance = item.ai_relevance_score || 50;
            const isAlert = relevance >= 85 || item.ai_sentiment === 'alerta';

            return (
              <div
                key={item.id}
                className={`p-6 rounded-2xl border flex flex-col justify-between transition-all duration-300 relative overflow-hidden group ${
                  isFeatured
                    ? 'md:col-span-2 bg-gradient-to-br from-zinc-950 to-zinc-900 text-white border-zinc-800 hover:border-zinc-700'
                    : isAlert
                    ? 'bg-rose-50/40 border-rose-100 hover:border-rose-300'
                    : 'bg-white border-zinc-200 hover:border-vj-green/40'
                }`}
              >
                {/* Glow decorativo */}
                {isFeatured && (
                  <div className="absolute top-0 right-0 w-80 h-80 bg-vj-green/10 blur-[120px] pointer-events-none" />
                )}
                {isAlert && !isFeatured && (
                  <div className="absolute top-0 right-0 w-40 h-40 bg-rose-500/5 blur-[60px] pointer-events-none" />
                )}

                <div className="space-y-4">
                  {/* Top Header */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`capitalize font-bold border ${isFeatured ? 'bg-zinc-800 text-zinc-300 border-zinc-700' : CATEGORY_COLORS[category]}`}>
                        {category}
                      </Badge>
                      <span className={`text-[10px] font-semibold ${isFeatured ? 'text-zinc-500' : 'text-zinc-400'}`}>
                        {new Date(item.published_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    
                    {/* Score de relevância */}
                    <div className="flex items-center gap-1">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${isFeatured ? 'text-zinc-400' : 'text-zinc-500'}`}>Relevância</span>
                      <Badge className={`font-black ${
                        relevance >= 85 
                          ? 'bg-rose-500 text-white' 
                          : relevance >= 70 
                          ? 'bg-amber-500 text-white' 
                          : 'bg-zinc-500 text-white'
                      }`}>
                        {relevance}%
                      </Badge>
                    </div>
                  </div>

                  {/* Título */}
                  <h3 className={`font-bold leading-tight group-hover:text-vj-green transition-colors cursor-pointer ${
                    isFeatured ? 'text-2xl lg:text-3xl' : 'text-lg'
                  } ${isAlert && !isFeatured ? 'text-rose-950' : 'text-zinc-900'}`}
                  onClick={() => navigate(`/noticias/${item.slug}`)}>
                    {item.title}
                  </h3>

                  {/* Resumo */}
                  <p className={`line-clamp-3 text-sm leading-relaxed ${isFeatured ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    {item.ai_short_summary || item.ai_summary || item.raw_excerpt}
                  </p>

                  {/* Insight da Agência (Bento Element) */}
                  {item.ai_travel_agency_insight && (
                    <div className={`p-4 rounded-xl border flex gap-3 ${
                      isFeatured 
                        ? 'bg-zinc-900/50 border-zinc-800 text-zinc-300' 
                        : 'bg-emerald-50/30 border-emerald-100 text-zinc-800'
                    }`}>
                      <Lightbulb className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Por que isso importa:</p>
                        <p className="text-xs mt-1 leading-snug">{item.ai_travel_agency_insight}</p>
                      </div>
                    </div>
                  )}

                  {/* Ação Comercial Recomendada */}
                  {item.ai_recommended_action && !isFeatured && (
                    <div className="p-3 rounded-xl bg-blue-50/30 border border-blue-100/50 text-zinc-800 flex gap-2.5 items-start">
                      <CheckSquare className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-blue-600">Ação Sugerida:</p>
                        <p className="text-xs text-zinc-700 leading-snug">{item.ai_recommended_action}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className={`mt-6 pt-4 border-t flex items-center justify-between ${
                  isFeatured ? 'border-zinc-800' : 'border-zinc-100'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${isFeatured ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      Fonte: {item.source_name}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <a 
                      href={item.original_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className={`text-xs flex items-center gap-1 hover:underline ${isFeatured ? 'text-zinc-500 hover:text-white' : 'text-zinc-400 hover:text-zinc-600'}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      Original <ExternalLink className="w-3 h-3" />
                    </a>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className={`h-8 gap-1.5 hover:bg-transparent ${isFeatured ? 'text-white hover:text-vj-green' : 'text-zinc-800 hover:text-vj-green'}`}
                      onClick={() => navigate(`/noticias/${item.slug}`)}
                    >
                      Ver Análise <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Estado Vazio */}
          {!isLoading && filteredNews?.length === 0 && (
            <div className="col-span-full py-20 text-center flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50">
              <Newspaper className="w-12 h-12 text-zinc-300 mb-4" />
              <h3 className="text-xl font-bold text-zinc-700">Radar Sem Notícias</h3>
              <p className="text-zinc-500 max-w-sm mt-2 text-sm">
                Nenhum artigo encontrado nesta categoria. Sincronize o radar com os feeds cadastrados para importar dados.
              </p>
              <Button className="mt-6 bg-vj-green text-white hover:bg-vj-green/90" onClick={handleSync} disabled={isSyncing}>
                {isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
