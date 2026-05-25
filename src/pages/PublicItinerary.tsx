import { logger } from '@/utils/logger';

import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ItinerarySplitView } from '@/components/itinerary/ItinerarySplitView';
import { StopCoordinate } from '@/components/itinerary/ItineraryMap';
import { TurisBadge } from '@/components/ui/TurisBadge';
import { Loader2, Calendar, MapPin, Share2, Download, AlertCircle, Users, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const publicItineraryDb = supabase as any;

export default function PublicItinerary() {
  const { token } = useParams<{ token: string }>();

  const { data: itinerary, isLoading, error } = useQuery({
    queryKey: ['public_itinerary', token],
    queryFn: async () => {
      // Fetch itinerary by public_token
      const { data: itin, error: itinErr } = await publicItineraryDb
        .from('itineraries')
        .select('*')
        .eq('public_token', token!)
        .eq('is_public', true)
        .maybeSingle();

      if (itinErr) throw itinErr;
      if (!itin) throw new Error('Roteiro não encontrado ou não está público.');

      // Fetch stops
      const { data: stops } = await publicItineraryDb
        .from('itinerary_stops')
        .select('*')
        .eq('itinerary_id', itin.id)
        .order('day_number', { ascending: true })
        .order('position', { ascending: true });

      // Fetch org info
      const { data: org } = await publicItineraryDb
        .from('organizations')
        .select('name, logo_url, whatsapp, slug')
        .eq('id', itin.org_id)
        .maybeSingle();

      // Increment view_count (best effort, ignore if RPC doesn't exist)
      publicItineraryDb.rpc('increment_itinerary_view', { p_token: token! }).then(() => {});

      return { ...itin, stops: stops || [], org };
    },
    enabled: !!token,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', whatsapp: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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
      }).catch(logger.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado!');
    }
  };

  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.whatsapp) {
      toast.error('Preencha seu nome e whatsapp!');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const { error } = await publicItineraryDb.from('itinerary_leads').insert({
        itinerary_id: itinerary.id,
        org_id: itinerary.org_id,
        name: formData.name,
        email: formData.email,
        whatsapp: formData.whatsapp,
        action: itinerary.is_group_itinerary ? 'group_interest' : 'general_interest',
        utm_source: token
      } as Record<string, any>);
      
      if (error) throw error;
      
      // Update local pax count artificially to seem reactive
      if (itinerary.current_pax !== undefined) {
         itinerary.current_pax += 1;
      }
      setIsSuccess(true);
      toast.success('Interesse registrado com sucesso! Em breve entraremos em contato.');
    } catch (err) {
      logger.error(err);
      toast.error('Ocorreu um erro ao registrar seu interesse.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadImage = async () => {
    if (!exportRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(exportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#09090b', // dark background matching zinc-950
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `roteiro-${itinerary.title.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      logger.error('Erro ao exportar imagem:', err);
      alert('Não foi possível exportar a imagem. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col overflow-x-hidden font-sans pb-20">
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
              onClick={handleDownloadImage}
              disabled={isExporting}
              title="Salvar como Imagem"
              className="rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white backdrop-blur-md"
            >
              {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
            </Button>
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
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-2 leading-tight">
            🗺️ {itinerary.title}
          </h1>
          {itinerary.subtitle && (
            <p className="text-white/80 text-lg md:text-xl max-w-3xl font-medium">
              {itinerary.subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Split View */}
      <div className="max-w-[1600px] w-full mx-auto p-4 md:p-6 lg:p-8 flex-1 flex flex-col z-10 -mt-6">
        <div className="bg-background rounded-3xl  border border-border/50 overflow-hidden flex-1 h-[800px] md:h-auto min-h-[600px] relative">
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

        {/* Group Registration / Interest Form */}
        {itinerary.is_group_itinerary && (
          <div className="mt-8 max-w-2xl mx-auto w-full">
            <Card className="rounded-3xl border-vj-green/20  bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md overflow-hidden relative">
               <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
               <div className="absolute bottom-0 left-0 w-32 h-32 bg-fuchsia-500/10 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none" />
               
               <CardHeader className="text-center relative z-10 pb-4">
                 <div className="mx-auto w-12 h-12 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-full flex items-center justify-center mb-3 ">
                   <Users className="w-6 h-6" />
                 </div>
                 <Badge className="bg-violet-500 text-white w-fit mx-auto mb-2 pointer-events-none">Vagas Abertas</Badge>
                 <CardTitle className="text-3xl font-extrabold tracking-tight">Garanta Sua Vaga no Grupo</CardTitle>
                 <CardDescription className="text-base mt-2">
                   {itinerary.group_name || itinerary.title}
                 </CardDescription>
                 
               </CardHeader>

               <CardContent className="relative z-10">
                 {isSuccess ? (
                   <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 p-6 rounded-2xl text-center font-medium border border-green-200 dark:border-green-900/50">
                     ✨ Inscrição prévia realizada com sucesso!<br/>
                     Nossa equipe do WhatsApp oficial vai entrar em contato com você em breve para alinhar os detalhes.
                   </div>
                 ) : (
                   <form onSubmit={handleSubmitLead} className="space-y-4">
                     <div className="grid gap-2">
                       <Label>Nome Completo*</Label>
                       <Input 
                         required 
                         placeholder="Como você gostaria de ser chamado?" 
                         value={formData.name}
                         onChange={e => setFormData({ ...formData, name: e.target.value })}
                         className="rounded-xl border-border/50"
                       />
                     </div>
                     <div className="grid md:grid-cols-2 gap-4">
                       <div className="grid gap-2">
                         <Label>WhatsApp*</Label>
                         <Input 
                           required 
                           placeholder="(00) 00000-0000" 
                           value={formData.whatsapp}
                           onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                           className="rounded-xl border-border/50"
                         />
                       </div>
                       <div className="grid gap-2">
                         <Label>E-mail (Opcional)</Label>
                         <Input 
                           type="email" 
                           placeholder="seu@email.com" 
                           value={formData.email}
                           onChange={e => setFormData({ ...formData, email: e.target.value })}
                           className="rounded-xl border-border/50"
                         />
                       </div>
                     </div>
                     <Button 
                       type="submit" 
                       disabled={isSubmitting}
                       className="w-full rounded-xl py-6 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-bold text-lg  border-0 mt-2 transition-all hover:scale-[1.01]"
                     >
                       {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto"/> : 'Tenho Interesse Nesta Viagem'}
                     </Button>
                   </form>
                 )}
               </CardContent>

               {itinerary.max_pax && itinerary.max_pax > 0 && (
                 <CardFooter className="bg-muted/30 border-t justify-center relative z-10 rounded-b-3xl">
                   <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <span className="relative flex h-3 w-3">
                        {(itinerary.max_pax - (itinerary.current_pax || 0)) < 5 ? (
                          <>
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                          </>
                        ) : (
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-violet-400"></span>
                        )}
                      </span>
                     Restam apenas <strong>{Math.max(0, itinerary.max_pax - (itinerary.current_pax || 0))} vagas</strong> de {itinerary.max_pax}
                   </p>
                 </CardFooter>
               )}
            </Card>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center px-2">
          <div className="text-sm text-muted-foreground">
            Este roteiro teve <strong>{(itinerary.view_count || 1)}</strong> visualização(ões)
          </div>
        </div>
      </div>

      <TurisBadge />

      {/* Elemento oculto com layout fixo (800px) exclusivamente para exportação de imagem */}
      <div 
        ref={exportRef}
        style={{ width: '800px', position: 'absolute', left: '-9999px', top: '-9999px' }}
        className="bg-zinc-950 text-white p-10 space-y-8 font-sans"
      >
        {/* Cabeçalho do Roteiro */}
        <div className="border-b border-zinc-800 pb-6 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black uppercase tracking-widest px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-[#00D37B]">
              {itinerary.org?.name || 'Excelência Tour'}
            </span>
            {itinerary.destination && (
              <span className="text-xs text-zinc-400 font-bold">
                📍 {itinerary.destination}
              </span>
            )}
          </div>
          <h2 className="text-3xl font-black tracking-tight text-white leading-tight">
            {itinerary.title}
          </h2>
          {itinerary.subtitle && (
            <p className="text-sm text-zinc-400 font-medium max-w-2xl">
              {itinerary.subtitle}
            </p>
          )}
          {itinerary.departure_date && (
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">
              Saída: {new Date(itinerary.departure_date).toLocaleDateString('pt-BR')}
            </p>
          )}
        </div>

        {/* Paradas do Roteiro (Timeline Simplificada) */}
        <div className="space-y-6">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Cronograma Oficial</h3>
          {mappedStops.length > 0 ? (
            <div className="space-y-4">
              {mappedStops.map((stop, idx) => (
                <div key={stop.id || idx} className="p-5 rounded-2xl border border-zinc-900 bg-zinc-900/40 space-y-2 relative">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black bg-[#00D37B]/10 border border-[#00D37B]/20 text-[#00D37B] rounded-full px-2 py-0.5">
                      Dia {stop.day_number}
                    </span>
                    {stop.time && (
                      <span className="text-[10px] text-zinc-500 font-bold uppercase">
                        🕒 {stop.time}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    {stop.emoji || '📍'} {stop.name}
                  </h4>
                  {stop.description && (
                    <p className="text-xs text-zinc-400 leading-relaxed pt-1">
                      {stop.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-zinc-500 italic text-center py-10">Roteiro em construção.</p>
          )}
        </div>

        {/* Rodapé da Imagem */}
        <div className="pt-6 border-t border-zinc-900 flex justify-between items-center text-[10px] text-zinc-500">
          <span>Roteiro de Viagem Personalizado</span>
          <span className="font-bold text-zinc-400">Turis Agências</span>
        </div>
      </div>
    </div>
  );
}
