import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BentoGrid, BentoCell } from '@/components/ui/BentoGrid';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Loader2, MapPin, Globe2, Sun, CreditCard, Car, Languages } from 'lucide-react';

export default function PublicGuide() {
  const { slug } = useParams<{ slug: string }>();

  const { data: guide, isLoading, error } = useQuery({
    queryKey: ['public-guide', slug],
    queryFn: async () => {
      if (!slug) throw new Error('Slug is required');
      const { data, error } = await supabase
        .from('destination_guides')
        .select('*')
        .eq('is_published', true) as any;
        
      if (error) throw error;
      const match = (data as any[])?.find((g: any) => g.slug === slug);
      if (!match) throw new Error('Guide not found');
      return match;
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

  if (error || !guide) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-cb-s0 text-center p-4">
        <Globe2 className="h-12 w-12 text-cb-muted mb-4 opacity-50" />
        <h1 className="text-2xl font-bold text-cb-text">Guia Indisponível</h1>
        <p className="text-cb-muted mt-2 max-w-md">
          Este guia de destino foi removido, está em modo privado ou a URL é inválida. 
          Consulte seu agente de viagens.
        </p>
      </div>
    );
  }

  return (
    <PublicLayout orgName="Guia de Destino Exclusivo">
      <div className="mb-8 mt-4 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold text-cb-text tracking-tight mb-2">
          {guide.city}
        </h1>
        <p className="text-xl md:text-2xl text-cb-muted font-medium flex items-center justify-center gap-2">
          <MapPin className="h-5 w-5" /> {guide.country}
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-12 mt-8 md:mt-12 space-y-8">
        
        {/* Intro */}
        {guide.intro && (
          <section className="bg-cb-s1 rounded-cb-lg p-6 md:p-8 border border-cb-border shadow-sm">
            <h2 className="text-xl font-bold text-cb-text mb-4">Sobre o Destino</h2>
            <p className="text-cb-text/80 leading-relaxed whitespace-pre-wrap text-lg">
              {guide.intro}
            </p>
          </section>
        )}

        {/* Bento Grid Logística */}
        <BentoGrid cols={2} gap="md">
          <BentoCell padding="lg" variant="default" className="shadow-sm">
            <h3 className="font-semibold mb-4 text-cb-text flex items-center gap-2">
              <Sun className="h-5 w-5 text-cb-accent" /> Clima e Estações
            </h3>
            <p className="text-sm text-cb-text/80 leading-relaxed whitespace-pre-wrap">
              {guide.climate_info || 'Sem informações cadastradas.'}
            </p>
          </BentoCell>
          
          <BentoCell padding="lg" variant="default" className="shadow-sm">
            <h3 className="font-semibold mb-4 text-cb-text flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-cb-warning" /> Moeda
            </h3>
            <p className="text-sm text-cb-text/80 leading-relaxed whitespace-pre-wrap">
              {guide.currency_info || 'Sem informações cadastradas.'}
            </p>
          </BentoCell>
        </BentoGrid>

        <BentoGrid cols={2} gap="md">
          <BentoCell padding="lg" variant="default" className="shadow-sm">
            <h3 className="font-semibold mb-4 text-cb-text flex items-center gap-2">
              <Languages className="h-5 w-5 text-cb-success" /> Idioma
            </h3>
            <p className="text-sm text-cb-text/80 leading-relaxed whitespace-pre-wrap">
              {guide.language_tips || 'Sem informações cadastradas.'}
            </p>
          </BentoCell>

          <BentoCell padding="lg" variant="default" className="shadow-sm">
            <h3 className="font-semibold mb-4 text-cb-text flex items-center gap-2">
              <Car className="h-5 w-5 text-cb-muted" /> Transporte Local
            </h3>
            <p className="text-sm text-cb-text/80 leading-relaxed whitespace-pre-wrap">
              {guide.transportation || 'Sem informações cadastradas.'}
            </p>
          </BentoCell>
        </BentoGrid>
        
      </div>
    </PublicLayout>
  );
}
