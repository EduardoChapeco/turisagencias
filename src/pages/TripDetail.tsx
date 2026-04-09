import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { useTrip } from '@/hooks/useTrips';
import { useChecklists, useCreateChecklist, useCreateChecklistItem } from '@/hooks/useChecklists';
import { useCreateTicket, useTickets } from '@/hooks/useTickets';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

export default function TripDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: trip, isLoading } = useTrip(id);
  const { data: tickets } = useTickets(id);
  const { data: checklists } = useChecklists(id);
  const createTicket = useCreateTicket();
  const createChecklist = useCreateChecklist();
  const createChecklistItem = useCreateChecklistItem();
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [checklistTitle, setChecklistTitle] = useState('');
  const [checklistItemTitle, setChecklistItemTitle] = useState<Record<string, string>>({});

  if (isLoading) {
    return (
      <AppLayout>
        <Skeleton className="h-80 rounded-lg" />
      </AppLayout>
    );
  }

  if (!trip) {
    return (
      <AppLayout>
        <p className="text-sm text-muted-foreground">Viagem não encontrada.</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/trips')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="font-heading text-2xl font-bold">{trip.title}</h1>
            <p className="text-sm text-muted-foreground">
              {[trip.destination_city, trip.destination_country].filter(Boolean).join(', ') || 'Destino em definição'}
            </p>
          </div>
        </div>

        <Tabs defaultValue="summary">
          <TabsList className="flex h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
            <TabsTrigger value="summary">Resumo</TabsTrigger>
            <TabsTrigger value="flights">Voos</TabsTrigger>
            <TabsTrigger value="travelers">Viajantes</TabsTrigger>
            <TabsTrigger value="documents">Documentos</TabsTrigger>
            <TabsTrigger value="tickets">Tickets</TabsTrigger>
            <TabsTrigger value="checklists">Checklist</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="mt-4">
            <Card>
              <CardHeader><CardTitle>Resumo</CardTitle></CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Cliente principal</p>
                  <p className="font-medium">{trip.clients?.name || 'Não definido'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium">{trip.status}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Datas</p>
                  <p className="font-medium">
                    {trip.departure_date ? new Date(trip.departure_date).toLocaleDateString('pt-BR') : '--'}
                    {' → '}
                    {trip.return_date ? new Date(trip.return_date).toLocaleDateString('pt-BR') : '--'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Hotel</p>
                  <p className="font-medium">{trip.hotel_name || 'Pendente'}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="flights" className="mt-4">
            <Card>
              <CardHeader><CardTitle>Voos</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {!trip.trip_flights?.length && <p className="text-sm text-muted-foreground">Nenhum voo cadastrado ainda.</p>}
                {trip.trip_flights?.map((flight) => (
                  <div key={flight.id} className="rounded-md border p-3">
                    <p className="font-medium">{flight.airline_name || 'Companhia'} {flight.flight_number || ''}</p>
                    <p className="text-sm text-muted-foreground">
                      {[flight.origin_city, flight.destination_city].filter(Boolean).join(' → ') || 'Trecho pendente'}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="travelers" className="mt-4">
            <Card>
              <CardHeader><CardTitle>Viajantes</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {!trip.trip_travelers?.length && <p className="text-sm text-muted-foreground">Nenhum viajante vinculado ainda.</p>}
                {trip.trip_travelers?.map((traveler) => (
                  <div key={traveler.id} className="rounded-md border p-3">
                    <p className="font-medium">{traveler.travelers?.full_name || 'Viajante'}</p>
                    <p className="text-sm text-muted-foreground">
                      {traveler.ticket_number || 'Sem bilhete'} • {traveler.seat_number || 'Sem assento'}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="mt-4">
            <Card>
              <CardHeader><CardTitle>Documentos</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {!trip.trip_documents?.length && <p className="text-sm text-muted-foreground">Nenhum documento anexado ainda.</p>}
                {trip.trip_documents?.map((document) => (
                  <div key={document.id} className="rounded-md border p-3">
                    <p className="font-medium">{document.title}</p>
                    <p className="text-sm text-muted-foreground">{document.doc_type}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tickets" className="mt-4">
            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <Card>
                <CardHeader><CardTitle>Tickets vinculados</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {!tickets?.length && <p className="text-sm text-muted-foreground">Nenhum ticket vinculado a esta viagem.</p>}
                  {tickets?.map((ticket) => (
                    <button
                      key={ticket.id}
                      type="button"
                      className="w-full rounded-md border p-3 text-left transition-colors hover:bg-muted"
                      onClick={() => navigate(`/tickets/${ticket.id}`)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{ticket.title}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{ticket.description}</p>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          <p>{ticket.status}</p>
                          <p>{ticket.priority}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Abrir novo ticket</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ticket-title">Título</Label>
                    <Input id="ticket-title" value={ticketTitle} onChange={(event) => setTicketTitle(event.target.value)} placeholder="Solicitação de reemissão" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ticket-description">Descrição</Label>
                    <Input id="ticket-description" value={ticketDescription} onChange={(event) => setTicketDescription(event.target.value)} placeholder="Explique o que precisa ser resolvido" />
                  </div>
                  <Button
                    className="w-full"
                    disabled={!ticketTitle || !ticketDescription || createTicket.isPending}
                    onClick={async () => {
                      await createTicket.mutateAsync({
                        title: ticketTitle,
                        description: ticketDescription,
                        trip_id: trip.id,
                        client_id: trip.primary_client_id ?? null,
                      });
                      setTicketTitle('');
                      setTicketDescription('');
                    }}
                  >
                    {createTicket.isPending ? 'Criando...' : 'Criar ticket'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="checklists" className="mt-4">
            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <Card>
                <CardHeader><CardTitle>Checklists da viagem</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {!checklists?.length && <p className="text-sm text-muted-foreground">Nenhum checklist criado para esta viagem.</p>}
                  {checklists?.map((checklist) => (
                    <div key={checklist.id} className="rounded-lg border p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{checklist.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {checklist.is_visible_to_client ? 'Visível ao cliente' : 'Uso interno'}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigator.clipboard.writeText(`${window.location.origin}/c/${checklist.share_token}`)}
                        >
                          Copiar link
                        </Button>
                      </div>
                      <div className="mt-4 space-y-3">
                        {!checklist.checklist_items?.length && (
                          <p className="text-sm text-muted-foreground">Nenhum item adicionado ainda.</p>
                        )}
                        {checklist.checklist_items?.map((item) => (
                          <label key={item.id} className="flex items-start gap-3 rounded-md border p-3">
                            <Checkbox checked={item.is_completed} disabled />
                            <div>
                              <p className="text-sm font-medium">{item.title}</p>
                              {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
                            </div>
                          </label>
                        ))}
                        <div className="flex gap-2">
                          <Input
                            value={checklistItemTitle[checklist.id] ?? ''}
                            onChange={(event) =>
                              setChecklistItemTitle((current) => ({ ...current, [checklist.id]: event.target.value }))
                            }
                            placeholder="Adicionar item"
                          />
                          <Button
                            variant="outline"
                            disabled={!checklistItemTitle[checklist.id]?.trim() || createChecklistItem.isPending}
                            onClick={async () => {
                              const title = checklistItemTitle[checklist.id]?.trim();
                              if (!title) return;
                              await createChecklistItem.mutateAsync({
                                checklist_id: checklist.id,
                                title,
                                position: checklist.checklist_items?.length ?? 0,
                              });
                              setChecklistItemTitle((current) => ({ ...current, [checklist.id]: '' }));
                            }}
                          >
                            Adicionar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Novo checklist</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="checklist-title">Título</Label>
                    <Input
                      id="checklist-title"
                      value={checklistTitle}
                      onChange={(event) => setChecklistTitle(event.target.value)}
                      placeholder="Checklist pré-embarque"
                    />
                  </div>
                  <Button
                    className="w-full"
                    disabled={!checklistTitle || createChecklist.isPending}
                    onClick={async () => {
                      await createChecklist.mutateAsync({
                        title: checklistTitle,
                        trip_id: trip.id,
                        client_id: trip.primary_client_id ?? null,
                        is_visible_to_client: true,
                      });
                      setChecklistTitle('');
                    }}
                  >
                    {createChecklist.isPending ? 'Criando...' : 'Criar checklist'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
