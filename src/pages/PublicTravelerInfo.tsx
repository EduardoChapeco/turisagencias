import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, BookOpen, AlertCircle, Info, CheckCircle2 } from 'lucide-react';

export default function PublicTravelerInfo() {
  const { slug } = useParams<{ slug: string }>();

  const { data: page, isLoading, error } = useQuery({
    queryKey: ['public-traveler-info', slug],
    queryFn: async () => {
      if (!slug) throw new Error('Slug is required');
      const { data, error } = await supabase
        .from('traveler_info_pages')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cb-s0">
        <Loader2 className="h-8 w-8 animate-spin text-cb-accent" />
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-cb-s0 text-center p-4">
        <BookOpen className="h-12 w-12 text-cb-muted mb-4 opacity-50" />
        <h1 className="text-2xl font-bold text-cb-text">Página Indisponível</h1>
        <p className="text-cb-muted mt-2 max-w-md">
          Este conteúdo foi removido, está em modo privado ou o link é inválido.
        </p>
      </div>
    );
  }

  const renderContentBlocks = (blocks: any[]) => {
    return blocks.map((block, idx) => {
      const type = block.type;
      const content = block.content;

      if (type === 'text') {
        return (
          <div key={idx} className="prose prose-sm md:prose-base prose-neutral max-w-none text-cb-text mb-6">
            {content.split('\n').map((paragraph: string, i: number) => (
              <p key={i} className="mb-4 leading-relaxed">{paragraph}</p>
            ))}
          </div>
        );
      }

      if (type === 'alert') {
        const style = content.style || 'neutral';
        const config = {
          neutral: { bg: 'bg-cb-s1', border: 'border-cb-border', text: 'text-cb-text', icon: Info, iconColor: 'text-cb-muted' },
          danger: { bg: 'bg-cb-danger/10', border: 'border-cb-danger/20', text: 'text-cb-danger', icon: AlertCircle, iconColor: 'text-cb-danger' },
          warning: { bg: 'bg-cb-warning/10', border: 'border-cb-warning/30', text: 'text-cb-warning text-yellow-800', icon: AlertCircle, iconColor: 'text-cb-warning font-bold' },
          success: { bg: 'bg-cb-success/10', border: 'border-cb-success/20', text: 'text-cb-success', icon: CheckCircle2, iconColor: 'text-cb-success' },
        }[style as 'neutral'|'danger'|'warning'|'success'];

        const Icon = config.icon;

        return (
          <div key={idx} className={`flex gap-3 p-4 rounded-cb-md border mb-6 ${config.bg} ${config.border}`}>
            <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${config.iconColor}`} />
            <p className={`text-sm md:text-base leading-relaxed ${config.text}`}>
              {content.text}
            </p>
          </div>
        );
      }

      if (type === 'image') {
        return (
          <div key={idx} className="mb-6 rounded-cb-md overflow-hidden bg-cb-s2">
            <img src={content} alt="Content" className="w-full h-auto object-cover max-h-[500px]" loading="lazy" />
          </div>
        );
      }

      return null;
    });
  };

  return (
    <div className="min-h-screen bg-cb-s0 font-sans pb-24">
      {page.cover_image_url && (
        <div className="w-full h-48 md:h-64 lg:h-80 relative bg-cb-s1">
          <img 
            src={page.cover_image_url} 
            alt={page.title} 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cb-s0 to-transparent" />
        </div>
      )}

      <main className={`max-w-3xl mx-auto px-5 md:px-8 ${page.cover_image_url ? '-mt-16 md:-mt-24 relative z-10' : 'pt-16'}`}>
        <header className="mb-10 text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold text-cb-text tracking-tight mb-4">
            {page.title}
          </h1>
          {page.description && (
            <p className="text-lg md:text-xl text-cb-muted font-medium">
              {page.description}
            </p>
          )}
        </header>

        <article className="bg-cb-s0 sm:bg-transparent">
          {page.content_blocks && Array.isArray(page.content_blocks) && page.content_blocks.length > 0 ? (
             renderContentBlocks(page.content_blocks)
          ) : (
            <div className="text-center py-12 text-cb-muted italic">
              Nenhum conteúdo disponível nesta página ainda.
            </div>
          )}
        </article>
      </main>
    </div>
  );
}
