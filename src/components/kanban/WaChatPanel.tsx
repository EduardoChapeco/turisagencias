import { useWaSession, useWaLogs } from '@/hooks/useWaExtension';
import { Loader2, MessageCircle, AlertCircle, Smartphone } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EmptyState } from '@/components/ui/EmptyState';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function WaChatPanel({ clientId, phone }: { clientId?: string | null; phone?: string | null }) {
  const { data: session, isLoading, isError } = useWaSession(clientId, phone);
  const { data: logs, isLoading: loadingLogs } = useWaLogs(session?.id);

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center text-vj-txt3">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Erro ao carregar Chat"
        description="Não foi possível sincronizar com a extensão do WhatsApp."
      />
    );
  }

  if (!session) {
    return (
      <EmptyState
        icon={MessageCircle}
        title="Nenhuma sessão vinculada"
        description={<>
          A extensão do WhatsApp ainda não rastreou conversas para este cliente.
          <br/>
          <strong>Tente abrir o contato no WhatsApp Web com a extensão ativa.</strong>
        </>}
        action={
          <Button variant="outline" size="sm" onClick={() => window.open('https://web.whatsapp.com', '_blank')}>
            <Smartphone className="h-4 w-4 mr-2"/> Abrir WhatsApp Web
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col space-y-4 h-full">
      <div className="surface-muted rounded-cb-md p-3 flex justify-between items-center text-sm">
        <div className="flex items-center gap-2">
          <div className="bg-vj-green text-white p-1.5 rounded flex items-center justify-center">
            <MessageCircle size={14} />
          </div>
          <div>
            <p className="font-semibold text-vj-txt leading-none">{session.contact_name || 'Desconhecido'}</p>
            <p className="text-xs text-vj-txt3 mt-1 leading-none">{session.contact_phone}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-vj-txt3 font-semibold uppercase tracking-wider">Última sync</p>
          <p className="text-xs font-medium text-vj-txt">
            {session.last_seen_at ? format(new Date(session.last_seen_at), 'HH:mm - dd/MM') : 'Nunca'}
          </p>
        </div>
      </div>

      <div className="border border-vj-border rounded-cb-md bg-white flex-1 overflow-hidden flex flex-col max-h-[500px] min-h-[300px]">
        {loadingLogs ? (
          <div className="flex-1 flex items-center justify-center">
             <Loader2 className="h-5 w-5 animate-spin text-vj-txt3" />
          </div>
        ) : !logs || logs.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-sm text-vj-txt3 p-4 text-center">
            Nenhuma mensagem rastreada.
            <br/> 
            Mande uma mensagem pelo sistema ou sincronize pela extensão.
          </div>
        ) : (
          <ScrollArea className="flex-1 p-4 bg-[#E5DDD5]/20">
            <div className="flex flex-col gap-3">
              {logs.map((log) => {
                const isIn = log.direction === 'in';
                return (
                  <div key={log.id} className={cn("flex w-full", isIn ? "justify-start" : "justify-end")}>
                    <div className={cn(
                      "max-w-[85%] rounded-md p-2 text-[13px] relative",
                      isIn ? "bg-white text-zinc-900 rounded-tl-none border border-zinc-100" : "bg-[#DCF8C6] text-zinc-900 rounded-tr-none"
                    )}>
                      <p className="whitespace-pre-wrap">{log.message_text}</p>
                      <div className="text-[9px] text-zinc-500 text-right mt-1 font-medium">
                        {log.message_time ? format(new Date(log.message_time), 'HH:mm') : log.message_time_label || ''}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
