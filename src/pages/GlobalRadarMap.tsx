import { GlobalRadarMapWidget, RadarMarker } from '@/components/GlobalRadarMapWidget';
import { useGroupTrips } from '@/hooks/useGroupTrips';
import { geocodeCity } from '@/utils/geocoder';
import { useEffect, useState } from 'react';
import { ArrowLeft, Globe2, Loader2, PlaneTakeoff, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { parseISO } from 'date-fns';

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
 const retDateExtended = new Date(retDate.getTime() + 24 * 60 * 60 * 1000);
 
 if (now >= depDate && now <= retDateExtended) {
 isTravelingNow = true;
 } else if (now < depDate) {
 isTravelingNow = false;
 } else {
 continue;
 }
 } catch(e) { continue; }

 const res = await geocodeCity(t.destination!);
 if (res && res.lat !== 0) {
 markers.push({
 id: t.id, lat: res.lat, lng: res.lng,
 name: `${t.title} (${t.destination})`,
 pax: t.current_pax || 0,
 color: isTravelingNow ? '#10b981' : '#f59e0b',
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
 <div className="w-full h-[100dvh] overflow-hidden bg-zinc-950 relative no-scrollbar">
 {/* Top Left Navigation */}
 <div className="absolute top-6 left-6 z-[1000] flex items-center gap-4">
 <Button size="icon" variant="outline" className="bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800 rounded-lg " onClick={() => navigate(-1)}>
 <ArrowLeft className="w-4 h-4" />
 </Button>
 </div>
 
 {/* Top Right Intelligence Dashboard */}
 <div className="absolute top-6 right-6 z-[1000] bg-zinc-900 border border-zinc-800 rounded-xl p-5 w-80 ">
 <h1 className="text-white font-bold tracking-widest text-[10px] uppercase flex items-center justify-between mb-4">
 <span className="flex items-center gap-2">
 <Globe2 className="w-4 h-4 text-vj-green" /> Radar Global
 {(isLoading || isProcessing) && <Loader2 className="w-3 h-3 animate-spin text-zinc-600" />}
 </span>
 </h1>
 <div className="flex gap-4 mb-6">
 <div className="flex flex-col">
 <span className="text-[9px] text-vj-green font-black uppercase tracking-widest flex items-center gap-1"><Navigation size={10}/> Ativo</span>
 <span className="text-2xl font-black text-white">{activePaxCount}</span>
 </div>
 <div className="w-px bg-zinc-800"></div>
 <div className="flex flex-col">
 <span className="text-[9px] text-amber-500 font-black uppercase tracking-widest flex items-center gap-1"><PlaneTakeoff size={10}/> Plano</span>
 <span className="text-2xl font-black text-white">{futurePaxCount}</span>
 </div>
 </div>
 
 <div className="flex flex-col gap-1 max-h-[50vh] overflow-y-auto no-scrollbar">
 {radarMarkers.map(m => (
 <div key={m.id} className="flex justify-between items-center bg-zinc-800/40 p-2.5 rounded-lg border border-zinc-800/50">
 <div className="flex items-center gap-3 min-w-0">
 <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: m.color }}></span>
 <span className="text-[11px] font-bold text-zinc-300 truncate">{m.name}</span>
 </div>
 <span className="text-[9px] font-black text-zinc-500 ml-2 uppercase">{m.pax} Pax</span>
 </div>
 ))}
 </div>
 </div>

 <div className="w-full h-full">
 <GlobalRadarMapWidget markers={radarMarkers} interactive={true} />
 </div>
 </div>
 );
}
