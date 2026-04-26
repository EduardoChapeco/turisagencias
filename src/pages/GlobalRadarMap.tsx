import { GlobalRadarMapWidget, RadarMarker } from '@/components/GlobalRadarMapWidget';
import { useGroupTrips } from '@/hooks/useGroupTrips';
import { geocodeCity } from '@/utils/geocoder';
import { useEffect, useState } from 'react';
import { ArrowLeft, Globe2, Loader2, PlaneTakeoff, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { format, isWithinInterval, parseISO } from 'date-fns';

export default function GlobalRadarMap() {
  const { data: trips, isLoading } = useGroupTrips();
  const [radarMarkers, setRadarMarkers] = useState<RadarMarker[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!trips || trips.length === 0) return;
    let isActive = true;
    setIsProcessing(true);

    const buildMarkers = async () => {
      // Filter only published or closed trips that have a destination and a date
      const activeTrips = trips.filter(t => 
        (t.status === 'published' || t.status === 'closed') && 
        t.destination && 
        t.departure_date && 
        t.return_date
      );

      const markers: RadarMarker[] = [];
      const now = new Date();
      
      for (let i = 0; i < activeTrips.length; i++) {
        const t = activeTrips[i];
        
        let isTravelingNow = false;
        try {
           const depDate = parseISO(t.departure_date!);
           const retDate = parseISO(t.return_date!);
           // Extend Return Date by 1 day to include the full day
           const retDateExtended = new Date(retDate.getTime() + 24 * 60 * 60 * 1000);
           
           if (now >= depDate && now <= retDateExtended) {
               isTravelingNow = true;
           } else if (now < depDate) {
               // Future trip
               isTravelingNow = false;
           } else {
               // Past trip, skip
               continue;
           }
        } catch(e) {
            continue;
        }

        const res = await geocodeCity(t.destination!);
        if (res && res.lat !== 0) {
          markers.push({
            id: t.id,
            lat: res.lat,
            lng: res.lng,
            name: `${t.title} (${t.destination})`,
            pax: t.current_pax || 0,
            color: isTravelingNow ? '#10b981' : '#f59e0b', // Green if traveling now, Amber if future
            isTravelingNow
          });
        }
      }
      
      if (isActive) {
        setRadarMarkers(markers);
        setIsProcessing(false);
      }
    };

    buildMarkers();
    return () => { isActive = false; };
  }, [trips]);

  const activePaxCount = radarMarkers.filter(m => m.isTravelingNow).reduce((acc, m) => acc + m.pax, 0);
  const futurePaxCount = radarMarkers.filter(m => !m.isTravelingNow).reduce((acc, m) => acc + m.pax, 0);

  return (
    <div className="w-screen h-screen overflow-hidden bg-zinc-950 relative">
      {/* Top Left Navigation */}
      <div className="absolute top-6 left-6 z-[1000] flex items-center gap-4">
        <Button size="icon" variant="outline" className="bg-zinc-900/80 text-white border-zinc-700 hover:bg-zinc-800 backdrop-blur-md rounded-xl" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>
      
      {/* Top Right Intelligence Dashboard */}
      <div className="absolute top-6 right-6 z-[1000] bg-zinc-900/80 backdrop-blur-md border border-zinc-700/50 rounded-2xl p-5 min-w-[320px]">
         <h1 className="text-white font-bold tracking-widest text-sm uppercase flex items-center justify-between mb-1">
           <span className="flex items-center gap-2">
             <Globe2 className="w-4 h-4 text-vj-green" /> Radar Global
             {(isLoading || isProcessing) && <Loader2 className="w-3 h-3 animate-spin text-zinc-400" />}
           </span>
         </h1>
         <div className="flex gap-4 mt-3 mb-4">
             <div className="flex flex-col">
                 <span className="text-xs text-vj-green font-bold flex items-center gap-1 uppercase tracking-wider"><Navigation size={12}/> Em Trânsito</span>
                 <span className="text-2xl font-black text-white">{activePaxCount} <span className="text-sm font-medium text-zinc-400">Pax</span></span>
             </div>
             <div className="w-px bg-zinc-700/50"></div>
             <div className="flex flex-col">
                 <span className="text-xs text-amber-500 font-bold flex items-center gap-1 uppercase tracking-wider"><PlaneTakeoff size={12}/> Futuro</span>
                 <span className="text-2xl font-black text-white">{futurePaxCount} <span className="text-sm font-medium text-zinc-400">Pax</span></span>
             </div>
         </div>
         
         {!isLoading && !isProcessing && radarMarkers.length === 0 ? (
           <div className="text-xs text-zinc-500 italic p-3 bg-zinc-800/30 rounded-lg text-center border border-zinc-800 border-dashed">
             Nenhuma viagem ativa com passageiros localizada.
           </div>
         ) : (
           <div className="flex flex-col gap-2.5 max-h-[55vh] overflow-y-auto scrollbar-none pr-1">
              {radarMarkers.map(m => (
                <div key={m.id} className="flex justify-between items-center bg-zinc-800/40 hover:bg-zinc-800/60 transition-colors p-2.5 rounded-xl border border-zinc-700/30">
                   <div className="flex items-center gap-3">
                     <span className="w-2.5 h-2.5 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: m.color }}></span>
                     <span className="text-xs font-semibold text-white tracking-wide truncate max-w-[150px]">{m.name}</span>
                   </div>
                   <span className="text-[10px] font-bold text-zinc-300 bg-zinc-950/70 border border-zinc-800 px-2 py-0.5 rounded-md whitespace-nowrap">
                     {m.pax} PAX
                   </span>
                </div>
              ))}
           </div>
         )}
      </div>

      {/* Embedded Map Widget */}
      <div className="w-full h-full">
         <GlobalRadarMapWidget markers={radarMarkers} interactive={true} />
      </div>
    </div>
  );
}
