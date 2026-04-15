import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { useCreateTicketMessage, useTicket } from '@/hooks/useTickets';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Mail, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TicketDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: ticket, isLoading } = useTicket(id);
  const createMessage = useCreateTicketMessage();
  const [message, setMessage] = useState('');

  if (isLoading) {
    return (
      <AppLayout>
        <Skeleton className="h-80 rounded-lg" />
      </AppLayout>
    );
  }

  if (!ticket) {
    return (
      <AppLayout>
        <p className="text-sm text-muted-foreground">Ticket não encontrado.</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/tickets')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <h1 className="truncate font-heading text-2xl font-bold flex items-center gap-2">
               {ticket.title}
            </h1>
            <p className="text-sm text-muted-foreground">{ticket.description}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{ticket.status}</Badge>
              <Badge variant="outline">{ticket.priority}</Badge>
              <Badge variant="outline">{ticket.type}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
            <p>Viagem: {ticket.trips?.title || 'Não vinculada'}</p>
            <p>Cliente: {ticket.clients?.name || 'Não informado'}</p>
            <p>Criado em: {new Date(ticket.created_at).toLocaleString('pt-BR')}</p>
          </CardContent>
        </Card>

        {/* --- Unified Timeline Builder --- */}
        {(() => {
          // Flatten messages
          const msgs = ((ticket as any).ticket_messages || []).map((m: Record<string, unknown>) => ({
             _type: 'msg',
             id: m.id as string,
             date: new Date(m.created_at as string),
             original: m
          }));

          const timeline = [...msgs].sort((a: any, b: any) => a.date.getTime() - b.date.getTime());
          
          return (

        <Card>
          <CardHeader>
            <CardTitle>Histórico e Emails</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {timeline.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhuma mensagem ou email registrado ainda.</p>
            )}

            {timeline.map((item) => {
              if (item._type === 'msg') {
                const m = item.original;
                return (
                  <div key={m.id} className="rounded-md border p-3 bg-white">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-vj-txt flex items-center gap-1.5">
                        <MessageSquare size={14} className="text-vj-green"/>
                        {m.sender_type === 'agent' ? 'Agência' : 'Cliente'}
                        {m.is_internal ? <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded ml-2">Nota Interna</span> : ''}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.date.toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <p className="mt-2 text-sm text-vj-txt2">{m.body}</p>
                  </div>
                );
              }

              if (item._type === 'email') {
                const em = item.original;
                return (
                   <div key={em.id} className="rounded-md border border-blue-200 bg-blue-50/30 p-3 relative">
                      <div className="absolute top-3 right-3 opacity-20"><Mail size={32}/></div>
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <div>
                          <p className="text-sm font-semibold text-blue-900 flex items-center gap-1">
                            <Mail size={14} /> Email {em.direction === 'inbound' ? 'Recebido' : 'Enviado'}
                          </p>
                          <p className="text-xs text-blue-700">De: {em.from_name || em.from_email} • Assunto: <span className="font-medium">{em.subject}</span></p>
                        </div>
                        <p className="text-xs text-blue-600 font-medium">
                          {item.date.toLocaleString('pt-BR')}
                        </p>
                      </div>
                      
                      {/* AI Classification Badge se houver */}
                      {em.ai_type && (
                         <div className="mb-2 inline-flex items-center gap-1 px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] rounded-sm font-semibold">
                            <CheckCircle2 size={10} /> IA: {em.ai_type} {em.ai_priority ? `(${em.ai_priority})` : ''}
                         </div>
                      )}

                      <div className="text-sm text-gray-800 whitespace-pre-wrap mt-1">
                        {em.body_text}
                      </div>

                      {em.attachments && em.attachments.length > 0 && (
                         <div className="mt-3 pt-3 border-t border-blue-200/50 flex flex-wrap gap-2">
                            {em.attachments.map((a: Record<string, string>, i: number) => (
                               <a key={i} href={a.url} target="_blank" rel="noreferrer" className="text-[10px] font-semibold text-blue-600 bg-white border border-blue-200 px-2 py-1 rounded hover:bg-blue-50">
                                  📎 {a.filename}
                               </a>
                            ))}
                         </div>
                      )}
                   </div>
                );
              }
              return null;
            })}

            <div className="flex gap-2 pt-4 border-t border-vj-border mt-4">
              <Input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Responder ticket"
              />
              <Button
                disabled={!message.trim() || createMessage.isPending}
                onClick={async () => {
                  const content = message.trim();
                  if (!content) return;
                  await createMessage.mutateAsync({ ticket_id: ticket.id, content });
                  setMessage('');
                }}
              >
                {createMessage.isPending ? 'Enviando...' : 'Enviar'}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        ); // End of timeline builder function
        })()}
        
      </div>
    </AppLayout>
  );
}
