import { StopCoordinate } from './ItineraryMap';
import { cn } from '@/lib/utils';
import { Clock, MapPin, Navigation } from 'lucide-react';

interface ItineraryTimelineProps {
 stops: StopCoordinate[];
 activeStopId?: string | null;
 onStopClick?: (stop: StopCoordinate) => void;
 isEditable?: boolean;
}

export function ItineraryTimeline({ stops, activeStopId, onStopClick, isEditable = false }: ItineraryTimelineProps) {
 // Group stops by day
 const days = stops.reduce((acc, stop) => {
 if (!acc[stop.day_number]) {
 acc[stop.day_number] = [];
 }
 acc[stop.day_number].push(stop);
 return acc;
 }, {} as Record<number, StopCoordinate[]>);

 if (stops.length === 0) {
 return (
 <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center bg-slate-50 dark:bg-zinc-950/50">
 <MapPin className="h-12 w-12 mb-4 opacity-20" />
 <p>Nenhuma parada adicionada ao roteiro ainda.</p>
 {isEditable && <p className="text-sm mt-2">Use o chat para gerar um roteiro com IA ou adicione manualmente.</p>}
 </div>
 );
 }

 return (
 <div className="flex flex-col h-full bg-slate-50 dark:bg-zinc-950/50 overflow-y-auto">
 <div className="p-6 md:p-8 space-y-12">
 {Object.entries(days).map(([dayNumber, dayStops]) => (
 <div key={`day-${dayNumber}`} className="relative">
 {/* Day Header */}
 <div className="sticky top-0 z-10 bg-slate-50/90 dark:bg-zinc-950/90 backdrop-blur-md py-3 -mx-4 px-4 sm:-mx-8 sm:px-8 mb-6 border-b border-border flex items-center">
 <div className="flex flex-col">
 <h3 className="text-sm font-bold text-primary uppercase tracking-widest bg-primary/10 w-fit px-3 py-1 rounded-full">
 Dia {dayNumber}
 </h3>
 </div>
 </div>

 {/* Stops list for this day */}
 <div className="space-y-6">
 {dayStops.map((stop, index) => {
 const isActive = stop.id === activeStopId;
 const isLast = index === dayStops.length - 1;

 return (
 <div 
 key={stop.id} 
 className={cn(
 "relative flex gap-4 sm:gap-6 group cursor-pointer transition-all duration-300",
 isActive ? "opacity-100" : "opacity-80 hover:opacity-100"
 )}
 onClick={() => onStopClick?.(stop)}
 >
 {/* Vertical connecting line */}
 {!isLast && (
 <div className="absolute left-[23px] sm:left-[27px] top-[46px] bottom-[-24px] w-0.5 bg-border group-hover:bg-primary/30 transition-colors" />
 )}

 {/* Emoji / Icon container */}
 <div className="relative shrink-0 z-10 pt-1">
 <div className={cn(
 "w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-xl sm:text-2xl border-2 transition-transform duration-300",
 isActive ? "bg-primary border-primary text-primary-foreground scale-110" : "bg-card border-border hover:border-primary/50"
 )}>
 {stop.emoji || '📍'}
 </div>
 </div>

 {/* Content Card */}
 <div className={cn(
 "flex-1 rounded-2xl p-4 sm:p-5 transition-all duration-300 border bg-card",
 isActive ? "border-primary ring-1 ring-primary/20 ring-offset-2 ring-offset-background" : "border-border hover: hover:border-primary/30"
 )}>
 {stop.time && (
 <div className="flex items-center text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 gap-1.5 flex-wrap">
 <Clock className="w-3.5 h-3.5" />
 {stop.time}
 {stop.category && (
 <>
 <span className="opacity-50">•</span>
 <span className={cn(
 "px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800",
 stop.category === 'transport' || stop.category === 'departure' ? 'text-slate-600 dark:text-slate-400' :
 stop.category === 'hotel' ? 'text-violet-600 dark:text-violet-400' :
 stop.category === 'restaurant' ? 'text-amber-600 dark:text-amber-400' :
 stop.category === 'nature' || stop.category === 'beach' ? 'text-emerald-600 dark:text-emerald-400' :
 'text-blue-600 dark:text-blue-400'
 )}>
 {stop.category}
 </span>
 </>
 )}
 </div>
 )}
 
 <h4 className="text-base sm:text-lg font-bold text-foreground mb-1.5 leading-tight">
 {stop.name}
 </h4>
 
 {stop.description && (
 <p className="text-sm text-muted-foreground leading-relaxed">
 {stop.description}
 </p>
 )}

 {/* Display tips or extra metadata if needed */}
 {isEditable && (
 <div className="mt-3 pt-3 border-t border-border flex items-center justify-end text-xs opacity-0 group-hover:opacity-100 transition-opacity">
 <span className="text-primary font-medium hover:underline">Editar parada</span>
 </div>
 )}
 </div>
 </div>
 );
 })}
 </div>
 </div>
 ))}
 {/* End of itinerary marker */}
 <div className="flex flex-col items-center justify-center pt-8 pb-12 opacity-50">
 <Navigation className="w-6 h-6 rotate-180 text-muted-foreground mb-2" />
 <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Fim do Roteiro</p>
 </div>
 </div>
 </div>
 );
}
