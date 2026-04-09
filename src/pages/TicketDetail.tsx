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
            <h1 className="truncate font-heading text-2xl font-bold">{ticket.title}</h1>
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

        <Card>
          <CardHeader>
            <CardTitle>Mensagens</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!ticket.ticket_messages?.length && (
              <p className="text-sm text-muted-foreground">Nenhuma mensagem registrada ainda.</p>
            )}

            {ticket.ticket_messages?.map((item) => (
              <div key={item.id} className="rounded-md border p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">
                    {item.sender_type === 'agent' ? 'Agência' : 'Cliente'}
                    {item.is_internal ? ' • Nota interna' : ''}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
              </div>
            ))}

            <div className="flex gap-2 pt-2">
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
      </div>
    </AppLayout>
  );
}
