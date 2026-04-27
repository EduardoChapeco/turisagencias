import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, BookOpen, AlertCircle, Info, CheckCircle2 } from 'lucide-react';

const travelerInfoDb = supabase as any;

export default function PublicTravelerInfo() {
  const { slug } = useParams<{ slug: string }>();

  const { data: page, isLoading, error } = useQuery({
    queryKey: ['public-traveler-info', slug],
    queryFn: async () => {
      if (!slug) throw new Error('Slug is required');
      const { data, error } = await travelerInfoDb
        .from('traveler_info_pages')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();
        
      if (error) throw error;
      return data as Record<string, any>;
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-vj-green" />
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white text-center p-4">
        <BookOpen className="h-12 w-12 text-vj-txt3 mb-4 opacity-50" />
        <h1 className="text-2xl font-bold text-vj-txt">Página Indisponível</h1>
        <p className="text-vj-txt3 mt-2 max-w-md">
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
          <div key={idx} className="prose prose-sm md:prose-base prose-neutral max-w-none text-vj-txt mb-6">
            {content.split('\n').map((paragraph: string, i: number) => (
              <p key={i} className="mb-4 leading-relaxed">{paragraph}</p>
            ))}
          </div>
        );
      }

      if (type === 'alert') {
        const style = content.style || 'neutral';
        const config = {
          neutral: { bg: 'bg-vj-bg', border: 'border-vj-border', text: 'text-vj-txt', icon: Info, iconColor: 'text-vj-txt3' },
          danger: { bg: 'bg-vj-red/10', border: 'border-vj-red/20', text: 'text-vj-red', icon: AlertCircle, iconColor: 'text-vj-red' },
          warning: { bg: 'bg-vj-orange/10', border: 'border-vj-orange/30', text: 'text-vj-orange text-yellow-800', icon: AlertCircle, iconColor: 'text-vj-orange font-bold' },
          success: { bg: 'bg-vj-green/10', border: 'border-vj-green/20', text: 'text-vj-green', icon: CheckCircle2, iconColor: 'text-vj-green' },
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
          <div key={idx} className="mb-6 rounded-cb-md overflow-hidden bg-vj-bg">
            <img src={content} alt="Content" className="w-full h-auto object-cover max-h-[500px]" loading="lazy" />
          </div>
        );
      }

      return null;
    });
  };

  return (
    <div className="min-h-screen bg-white font-sans pb-24">
      {page.cover_image_url && (
        <div className="w-full h-48 md:h-64 lg:h-80 relative bg-vj-bg">
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
          <h1 className="text-3xl md:text-5xl font-extrabold text-vj-txt tracking-tight mb-4">
            {page.title}
          </h1>
          {page.description && (
            <p className="text-lg md:text-xl text-vj-txt3 font-medium">
              {page.description}
            </p>
          )}
        </header>

        <article className="bg-white sm:bg-transparent">
          {page.content_blocks && Array.isArray(page.content_blocks) && page.content_blocks.length > 0 ? (
             renderContentBlocks(page.content_blocks)
          ) : (
            <div className="text-center py-12 text-vj-txt3 italic">
              Nenhum conteúdo disponível nesta página ainda.
            </div>
          )}
        </article>
      </main>
    </div>
  );
}
