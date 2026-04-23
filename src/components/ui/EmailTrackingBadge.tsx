import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Eye, Clock, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EmailTrackingBadgeProps {
  entityId: string;
  className?: string;
}

interface TrackingLog {
  id: string;
  opened_at: string | null;
  open_count: number;
  last_ip: string | null;
  last_user_agent: string | null;
  recipient_email: string | null;
  created_at: string;
}

export function EmailTrackingBadge({ entityId, className }: EmailTrackingBadgeProps) {
  const [logs, setLogs] = useState<TrackingLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!entityId) return;

    const fetchLogs = async () => {
      const { data, error } = await supabase
        .from('email_tracking_logs')
        .select('*')
        .eq('entity_id', entityId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setLogs(data as TrackingLog[]);
      }
      setLoading(false);
    };

    fetchLogs();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`tracking_${entityId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'email_tracking_logs',
          filter: `entity_id=eq.${entityId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setLogs(prev => [payload.new as TrackingLog, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setLogs(prev => prev.map(log => log.id === payload.new.id ? payload.new as TrackingLog : log));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [entityId]);

  if (loading || logs.length === 0) return null;

  const latestLog = logs[0];
  const isOpened = !!latestLog.opened_at;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-help border",
            isOpened 
              ? "bg-vj-green/10 text-vj-green border-vj-green/20" 
              : "bg-zinc-100 text-zinc-500 border-zinc-200",
            className
          )}>
            {isOpened ? <Eye size={12} /> : <Mail size={12} />}
            <span>
              {isOpened ? 'Lido' : 'Enviado'}
            </span>
            {latestLog.open_count > 0 && (
              <span className="ml-0.5 opacity-60">({latestLog.open_count})</span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent className="p-3 max-w-[240px] space-y-2">
          <div className="flex flex-col gap-1">
            <p className="text-xs font-bold text-zinc-800">Rastreamento de E-mail</p>
            <p className="text-[10px] text-zinc-500">{latestLog.recipient_email}</p>
          </div>
          
          <div className="space-y-1.5 pt-1 border-t border-zinc-100">
            <div className="flex items-center gap-1.5 text-[10px]">
              <Clock size={10} className="text-zinc-400" />
              <span className="text-zinc-500">Enviado em:</span>
              <span className="font-medium">{new Date(latestLog.created_at).toLocaleString('pt-BR')}</span>
            </div>
            
            {isOpened && (
              <>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <Eye size={10} className="text-vj-green" />
                  <span className="text-zinc-500">Primeira leitura:</span>
                  <span className="font-medium text-vj-green">{new Date(latestLog.opened_at!).toLocaleString('pt-BR')}</span>
                </div>
                {latestLog.last_ip && (
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <MapPin size={10} className="text-zinc-400" />
                    <span className="text-zinc-500">Último IP:</span>
                    <span className="font-mono text-[9px]">{latestLog.last_ip}</span>
                  </div>
                )}
              </>
            )}
            
            {!isOpened && (
              <p className="text-[10px] italic text-zinc-400">Aguardando leitura do destinatário...</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
