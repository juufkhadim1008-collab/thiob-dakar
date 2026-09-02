/**
 * THIOB EXPRESS - MOTEUR DE GÉOLOCALISATION DAKAR & POSTGIS
 * Gestion ultra-précise des coordonnées, reverse geocoding (Malika, Almadies, Plateau, etc.),
 * calculs spatiaux et suivi temps réel.
 */

import { supabase } from './supabase';

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface DakarNeighborhoodLocation {
  name: string;
  shortName: string;
  lat: number;
  lng: number;
  zone: string;
}

// Base de repères certifiés de la Région de Dakar (Dakar, Pikine, Guédiawaye, Keur Massar, Rufisque)
export const DAKAR_GEO_PRESETS: Record<string, DakarNeighborhoodLocation> = {
  // Dakar Est / Niayes & Keur Massar
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
 * Calcul précis de distance orthodromique (Formule de Haversine)
 * Retourne la distance en kilomètres (ex: 0.8 km)
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

  return Math.round(dist * 10) / 10; // Arrondi à 1 décimale
}

/**
 * Formate une distance pour l'affichage Thiob Express
 * Ex: "800 m" ou "2.4 km"
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
 * 1. Détection par zones précises (Malika, Yeumbeul, Almadies, etc.)
 * 2. Appel API BigDataCloud + OpenStreetMap Nominatim avec détails d'adresses
 * 3. Fallback vers le centroïde le plus proche
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

  // 1. Détection géométrique précise par bornes spécifiques de Dakar
  if (lat >= 14.785 && lat <= 14.815 && lng >= -17.350 && lng <= -17.320) {
    const res = {
      neighborhood: 'Malika',
      fullAddress: 'Malika, Dakar, Sénégal',
      zone: 'Dakar Est / Niayes'
    };
    geocodeCache.set(cacheKey, res);
    return res;
  }

  if (lat >= 14.770 && lat <= 14.795 && lng >= -17.330 && lng <= -17.300) {
    const res = {
      neighborhood: 'Keur Massar',
      fullAddress: 'Keur Massar, Dakar, Sénégal',
      zone: 'Dakar Est'
    };
    geocodeCache.set(cacheKey, res);
    return res;
  }

  if (lat >= 14.760 && lat <= 14.785 && lng >= -17.375 && lng <= -17.345) {
    const res = {
      neighborhood: 'Yeumbeul',
      fullAddress: 'Yeumbeul, Dakar, Sénégal',
      zone: 'Dakar Est'
    };
    geocodeCache.set(cacheKey, res);
    return res;
  }

  // 2. Trouver le quartier le plus proche dans les centroïdes certifiés
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

  // 3. Appel de géocodage inversé précis (BigDataCloud Client API - rapide et gratuit)
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
    // Tentative de fallback via Nominatim
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const nomRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=17&addressdetails=1`,
        {
          headers: { 'Accept-Language': 'fr' },
          signal: controller.signal,
        }
      );
      clearTimeout(timeoutId);
      if (nomRes.ok) {
        const nomData = await nomRes.json();
        const addr = nomData.address || {};
        const sub = addr.suburb || addr.neighbourhood || addr.village || addr.quarter || addr.city_district || addr.town;
        if (sub) {
          resolvedNeighborhood = sub;
          resolvedAddress = `${sub}, Dakar, Sénégal`;
        }
      }
    } catch {
      // Conserve resolvedNeighborhood issu des centroïdes certifiés
    }
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
 * Récupère la position GPS actuelle exacte via l'API HTML5 Geolocation
 */
export async function getCurrentBrowserLocation(): Promise<{
  coords: GeoPoint;
  accuracy: number;
}> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      reject(new Error('La géolocalisation n’est pas supportée par votre navigateur.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          coords: {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          },
          accuracy: pos.coords.accuracy,
        });
      },
      (err) => {
        let msg = 'Impossible de récupérer votre position GPS.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Autorisation GPS refusée. Veuillez activer la localisation dans les réglages de votre téléphone.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = 'Signal GPS non disponible.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Délai d’attente GPS dépassé.';
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0, // Force un relevé en direct sans cache obsolète
      }
    );
  });
}

/**
 * Ouvre la position directement dans l'application Maps native (Google Maps / Apple Maps / Waze)
 */
export function openInExternalMaps(lat: number, lng: number, label: string = 'Destination Thiob') {
  if (typeof window === 'undefined') return;
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (isIOS) {
    window.open(`maps://maps.apple.com/?q=${encodeURIComponent(label)}&ll=${lat},${lng}`, '_blank');
  } else {
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
  }
}

/**
 * Suivi GPS en temps réel du coursier (cadence adaptative)
 */
export class CourierLocationTracker {
  private watchId: number | null = null;
  private courierId: string;
  private isDelivering: boolean = false;
  private lastUpdateTimestamp: number = 0;
  private onLocationUpdate?: (pos: GeoPoint) => void;

  constructor(courierId: string, onLocationUpdate?: (pos: GeoPoint) => void) {
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
        const throttleInterval = this.isDelivering ? 5000 : 15000; // 5s en course, 15s au repos

        if (now - this.lastUpdateTimestamp < throttleInterval) {
          return;
        }

        this.lastUpdateTimestamp = now;
        const coords: GeoPoint = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        if (this.onLocationUpdate) {
          this.onLocationUpdate(coords);
        }

        try {
          await supabase.rpc('update_courier_gps', {
            p_courier_id: this.courierId,
            p_lat: coords.lat,
            p_lng: coords.lng,
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
        maximumAge: 5000,
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
