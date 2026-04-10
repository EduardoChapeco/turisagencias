import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, CalendarDays, Users as UsersIcon, FileText, CheckSquare, MessageSquare, Plane, Hotel } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { useTrip } from '@/hooks/useTrips';
import { useChecklists, useCreateChecklist, useCreateChecklistItem } from '@/hooks/useChecklists';
import { useCreateTicket, useTickets } from '@/hooks/useTickets';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

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
        <div className="space-y-4">
           <Skeleton className="h-32 w-full rounded-2xl" />
           <Skeleton className="h-[400px] w-full rounded-2xl" />
        </div>
      </AppLayout>
    );
  }

  if (!trip) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
           <Plane className="h-12 w-12 text-muted-foreground/30" />
           <p className="text-muted-foreground">Workspace de Viagem não encontrado.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex items-start gap-4">
          <Button variant="outline" size="icon" className="shrink-0 rounded-xl" onClick={() => navigate('/trips')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-3xl font-bold tracking-tight text-primary">{trip.title}</h1>
              <Badge variant={trip.status === 'confirmed' ? 'default' : 'secondary'} className="text-xs uppercase px-2 py-0.5 shadow-sm">
                {trip.status}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-accent" />
              {[trip.destination_city, trip.destination_country].filter(Boolean).join(', ') || 'Destino em Definição'}
            </p>
          </div>
        </div>

        <Tabs defaultValue="itinerary" className="w-full">
          <div className="bg-surface/50 p-1.5 rounded-2xl border border-border/50 shadow-sm inline-block max-w-full overflow-x-auto scrollbar-none">
            <TabsList className="h-auto bg-transparent p-0 flex gap-1">
              <TabsTrigger value="itinerary" className="rounded-xl px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"><MapPin className="h-4 w-4 mr-2" />Itinerário & Mapa</TabsTrigger>
              <TabsTrigger value="summary" className="rounded-xl px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"><CalendarDays className="h-4 w-4 mr-2" />Resumo Geral</TabsTrigger>
              <TabsTrigger value="travelers" className="rounded-xl px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"><UsersIcon className="h-4 w-4 mr-2" />Cargadores & Grupos</TabsTrigger>
              <TabsTrigger value="documents" className="rounded-xl px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"><FileText className="h-4 w-4 mr-2" />Documentos</TabsTrigger>
              <TabsTrigger value="tickets" className="rounded-xl px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"><MessageSquare className="h-4 w-4 mr-2" />Atendimentos</TabsTrigger>
              <TabsTrigger value="checklists" className="rounded-xl px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"><CheckSquare className="h-4 w-4 mr-2" />Checklists</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="itinerary" className="mt-6 flex flex-col md:flex-row gap-6">
            {/* Timeline View */}
            <div className="flex-1 space-y-4">
               <h3 className="text-lg font-semibold flex items-center gap-2"><MapPin className="h-5 w-5 text-accent"/> Timeline Interativa</h3>
               <div className="relative border-l-2 border-primary/20 pl-6 ml-3 space-y-8 pb-4">
                  
                  {/* Ponto Voo */}
                  <div className="relative">
                     <div className="absolute -left-[35px] w-8 h-8 bg-surface border-2 border-primary rounded-full flex items-center justify-center z-10 shadow-sm">
                        <Plane className="h-4 w-4 text-primary" />
                     </div>
                     <Card className="border-border/50 shadow-sm hover:shadow-md transition-all">
                        <CardHeader className="bg-muted/20 py-3 px-4 border-b border-border/30">
                           <CardTitle className="text-sm font-medium">Voo de Ida</CardTitle>
                        </CardHeader>
                        <CardContent className="py-4 px-4 space-y-3">
                           {!trip.trip_flights?.length && <p className="text-sm text-muted-foreground italic">Nenhum voo conectado ao Itinerário.</p>}
                           {trip.trip_flights?.map((flight) => (
                             <div key={flight.id} className="flex flex-col text-sm">
                               <span className="font-semibold text-primary">{flight.airline_name || 'Companhia'} {flight.flight_number || ''}</span>
                               <span className="text-muted-foreground">{[flight.origin_city, flight.destination_city].filter(Boolean).join(' → ')}</span>
                             </div>
                           ))}
                        </CardContent>
                     </Card>
                  </div>

                  {/* Ponto Hotel */}
                  <div className="relative">
                     <div className="absolute -left-[35px] w-8 h-8 bg-surface border-2 border-accent rounded-full flex items-center justify-center z-10 shadow-sm">
                        <Hotel className="h-4 w-4 text-accent" />
                     </div>
                     <Card className="border-border/50 shadow-sm hover:shadow-md transition-all">
                        <CardHeader className="bg-muted/20 py-3 px-4 border-b border-border/30">
                           <CardTitle className="text-sm font-medium">Hospedagem</CardTitle>
                        </CardHeader>
                        <CardContent className="py-4 px-4">
                           {trip.hotel_name ? (
                              <div className="flex flex-col text-sm">
                                 <span className="font-semibold text-primary">{trip.hotel_name}</span>
                                 <span className="text-muted-foreground">Check-in Programado</span>
                              </div>
                           ) : (
                              <p className="text-sm text-muted-foreground italic">Nenhum hotel mapeado no Itinerário.</p>
                           )}
                        </CardContent>
                     </Card>
                  </div>

               </div>
            </div>

            {/* Map Placeholder */}
            <div className="md:w-[400px] shrink-0">
               <Card className="border-border/50 shadow-sm overflow-hidden h-full min-h-[400px] relative bg-muted/20 flex items-center justify-center group">
                  <div className="absolute inset-0 bg-[url('https://api.maptiler.com/maps/basic-v2/256/0/0/0.png')] bg-cover bg-center opacity-30 grayscale group-hover:grayscale-0 group-hover:opacity-50 transition-all duration-700"></div>
                  <div className="relative z-10 flex flex-col items-center space-y-3 bg-surface/80 p-6 rounded-2xl backdrop-blur-md border border-white/10 shadow-xl text-center">
                     <MapPin className="h-10 w-10 text-accent animate-bounce" />
                     <h4 className="font-heading font-semibold text-lg">Pin de Destino</h4>
                     <p className="text-sm text-muted-foreground px-4">A integração nativa de Mapas renderizará {trip.destination_city || 'sua rota'} aqui.</p>
                  </div>
               </Card>
            </div>
          </TabsContent>

          <TabsContent value="summary" className="mt-6">
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="bg-surface/50 border-b border-border/30">
                <CardTitle>Painel do Workspace</CardTitle>
                <CardDescription>Visão sistêmica da estrutura baseada nos dados contratuais.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 p-6 pt-6">
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Comprador</p>
                  <p className="font-semibold text-primary truncate">{trip.clients?.name || 'Vazio'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Datas</p>
                  <p className="font-semibold text-foreground">
                    {trip.departure_date ? new Date(trip.departure_date).toLocaleDateString('pt-BR') : '--'}
                    <span className="mx-1 text-muted-foreground">até</span>
                    {trip.return_date ? new Date(trip.return_date).toLocaleDateString('pt-BR') : '--'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Hospedagem</p>
                  <p className="font-semibold text-foreground truncate">{trip.hotel_name || 'Vazio'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Registro Interno</p>
                  <p className="font-mono text-sm text-muted-foreground truncate">{trip.id.split('-')[0]}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="travelers" className="mt-6">
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="bg-surface/50 border-b border-border/30">
                <CardTitle className="flex justify-between items-center">
                   Matriz de Viajantes & Grupos
                   <Button variant="outline" size="sm" disabled>Gerenciar Grupos</Button>
                </CardTitle>
                <CardDescription>Mapeamento de travel_groups e tickets estruturados dos passageiros.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {!trip.trip_travelers?.length ? (
                  <div className="text-center py-8">
                     <UsersIcon className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                     <p className="text-muted-foreground">A matriz de viajantes está zerada.</p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                     {trip.trip_travelers?.map((traveler) => (
                       <div key={traveler.id} className="rounded-xl border border-border/60 bg-surface/40 p-4 shrink-0 hover:border-primary/40 transition-colors">
                         <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                               {traveler.travelers?.full_name?.charAt(0) || 'V'}
                            </div>
                            <div>
                               <p className="font-semibold text-sm line-clamp-1">{traveler.travelers?.full_name || 'Viajante Desconhecido'}</p>
                               <p className="text-xs text-muted-foreground">Passageiro</p>
                            </div>
                         </div>
                         <div className="space-y-2 text-xs">
                            <div className="flex justify-between border-b border-border/30 pb-1">
                               <span className="text-muted-foreground">E-ticket:</span>
                               <span className="font-mono">{traveler.ticket_number || '--'}</span>
                            </div>
                            <div className="flex justify-between">
                               <span className="text-muted-foreground">Assento:</span>
                               <span className="font-medium">{traveler.seat_number || '--'}</span>
                            </div>
                         </div>
                       </div>
                     ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="mt-6">
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="bg-surface/50 border-b border-border/30">
                 <CardTitle>Cofre de Documentos</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {!trip.trip_documents?.length && <p className="text-sm text-muted-foreground text-center py-6">O cofre digital está vazio.</p>}
                <div className="grid gap-3 md:grid-cols-2">
                   {trip.trip_documents?.map((document) => (
                     <div key={document.id} className="flex items-center gap-3 rounded-lg border border-border/60 p-3 bg-surface/30">
                       <FileText className="h-8 w-8 text-muted-foreground/60 p-1.5 bg-muted rounded-md" />
                       <div>
                          <p className="font-medium text-sm">{document.title}</p>
                          <p className="text-xs text-muted-foreground uppercase">{document.doc_type}</p>
                       </div>
                     </div>
                   ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tickets" className="mt-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
              <Card className="border-border/50 shadow-sm">
                <CardHeader className="bg-surface/50 border-b border-border/30">
                   <CardTitle>Tickets (Atendimentos)</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {!tickets?.length && <p className="text-sm text-muted-foreground text-center py-6">Nenhum chamado aberto na agência para este Workspace.</p>}
                  <div className="space-y-3">
                     {tickets?.map((ticket) => (
                       <button
                         key={ticket.id}
                         type="button"
                         className="w-full flex items-center justify-between rounded-xl border border-border/60 p-4 text-left transition-colors hover:border-primary/50 hover:bg-surface/50"
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
                            <Checkbox checked={item.is_checked} disabled />
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
