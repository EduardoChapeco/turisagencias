import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface RadarMarker {
 id: string;
 lat: number;
 lng: number;
 name: string;
 pax: number;
 color: string;
 isTravelingNow?: boolean;
}

interface Props {
 markers: RadarMarker[];
 interactive?: boolean;
}

export function GlobalRadarMapWidget({ markers, interactive = true }: Props) {
 const mapContainerRef = useRef<HTMLDivElement>(null);
 const mapRef = useRef<L.Map | null>(null);
 const markersRef = useRef<Record<string, L.Marker>>({});

 useEffect(() => {
 if (!mapContainerRef.current) return;
 mapRef.current = L.map(mapContainerRef.current, {
 center: [20, 0],
 zoom: 2,
 zoomControl: interactive,
 dragging: interactive,
 scrollWheelZoom: interactive,
 doubleClickZoom: interactive,
 zoomAnimation: true
 });

 // Dark Map Base Layer
 L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
 attribution: '&copy; CARTO',
 subdomains: 'abcd',
 maxZoom: 20
 }).addTo(mapRef.current);

 return () => {
 mapRef.current?.remove();
 };
 }, [interactive]);

 useEffect(() => {
 if (!mapRef.current) return;
 
 // Clear old markers
 Object.values(markersRef.current).forEach(m => m.remove());
 markersRef.current = {};

 markers.forEach(mk => {
 const iconHTML = `
 <div class="relative w-4 h-4 flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
 <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style="background-color: ${mk.color};"></span>
 <span class="relative inline-flex rounded-full h-3 w-3 border-[2px] border-zinc-950 z-10" style="background-color: ${mk.color};"></span>
 </div>
 `;
 const icon = L.divIcon({
 className: 'leaflet-transparent-marker bg-transparent border-0',
 html: iconHTML,
 iconSize: [20, 20]
 });

 const marker = L.marker([mk.lat, mk.lng], { icon, interactive }).addTo(mapRef.current!);
 
 if (interactive) {
 marker.bindPopup(`
 <div class="px-2 py-0.5 min-w-[150px] font-sans">
 <p class="text-[9px] uppercase font-bold text-slate-400 tracking-widest mb-1 ">${mk.isTravelingNow ? '📍 Em Trânsito Hoje' : '✈️ Planejamento / Futuro'}</p>
 <p class="text-[14px] font-black leading-tight text-slate-800">${mk.name}</p>
 <p class="text-[11px] font-semibold text-slate-500 mt-1">${mk.pax} ${mk.isTravelingNow ? 'Pax hospedados/em rota' : 'Pax previstos'}</p>
 </div>
 `, { 
 className: 'custom-radar-popup border-0',
 closeButton: false,
 offset: [0, -10]
 });

 // Open popup on hover if requested, or keep tap-based
 marker.on('mouseover', () => marker.openPopup());
 marker.on('mouseout', () => marker.closePopup());
 }

 markersRef.current[mk.id] = marker;
 });

 }, [markers, interactive]);

 return (
 <>
 <style>{`
 .leaflet-container { background-color: #09090b; }
 .leaflet-transparent-marker { background: transparent; border: none; }
 .custom-radar-popup .leaflet-popup-content-wrapper {
 background: rgba(255,255,255,0.95);
 backdrop-filter: blur(8px);
 border-radius: 12px;
 box-shadow: 0 10px 25px rgba(0,0,0,0.2);
 }
 .custom-radar-popup .leaflet-popup-tip {
 background: rgba(255,255,255,0.95);
 }
 `}</style>
 <div ref={mapContainerRef} className="w-full h-full z-0" />
 </>
 );
}
