import { useParams, useNavigate } from 'react-router-dom';
import { useNewsArticleBySlug, useRadarNews } from '@/hooks/useAiRadar';
import { 
  Newspaper, Calendar, ArrowLeft, ExternalLink, Lightbulb, 
  CheckCircle, Globe, Share2, Loader2, MessageCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

// Função de sanitização básica de strings para exibição segura de HTML em texto simples
function sanitizeText(html: string | null): string {
  if (!html) return '';
  // Remove scripts e tags nocivas
  return html
    .replace(/<script[^>]*>([\S\s]*?)<\/script>/gi, '')
    .replace(/<iframe[^>]*>([\S\s]*?)<\/iframe>/gi, '')
    .replace(/<\/?[^>]+(>|$)/g, ""); // Remove todas as tags HTML para texto puro seguro
}

export default function PublicNewsArticle() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { data: article, isLoading, error } = useNewsArticleBySlug(slug || '');
  const { data: recentNews } = useRadarNews();

  // Atualizar título da página para SEO
  useEffect(() => {
    if (article?.title) {
      document.title = `${article.title} - Radar Turis Agências`;
    }
    return () => {
      document.title = 'Turis Agências - SaaS para Agências de Viagens';
    };
  }, [article?.title]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-vj-green animate-spin" />
          <p className="text-sm font-semibold text-zinc-400">Carregando análise do Radar...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-white p-6 text-center">
        <Newspaper className="w-16 h-16 text-zinc-700 mb-4" />
        <h2 className="text-xl font-bold">Artigo não localizado</h2>
        <p className="text-sm text-zinc-400 mt-2 max-w-md">O link acessado pode ter expirado ou o artigo foi arquivado da curadoria principal.</p>
        <Button className="mt-6 bg-vj-green text-white hover:bg-vj-green/90" onClick={() => navigate('/radar')}>
          Voltar ao Radar
        </Button>
      </div>
    );
  }

  // Filtrar artigos relacionados (mesmo tema ou recentes) excluindo o atual
  const related = recentNews
    ?.filter(n => n.id !== article.id)
    ?.slice(0, 3) || [];

  const handleShare = () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.ai_short_summary || undefined,
        url: shareUrl,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast({ title: 'Link copiado!', description: 'O link do artigo foi copiado para a área de transferência.' });
    }
  };

  // Metadados do artigo
  const relevance = article.ai_relevance_score || 50;
  const category = article.ai_category || 'geral';

  // Bullets formatados
  let bullets: string[] = [];
  if (Array.isArray(article.ai_bullets)) {
    bullets = article.ai_bullets;
  } else if (typeof article.ai_bullets === 'string') {
    try {
      bullets = JSON.parse(article.ai_bullets);
    } catch (_) {
      bullets = [article.ai_bullets];
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      {/* Top Banner de Navegação */}
      <nav className="bg-white border-b border-zinc-100 py-4 px-4 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button variant="ghost" size="sm" className="text-zinc-600 hover:text-zinc-950 gap-1.5" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={handleShare}>
              <Share2 className="w-4 h-4" /> Compartilhar
            </Button>
            <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-zinc-800 gap-1" asChild>
              <a href={article.original_url} target="_blank" rel="noopener noreferrer">
                Fonte Original <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 mt-8 space-y-8">
        
        {/* Artigo Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize text-xs font-bold bg-zinc-100 border-zinc-200 text-zinc-800 py-1 px-3">
              {category}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-zinc-500">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(article.published_at).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            <Badge className="ml-auto bg-emerald-50 text-emerald-700 hover:bg-emerald-50 font-black">
              Relevância: {relevance}%
            </Badge>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 leading-tight tracking-tight">
            {article.title}
          </h1>

          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <span>Fonte original: <strong>{article.source_name}</strong></span>
            {article.author && <span>· Por: {article.author}</span>}
          </div>
        </div>

        {/* Bento Grid Análise Radar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Lado Esquerdo: Resumo & Bullets (Ocupa 2 colunas) */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Box Resumo Inteligente */}
            <Card className="border-zinc-200/60 overflow-hidden rounded-2xl bg-white">
              <CardHeader className="bg-zinc-50/50 border-b border-zinc-100 py-4 px-6">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-600 flex items-center gap-2">
                  <Newspaper className="w-4 h-4 text-vj-green" /> Análise e Resumo do Radar
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <p className="text-zinc-700 text-sm sm:text-base leading-relaxed font-medium">
                  {article.ai_summary || sanitizeText(article.raw_excerpt)}
                </p>

                {bullets.length > 0 && (
                  <div className="pt-4 border-t border-zinc-100 space-y-3">
                    <p className="text-xs font-black uppercase tracking-wider text-zinc-500">Pontos Principais:</p>
                    <ul className="space-y-2">
                      {bullets.map((b, i) => (
                        <li key={i} className="flex gap-2.5 items-start text-sm text-zinc-600 leading-snug">
                          <CheckCircle className="w-4.5 h-4.5 text-vj-green shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Conteúdo Bruto / Detalhado */}
            {(article.raw_content || article.raw_excerpt) && (
              <div className="prose prose-sm max-w-none text-zinc-600 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">Descrição da Notícia</h3>
                <p className="text-sm leading-relaxed whitespace-pre-line bg-white p-6 rounded-2xl border border-zinc-100">
                  {sanitizeText(article.raw_content || article.raw_excerpt)}
                </p>
              </div>
            )}
          </div>

          {/* Lado Direito: Insights & Ações (Ocupa 1 coluna) */}
          <div className="space-y-6">
            
            {/* Box Insights para Agência */}
            {article.ai_travel_agency_insight && (
              <Card className="border-emerald-100 bg-emerald-50/20 rounded-2xl overflow-hidden">
                <CardHeader className="bg-emerald-50 border-b border-emerald-100/50 py-3 px-5">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-emerald-500" /> Insight do Setor
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <p className="text-zinc-800 text-sm leading-relaxed font-semibold">
                    {article.ai_travel_agency_insight}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Box Ação Recomendada */}
            {article.ai_recommended_action && (
              <Card className="border-blue-100 bg-blue-50/20 rounded-2xl overflow-hidden">
                <CardHeader className="bg-blue-50 border-b border-blue-100/50 py-3 px-5">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-blue-500" /> Oportunidade
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <p className="text-zinc-800 text-xs sm:text-sm leading-relaxed font-semibold mb-3">
                    {article.ai_recommended_action}
                  </p>
                  
                  {/* WhatsApp de ação rápida */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-xs font-bold border-emerald-200 text-emerald-700 hover:bg-emerald-50/50"
                    asChild
                  >
                    <a 
                      href={`https://wa.me/?text=${encodeURIComponent(`Olá! Veja esta novidade do mercado turístico: ${article.title} - ${window.location.href}`)}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="w-3.5 h-3.5 mr-2" /> Compartilhar no WhatsApp
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Artigos Relacionados */}
        {related.length > 0 && (
          <div className="pt-8 border-t border-zinc-200 space-y-4">
            <h3 className="text-lg font-black text-zinc-900 tracking-tight flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-zinc-500" /> Outras Análises do Radar
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {related.map(r => (
                <div 
                  key={r.id} 
                  onClick={() => navigate(`/noticias/${r.slug}`)}
                  className="p-5 rounded-xl border border-zinc-200 bg-white hover:border-vj-green/30 transition-all duration-200 cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <Badge variant="outline" className="capitalize text-[9px] font-bold bg-zinc-50 text-zinc-600 mb-2">
                      {r.ai_category || 'geral'}
                    </Badge>
                    <h4 className="font-bold text-sm text-zinc-900 leading-snug line-clamp-2">{r.title}</h4>
                    <p className="text-xs text-zinc-500 line-clamp-2 mt-2 leading-relaxed">{r.ai_short_summary || r.ai_summary}</p>
                  </div>
                  <span className="text-[10px] text-zinc-400 mt-4 block">Fonte: {r.source_name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
