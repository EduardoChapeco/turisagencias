import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MousePointerClick, Eye, MessageSquare, MousePointer2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function B2CDigitalJourney({ clientId }: { clientId: string }) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadJourney() {
      // Find the shadow profile for this client
      const { data: profile } = await supabase
        .from('b2c_shadow_profiles')
        .select('id, device_info, geo_location, first_seen_at')
        .eq('converted_client_id', clientId)
        .maybeSingle();

      if (!profile) {
        setLoading(false);
        return;
      }

      // Find the events
      const { data: trackingEvents } = await supabase
        .from('b2c_tracking_events')
        .select('*')
        .eq('shadow_id', profile.id)
        .order('created_at', { ascending: false });

      setEvents(trackingEvents || []);
      setLoading(false);
    }
    loadJourney();
  }, [clientId]);

  if (loading) return <div className="p-4 text-xs text-zinc-500 animate-pulse">Carregando rastro digital...</div>;
  if (events.length === 0) return <div className="p-4 text-xs text-zinc-500">Nenhuma jornada digital encontrada para este cliente (captado antes do OMEGA Tracker ou via API Externa).</div>;

  const getEventIcon = (type: string) => {
    if (type.includes('scroll')) return <MousePointer2 className="w-3.5 h-3.5 text-blue-500" />;
    if (type === 'chat_open') return <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />;
    if (type === 'click') return <MousePointerClick className="w-3.5 h-3.5 text-orange-500" />;
    return <Eye className="w-3.5 h-3.5 text-zinc-500" />;
  };

  const getEventLabel = (type: string) => {
    if (type === 'page_view') return 'Visualizou a página';
    if (type === 'scroll_depth_50') return 'Scroll até a metade (50%)';
    if (type === 'scroll_depth_90') return 'Scroll quase completo (90%)';
    if (type === 'chat_open') return 'Abriu o Chat de IA';
    if (type === 'form_submit') return 'Preencheu formulário';
    return type;
  };

  return (
    <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-4 font-sans">
      <h3 className="text-sm font-semibold text-zinc-800 mb-4 flex items-center gap-2">
        <MousePointerClick className="w-4 h-4 text-zinc-400" />
        Jornada Digital Sombra (Shadow Profile)
      </h3>
      <ScrollArea className="h-[300px] pr-4">
        <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-200 before:to-transparent">
          {events.map((ev, i) => (
            <div key={ev.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-zinc-100 text-zinc-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                {getEventIcon(ev.event_type)}
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-3 rounded-2xl border border-zinc-100 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-zinc-800 text-xs">{getEventLabel(ev.event_type)}</span>
                  <span className="text-[10px] text-zinc-400">
                    {format(new Date(ev.created_at), "HH:mm - dd/MM", { locale: ptBR })}
                  </span>
                </div>
                <div className="text-zinc-600 text-xs truncate" title={ev.page_title}>
                  {ev.page_title || 'Página Pública'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
