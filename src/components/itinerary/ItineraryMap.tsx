import { logger } from '@/utils/logger';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface StopCoordinate {
  id: string;
  lat: number;
  lng: number;
  name: string;
  time?: string;
  category?: string;
  emoji?: string;
  description?: string;
  day_number: number;
}

interface ItineraryMapProps {
  stops: StopCoordinate[];
  activeStopId?: string | null;
  interactive?: boolean;
}

// Colors for different stop categories
const CATEGORY_COLORS: Record<string, string> = {
  transport: '#64748b',
  departure: '#64748b',
  return: '#64748b',
  nature: '#10b981',
  beach: '#0ea5e9',
  restaurant: '#f59e0b',
  food: '#f59e0b',
  hotel: '#8b5cf6',
  accommodation: '#8b5cf6',
  culture: '#ec4899',
  attraction: '#f43f5e',
  default: '#3b82f6'
};

function createNumberedPin(number: number, category: string = 'default') {
  const color = CATEGORY_COLORS[category] || CATEGORY_COLORS.default;

  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="
        width: 32px; height: 32px;
        background: ${color};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 2px solid white;
        display: flex; align-items: center; justify-content: center;
        transition: transform 0.2s ease;
      " class="pin-marker">
        <span style="
          transform: rotate(45deg);
          color: white;
          font-weight: 700;
          font-size: 14px;
          line-height: 1;
        ">${number}</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -34]
  });
}

// Fetch OSRM route using the public demo server
async function getRoute(waypoints: { lat: number; lng: number }[]) {
  if (waypoints.length < 2) return null;
  const coords = waypoints.map(p => `${p.lng},${p.lat}`).join(';');
  const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson&steps=false`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.code === 'Ok' && data.routes.length > 0) {
      return data.routes[0].geometry;
    }
  } catch (err) {
    logger.error('Failed to get route geometry:', err);
  }
  return null;
}

export function ItineraryMap({ stops, activeStopId, interactive = true }: ItineraryMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const routeLayerRef = useRef<L.GeoJSON | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Default center (Brazil)
    const initialCenter: L.LatLngTuple = [-14.235, -51.925];
    
    mapRef.current = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 4,
      zoomControl: interactive,
      dragging: interactive,
      scrollWheelZoom: interactive,
      doubleClickZoom: interactive,
      touchZoom: interactive
    });

    // CARTO Voyager Tiles (clean, beautiful, no key required)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(mapRef.current);

    return () => {
      mapRef.current?.remove();
    };
  }, [interactive]);

  // Update Markers and Routes
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear old markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    // Clear old route
    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }

    const validStops = stops.filter(s => s.lat != null && s.lng != null);
    
    // Add new markers
    validStops.forEach((stop, index) => {
      const marker = L.marker([stop.lat, stop.lng], {
        icon: createNumberedPin(index + 1, stop.category || 'default'),
        interactive
      }).addTo(mapRef.current!);

      const popupContent = `
        <div class="px-1 py-1 min-w-[180px] font-sans">
          <div class="flex items-center gap-2 mb-1">
            <span class="text-xl">${stop.emoji || '📍'}</span>
            <strong class="text-sm font-semibold text-slate-800 leading-tight">${stop.name}</strong>
          </div>
          ${stop.time ? `<div class="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">⏰ ${stop.time}</div>` : ''}
          ${stop.description ? `<p class="text-xs text-slate-600 line-clamp-2 mt-1 leading-snug">${stop.description}</p>` : ''}
        </div>
      `;

      if (interactive) {
        marker.bindPopup(popupContent, {
          className: 'custom-popup rounded-xl  border-0',
          closeButton: false
        });
      }

      markersRef.current[stop.id] = marker;
    });

    // Fit bounds to show all markers
    if (validStops.length > 0) {
      const bounds = L.latLngBounds(validStops.map(s => [s.lat, s.lng]));
      mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }

    // Draw route connecting points
    if (validStops.length > 1) {
      const waypoints = validStops.map(s => ({ lat: s.lat, lng: s.lng }));
      
      // Get the real routing polyline from OSRM
      getRoute(waypoints).then(geometry => {
        if (geometry && mapRef.current) {
          routeLayerRef.current = L.geoJSON(geometry, {
            style: {
              color: '#3b82f6',
              weight: 4,
              opacity: 0.6,
              dashArray: '10, 8', // dashed line for flight/jump feel
              lineCap: 'round',
              lineJoin: 'round'
            }
          }).addTo(mapRef.current);
        } else if (mapRef.current) {
            // Fallback: draw straight lines if routing fails
            const lineCoords = validStops.map(s => [s.lat, s.lng] as L.LatLngTuple);
            routeLayerRef.current = (L.polyline(lineCoords, {
                color: '#3b82f6',
                weight: 3,
                opacity: 0.5,
                dashArray: '8, 8'
            }) as unknown as L.GeoJSON).addTo(mapRef.current);
        }
      });
    }
  }, [stops, interactive]);

  // Handle Active Stop focus
  useEffect(() => {
    if (!mapRef.current || !activeStopId || !markersRef.current[activeStopId]) return;

    const marker = markersRef.current[activeStopId];
    const latlng = marker.getLatLng();
    mapRef.current.setView(latlng, 16, {
      animate: true,
      duration: 0.8
    });

    if (interactive) {
      marker.openPopup();
    }
    
    // Slight zoom effect for the focused marker
    const el = marker.getElement();
    if (el) {
      const inner = el.querySelector('.pin-marker') as HTMLElement;
      if (inner) {
        inner.style.transform = 'rotate(-45deg) scale(1.2)';
        setTimeout(() => {
           if (inner) inner.style.transform = 'rotate(-45deg) scale(1)';
        }, 1500);
      }
    }
  }, [activeStopId, interactive]);

  // Additional Leaflet CSS Overrides for proper visual
  return (
    <>
      <style>{`
        .leaflet-container {
          background-color: #f8fafc;
          font-family: inherit;
        }
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          padding: 4px;
          border: 1px solid rgba(0, 0, 0, 0.08);
        }
        .custom-popup .leaflet-popup-tip-container {
          margin-top: -1px;
        }
      `}</style>
      <div ref={mapContainerRef} className="w-full h-full z-0" />
    </>
  );
}
