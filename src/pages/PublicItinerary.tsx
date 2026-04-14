import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ItinerarySplitView } from '@/components/itinerary/ItinerarySplitView';
import { StopCoordinate } from '@/components/itinerary/ItineraryMap';
import { TurisBadge } from '@/components/ui/TurisBadge';
import { Loader2, Calendar, MapPin, Share2, Download, AlertCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function PublicItinerary() {
  const { token } = useParams<{ token: string }>();

  const { data: itinerary, isLoading, error } = useQuery({
    queryKey: ['public_itinerary', token],
    queryFn: async () => {
      // Fetch itinerary by public_token
      const { data: itin, error: itinErr } = await supabase
        .from('itineraries')
        .select('*')
        .eq('public_token', token!)
        .eq('is_public', true)
        .maybeSingle();

      if (itinErr) throw itinErr;
      if (!itin) throw new Error('Roteiro não encontrado ou não está público.');

      // Fetch stops
      const { data: stops } = await supabase
        .from('itinerary_stops')
        .select('*')
        .eq('itinerary_id', itin.id)
        .order('day_number', { ascending: true })
        .order('position', { ascending: true });

      // Fetch org info
      const { data: org } = await supabase
        .from('organizations')
        .select('name, logo_url, whatsapp, slug')
        .eq('id', itin.org_id)
        .maybeSingle();

      // Increment view_count (fire and forget)
      supabase.from('itineraries').update({ view_count: (itin.view_count || 0) + 1 }).eq('id', itin.id).then(() => {});

      return { ...itin, stops: stops || [], org };
    },
    enabled: !!token,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary opacity-50 mb-4" />
        <p className="text-muted-foreground animate-pulse">Carregando roteiro…</p>
      </div>
    );
  }

  if (error || !itinerary) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-16 h-16 text-destructive/50 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Roteiro Indisponível</h1>
        <p className="text-muted-foreground max-w-md">
          Este roteiro não foi encontrado ou não está mais disponível publicamente.
        </p>
        <TurisBadge />
      </div>
    );
  }

  // Map to StopCoordinate format
  const mappedStops: StopCoordinate[] = itinerary.stops.map((s: any) => ({
    id: s.id,
    lat: s.lat ?? 0,
    lng: s.lng ?? 0,
    name: s.name,
    time: s.time_start,
    category: s.category || s.stop_type,
    emoji: s.emoji,
    description: s.description,
    day_number: s.day_number ?? 1,
  }));

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: itinerary.title,
        text: itinerary.subtitle || 'Confira este roteiro incrível!',
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col overflow-x-hidden font-sans pb-20">
      {/* Hero */}
      <div className="relative w-full h-[45vh] min-h-[300px] flex flex-col justify-end p-6 md:p-12 overflow-hidden shrink-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 p-5 flex justify-between items-start z-20">
          <div className="px-4 py-2 bg-black/30 backdrop-blur-md rounded-xl text-white font-bold tracking-tight">
            {itinerary.org?.name || 'Turis Agências'}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleShare}
              className="rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white backdrop-blur-md"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto w-full">
          <div className="flex flex-wrap gap-2 mb-3">
            {itinerary.destination && (
              <Badge className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border-0">
                <MapPin className="w-3 h-3 mr-1" /> {itinerary.destination}
              </Badge>
            )}
            {itinerary.departure_date && (
              <Badge className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border-0">
                <Calendar className="w-3 h-3 mr-1" />
                {new Date(itinerary.departure_date).toLocaleDateString('pt-BR')}
              </Badge>
            )}
            {itinerary.is_group_itinerary && (
              <Badge className="bg-violet-500/80 hover:bg-violet-500/90 text-white backdrop-blur-md border-0">
                <Users className="w-3 h-3 mr-1" /> Roteiro de Grupo
              </Badge>
            )}
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-2 drop-shadow-lg leading-tight">
            🗺️ {itinerary.title}
          </h1>
          {itinerary.subtitle && (
            <p className="text-white/80 text-lg md:text-xl max-w-3xl drop-shadow font-medium">
              {itinerary.subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Split View */}
      <div className="max-w-[1600px] w-full mx-auto p-4 md:p-6 lg:p-8 flex-1 flex flex-col z-10 -mt-6">
        <div className="bg-background rounded-3xl shadow-xl border border-border/50 overflow-hidden flex-1 h-[800px] md:h-auto min-h-[600px] relative">
          {mappedStops.length > 0 ? (
            <ItinerarySplitView
              stops={mappedStops}
              isEditable={false}
              className="border-0 rounded-none h-full"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-slate-50 dark:bg-zinc-950">
              <MapPin className="w-16 h-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Roteiro em construção</h3>
              <p className="text-muted-foreground max-w-sm">
                Nenhuma parada foi adicionada ainda.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center px-2">
          <div className="text-sm text-muted-foreground">
            Este roteiro teve <strong>{(itinerary.view_count || 1)}</strong> visualização(ões)
          </div>
        </div>
      </div>

      <TurisBadge />
    </div>
  );
}
