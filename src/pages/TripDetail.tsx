import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, MapPin, CalendarDays, Users as UsersIcon,
  FileText, CheckSquare, MessageSquare, Plane, Edit2,
  Hotel, Clock, Users2, DollarSign, Shield, Lock, Map, ExternalLink,
} from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { useTrip } from '@/hooks/useTrips';
import { useChecklists, useCreateChecklist, useCreateChecklistItem } from '@/hooks/useChecklists';
import { useCreateTicket, useTickets } from '@/hooks/useTickets';
import { useItineraryDetail, useItineraryStops } from '@/hooks/useItineraries';
import { ItinerarySplitView } from '@/components/itinerary/ItinerarySplitView';
import type { StopCoordinate } from '@/components/itinerary/ItineraryMap';
import { TripEditSheet } from '@/components/TripEditSheet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/ui/StatusBadge';

const STATUS_MAP: Record<string, { label: string; variant: 'success' | 'info' | 'warning' | 'neutral' | 'danger' }> = {
  quoting:   { label: 'Em Cotação',  variant: 'warning' },
  booked:    { label: 'Reservado',   variant: 'info' },
  confirmed: { label: 'Confirmado',  variant: 'success' },
  traveling: { label: 'Em Viagem',   variant: 'info' },
  completed: { label: 'Concluído',   variant: 'neutral' },
  cancelled: { label: 'Cancelado',   variant: 'danger' },
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

  // Itinerary linked to this trip
  const tripItineraryId = (trip as any)?.itinerary_id as string | undefined;
  const { data: linkedItinerary } = useItineraryDetail(tripItineraryId);
  const { stops: linkedStops } = useItineraryStops(tripItineraryId);

  const mappedStops: StopCoordinate[] = (linkedStops || []).map((s: any) => ({
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
      <div className="space-y-8 max-w-[1400px] mx-auto pb-20 px-4 sm:px-6">
        
        {/* Header: Identity & Actions */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-start gap-4">
            <Button variant="outline" size="icon" className="shrink-0 premium-button border-vj-border h-12 w-12 bg-white" onClick={() => navigate('/trips')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="font-heading text-4xl font-extrabold text-vj-txt tracking-tight leading-none">{trip.title}</h1>
                <div className="scale-110 origin-left">
                  <StatusBadge variant={statusInfo.variant}>{statusInfo.label}</StatusBadge>
                </div>
              </div>
              <p className="text-sm text-vj-txt3 font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4 text-vj-green" /> {destination} • #{trip.id.slice(0, 8)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
             <Button variant="outline" className="premium-button border-vj-border bg-white" onClick={() => navigate('/itineraries')}>
               <Map className="w-4 h-4 mr-2" /> Roteiros
             </Button>
             <Button onClick={() => setEditOpen(true)} className="premium-button bg-vj-txt text-white hover:bg-zinc-800 shadow-xl">
               <Edit2 className="h-4 w-4 mr-2" /> Gerenciar Viagem
             </Button>
          </div>
        </div>

        {/* The Premium Bento Grid */}
        <div className="bento-grid-premium auto-rows-auto">
          
          {/* Main Info Block (Wide) */}
          <div className="col-span-1 md:col-span-2 premium-card p-8 flex flex-col justify-between bg-gradient-to-br from-white to-zinc-50/50">
            <div className="flex items-center justify-between mb-10">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-vj-txt3">Cronograma & Logística</span>
              <CalendarDays className="w-5 h-5 text-vj-green/40" />
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-vj-txt3 uppercase tracking-wider">Partida</p>
                <p className="text-xl font-bold">{new Date(trip.departure_date!).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</p>
                <p className="text-xs text-vj-txt3 font-medium">{new Date(trip.departure_date!).getFullYear()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-vj-txt3 uppercase tracking-wider">Retorno</p>
                <p className="text-xl font-bold">{new Date(trip.return_date!).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</p>
                <p className="text-xs text-vj-txt3 font-medium">{new Date(trip.return_date!).getFullYear()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-vj-txt3 uppercase tracking-wider">Duração</p>
                <p className="text-xl font-bold">{numNights} Noites</p>
                <p className="text-xs text-vj-txt3 font-medium">Estadia total</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-vj-txt3 uppercase tracking-wider">Passageiros</p>
                <p className="text-xl font-bold">{((trip as any).pax_count) ?? 0} Pax</p>
                <p className="text-xs text-vj-txt3 font-medium">Ocupação total</p>
              </div>
            </div>
          </div>

          {/* Voo & Rota SVG (Card) */}
          <div className="col-span-1 premium-card bg-zinc-950 p-6 text-white flex flex-col justify-between overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-transparent opacity-30 group-hover:opacity-50 transition-opacity" />
            <div className="relative z-10 flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-zinc-500 text-balance">Logística Aérea</span>
              <Plane className="w-4 h-4 text-green-400" />
            </div>

            <div className="relative z-10 py-6">
               <div className="flex items-center justify-between gap-4">
                  <div className="text-center">
                    <p className="text-[32px] font-bold leading-none">BR</p>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 mt-1">SAO</p>
                  </div>
                  <div className="flex-1 relative flex flex-col items-center">
                    <svg viewBox="0 0 100 40" className="w-full h-10 overflow-visible">
                      <path d="M 5 35 Q 50 0 95 35" stroke="rgba(34, 197, 94, 0.4)" strokeWidth="1" fill="none" strokeDasharray="3 2" />
                      <circle cx="5" cy="35" r="2" fill="#22c55e" />
                      <circle cx="95" cy="35" r="2" fill="#22c55e" />
                      <text x="50" y="20" textAnchor="middle" fontSize="12" fill="#22c55e" className="animate-pulse">✈</text>
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-[32px] font-bold leading-none text-green-400">{trip.destination_city?.slice(0, 3).toUpperCase() || 'DST'}</p>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 mt-1">{trip.destination_city || 'Destino'}</p>
                  </div>
               </div>
            </div>

            <div className="relative z-10 pt-4 border-t border-zinc-800 grid grid-cols-2 gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
               <div>LOC: <span className="text-white ml-1">{(trip as any).locator_code || '---'}</span></div>
               <div className="text-right font-mono">{(trip as any).flight_number || 'S/V'}</div>
            </div>
          </div>

          {/* Hotel Block (Mini) */}
          <div className="col-span-1 premium-card p-6 flex flex-col justify-between card-gradient-green border-vj-green/10">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-vj-green">Hospedagem Selecionada</span>
              <Hotel className="w-5 h-5 text-vj-green/60" />
            </div>
            
            <div className="mt-8">
              <h4 className="text-lg font-bold truncate max-w-full text-vj-txt">{trip.hotel_name || "Sem Hotel Definido"}</h4>
              <p className="text-xs text-vj-txt3 font-medium mt-1">{(trip as any).meal_plan || "Regime não informado"}</p>
              
              <div className="flex items-center gap-1 mt-3">
                {[1,2,3,4,5].map(s => <div key={s} className="w-1.5 h-1.5 rounded-full bg-vj-green/20" />)}
              </div>
            </div>
          </div>

          {/* Finance & Insurance (Medium) */}
          <div className="col-span-1 md:col-span-1 lg:col-span-1 premium-card p-6 bg-slate-50 border-slate-200">
             <h3 className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400 mb-6">Financeiro & Proteção</h3>
             
             <div className="space-y-6">
                <div>
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Valor do Pacote</p>
                   <p className="stat-value text-vj-txt text-3xl leading-none">{fmtCurrency((trip as any).total_value)}</p>
                </div>
                <div className="pt-4 border-t border-slate-200">
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Shield className="w-3 h-3"/> Seguro Viagem</p>
                   <p className="text-xs font-bold text-vj-txt truncate">{(trip as any).insurance_company || "Não Contratado"}</p>
                   <p className="text-[10px] font-mono text-slate-400 mt-0.5">{(trip as any).insurance_policy || "---"}</p>
                </div>
             </div>
          </div>

          {/* Client & Travelers integrated (Medium-Wide) */}
          <div className="col-span-1 md:col-span-2 lg:col-span-2 premium-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-vj-txt3">Passageiros & Documentação</h3>
              <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase hover:bg-zinc-100" disabled>Integrar CRM →</Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Primary Client */}
              {trip.clients && (
                <div className="p-4 rounded-[20px] bg-zinc-50 border border-zinc-100 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-vj-green flex items-center justify-center text-white font-black shadow-lg shadow-green-900/10">
                    {(trip.clients as any).name?.charAt(0) || 'C'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold text-vj-green uppercase tracking-widest">Contratante</p>
                    <p className="text-sm font-bold text-vj-txt truncate">{(trip.clients as any).name}</p>
                  </div>
                </div>
              )}

              {/* Travelers Quick Scroll */}
              <div className="flex gap-2 overflow-x-auto scrollbar-none py-1">
                 {trip.trip_travelers?.map((t: any) => (
                   <div key={t.id} className="min-w-[140px] p-3 rounded-2xl border border-zinc-100 bg-white flex flex-col items-center text-center">
                     <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-[10px] font-bold text-zinc-500 mb-2">
                       {t.travelers?.full_name?.charAt(0) || 'V'}
                     </div>
                     <p className="text-[10px] font-bold truncate w-full">{t.travelers?.full_name}</p>
                     <p className="text-[9px] text-zinc-400 font-medium">Assento: {t.seat_number || '--'}</p>
                   </div>
                 ))}
                 {!trip.trip_travelers?.length && <p className="text-[10px] text-vj-txt3 italic flex items-center h-full">Nenhum viajante vinculado.</p>}
              </div>
            </div>
          </div>

          {/* Internal Notes / Vault (Tall) */}
          <div className="col-span-1 md:col-span-1 row-span-1 premium-card p-6 flex flex-col justify-between bg-zinc-50 border-vj-border/30">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Lock className="w-4 h-4 text-vj-txt3" />
                <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-vj-txt3">Notas do Agente</span>
              </div>
              <p className="text-xs text-vj-txt font-medium leading-relaxed italic line-clamp-6">
                {trip.notes_internal || "Nenhuma nota interna registrada para esta viagem. Clique em editar para adicionar informações críticas do passageiro."}
              </p>
            </div>
            
            <div className="pt-6 border-t border-zinc-200 mt-6 flex justify-between items-center text-[10px] font-extrabold uppercase tracking-widest text-vj-txt3">
               <span>Cofre Ativo</span>
               <div className="flex gap-1">
                 {[1,2,3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-green-500" />)}
               </div>
            </div>
          </div>

          {/* Roteiro & Chamados Tabs (Wide Bottom) */}
          <div className="col-span-full mt-4">
             <Tabs defaultValue="roteiro" className="w-full">
                <TabsList className="bg-zinc-100 border-vj-border p-1 rounded-2xl mb-6">
                  <TabsTrigger value="roteiro" className="rounded-xl px-8 data-[state=active]:bg-white data-[state=active]:shadow-sm">Roteiro Detalhado</TabsTrigger>
                  <TabsTrigger value="tickets" className="rounded-xl px-8 data-[state=active]:bg-white data-[state=active]:shadow-sm">Suporte & Chamados</TabsTrigger>
                  <TabsTrigger value="checklists" className="rounded-xl px-8 data-[state=active]:bg-white data-[state=active]:shadow-sm">Checklists</TabsTrigger>
                  <TabsTrigger value="documents" className="rounded-xl px-8 data-[state=active]:bg-white data-[state=active]:shadow-sm">Todos os Documentos</TabsTrigger>
                </TabsList>
                
                <TabsContent value="roteiro">
                   <div className="premium-card overflow-hidden">
                      <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                        <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2"><Map className="w-4 h-4 text-vj-green"/> Visualização do Itinerário</h3>
                        <Button variant="outline" size="sm" className="premium-button text-xs h-8" onClick={() => navigate(`/itineraries/${tripItineraryId}/builder`)}>Editar no Módulo</Button>
                      </div>
                      <div className="h-[500px]">
                         {tripItineraryId ? (
                           <ItinerarySplitView stops={mappedStops} isEditable={false} className="border-0 rounded-none h-full" />
                         ) : (
                           <div className="h-full flex flex-col items-center justify-center p-20 text-center text-vj-txt3">
                             <Map className="w-12 h-12 mb-4 opacity-20" />
                             <p className="text-sm font-medium">Nenhum roteiro vinculado.</p>
                           </div>
                         )}
                      </div>
                   </div>
                </TabsContent>

                <TabsContent value="tickets">
                   <div className="grid md:grid-cols-3 gap-6">
                      <div className="md:col-span-2 premium-card p-6">
                         <h3 className="text-sm font-bold uppercase tracking-wider mb-6">Histórico de Atendimento</h3>
                         <div className="space-y-3">
                            {tickets?.map(t => (
                              <div key={t.id} className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-between hover:bg-zinc-100 transition-colors cursor-pointer" onClick={() => navigate(`/tickets/${t.id}`)}>
                                 <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${t.priority === 'urgent' ? 'bg-red-500' : 'bg-amber-400'}`} />
                                    <span className="text-sm font-bold">{t.title}</span>
                                 </div>
                                 <span className="text-[10px] font-bold uppercase text-zinc-400">{t.status}</span>
                              </div>
                            ))}
                            {!tickets?.length && <p className="text-xs text-vj-txt3 text-center py-10 italic">Nenhum chamado pendente.</p>}
                         </div>
                      </div>
                      <div className="premium-card p-6 bg-zinc-900 text-white">
                         <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4">Novo Chamado</h3>
                         <div className="space-y-4">
                            <Input value={ticketTitle} onChange={(e) => setTicketTitle(e.target.value)} placeholder="Título do problema..." className="bg-zinc-800 border-zinc-700 text-white" />
                            <Input value={ticketDescription} onChange={(e) => setTicketDescription(e.target.value)} placeholder="Descrição curta..." className="bg-zinc-800 border-zinc-700 text-white" />
                            <Button className="w-full bg-white text-zinc-900 hover:bg-zinc-200 premium-button" onClick={async () => {
                              await createTicket.mutateAsync({ title: ticketTitle, description: ticketDescription, trip_id: trip.id, client_id: trip.primary_client_id ?? null });
                              setTicketTitle(''); setTicketDescription('');
                            }}>Abrir Ticket</Button>
                         </div>
                      </div>
                   </div>
                </TabsContent>
                
                <TabsContent value="documents">
                   <div className="premium-card p-8">
                     <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {trip.trip_documents?.map(doc => (
                          <div key={doc.id} className="p-4 rounded-[20px] bg-zinc-50 border border-zinc-100 flex flex-col items-center text-center gap-3 hover:border-vj-green/40 transition-all cursor-pointer">
                             <div className="w-12 h-12 rounded-2xl bg-white border border-zinc-100 flex items-center justify-center shadow-sm">
                               <FileText className="w-6 h-6 text-vj-green" />
                             </div>
                             <div>
                               <p className="text-xs font-bold truncate w-full">{doc.title}</p>
                               <p className="text-[10px] text-vj-txt3 uppercase font-bold mt-1">{(doc as any).doc_type}</p>
                             </div>
                          </div>
                        ))}
                        {!trip.trip_documents?.length && <p className="text-xs text-vj-txt3 text-center col-span-full py-20 italic">Ainda não há documentos anexados.</p>}
                     </div>
                   </div>
                </TabsContent>

                <TabsContent value="checklists">
                   <div className="grid md:grid-cols-2 gap-4">
                      {checklists?.map(cl => (
                        <div key={cl.id} className="premium-card p-6">
                           <h4 className="text-sm font-bold uppercase tracking-wider mb-4">{cl.title}</h4>
                           <div className="space-y-2">
                              {cl.checklist_items?.map((item: any) => (
                                <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                                   <Checkbox checked={item.is_checked} disabled />
                                   <span className="text-xs font-medium">{item.title}</span>
                                </div>
                              ))}
                           </div>
                        </div>
                      ))}
                   </div>
                </TabsContent>
             </Tabs>
          </div>

        </div>
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
