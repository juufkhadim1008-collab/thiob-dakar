/**
 * THIOB EXPRESS - MOTEUR DE GÉOLOCALISATION ULTRA-PRÉCISE DAKAR & POSTGIS
 * Gestion des coordonnées exactes, précision GPS (± X mètres), multi-pass sampling,
 * reverse geocoding précis et guidage natif (Google Maps / Apple Maps / Waze).
 */

import { supabase } from './supabase';

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface ExactLocation {
  lat: number;
  lng: number;
  accuracy: number; // Précision en mètres (ex: 4.8)
  timestamp: number;
  altitude?: number | null;
  speed?: number | null;
  heading?: number | null;
  isApproximate: boolean;
}

export interface DakarNeighborhoodLocation {
  name: string;
  shortName: string;
  lat: number;
  lng: number;
  zone: string;
}

// Base certifiée des centroïdes de la Région de Dakar
export const DAKAR_GEO_PRESETS: Record<string, DakarNeighborhoodLocation> = {
  // Dakar Est & Niayes
  'Malika': { name: 'Malika, Dakar', shortName: 'Malika', lat: 14.7925, lng: -17.3365, zone: 'Dakar Est / Niayes' },
  'Keur Massar': { name: 'Keur Massar, Dakar', shortName: 'Keur Massar', lat: 14.7820, lng: -17.3150, zone: 'Dakar Est' },
  'Yeumbeul': { name: 'Yeumbeul, Dakar', shortName: 'Yeumbeul', lat: 14.7730, lng: -17.3580, zone: 'Dakar Est' },
  'Tivaouane Peulh': { name: 'Tivaouane Peulh / Niaga', shortName: 'Tivaouane Peulh', lat: 14.8150, lng: -17.2750, zone: 'Dakar Nord-Est' },
  'Mbao': { name: 'Mbao / Forêt Classée', shortName: 'Mbao', lat: 14.7420, lng: -17.3290, zone: 'Dakar Est' },
  'Thiaroye': { name: 'Thiaroye Gare / Mer, Dakar', shortName: 'Thiaroye', lat: 14.7480, lng: -17.3780, zone: 'Dakar Est' },
  'Guédiawaye': { name: 'Guédiawaye Hamo / Littoral Nord', shortName: 'Guédiawaye', lat: 14.7780, lng: -17.3980, zone: 'Banlieue Guédiawaye' },
  'Pikine': { name: 'Pikine Icotaf / Tally Boubess', shortName: 'Pikine', lat: 14.7570, lng: -17.3940, zone: 'Banlieue Pikine' },

  // Dakar Ouest & Centre
  'Almadies': { name: 'Les Almadies, Dakar', shortName: 'Almadies', lat: 14.7431, lng: -17.5186, zone: 'Dakar Ouest' },
  'Ngor': { name: 'Ngor Virage, Dakar', shortName: 'Ngor', lat: 14.7550, lng: -17.5140, zone: 'Dakar Ouest' },
  'Yoff': { name: 'Yoff Tonghor / BCEAO, Dakar', shortName: 'Yoff', lat: 14.7610, lng: -17.4720, zone: 'Dakar Nord' },
  'Ouakam': { name: 'Ouakam Monument Renaissance, Dakar', shortName: 'Ouakam', lat: 14.7230, lng: -17.4910, zone: 'Dakar Ouest' },
  'Mermoz': { name: 'Mermoz VDN / Pyrotechnie, Dakar', shortName: 'Mermoz', lat: 14.7080, lng: -17.4720, zone: 'Dakar Centre' },
  'Sacré-Cœur': { name: 'Sacré-Cœur 3 / VDN, Dakar', shortName: 'Sacré-Cœur', lat: 14.7180, lng: -17.4620, zone: 'Dakar Centre' },
  'Fann Résidence': { name: 'Fann Résidence / Corniche', shortName: 'Fann', lat: 14.6930, lng: -17.4680, zone: 'Dakar Sud' },
  'Point E': { name: 'Point E / Piscine Olympique', shortName: 'Point E', lat: 14.6980, lng: -17.4600, zone: 'Dakar Centre' },
  'Plateau': { name: 'Dakar Plateau / Centre-Ville', shortName: 'Plateau', lat: 14.6710, lng: -17.4320, zone: 'Dakar Centre-Sud' },
  'Médina': { name: 'Médina / Rue 6, Dakar', shortName: 'Médina', lat: 14.6850, lng: -17.4480, zone: 'Dakar Centre' },
  'Grand Dakar': { name: 'Grand Dakar / Allées Khalifa', shortName: 'Grand Dakar', lat: 14.7020, lng: -17.4450, zone: 'Dakar Centre' },
  'Hann Maristes': { name: 'Hann Maristes / Parc Zoologique', shortName: 'Hann Maristes', lat: 14.7300, lng: -17.4350, zone: 'Dakar Est' },

  // Rufisque & Pôles
  'Rufisque': { name: 'Rufisque Centre / Gare TER', shortName: 'Rufisque', lat: 14.7160, lng: -17.2720, zone: 'Rufisque' },
  'Bargny': { name: 'Bargny / Minam', shortName: 'Bargny', lat: 14.6980, lng: -17.2280, zone: 'Rufisque' },
  'Diamniadio': { name: 'Diamniadio Pôle Urbain', shortName: 'Diamniadio', lat: 14.7310, lng: -17.1780, zone: 'Diamniadio' },
  'Lac Rose': { name: 'Lac Rose / Niaga Peulh', shortName: 'Lac Rose', lat: 14.8350, lng: -17.2280, zone: 'Dakar Nord-Est' },
};

export const DAKAR_DEFAULT_COORDS: GeoPoint = {
  lat: 14.7167,
  lng: -17.4677, // Centre de Dakar (Mermoz / VDN)
};

/**
 * Diagnostic & Qualité de la Précision GPS
 */
export function getAccuracyInfo(accuracyMeters?: number): {
  label: string;
  isGood: boolean;
  isApproximate: boolean;
  badgeClass: string;
} {
  if (!accuracyMeters || accuracyMeters <= 0) {
    return {
      label: 'Précision non mesurée',
      isGood: false,
      isApproximate: true,
      badgeClass: 'bg-gray-100 text-gray-700',
    };
  }

  const rounded = Math.round(accuracyMeters);

  if (rounded <= 10) {
    return {
      label: `± ${rounded} m (Excellente)`,
      isGood: true,
      isApproximate: false,
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    };
  } else if (rounded <= 35) {
    return {
      label: `± ${rounded} m (Bonne)`,
      isGood: true,
      isApproximate: false,
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };
  } else {
    return {
      label: `± ${rounded} m (Approximative)`,
      isGood: false,
      isApproximate: true,
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    };
  }
}

/**
 * Calcul précis de distance orthodromique (Haversine)
 */
export function calculateDistanceKm(
  point1: GeoPoint | { latitude?: number; longitude?: number; coordinates?: GeoPoint },
  point2: GeoPoint | { latitude?: number; longitude?: number; coordinates?: GeoPoint }
): number {
  const p1 = extractPoint(point1);
  const p2 = extractPoint(point2);

  if (!p1 || !p2) return 0;

  const R = 6371; // Rayon moyen de la Terre en km
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1.lat * Math.PI) / 180) *
      Math.cos((p2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const dist = R * c;

  return Math.round(dist * 10) / 10;
}

/**
 * Formate une distance pour l'utilisateur
 */
export function formatDistanceString(distanceKm: number): string {
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters} m`;
  }
  return `${distanceKm.toFixed(1).replace('.', ',')} km`;
}

function extractPoint(
  input: GeoPoint | { latitude?: number; longitude?: number; coordinates?: GeoPoint }
): GeoPoint | null {
  if (!input) return null;
  if ('lat' in input && 'lng' in input && typeof input.lat === 'number' && typeof input.lng === 'number') {
    return { lat: input.lat, lng: input.lng };
  }
  if ('latitude' in input && 'longitude' in input && typeof input.latitude === 'number' && typeof input.longitude === 'number') {
    return { lat: input.latitude, lng: input.longitude };
  }
  if ('coordinates' in input && input.coordinates && typeof input.coordinates.lat === 'number') {
    return { lat: input.coordinates.lat, lng: input.coordinates.lng };
  }
  return null;
}

/**
 * Reverse Geocoding ultra-précis pour Dakar
 */
const geocodeCache = new Map<string, { neighborhood: string; fullAddress: string; zone: string }>();

export async function reverseGeocodeDakar(lat: number, lng: number): Promise<{
  neighborhood: string;
  fullAddress: string;
  zone: string;
}> {
  const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey)!;
  }

  // Bornes géométriques directes de Dakar
  if (lat >= 14.785 && lat <= 14.815 && lng >= -17.350 && lng <= -17.320) {
    const res = { neighborhood: 'Malika', fullAddress: 'Malika, Dakar, Sénégal', zone: 'Dakar Est / Niayes' };
    geocodeCache.set(cacheKey, res);
    return res;
  }
  if (lat >= 14.770 && lat <= 14.795 && lng >= -17.330 && lng <= -17.300) {
    const res = { neighborhood: 'Keur Massar', fullAddress: 'Keur Massar, Dakar, Sénégal', zone: 'Dakar Est' };
    geocodeCache.set(cacheKey, res);
    return res;
  }
  if (lat >= 14.760 && lat <= 14.785 && lng >= -17.375 && lng <= -17.345) {
    const res = { neighborhood: 'Yeumbeul', fullAddress: 'Yeumbeul, Dakar, Sénégal', zone: 'Dakar Est' };
    geocodeCache.set(cacheKey, res);
    return res;
  }

  // Centroïdes certifiés
  let closestNeighborhood = 'Dakar';
  let closestZone = 'Région de Dakar';
  let minDistance = Infinity;

  for (const [name, data] of Object.entries(DAKAR_GEO_PRESETS)) {
    const dist = calculateDistanceKm({ lat, lng }, { lat: data.lat, lng: data.lng });
    if (dist < minDistance) {
      minDistance = dist;
      closestNeighborhood = name;
      closestZone = data.zone;
    }
  }

  let resolvedNeighborhood = closestNeighborhood;
  let resolvedAddress = `${closestNeighborhood}, Dakar, Sénégal`;

  // Appel de précision BigDataCloud + OSM
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const bdcRes = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=fr`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (bdcRes.ok) {
      const data = await bdcRes.json();
      const locality = data.locality || data.city || data.principalSubdivision;
      if (locality && locality.length > 2 && !locality.toLowerCase().includes('unknown')) {
        resolvedNeighborhood = locality;
        resolvedAddress = `${locality}, ${data.city || 'Dakar'}, Sénégal`;
      }
    }
  } catch {
    // Fallback silencieux
  }

  const result = {
    neighborhood: resolvedNeighborhood,
    fullAddress: resolvedAddress,
    zone: closestZone,
  };

  geocodeCache.set(cacheKey, result);
  return result;
}

/**
 * Récupération GPS multi-passes adaptative (Convergence vers la meilleure accuracy)
 * Échantillonne jusqu'à 3-5 lectures pour éliminer les premières positions trop approximatives.
 */
export async function getHighAccuracyLocation(
  maxWaitMs: number = 6000,
  targetAccuracyMeters: number = 10
): Promise<ExactLocation> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      reject(new Error('La géolocalisation n’est pas supportée par votre navigateur.'));
      return;
    }

    let bestLocation: ExactLocation | null = null;
    let watchId: number | null = null;
    let isFinished = false;

    const finish = () => {
      if (isFinished) return;
      isFinished = true;
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
      if (bestLocation) {
        resolve(bestLocation);
      } else {
        // Fallback sur getCurrentPosition simple
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            resolve({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              accuracy: pos.coords.accuracy || 25,
              timestamp: pos.timestamp || Date.now(),
              altitude: pos.coords.altitude,
              speed: pos.coords.speed,
              heading: pos.coords.heading,
              isApproximate: (pos.coords.accuracy || 25) > 40,
            });
          },
          (err) => reject(new Error(err.message || 'Signal GPS indisponible.')),
          { enableHighAccuracy: true, timeout: 6000 }
        );
      }
    };

    const timer = setTimeout(finish, maxWaitMs);

    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const accuracy = pos.coords.accuracy || 30;
        const currentLoc: ExactLocation = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: accuracy,
          timestamp: pos.timestamp || Date.now(),
          altitude: pos.coords.altitude,
          speed: pos.coords.speed,
          heading: pos.coords.heading,
          isApproximate: accuracy > 40,
        };

        if (!bestLocation || accuracy < bestLocation.accuracy) {
          bestLocation = currentLoc;
        }

        // Si la précision souhaitée est atteinte (ex: <= 10 mètres), on valide immédiatement
        if (accuracy <= targetAccuracyMeters) {
          clearTimeout(timer);
          finish();
        }
      },
      (err) => {
        console.warn('[GPS Multi-Pass] Erreur partielle :', err.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: maxWaitMs,
      }
    );
  });
}

/**
 * Raccourci simple de capture GPS
 */
export async function getCurrentBrowserLocation(): Promise<{
  coords: GeoPoint;
  accuracy: number;
  exactLocation: ExactLocation;
}> {
  const exact = await getHighAccuracyLocation(5000, 15);
  return {
    coords: { lat: exact.lat, lng: exact.lng },
    accuracy: exact.accuracy,
    exactLocation: exact,
  };
}

/**
 * Générateur d'URL d'itinéraire universel pour Maps native (Google Maps / Apple Maps / Waze)
 */
export function getNavigationUrl(
  destLat: number,
  destLng: number,
  originLat?: number,
  originLng?: number,
  label: string = 'Destination Thiob'
): string {
  if (typeof window === 'undefined') {
    return `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}`;
  }

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  if (isIOS) {
    if (originLat && originLng) {
      return `maps://maps.apple.com/?saddr=${originLat},${originLng}&daddr=${destLat},${destLng}&q=${encodeURIComponent(label)}`;
    }
    return `maps://maps.apple.com/?daddr=${destLat},${destLng}&q=${encodeURIComponent(label)}`;
  }

  if (originLat && originLng) {
    return `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destLat},${destLng}&travelmode=driving`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}&travelmode=driving`;
}

/**
 * Ouvre directement la navigation dans l'application Maps
 */
export function openInExternalMaps(
  lat: number,
  lng: number,
  label: string = 'Destination Thiob',
  originLat?: number,
  originLng?: number
) {
  if (typeof window === 'undefined') return;
  const url = getNavigationUrl(lat, lng, originLat, originLng, label);
  window.open(url, '_blank');
}

/**
 * Suivi GPS en temps réel du coursier avec cadence adaptative & bearing
 */
export class CourierLocationTracker {
  private watchId: number | null = null;
  private courierId: string;
  private isDelivering: boolean = false;
  private lastUpdateTimestamp: number = 0;
  private onLocationUpdate?: (pos: ExactLocation) => void;

  constructor(courierId: string, onLocationUpdate?: (pos: ExactLocation) => void) {
    this.courierId = courierId;
    this.onLocationUpdate = onLocationUpdate;
  }

  public setDeliveringStatus(isDelivering: boolean) {
    this.isDelivering = isDelivering;
  }

  public startTracking() {
    if (typeof window === 'undefined' || !navigator.geolocation) return;
    if (this.watchId !== null) return;

    this.watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const now = Date.now();
        const throttleInterval = this.isDelivering ? 4000 : 15000;

        if (now - this.lastUpdateTimestamp < throttleInterval) {
          return;
        }

        this.lastUpdateTimestamp = now;
        const exactLoc: ExactLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy || 5,
          timestamp: position.timestamp || now,
          altitude: position.coords.altitude,
          speed: position.coords.speed,
          heading: position.coords.heading,
          isApproximate: (position.coords.accuracy || 5) > 40,
        };

        if (this.onLocationUpdate) {
          this.onLocationUpdate(exactLoc);
        }

        try {
          await supabase.rpc('update_courier_gps', {
            p_courier_id: this.courierId,
            p_lat: exactLoc.lat,
            p_lng: exactLoc.lng,
            p_accuracy: exactLoc.accuracy,
            p_bearing: exactLoc.heading || 0,
            p_status: this.isDelivering ? 'BUSY' : 'AVAILABLE',
            p_is_online: true,
          });
        } catch {
          // Sync silencieuse
        }
      },
      (error) => {
        console.warn('[CourierTracker] Erreur GPS :', error.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 3000,
        timeout: 10000,
      }
    );
  }

  public stopTracking() {
    if (this.watchId !== null && typeof window !== 'undefined') {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }
}
