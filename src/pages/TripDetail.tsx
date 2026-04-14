import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, MapPin, CalendarDays, Users as UsersIcon,
  FileText, CheckSquare, MessageSquare, Plane, Edit2,
  Hotel, Clock, Users2, DollarSign, Shield, Lock,
} from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { useTrip } from '@/hooks/useTrips';
import { useChecklists, useCreateChecklist, useCreateChecklistItem } from '@/hooks/useChecklists';
import { useCreateTicket, useTickets } from '@/hooks/useTickets';
import { TripEditSheet } from '@/components/TripEditSheet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/ui/StatusBadge';

const STATUS_MAP: Record<string, { label: string; variant: 'success' | 'info' | 'warning' | 'neutral' | 'destructive' }> = {
  quoting:   { label: 'Em Cotação',  variant: 'warning' },
  booked:    { label: 'Reservado',   variant: 'info' },
  confirmed: { label: 'Confirmado',  variant: 'success' },
  traveling: { label: 'Em Viagem',   variant: 'info' },
  completed: { label: 'Concluído',   variant: 'neutral' },
  cancelled: { label: 'Cancelado',   variant: 'destructive' },
};

const fmt = (date: string | null | undefined) =>
  date ? new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const fmtCurrency = (val: number | null | undefined) =>
  val != null
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
    : '—';

const nights = (dep: string | null | undefined, ret: string | null | undefined) => {
  if (!dep || !ret) return null;
  const d = Math.round((new Date(ret).getTime() - new Date(dep).getTime()) / 86400000);
  return d > 0 ? d : null;
};

export default function TripDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: trip, isLoading, refetch } = useTrip(id);
  const { data: tickets } = useTickets(id);
  const { data: checklists } = useChecklists(id);
  const createTicket = useCreateTicket();
  const createChecklist = useCreateChecklist();
  const createChecklistItem = useCreateChecklistItem();
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [checklistTitle, setChecklistTitle] = useState('');
  const [checklistItemTitle, setChecklistItemTitle] = useState<Record<string, string>>({});
  const [editOpen, setEditOpen] = useState(false);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-4 max-w-7xl mx-auto">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
      </AppLayout>
    );
  }

  if (!trip) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
          <Plane className="h-12 w-12 text-vj-txt3/30" />
          <p className="text-vj-txt3">Viagem não encontrada.</p>
          <Button variant="outline" onClick={() => navigate('/trips')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
        </div>
      </AppLayout>
    );
  }

  const statusInfo = STATUS_MAP[trip.status] ?? { label: trip.status, variant: 'neutral' as const };
  const numNights = (trip as Record<string, unknown>).num_nights as number | null ?? nights(trip.departure_date, trip.return_date);
  const destination = [trip.destination_city, trip.destination_country].filter(Boolean).join(', ') || 'Destino em Definição';

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* ── Header ── */}
        <div className="flex items-start gap-4">
          <Button variant="outline" size="icon" className="shrink-0 rounded-xl border-vj-border h-10 w-10" onClick={() => navigate('/trips')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="font-heading text-2xl font-bold text-vj-txt leading-tight">{trip.title}</h1>
              <StatusBadge variant={statusInfo.variant}>{statusInfo.label}</StatusBadge>
            </div>
            <p className="text-sm text-vj-txt3 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> {destination}
            </p>
          </div>
          <Button
            onClick={() => setEditOpen(true)}
            variant="outline"
            className="shrink-0 border-vj-border gap-2"
          >
            <Edit2 className="h-4 w-4" /> Editar Viagem
          </Button>
        </div>

        {/* ── KPI Strip ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-xl border border-vj-border bg-white p-4">
            <p className="text-xs text-vj-txt3 uppercase tracking-wider font-medium mb-1 flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" />Ida</p>
            <p className="font-semibold text-vj-txt text-sm">{fmt(trip.departure_date)}</p>
          </div>
          <div className="rounded-xl border border-vj-border bg-white p-4">
            <p className="text-xs text-vj-txt3 uppercase tracking-wider font-medium mb-1 flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" />Volta</p>
            <p className="font-semibold text-vj-txt text-sm">{fmt(trip.return_date)}</p>
          </div>
          <div className="rounded-xl border border-vj-border bg-white p-4">
            <p className="text-xs text-vj-txt3 uppercase tracking-wider font-medium mb-1 flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />Noites</p>
            <p className="font-semibold text-vj-txt text-sm">{numNights != null ? `${numNights} noites` : '—'}</p>
          </div>
          <div className="rounded-xl border border-vj-border bg-white p-4">
            <p className="text-xs text-vj-txt3 uppercase tracking-wider font-medium mb-1 flex items-center gap-1.5"><Users2 className="h-3.5 w-3.5" />Pax</p>
            <p className="font-semibold text-vj-txt text-sm">
              {((trip as Record<string, unknown>).pax_count as number | null) ?? '—'} passageiros
            </p>
          </div>
        </div>

        {/* ── Route Map Card ── */}
        {(trip.destination_city || trip.destination_country) && (
          <div className="grid md:grid-cols-[1fr_340px] gap-4">
            {/* OSM Map iframe — free, no API key */}
            <div className="rounded-xl border border-vj-border bg-white overflow-hidden" style={{ minHeight: 240 }}>
              <div className="px-4 pt-4 pb-2 flex items-center gap-2 border-b border-vj-border">
                <MapPin className="h-4 w-4 text-vj-green" />
                <span className="text-sm font-semibold text-vj-txt">{destination}</span>
                <span className="text-xs text-vj-txt3 ml-auto">OpenStreetMap</span>
              </div>
              <iframe
                title="Mapa do destino"
                loading="lazy"
                style={{ width: '100%', height: 220, border: 'none', display: 'block' }}
                src={`https://www.openstreetmap.org/export/embed.html?layer=mapnik&marker=${encodeURIComponent(`${trip.destination_city ?? ''}, ${trip.destination_country ?? ''}`)}`}
              />
            </div>

            {/* SVG Flight Route */}
            <div className="rounded-xl border border-vj-border bg-white p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-vj-txt3 uppercase tracking-wider flex items-center gap-1.5">
                  <Plane className="h-3.5 w-3.5" /> Rota do Voo
                </span>
              </div>

              {/* Route SVG arc */}
              <div className="flex-1 flex flex-col items-center justify-center py-2">
                <div className="flex items-end justify-between w-full gap-2 mb-2">
                  <div className="text-center">
                    <p className="text-xs text-vj-txt3 uppercase tracking-wider">Origem</p>
                    <p className="font-bold text-vj-txt text-lg leading-tight">
                      {((trip as Record<string, unknown>).airline as string) || 'BR'}
                    </p>
                    <p className="text-xs text-vj-txt3 mt-0.5">Brasil</p>
                  </div>
                  <div className="flex-1 flex flex-col items-center">
                    <svg viewBox="0 0 160 60" className="w-full max-w-[160px]" style={{ overflow: 'visible' }}>
                      {/* Arc */}
                      <path d="M 8 50 Q 80 4 152 50" stroke="#22c55e" strokeWidth="1.5" fill="none" strokeDasharray="4 3" />
                      {/* Plane icon at midpoint */}
                      <g transform="translate(80,18) rotate(-5)">
                        <circle cx="0" cy="0" r="8" fill="white" stroke="#22c55e" strokeWidth="1.5" />
                        <text x="0" y="4" textAnchor="middle" fontSize="9" fill="#166534">✈</text>
                      </g>
                      {/* Origin dot */}
                      <circle cx="8" cy="50" r="4" fill="#22c55e" />
                      {/* Dest dot */}
                      <circle cx="152" cy="50" r="4" fill="#166534" />
                    </svg>
                    {trip.departure_date && trip.return_date && numNights && (
                      <p className="text-[10px] text-vj-txt3 mt-1">{numNights} noites</p>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-vj-txt3 uppercase tracking-wider">Destino</p>
                    <p className="font-bold text-vj-green text-lg leading-tight">{trip.destination_city || '—'}</p>
                    <p className="text-xs text-vj-txt3 mt-0.5">{trip.destination_country || ''}</p>
                  </div>
                </div>
              </div>

              {/* Extra flight info */}
              <div className="space-y-2 pt-3 border-t border-vj-border">
                {(trip as Record<string, unknown>).flight_number as string && (
                  <div className="flex justify-between text-xs">
                    <span className="text-vj-txt3">Voo</span>
                    <span className="font-mono font-semibold">{(trip as Record<string, unknown>).flight_number as string}</span>
                  </div>
                )}
                {(trip as Record<string, unknown>).locator_code as string && (
                  <div className="flex justify-between text-xs">
                    <span className="text-vj-txt3">Localizador</span>
                    <span className="font-mono font-bold text-vj-green uppercase">{(trip as Record<string, unknown>).locator_code as string}</span>
                  </div>
                )}
                {trip.hotel_name && (
                  <div className="flex justify-between text-xs">
                    <span className="text-vj-txt3">Hotel</span>
                    <span className="font-medium text-right max-w-[60%] truncate">{trip.hotel_name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Tabs ── */}
        <Tabs defaultValue="summary" className="w-full">
          <div className="bg-vj-bg p-1 rounded-xl border border-vj-border inline-flex max-w-full overflow-x-auto scrollbar-none">
            <TabsList className="h-auto bg-transparent p-0 flex gap-0.5">
              {[
                { value: 'summary',    label: 'Resumo',       icon: MapPin },
                { value: 'travelers',  label: 'Viajantes',    icon: UsersIcon },
                { value: 'documents',  label: 'Documentos',   icon: FileText },
                { value: 'tickets',    label: 'Chamados',     icon: MessageSquare },
                { value: 'checklists', label: 'Checklists',   icon: CheckSquare },
              ].map(tab => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="rounded-lg px-4 py-2 text-sm flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-vj-txt data-[state=active]:shadow-none data-[state=inactive]:text-vj-txt3 transition-colors"
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* ── Resumo Geral ── */}
          <TabsContent value="summary" className="mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Destino & Datas */}
              <div className="rounded-xl border border-vj-border bg-white p-5 space-y-4">
                <h3 className="font-semibold text-vj-txt flex items-center gap-2 text-sm uppercase tracking-wider text-vj-txt3"><MapPin className="h-4 w-4" />Destino & Datas</h3>
                <div className="grid grid-cols-2 gap-y-3 text-sm">
                  <span className="text-vj-txt3">Destino</span>
                  <span className="font-medium text-vj-txt text-right">{destination}</span>
                  <span className="text-vj-txt3">Ida</span>
                  <span className="font-medium text-right">{fmt(trip.departure_date)}</span>
                  <span className="text-vj-txt3">Volta</span>
                  <span className="font-medium text-right">{fmt(trip.return_date)}</span>
                  <span className="text-vj-txt3">Noites</span>
                  <span className="font-medium text-right">{numNights != null ? `${numNights}` : '—'}</span>
                  <span className="text-vj-txt3">Pax</span>
                  <span className="font-medium text-right">{((trip as Record<string, unknown>).pax_count as number | null) ?? '—'}</span>
                </div>
              </div>

              {/* Hospedagem */}
              <div className="rounded-xl border border-vj-border bg-white p-5 space-y-4">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-vj-txt3 flex items-center gap-2"><Hotel className="h-4 w-4" />Hospedagem</h3>
                <div className="grid grid-cols-2 gap-y-3 text-sm">
                  <span className="text-vj-txt3">Hotel</span>
                  <span className="font-medium text-right truncate">{trip.hotel_name || '—'}</span>
                  <span className="text-vj-txt3">Regime</span>
                  <span className="font-medium text-right">{(trip as Record<string, unknown>).meal_plan as string || trip.hotel_regime || '—'}</span>
                  <span className="text-vj-txt3">Tipo de Quarto</span>
                  <span className="font-medium text-right">{(trip as Record<string, unknown>).room_type as string || '—'}</span>
                </div>
              </div>

              {/* Voo & Localizador */}
              <div className="rounded-xl border border-vj-border bg-white p-5 space-y-4">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-vj-txt3 flex items-center gap-2"><Plane className="h-4 w-4" />Voo & Localizador</h3>
                <div className="grid grid-cols-2 gap-y-3 text-sm">
                  <span className="text-vj-txt3">Companhia</span>
                  <span className="font-medium text-right">{(trip as Record<string, unknown>).airline as string || '—'}</span>
                  <span className="text-vj-txt3">Voo</span>
                  <span className="font-medium text-right font-mono">{(trip as Record<string, unknown>).flight_number as string || '—'}</span>
                  <span className="text-vj-txt3">Localizador</span>
                  <span className="font-mono font-bold text-vj-green text-right uppercase">{(trip as Record<string, unknown>).locator_code as string || '—'}</span>
                </div>
              </div>

              {/* Financeiro & Seguro */}
              <div className="rounded-xl border border-vj-border bg-white p-5 space-y-4">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-vj-txt3 flex items-center gap-2"><DollarSign className="h-4 w-4" />Financeiro & Seguro</h3>
                <div className="grid grid-cols-2 gap-y-3 text-sm">
                  <span className="text-vj-txt3">Valor Total</span>
                  <span className="font-bold text-vj-green text-right">{fmtCurrency((trip as Record<string, unknown>).total_value as number | null)}</span>
                  <span className="text-vj-txt3">Seguradora</span>
                  <span className="font-medium text-right">{(trip as Record<string, unknown>).insurance_company as string || '—'}</span>
                  <span className="text-vj-txt3">Apólice</span>
                  <span className="font-mono text-right text-xs">{(trip as Record<string, unknown>).insurance_policy as string || '—'}</span>
                </div>
              </div>
            </div>

            {/* Cliente principal */}
            {trip.clients && (
              <div className="mt-4 rounded-xl border border-vj-border bg-white p-5 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-vj-green/10 flex items-center justify-center text-vj-green font-bold text-base shrink-0">
                  {(trip.clients as { name: string }).name?.charAt(0) ?? 'C'}
                </div>
                <div>
                  <p className="text-xs text-vj-txt3 uppercase tracking-wider font-medium">Cliente Principal</p>
                  <p className="font-semibold text-vj-txt">{(trip.clients as { name: string }).name}</p>
                </div>
              </div>
            )}

            {/* Notas internas */}
            {trip.notes_internal && (
              <div className="mt-4 rounded-xl border border-vj-border bg-white p-5">
                <p className="text-xs text-vj-txt3 uppercase tracking-wider font-medium mb-2 flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" />Notas Internas</p>
                <p className="text-sm text-vj-txt whitespace-pre-wrap">{trip.notes_internal}</p>
              </div>
            )}
          </TabsContent>

          {/* ── Viajantes ── */}
          <TabsContent value="travelers" className="mt-4">
            <div className="rounded-xl border border-vj-border bg-white p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-vj-txt">Viajantes & Grupos</h3>
                <Button variant="outline" size="sm" className="border-vj-border" disabled>
                  <UsersIcon className="mr-2 h-4 w-4" /> Adicionar Viajante
                </Button>
              </div>
              {!trip.trip_travelers?.length ? (
                <div className="text-center py-12">
                  <UsersIcon className="h-10 w-10 text-vj-txt3/30 mx-auto mb-3" />
                  <p className="text-vj-txt3 text-sm">Nenhum viajante vinculado a esta viagem.</p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {trip.trip_travelers.map((t) => (
                    <div key={t.id} className="rounded-xl border border-vj-border p-4 hover:border-vj-green/30 transition-colors">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-vj-green/10 flex items-center justify-center font-bold text-vj-green shrink-0">
                          {(t.travelers as { full_name: string } | null)?.full_name?.charAt(0) ?? 'V'}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-vj-txt">{(t.travelers as { full_name: string } | null)?.full_name ?? 'Viajante'}</p>
                          <p className="text-xs text-vj-txt3">Passageiro</p>
                        </div>
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-vj-txt3">E-ticket</span>
                          <span className="font-mono">{(t as Record<string, unknown>).ticket_number as string || '—'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-vj-txt3">Assento</span>
                          <span className="font-medium">{(t as Record<string, unknown>).seat_number as string || '—'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── Documentos ── */}
          <TabsContent value="documents" className="mt-4">
            <div className="rounded-xl border border-vj-border bg-white p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-vj-txt">Cofre de Documentos</h3>
                <Button variant="outline" size="sm" className="border-vj-border" disabled>
                  <FileText className="mr-2 h-4 w-4" /> Anexar Documento
                </Button>
              </div>
              {!trip.trip_documents?.length ? (
                <div className="text-center py-12">
                  <FileText className="h-10 w-10 text-vj-txt3/30 mx-auto mb-3" />
                  <p className="text-vj-txt3 text-sm">O cofre digital está vazio.</p>
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {trip.trip_documents.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-3 rounded-xl border border-vj-border p-4 hover:border-vj-green/30 transition-colors">
                      <div className="h-10 w-10 rounded-lg bg-vj-bg flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5 text-vj-txt3" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-vj-txt truncate">{doc.title}</p>
                        <p className="text-xs text-vj-txt3 uppercase">{(doc as Record<string, unknown>).doc_type as string}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── Chamados ── */}
          <TabsContent value="tickets" className="mt-4">
            <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
              <div className="rounded-xl border border-vj-border bg-white p-6">
                <h3 className="font-semibold text-vj-txt mb-5">Chamados da Viagem</h3>
                {!tickets?.length ? (
                  <div className="text-center py-10">
                    <MessageSquare className="h-10 w-10 text-vj-txt3/30 mx-auto mb-3" />
                    <p className="text-vj-txt3 text-sm">Nenhum chamado para esta viagem.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tickets.map((ticket) => (
                      <button
                        key={ticket.id}
                        type="button"
                        onClick={() => navigate(`/tickets/${ticket.id}`)}
                        className="w-full flex items-start justify-between rounded-xl border border-vj-border p-4 text-left hover:border-vj-green/30 transition-colors"
                      >
                        <div>
                          <p className="font-medium text-vj-txt text-sm">{ticket.title}</p>
                          <p className="text-xs text-vj-txt3 mt-1 line-clamp-1">{ticket.description}</p>
                        </div>
                        <span className="text-xs text-vj-txt3 ml-4 shrink-0">{ticket.status}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-vj-border bg-white p-5 self-start">
                <h3 className="font-semibold text-vj-txt mb-4 text-sm">Abrir Chamado</h3>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="t-title" className="text-xs text-vj-txt3">Título</Label>
                    <Input id="t-title" value={ticketTitle} onChange={(e) => setTicketTitle(e.target.value)} placeholder="Reemissão de passagem" className="border-vj-border h-9 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="t-desc" className="text-xs text-vj-txt3">Descrição</Label>
                    <Input id="t-desc" value={ticketDescription} onChange={(e) => setTicketDescription(e.target.value)} placeholder="Descreva o problema..." className="border-vj-border h-9 text-sm" />
                  </div>
                  <Button
                    className="w-full"
                    disabled={!ticketTitle || !ticketDescription || createTicket.isPending}
                    onClick={async () => {
                      await createTicket.mutateAsync({ title: ticketTitle, description: ticketDescription, trip_id: trip.id, client_id: trip.primary_client_id ?? null });
                      setTicketTitle('');
                      setTicketDescription('');
                    }}
                  >
                    {createTicket.isPending ? 'Criando...' : 'Criar Chamado'}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ── Checklists ── */}
          <TabsContent value="checklists" className="mt-4">
            <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
              <div className="rounded-xl border border-vj-border bg-white p-6">
                <h3 className="font-semibold text-vj-txt mb-5">Checklists</h3>
                {!checklists?.length ? (
                  <div className="text-center py-10">
                    <CheckSquare className="h-10 w-10 text-vj-txt3/30 mx-auto mb-3" />
                    <p className="text-vj-txt3 text-sm">Nenhum checklist criado para esta viagem.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {checklists.map((checklist) => (
                      <div key={checklist.id} className="rounded-xl border border-vj-border p-5">
                        <div className="flex items-center justify-between mb-4">
                          <p className="font-semibold text-vj-txt">{checklist.title}</p>
                          <Button variant="outline" size="sm" className="border-vj-border text-xs h-7" onClick={() => navigator.clipboard.writeText(`${window.location.origin}/c/${checklist.share_token}`)}>
                            Copiar Link
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {checklist.checklist_items?.map((item) => (
                            <label key={item.id} className="flex items-start gap-3 rounded-lg border border-vj-border p-3 cursor-pointer hover:bg-vj-bg transition-colors">
                              <Checkbox checked={item.is_checked} disabled className="mt-0.5" />
                              <p className="text-sm text-vj-txt">{item.title}</p>
                            </label>
                          ))}
                          <div className="flex gap-2 mt-3">
                            <Input
                              value={checklistItemTitle[checklist.id] ?? ''}
                              onChange={(e) => setChecklistItemTitle((c) => ({ ...c, [checklist.id]: e.target.value }))}
                              placeholder="Adicionar item..."
                              className="border-vj-border h-9 text-sm"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-vj-border shrink-0"
                              disabled={!checklistItemTitle[checklist.id]?.trim() || createChecklistItem.isPending}
                              onClick={async () => {
                                const t = checklistItemTitle[checklist.id]?.trim();
                                if (!t) return;
                                await createChecklistItem.mutateAsync({ checklist_id: checklist.id, title: t, position: checklist.checklist_items?.length ?? 0 });
                                setChecklistItemTitle((c) => ({ ...c, [checklist.id]: '' }));
                              }}
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-vj-border bg-white p-5 self-start">
                <h3 className="font-semibold text-vj-txt mb-4 text-sm">Novo Checklist</h3>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-vj-txt3">Título</Label>
                    <Input value={checklistTitle} onChange={(e) => setChecklistTitle(e.target.value)} placeholder="Checklist pré-embarque" className="border-vj-border h-9 text-sm" />
                  </div>
                  <Button
                    className="w-full"
                    disabled={!checklistTitle || createChecklist.isPending}
                    onClick={async () => {
                      await createChecklist.mutateAsync({ title: checklistTitle, trip_id: trip.id, client_id: trip.primary_client_id ?? null, is_visible_to_client: true });
                      setChecklistTitle('');
                    }}
                  >
                    {createChecklist.isPending ? 'Criando...' : 'Criar Checklist'}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Sheet */}
      <TripEditSheet
        trip={trip as Record<string, unknown> & { id: string; title: string; status: string }}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSuccess={() => void refetch()}
      />
    </AppLayout>
  );
}
