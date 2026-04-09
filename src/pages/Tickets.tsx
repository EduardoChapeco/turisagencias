import { useNavigate } from 'react-router-dom';
import { LifeBuoy } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { useTickets } from '@/hooks/useTickets';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function Tickets() {
  const navigate = useNavigate();
  const { data: tickets, isLoading } = useTickets();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold">Tickets</h1>
            <p className="text-sm text-muted-foreground">
              Central de suporte da operação, integrada com clientes e viagens.
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/trips')}>
            Ir para viagens
          </Button>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando tickets...</p>
        ) : !tickets?.length ? (
          <Card>
            <CardContent className="flex flex-col items-center py-12 text-center">
              <LifeBuoy className="mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="text-lg font-medium">Nenhum ticket aberto</p>
              <p className="text-sm text-muted-foreground">
                Os tickets aparecem aqui e também dentro do workspace de cada viagem.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {tickets.map((ticket) => (
              <Card
                key={ticket.id}
                className="cursor-pointer transition-shadow hover:shadow-md"
                onClick={() => navigate(`/tickets/${ticket.id}`)}
              >
                <CardHeader>
                  <CardTitle className="flex items-start justify-between gap-3">
                    <div>
                      <p>{ticket.title}</p>
                      <p className="mt-1 text-sm font-normal text-muted-foreground">{ticket.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="secondary">{ticket.status}</Badge>
                      <Badge variant="outline">{ticket.priority}</Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span>Tipo: {ticket.type}</span>
                  <span>Cliente: {ticket.clients?.name || 'Não informado'}</span>
                  <span>Viagem: {ticket.trips?.title || 'Não vinculada'}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
