import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, FileText, Plane, MapPin, Hotel, ArrowLeft, Users, Download, Globe2 } from 'lucide-react';
import { usePortalTrip } from '@/hooks/usePortal';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function PortalTripDetail() {
  const { org_slug, id } = useParams<{ org_slug: string; id: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = usePortalTrip(org_slug, id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 p-6 md:p-12 space-y-8">
        <Skeleton className="h-40 w-full rounded-[2rem]" />
        <Skeleton className="h-[500px] w-full rounded-[2rem]" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950">
         <div className="flex flex-col items-center gap-4">
            <Plane className="h-12 w-12 text-muted-foreground/30" />
            <p className="text-muted-foreground">O itinerário não foi encontrado ou está expirado.</p>
         </div>
      </div>
    );
  }

  const { organization, trip } = data;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-foreground pb-20 font-sans">
      {/* Hero Banner Immersive */}
      <div className="relative h-[280px] md:h-[400px] w-full overflow-hidden">
         <div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{ 
               backgroundImage: `url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop')`, // generic beautiful plane/clouds 
               filter: 'brightness(0.6)'
            }}
         />
         <div className="absolute inset-0 bg-gradient-to-t from-slate-50 dark:from-zinc-950 via-transparent to-transparent" />
         
         <div className="relative z-10 h-full max-w-6xl mx-auto px-6 pt-8 flex flex-col">
            <Button 
               variant="outline" 
               className="self-start rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white backdrop-blur-md"
               onClick={() => navigate(`/portal/${org_slug}/home`)}
            >
               <ArrowLeft className="h-4 w-4 mr-2" />
               Voltar ao Início
            </Button>
            
            <div className="mt-auto pb-10">
               <div className="flex items-center gap-3 mb-3">
                  <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-md uppercase tracking-wider font-semibold">
                     {trip.status}
                  </Badge>
                  <span className="text-white/80 text-sm font-medium flex items-center gap-1.5 backdrop-blur-sm bg-black/20 px-3 py-1 rounded-full"><Globe2 className="h-4 w-4" /> {organization.name}</span>
               </div>
               <h1 className="font-heading text-4xl md:text-6xl font-bold text-white tracking-tight drop-shadow-lg">{trip.title}</h1>
               <p className="text-white/90 mt-2 flex items-center gap-2 text-lg md:text-xl font-medium drop-shadow-md">
                 <MapPin className="h-5 w-5 text-white/70" />
                 {[trip.destination_city, trip.destination_country].filter(Boolean).join(', ') || 'Destino a definir'}
               </p>
            </div>
         </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-4 relative z-20 space-y-8">
        
        {/* Quick Stats Glassmorphism Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-white/20 dark:border-white/5 p-4 md:p-6 rounded-3xl shadow-xl">
           <div className="space-y-1 text-center border-r border-border/40 last:border-0 md:border-r">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Embarque</p>
              <p className="font-heading font-bold text-lg md:text-xl">{trip.departure_date ? new Date(trip.departure_date).toLocaleDateString('pt-BR', {day:'2-digit', month:'short'}) : '--'}</p>
           </div>
           <div className="space-y-1 text-center border-r border-border/40 hidden md:block">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Retorno</p>
              <p className="font-heading font-bold text-lg md:text-xl">{trip.return_date ? new Date(trip.return_date).toLocaleDateString('pt-BR', {day:'2-digit', month:'short'}) : '--'}</p>
           </div>
           <div className="space-y-1 text-center border-r border-border/40">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Passageiros</p>
              <p className="font-heading font-bold text-lg md:text-xl flex items-center justify-center gap-2">
                 <Users className="h-5 w-5 text-primary" /> {trip.trip_travelers?.length || 0}
              </p>
           </div>
           <div className="space-y-1 text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Hospedagem</p>
              <p className="font-heading font-bold text-sm md:text-base truncate px-2 text-primary" title={trip.hotel_name || 'A definir'}>{trip.hotel_name || 'A definir'}</p>
           </div>
        </div>

        <div className="grid md:grid-cols-[1fr_350px] gap-8">
           
           {/* Timeline and Details Main Column */}
           <div className="space-y-8">
              <div className="space-y-6">
                 <h2 className="text-2xl font-heading font-bold flex items-center gap-3"><Plane className="h-6 w-6 text-primary" /> Seu Itinerário</h2>
                 <div className="relative border-l-2 border-primary/20 pl-6 ml-3 space-y-6">
                    
                    {/* Flights */}
                    {!trip.trip_flights?.length ? (
                       <p className="text-sm text-muted-foreground italic">Voos ainda não foram incluídos neste roteiro.</p>
                    ) : (
                       trip.trip_flights?.map((flight) => (
                         <div key={flight.id} className="relative">
                            <div className="absolute -left-[35px] w-8 h-8 bg-blue-100 dark:bg-blue-900/30 border-2 border-primary rounded-full flex items-center justify-center z-10 shadow-md">
                               <Plane className="h-4 w-4 text-primary" />
                            </div>
                            <Card className="border border-border/40 shadow-sm rounded-2xl overflow-hidden bg-white/50 dark:bg-zinc-900/50 hover:shadow-md transition-shadow">
                               <CardHeader className="bg-primary/5 py-4 pb-3 border-b border-border/30 flex flex-row items-center justify-between">
                                  <CardTitle className="text-sm font-semibold text-primary uppercase tracking-wider">{flight.airline_name || 'Aéreo'}</CardTitle>
                                  <Badge variant="outline" className="font-mono bg-background">{flight.flight_number || 'TBA'}</Badge>
                               </CardHeader>
                               <CardContent className="p-5 flex flex-col md:flex-row justify-between md:items-center gap-4">
                                  <div>
                                     <p className="text-xs text-muted-foreground uppercase mb-1">Trajeto</p>
                                     <p className="font-medium text-lg">{[flight.origin_city, flight.destination_city].filter(Boolean).join(' → ')}</p>
                                  </div>
                                  <div className="text-left md:text-right">
                                     <p className="text-xs text-muted-foreground uppercase mb-1">Horário Previsto</p>
                                     <p className="font-semibold text-accent">
                                        {flight.departure_datetime ? new Date(flight.departure_datetime).toLocaleString('pt-BR', { dateStyle:'short', timeStyle:'short' }) : 'Horário a definir'}
                                     </p>
                                  </div>
                               </CardContent>
                            </Card>
                         </div>
                       ))
                    )}

                    {/* Hotel Pinned */}
                    <div className="relative">
                       <div className="absolute -left-[35px] w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 border-2 border-emerald-500 rounded-full flex items-center justify-center z-10 shadow-md">
                          <Hotel className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                       </div>
                       <Card className="border border-border/40 shadow-sm rounded-2xl overflow-hidden bg-white/50 dark:bg-zinc-900/50">
                          <CardContent className="p-5 flex flex-col md:flex-row justify-between md:items-center gap-4">
                             <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Hospedagem Confirmada</p>
                                <p className="font-medium text-lg text-foreground">{trip.hotel_name || 'Pendente'}</p>
                                {trip.hotel_regime && <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1 font-medium">{trip.hotel_regime}</p>}
                             </div>
                          </CardContent>
                       </Card>
                    </div>

                 </div>
              </div>
           </div>

           {/* Side Column: Documents & Travelers */}
           <div className="space-y-6">
              <Card className="rounded-[2rem] border-border/40 shadow-lg bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl">
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-accent" /> Viajantes</CardTitle>
                    <CardDescription>Cargadores desta reserva</CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-4">
                    {!trip.trip_travelers?.length && <p className="text-sm text-muted-foreground">Ninguém vinculado ainda.</p>}
                    {trip.trip_travelers?.map((traveler) => (
                      <div key={traveler.id} className="flex items-center gap-3 bg-muted/40 p-3 rounded-2xl border border-border/30">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0">
                           {traveler.travelers?.full_name?.charAt(0) || 'V'}
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="font-medium text-sm truncate">{traveler.travelers?.full_name || 'Viajante'}</p>
                           <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                              <span className="font-mono text-accent">{traveler.ticket_number || 'Sem e-ticket'}</span>
                           </p>
                        </div>
                      </div>
                    ))}
                 </CardContent>
              </Card>

              <Card className="rounded-[2rem] border-border/40 shadow-lg bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl">
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> Documentação</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-3">
                    {!trip.trip_documents?.length && <p className="text-sm text-muted-foreground">Nenhum documento anexado ou liberado pela agência.</p>}
                    {trip.trip_documents?.map((document) => (
                      <a 
                         key={document.id} 
                         href={document.file_url} 
                         target="_blank" 
                         rel="noreferrer" 
                         className="flex items-center justify-between bg-background p-4 rounded-2xl shadow-sm border border-border/40 hover:border-primary/40 hover:shadow-md transition-all group"
                      >
                         <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-xl text-primary group-hover:scale-110 transition-transform"><FileText className="h-5 w-5" /></div>
                            <div>
                               <p className="font-semibold text-sm line-clamp-1">{document.title}</p>
                               <p className="text-xs text-muted-foreground uppercase font-medium">{document.doc_type}</p>
                            </div>
                         </div>
                         <Download className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </a>
                    ))}
                 </CardContent>
              </Card>
           </div>

        </div>
      </div>
    </div>
  );
}
