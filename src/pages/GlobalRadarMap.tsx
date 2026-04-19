import { GlobalRadarMapWidget, RadarMarker } from '@/components/GlobalRadarMapWidget';
import { useTrips } from '@/hooks/useTrips';
import { geocodeCity } from '@/utils/geocoder';
import { useEffect, useState } from 'react';
import { ArrowLeft, Globe2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function GlobalRadarMap() {
  const { data: trips } = useTrips();
  const [radarMarkers, setRadarMarkers] = useState<RadarMarker[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!trips) return;
    let isActive = true;

    const buildMarkers = async () => {
      const traveling = trips.filter(t => t.status === 'traveling');
      const markers: RadarMarker[] = [];
      const colors = ['#10b981', '#3b82f6', '#f43f5e', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
      
      for (let i = 0; i < traveling.length; i++) {
        const t = traveling[i];
        const res = await geocodeCity(t.destination_city || t.title, t.destination_country);
        if (res && res.lat !== 0) {
          markers.push({
            id: t.id,
            lat: res.lat,
            lng: res.lng,
            name: t.destination_city || t.title || 'Passageiro',
            pax: t.pax_count || 1,
            color: colors[i % colors.length]
          });
        }
      }
      if (isActive) setRadarMarkers(markers);
    };

    buildMarkers();
    return () => { isActive = false; };
  }, [trips]);

  const totalPax = radarMarkers.reduce((acc, m) => acc + m.pax, 0);

  return (
    <div className="w-screen h-screen overflow-hidden bg-zinc-950 relative">
      <div className="absolute top-6 left-6 z-[1000] flex items-center gap-4">
        <Button size="icon" variant="outline" className="bg-zinc-900/80 text-white border-zinc-700 hover:bg-zinc-800 backdrop-blur-md rounded-xl" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>
      
      <div className="absolute top-6 right-6 z-[1000] bg-zinc-900/80 backdrop-blur-md border border-zinc-700/50 rounded-2xl p-5 min-w-[280px] shadow-2xl">
         <h1 className="text-white font-bold tracking-widest text-sm uppercase flex items-center gap-2 mb-1">
           <Globe2 className="w-4 h-4 text-vj-green" /> Radar Global
         </h1>
         <p className="text-zinc-400 text-xs mb-4">{totalPax} passageiros em {radarMarkers.length} destinos ativos</p>
         
         {radarMarkers.length === 0 ? (
           <p className="text-xs text-zinc-500 italic">Buscando sinais...</p>
         ) : (
           <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto scrollbar-none pr-2">
              {radarMarkers.map(m => (
                <div key={m.id} className="flex justify-between items-center bg-zinc-800/50 p-2.5 rounded-lg border border-zinc-700/30">
                   <div className="flex items-center gap-3">
                     <span className="w-2.5 h-2.5 rounded-full animate-pulse shadow-lg" style={{ backgroundColor: m.color, boxShadow: `0 0 10px ${m.color}` }}></span>
                     <span className="text-xs font-semibold text-white tracking-wide uppercase line-clamp-1">{m.name}</span>
                   </div>
                   <span className="text-[10px] font-bold text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded-md">{m.pax} PAX</span>
                </div>
              ))}
           </div>
         )}
      </div>

      <div className="w-full h-full">
         <GlobalRadarMapWidget markers={radarMarkers} interactive={true} />
      </div>
    </div>
  );
}
