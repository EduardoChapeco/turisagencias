import { logger } from './logger';

const GEO_CACHE_KEY = 'aegis_geo_cache';

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1100; // Nominatim strictly requires 1 request per second max

export async function geocodeCity(city?: string | null, country?: string | null): Promise<{ lat: number, lng: number } | null> {
  if (!city) return null;
  const qStr = encodeURIComponent(`${city}${country ? `, ${country}` : ''}`);
  const cacheKey = qStr.toLowerCase();

  try {
    const rawCache = localStorage.getItem(GEO_CACHE_KEY);
    const cache = rawCache ? JSON.parse(rawCache) : {};

    if (cache[cacheKey]) {
      return cache[cacheKey];
    }

    // Rate Limiting Queue for OpenStreetMap (Nominatim)
    const now = Date.now();
    const timeSinceLast = now - lastRequestTime;
    if (timeSinceLast < MIN_REQUEST_INTERVAL) {
        await wait(MIN_REQUEST_INTERVAL - timeSinceLast);
    }
    lastRequestTime = Date.now();

    const url = `https://nominatim.openstreetmap.org/search?q=${qStr}&format=json&limit=1`;
    const res = await fetch(url, { 
      headers: { 
        'Accept-Language': 'pt-BR,en',
        // Good practice to provide User-Agent identifying the app
        'User-Agent': 'TurisAgenciasDashboard/1.0'
      } 
    });

    if (!res.ok) throw new Error('Geocoding failure');
    
    const data = await res.json();
    if (data && data.length > 0) {
      const coords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      cache[cacheKey] = coords;
      localStorage.setItem(GEO_CACHE_KEY, JSON.stringify(cache));
      return coords;
    }

    // Cache nulls to avoid repeatedly querying invalid cities
    cache[cacheKey] = { lat: 0, lng: 0 };
    localStorage.setItem(GEO_CACHE_KEY, JSON.stringify(cache));
    return null;

  } catch (err) {
    logger.error('Geocoding async error:', err);
    return null;
  }
}
