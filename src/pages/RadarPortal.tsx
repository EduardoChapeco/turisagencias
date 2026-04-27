import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useRadarNews, useTriggerRadarCrawler } from '@/hooks/useAiRadar';
import { Radar, RefreshCw, AlertTriangle, Newspaper, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/ui/PageHeader';

export default function RadarPortal() {
  const { data: news, isLoading, refetch } = useRadarNews();
  const { mutate: triggerScan, isPending: isScanning } = useTriggerRadarCrawler();
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const handleScan = () => {
    triggerScan(undefined, {
      onSuccess: () => {
        setTimeout(refetch, 1500);
      }
    });
  };

  const tags = Array.from(new Set(news?.flatMap(n => n.ai_classification_tags) || []));
  
  const filteredNews = news?.filter(n => {
    if (!activeFilter) return true;
    return n.ai_classification_tags?.includes(activeFilter);
  });

  return (
    <AppLayout>
      <div className="space-y-4 max-w-[1500px] mx-auto pb-10 px-3 sm:px-4">
        <PageHeader
          title="Radar do Mercado"
          description="Curadoria de notícias e alertas relevantes para turismo, operação e vendas."
          icon={Newspaper}
          actions={
            <Button variant="outline" className="glass-button" onClick={handleScan} disabled={isScanning}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isScanning ? 'animate-spin' : ''}`} />
              {isScanning ? 'Sincronizando...' : 'Atualizar Radar'}
            </Button>
          }
        />

        {/* Filtros por tag */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          <Button
            variant={activeFilter === null ? 'default' : 'outline'}
            className="rounded-xl h-8 px-4 text-xs font-bold shrink-0"
            onClick={() => setActiveFilter(null)}
          >
            Tudo
          </Button>
          {tags.map(tag => (
            <Button
              key={tag}
              variant={activeFilter === tag ? 'default' : 'outline'}
              className="rounded-xl h-8 px-4 text-xs font-bold shrink-0"
              onClick={() => setActiveFilter(tag)}
            >
              {tag}
            </Button>
          ))}
        </div>

        {/* Grid de notícias */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {isLoading && [1,2,3,4,5,6].map(i => (
            <Skeleton key={i} className={`rounded-2xl ${i === 1 ? 'md:col-span-2 md:row-span-2 h-[400px]' : 'h-[220px]'}`} />
          ))}

          {!isLoading && filteredNews?.map((item, index) => {
            const isFeatured = index === 0 && !activeFilter;
            return (
              <div
                key={item.id}
                className={`p-5 rounded-2xl border flex flex-col justify-between group overflow-hidden relative cursor-pointer transition-all duration-300 ${
                  isFeatured
                    ? 'md:col-span-2 md:row-span-2 bg-zinc-950 text-white min-h-[400px]'
                    : item.is_alert
                    ? 'bg-red-50 border-red-200'
                    : 'bg-white border-zinc-200'
                }`}
                onClick={() => window.open(item.url, '_blank')}
              >
                {/* Glow decorativo */}
                {isFeatured && (
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-[100px] pointer-events-none" />
                )}
                {!isFeatured && item.is_alert && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-[50px] pointer-events-none" />
                )}

                <div className="relative z-10">
                  {/* Tags e relevância */}
                  <div className="flex items-start justify-between mb-3 gap-2">
                    <div className="flex flex-wrap gap-1.5">
                      {item.is_alert && (
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg flex items-center gap-1 ${isFeatured ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'}`}>
                          <AlertTriangle className="w-3 h-3" /> URGENTE
                        </span>
                      )}
                      {item.ai_classification_tags?.map(t => (
                        <span key={t} className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg ${isFeatured ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-600'}`}>
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg shrink-0 ${
                      item.ai_relevance_score >= 90
                        ? (isFeatured ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700')
                        : (isFeatured ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700')
                    }`}>
                      {item.ai_relevance_score}
                    </div>
                  </div>

                  {/* Título */}
                  <h3 className={`font-bold leading-snug mb-3 ${isFeatured ? 'text-2xl lg:text-3xl' : 'text-base'} ${item.is_alert && !isFeatured ? 'text-red-950' : ''}`}>
                    {item.title}
                  </h3>

                  {/* Resumo */}
                  <p className={`leading-relaxed line-clamp-3 ${isFeatured ? 'text-zinc-400 text-base' : 'text-sm text-zinc-600'}`}>
                    {item.content_summary || item.full_extracted_content}
                  </p>

                  {/* Justificativa IA */}
                  {item.ai_validation_reason && (
                    <div className={`mt-3 p-3 rounded-xl border flex gap-2 items-start ${isFeatured ? 'bg-zinc-900 border-zinc-800' : 'bg-indigo-50/50 border-indigo-100'}`}>
                      <div className={`p-1 rounded-full shrink-0 ${isFeatured ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
                        <Radar className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className={`text-[10px] font-bold uppercase tracking-wider ${isFeatured ? 'text-indigo-400' : 'text-indigo-600'}`}>Por que é relevante</p>
                        <p className={`text-xs mt-0.5 line-clamp-2 ${isFeatured ? 'text-zinc-300' : 'text-zinc-700'}`}>{item.ai_validation_reason}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className={`relative z-10 mt-4 pt-3 border-t flex items-center justify-between ${isFeatured ? 'border-zinc-800' : 'border-zinc-100'}`}>
                  <div className="flex items-center gap-2">
                    <Newspaper className={`w-3.5 h-3.5 ${isFeatured ? 'text-zinc-500' : 'text-zinc-400'}`} />
                    <span className={`text-xs font-semibold ${isFeatured ? 'text-zinc-400' : 'text-zinc-500'}`}>{item.source}</span>
                  </div>
                  <span className={`text-xs flex items-center gap-1 ${isFeatured ? 'text-zinc-500 hover:text-white' : 'text-zinc-400 hover:text-indigo-600'} transition-colors`}>
                    Ler original <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}

          {/* Estado vazio */}
          {!isLoading && filteredNews?.length === 0 && (
            <div className="col-span-full py-20 text-center flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 rounded-2xl">
              <Newspaper className="w-12 h-12 text-zinc-300 mb-4" />
              <h3 className="text-xl font-bold text-zinc-700">Nenhuma notícia encontrada</h3>
              <p className="text-zinc-500 max-w-sm mt-2">
                Clique em "Atualizar Radar" para buscar as últimas notícias curadas para o setor.
              </p>
              <Button className="mt-6 premium-button" onClick={handleScan}>
                Sincronizar Agora
              </Button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
