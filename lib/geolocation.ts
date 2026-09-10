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

export interface DakarLandmark {
  id: string;
  name: string;
  shortName: string;
  neighborhood: string;
  address: string;
  lat: number;
  lng: number;
  radiusMeters: number;
  zone: string;
  type: 'brt' | 'ter' | 'monument' | 'market' | 'hospital' | 'university' | 'avenue' | 'district';
}

// 🚊 BASE OFFICIELLE DES REPERES ULTRA-PRÉCIS DE DAKAR (STATIONS BRT, GARES TER, RONDS-POINTS, PLACES)
export const DAKAR_PRECISE_LANDMARKS: DakarLandmark[] = [
  // 🚍 LIGNE BRT DAKAR (Petersen -> Guédiawaye)
  {
    id: 'brt-grand-dakar',
    name: 'Gare BRT Grand Dakar',
    shortName: 'BRT Grand Dakar',
    neighborhood: 'Grand Dakar',
    address: 'Gare BRT Grand Dakar, Allées Khalifa Ababacar Sy, Grand Dakar',
    lat: 14.7032,
    lng: -17.4468,
    radiusMeters: 450,
    zone: 'Dakar Centre / Grand Dakar',
    type: 'brt',
  },
  {
    id: 'brt-jet-deau',
    name: 'Station BRT Rond-point Jet d’Eau',
    shortName: 'BRT Jet d’Eau',
    neighborhood: 'Grand Dakar / Sicap',
    address: 'Station BRT Rond-point Jet d’Eau, Allées Khalifa Ababacar Sy, Dakar',
    lat: 14.7088,
    lng: -17.4485,
    radiusMeters: 400,
    zone: 'Dakar Centre',
    type: 'brt',
  },
  {
    id: 'brt-petersen',
    name: 'Gare BRT Petersen',
    shortName: 'BRT Petersen',
    neighborhood: 'Dakar Plateau / Petersen',
    address: 'Gare BRT Petersen, Avenue Faidherbe / Centenaire, Dakar Plateau',
    lat: 14.6782,
    lng: -17.4395,
    radiusMeters: 450,
    zone: 'Dakar Plateau',
    type: 'brt',
  },
  {
    id: 'brt-obelisque',
    name: 'Station BRT Place de la Nation / Obélisque',
    shortName: 'BRT Place de la Nation',
    neighborhood: 'Colobane',
    address: 'Station BRT Place de la Nation (Obélisque), Boulevard du Général de Gaulle, Colobane',
    lat: 14.6938,
    lng: -17.4475,
    radiusMeters: 400,
    zone: 'Dakar Centre',
    type: 'brt',
  },
  {
    id: 'brt-papa-gueye-fall',
    name: 'Station BRT Papa Guèye Fall',
    shortName: 'BRT Papa Guèye Fall',
    neighborhood: 'Médina / Centenaire',
    address: 'Station BRT Allées Papa Guèye Fall, Boulevard Général de Gaulle, Médina',
    lat: 14.6860,
    lng: -17.4420,
    radiusMeters: 350,
    zone: 'Dakar Centre',
    type: 'brt',
  },
  {
    id: 'brt-dial-diop',
    name: 'Station BRT Lycée Dial Diop',
    shortName: 'BRT Dial Diop',
    neighborhood: 'Fann / Point E',
    address: 'Station BRT Lycée Dial Diop, Avenue Cheikh Anta Diop, Dakar',
    lat: 14.6985,
    lng: -17.4510,
    radiusMeters: 350,
    zone: 'Dakar Centre',
    type: 'brt',
  },
  {
    id: 'brt-sacre-coeur',
    name: 'Station BRT Sacré-Cœur / VDN',
    shortName: 'BRT Sacré-Cœur',
    neighborhood: 'Sacré-Cœur 3',
    address: 'Station BRT Sacré-Cœur, Voie de Dégagement Nord (VDN), Dakar',
    lat: 14.7175,
    lng: -17.4580,
    radiusMeters: 400,
    zone: 'Dakar Centre',
    type: 'brt',
  },
  {
    id: 'brt-liberte-6',
    name: 'Station BRT Rond-point Liberté 6',
    shortName: 'BRT Liberté 6',
    neighborhood: 'Sicap Liberté 6',
    address: 'Station BRT Rond-point Liberté 6 / VDN, Dakar',
    lat: 14.7265,
    lng: -17.4650,
    radiusMeters: 400,
    zone: 'Dakar Centre',
    type: 'brt',
  },
  {
    id: 'brt-khar-yalla',
    name: 'Station BRT Khar Yalla',
    shortName: 'BRT Khar Yalla',
    neighborhood: 'Grand Yoff / Khar Yalla',
    address: 'Station BRT Khar Yalla, Avenue Bourguiba / Grand Yoff, Dakar',
    lat: 14.7180,
    lng: -17.4480,
    radiusMeters: 400,
    zone: 'Grand Yoff',
    type: 'brt',
  },
  {
    id: 'brt-grand-medine',
    name: 'Station BRT Grand Médine',
    shortName: 'BRT Grand Médine',
    neighborhood: 'Grand Médine / Stade LSS',
    address: 'Station BRT Grand Médine, Face Stade Léopold Sédar Senghor, Dakar',
    lat: 14.7430,
    lng: -17.4485,
    radiusMeters: 400,
    zone: 'Dakar Nord',
    type: 'brt',
  },
  {
    id: 'brt-aliou-sow',
    name: 'Station BRT Échangeur Aliou Sow',
    shortName: 'BRT Aliou Sow',
    neighborhood: 'Grand Yoff / Patte d’Oie',
    address: 'Station BRT Échangeur Aliou Sow, Patte d’Oie / Grand Yoff, Dakar',
    lat: 14.7490,
    lng: -17.4320,
    radiusMeters: 400,
    zone: 'Dakar Nord',
    type: 'brt',
  },
  {
    id: 'brt-police-parcelles',
    name: 'Station BRT Police Parcelles',
    shortName: 'BRT Parcelles',
    neighborhood: 'Parcelles Assainies',
    address: 'Station BRT Commissariat Parcelles Assainies (Unité 22-26), Dakar',
    lat: 14.7540,
    lng: -17.4380,
    radiusMeters: 400,
    zone: 'Parcelles Assainies',
    type: 'brt',
  },
  {
    id: 'brt-golf-sud',
    name: 'Station BRT Golf Sud',
    shortName: 'BRT Golf Sud',
    neighborhood: 'Golf Sud / Guédiawaye',
    address: 'Station BRT Golf Sud, Corniche de Guédiawaye, Dakar',
    lat: 14.7690,
    lng: -17.4220,
    radiusMeters: 400,
    zone: 'Guédiawaye',
    type: 'brt',
  },
  {
    id: 'brt-dalal-jamm',
    name: 'Station BRT Hôpital Dalal Jamm',
    shortName: 'BRT Dalal Jamm',
    neighborhood: 'Guédiawaye',
    address: 'Station BRT Hôpital Dalal Jamm, Guédiawaye, Dakar',
    lat: 14.7765,
    lng: -17.4120,
    radiusMeters: 400,
    zone: 'Guédiawaye',
    type: 'brt',
  },
  {
    id: 'brt-prefecture-guediawaye',
    name: 'Gare BRT Préfecture Guédiawaye',
    shortName: 'BRT Guédiawaye',
    neighborhood: 'Guédiawaye Centre',
    address: 'Gare BRT Préfecture de Guédiawaye, Terminus BRT, Dakar',
    lat: 14.7830,
    lng: -17.3920,
    radiusMeters: 500,
    zone: 'Guédiawaye',
    type: 'brt',
  },
  {
    id: 'brt-arenes-nationales',
    name: 'Station BRT Arènes Nationales',
    shortName: 'BRT Arènes',
    neighborhood: 'Pikine Nord',
    address: 'Station BRT Arènes Nationales, Pikine Nord, Dakar',
    lat: 14.7520,
    lng: -17.3880,
    radiusMeters: 400,
    zone: 'Banlieue Pikine',
    type: 'brt',
  },
  {
    id: 'brt-hopital-fann',
    name: 'Station BRT Hôpital Fann / UCAD',
    shortName: 'BRT Hôpital Fann',
    neighborhood: 'Fann Résidence',
    address: 'Station BRT Hôpital Fann, Avenue Cheikh Anta Diop, Dakar',
    lat: 14.6910,
    lng: -17.4640,
    radiusMeters: 350,
    zone: 'Dakar Sud',
    type: 'brt',
  },

  // 🚆 LIGNE TER DAKAR (Dakar Centre -> Diamniadio)
  {
    id: 'ter-dakar-centre',
    name: 'Gare TER Dakar Centre-Ville',
    shortName: 'TER Dakar',
    neighborhood: 'Plateau',
    address: 'Gare TER Dakar Centre, Place du Tirailleur, Plateau',
    lat: 14.6725,
    lng: -17.4310,
    radiusMeters: 450,
    zone: 'Dakar Plateau',
    type: 'ter',
  },
  {
    id: 'ter-colobane',
    name: 'Gare TER Colobane',
    shortName: 'TER Colobane',
    neighborhood: 'Colobane',
    address: 'Gare TER Colobane, Autoroute de l’Avenir, Colobane',
    lat: 14.6920,
    lng: -17.4410,
    radiusMeters: 400,
    zone: 'Dakar Centre',
    type: 'ter',
  },
  {
    id: 'ter-hann',
    name: 'Gare TER Hann Maristes',
    shortName: 'TER Hann',
    neighborhood: 'Hann Maristes',
    address: 'Gare TER Hann, Proche Parc de Hann, Hann Maristes',
    lat: 14.7210,
    lng: -17.4320,
    radiusMeters: 400,
    zone: 'Dakar Est',
    type: 'ter',
  },
  {
    id: 'ter-dalifort',
    name: 'Gare TER Dalifort',
    shortName: 'TER Dalifort',
    neighborhood: 'Dalifort',
    address: 'Gare TER Dalifort / Forêt de Mbao Ouest, Dakar',
    lat: 14.7390,
    lng: -17.4120,
    radiusMeters: 400,
    zone: 'Dakar Est',
    type: 'ter',
  },
  {
    id: 'ter-beaux-maraichers',
    name: 'Gare TER Beaux Maraîchers',
    shortName: 'TER Maraîchers',
    neighborhood: 'Pikine',
    address: 'Gare TER Beaux Maraîchers, Gare Routière Interurbaine, Pikine',
    lat: 14.7460,
    lng: -17.4010,
    radiusMeters: 400,
    zone: 'Banlieue Pikine',
    type: 'ter',
  },
  {
    id: 'ter-pikine',
    name: 'Gare TER Pikine Icotaf',
    shortName: 'TER Pikine',
    neighborhood: 'Pikine Icotaf',
    address: 'Gare TER Pikine, Tally Boubess / Icotaf, Pikine',
    lat: 14.7540,
    lng: -17.3910,
    radiusMeters: 400,
    zone: 'Banlieue Pikine',
    type: 'ter',
  },
  {
    id: 'ter-thiaroye',
    name: 'Gare TER Thiaroye Gare',
    shortName: 'TER Thiaroye',
    neighborhood: 'Thiaroye Gare',
    address: 'Gare TER Thiaroye, Marché Thiaroye Gare, Dakar',
    lat: 14.7485,
    lng: -17.3760,
    radiusMeters: 400,
    zone: 'Dakar Est',
    type: 'ter',
  },
  {
    id: 'ter-yeumbeul',
    name: 'Gare TER Yeumbeul',
    shortName: 'TER Yeumbeul',
    neighborhood: 'Yeumbeul',
    address: 'Gare TER Yeumbeul, Yeumbeul Nord / Sud, Dakar',
    lat: 14.7670,
    lng: -17.3520,
    radiusMeters: 400,
    zone: 'Dakar Est',
    type: 'ter',
  },
  {
    id: 'ter-keur-massar',
    name: 'Gare TER Keur Massar',
    shortName: 'TER Keur Massar',
    neighborhood: 'Keur Massar',
    address: 'Gare TER Keur Massar, Boulevard de l’Est, Keur Massar',
    lat: 14.7780,
    lng: -17.3200,
    radiusMeters: 450,
    zone: 'Dakar Est',
    type: 'ter',
  },
  {
    id: 'ter-mbao',
    name: 'Gare TER Mbao',
    shortName: 'TER Mbao',
    neighborhood: 'Mbao',
    address: 'Gare TER Mbao, Cité Forêt / Petit Mbao, Dakar',
    lat: 14.7390,
    lng: -17.3250,
    radiusMeters: 400,
    zone: 'Dakar Est',
    type: 'ter',
  },
  {
    id: 'ter-rufisque',
    name: 'Gare TER Rufisque Centre',
    shortName: 'TER Rufisque',
    neighborhood: 'Rufisque',
    address: 'Gare TER Rufisque Centre, Marché Central, Rufisque',
    lat: 14.7170,
    lng: -17.2710,
    radiusMeters: 450,
    zone: 'Rufisque',
    type: 'ter',
  },
  {
    id: 'ter-bargny',
    name: 'Gare TER Bargny',
    shortName: 'TER Bargny',
    neighborhood: 'Bargny',
    address: 'Gare TER Bargny, Route Nationale 1, Bargny',
    lat: 14.6970,
    lng: -17.2260,
    radiusMeters: 400,
    zone: 'Rufisque',
    type: 'ter',
  },
  {
    id: 'ter-diamniadio',
    name: 'Gare TER Diamniadio',
    shortName: 'TER Diamniadio',
    neighborhood: 'Diamniadio',
    address: 'Gare TER Diamniadio Pôle Urbain, Diamniadio',
    lat: 14.7290,
    lng: -17.1760,
    radiusMeters: 450,
    zone: 'Diamniadio',
    type: 'ter',
  },

  // 🏛️ REPERES MAJEURS & QUARTIERS PRECIS DE DAKAR
  {
    id: 'poi-monument-renaissance',
    name: 'Monument de la Renaissance Africaine',
    shortName: 'Renaissance',
    neighborhood: 'Ouakam',
    address: 'Monument de la Renaissance Africaine, Colline des Mamelles, Ouakam',
    lat: 14.7224,
    lng: -17.4947,
    radiusMeters: 450,
    zone: 'Dakar Ouest',
    type: 'monument',
  },
  {
    id: 'poi-phare-mamelles',
    name: 'Phare des Mamelles',
    shortName: 'Phare Mamelles',
    neighborhood: 'Mamelles / Ouakam',
    address: 'Phare des Mamelles, Route des Mamelles, Ouakam',
    lat: 14.7245,
    lng: -17.5005,
    radiusMeters: 400,
    zone: 'Dakar Ouest',
    type: 'monument',
  },
  {
    id: 'poi-almadies-king-fahd',
    name: 'Almadies (Zone King Fahd Palace)',
    shortName: 'King Fahd Palace',
    neighborhood: 'Almadies',
    address: 'Route du Méridien / King Fahd Palace, Les Almadies, Dakar',
    lat: 14.7450,
    lng: -17.5210,
    radiusMeters: 450,
    zone: 'Dakar Ouest',
    type: 'district',
  },
  {
    id: 'poi-pointe-almadies',
    name: 'Pointe des Almadies',
    shortName: 'Pointe Almadies',
    neighborhood: 'Almadies',
    address: 'Pointe des Almadies (Extrême Ouest), Dakar',
    lat: 14.7410,
    lng: -17.5300,
    radiusMeters: 500,
    zone: 'Dakar Ouest',
    type: 'district',
  },
  {
    id: 'poi-ngor-virage',
    name: 'Ngor Virage / Plage de Ngor',
    shortName: 'Ngor Virage',
    neighborhood: 'Ngor',
    address: 'Route du Virage, Plage de Ngor, Dakar',
    lat: 14.7560,
    lng: -17.5140,
    radiusMeters: 450,
    zone: 'Dakar Ouest',
    type: 'district',
  },
  {
    id: 'poi-yoff-bceao',
    name: 'Yoff Tonghor / Plage BCEAO',
    shortName: 'Yoff BCEAO',
    neighborhood: 'Yoff',
    address: 'Route de la Plage BCEAO / Tonghor, Yoff, Dakar',
    lat: 14.7630,
    lng: -17.4710,
    radiusMeters: 450,
    zone: 'Dakar Nord',
    type: 'district',
  },
  {
    id: 'poi-mermoz-pyrotechnie',
    name: 'Mermoz Pyrotechnie / VDN',
    shortName: 'Mermoz VDN',
    neighborhood: 'Mermoz',
    address: 'Mermoz Pyrotechnie, Voie de Dégagement Nord (VDN), Dakar',
    lat: 14.7090,
    lng: -17.4730,
    radiusMeters: 400,
    zone: 'Dakar Centre',
    type: 'district',
  },
  {
    id: 'poi-sacre-coeur-boulangerie-jaune',
    name: 'Sacré-Cœur 3 (Boulangerie Jaune)',
    shortName: 'Boulangerie Jaune',
    neighborhood: 'Sacré-Cœur',
    address: 'Sacré-Cœur 3, Vers Boulangerie Jaune / VDN, Dakar',
    lat: 14.7160,
    lng: -17.4640,
    radiusMeters: 350,
    zone: 'Dakar Centre',
    type: 'district',
  },
  {
    id: 'poi-point-e-piscine',
    name: 'Point E (Piscine Olympique)',
    shortName: 'Point E',
    neighborhood: 'Point E',
    address: 'Point E, Vers Piscine Olympique / Rue 10, Dakar',
    lat: 14.6970,
    lng: -17.4610,
    radiusMeters: 400,
    zone: 'Dakar Centre',
    type: 'district',
  },
  {
    id: 'poi-fann-residence-corniche',
    name: 'Fann Résidence (Corniche Ouest)',
    shortName: 'Fann Résidence',
    neighborhood: 'Fann Résidence',
    address: 'Boulevard de la Corniche Ouest, Fann Résidence, Dakar',
    lat: 14.6920,
    lng: -17.4700,
    radiusMeters: 400,
    zone: 'Dakar Sud',
    type: 'district',
  },
  {
    id: 'poi-plateau-place-independance',
    name: 'Place de l’Indépendance / Plateau',
    shortName: 'Place Indépendance',
    neighborhood: 'Plateau',
    address: 'Place de l’Indépendance, Dakar Plateau, Sénégal',
    lat: 14.6705,
    lng: -17.4330,
    radiusMeters: 400,
    zone: 'Dakar Plateau',
    type: 'monument',
  },
  {
    id: 'poi-medina-rue-6',
    name: 'Médina (Rue 6 x Blaise Diagne)',
    shortName: 'Médina Rue 6',
    neighborhood: 'Médina',
    address: 'Avenue Blaise Diagne x Rue 6, Médina, Dakar',
    lat: 14.6855,
    lng: -17.4475,
    radiusMeters: 350,
    zone: 'Dakar Centre',
    type: 'district',
  },
  {
    id: 'poi-marche-hlm',
    name: 'Marché HLM 5',
    shortName: 'Marché HLM',
    neighborhood: 'HLM 5',
    address: 'Marché HLM, Allées Cheikh Sidaty Aïdara, HLM, Dakar',
    lat: 14.7060,
    lng: -17.4410,
    radiusMeters: 350,
    zone: 'Dakar Centre',
    type: 'market',
  },
  {
    id: 'poi-hann-maristes-parc',
    name: 'Hann Maristes (Parc Zoologique)',
    shortName: 'Hann Maristes',
    neighborhood: 'Hann Maristes',
    address: 'Hann Maristes II, Face Parc Zoologique et Forestier de Hann, Dakar',
    lat: 14.7310,
    lng: -17.4340,
    radiusMeters: 450,
    zone: 'Dakar Est',
    type: 'district',
  },
  {
    id: 'poi-parcelles-case-bi',
    name: 'Parcelles Assainies (Rond-point Case-Bi)',
    shortName: 'Case-Bi Parcelles',
    neighborhood: 'Parcelles Assainies',
    address: 'Rond-point Case-Bi (Unités 10 à 26), Parcelles Assainies, Dakar',
    lat: 14.7550,
    lng: -17.4420,
    radiusMeters: 450,
    zone: 'Parcelles Assainies',
    type: 'district',
  },
  {
    id: 'poi-keur-massar-rp6',
    name: 'Keur Massar (Rond-point 6)',
    shortName: 'Rond-point 6 Keur Massar',
    neighborhood: 'Keur Massar',
    address: 'Rond-point 6, Cité Aïnoumady, Keur Massar, Dakar',
    lat: 14.7830,
    lng: -17.3160,
    radiusMeters: 450,
    zone: 'Dakar Est',
    type: 'district',
  },
  {
    id: 'poi-malika-plage',
    name: 'Malika Plage / Mbeubeuss',
    shortName: 'Malika Plage',
    neighborhood: 'Malika',
    address: 'Route de la Plage / Cité Sonatel, Malika, Dakar',
    lat: 14.7950,
    lng: -17.3380,
    radiusMeters: 450,
    zone: 'Dakar Est / Niayes',
    type: 'district',
  },
  {
    id: 'poi-ucad-universite',
    name: 'Université Cheikh Anta Diop (UCAD)',
    shortName: 'UCAD Fann',
    neighborhood: 'Fann / UCAD',
    address: 'Campus Universitaire UCAD, Avenue Cheikh Anta Diop, Dakar',
    lat: 14.6890,
    lng: -17.4630,
    radiusMeters: 450,
    zone: 'Dakar Sud',
    type: 'university',
  },
  {
    id: 'poi-stade-abdoulaye-wade',
    name: 'Stade Abdoulaye Wade (Diamniadio)',
    shortName: 'Stade Wade',
    neighborhood: 'Diamniadio',
    address: 'Stade Olympique Abdoulaye Wade, Diamniadio, Sénégal',
    lat: 14.7210,
    lng: -17.1850,
    radiusMeters: 550,
    zone: 'Diamniadio',
    type: 'monument',
  },
];

/**
 * Reverse Geocoding ultra-précis pour Dakar
 * Combine détection de repères précis (BRT, TER, POI), OSM et centroïdes.
 */
const geocodeCache = new Map<string, { neighborhood: string; fullAddress: string; zone: string; landmarkId?: string }>();

export async function reverseGeocodeDakar(lat: number, lng: number): Promise<{
  neighborhood: string;
  fullAddress: string;
  zone: string;
  landmarkId?: string;
}> {
  const cacheKey = `${lat.toFixed(5)},${lng.toFixed(5)}`;
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey)!;
  }

  // 1. RECHERCHE DE REPÈRE PRÉCIS (Gare BRT, Gare TER, Rond-point, Avenue)
  let bestLandmark: DakarLandmark | null = null;
  let minLandmarkDistKm = Infinity;

  for (const lm of DAKAR_PRECISE_LANDMARKS) {
    const distKm = calculateDistanceKm({ lat, lng }, { lat: lm.lat, lng: lm.lng });
    const distMeters = distKm * 1000;
    if (distMeters <= lm.radiusMeters && distKm < minLandmarkDistKm) {
      minLandmarkDistKm = distKm;
      bestLandmark = lm;
    }
  }

  if (bestLandmark) {
    const meters = Math.round(minLandmarkDistKm * 1000);
    const resolvedNeighborhood = meters <= 80 ? bestLandmark.name : `${bestLandmark.name} (${bestLandmark.neighborhood})`;
    const resolvedAddress = meters <= 80 
      ? bestLandmark.address 
      : `À ${meters}m de ${bestLandmark.name}, ${bestLandmark.neighborhood}, Dakar`;

    const res = {
      neighborhood: resolvedNeighborhood,
      fullAddress: resolvedAddress,
      zone: bestLandmark.zone,
      landmarkId: bestLandmark.id,
    };
    geocodeCache.set(cacheKey, res);
    return res;
  }

  // 2. RECHERCHE VIA OPENSTREETMAP (Nominatim avec zoom rue max)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const osmRes = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=fr`,
      { 
        signal: controller.signal,
        headers: { 'User-Agent': 'ThiobDakarApp/1.0' }
      }
    );
    clearTimeout(timeoutId);

    if (osmRes.ok) {
      const data = await osmRes.json();
      const addr = data.address || {};
      const road = addr.road || addr.pedestrian || addr.footway || addr.path;
      const suburb = addr.suburb || addr.neighbourhood || addr.quarter || addr.city_district;
      const poiName = data.name || addr.amenity || addr.building;

      if (road || suburb || poiName) {
        let preciseNeighborhood = poiName || suburb || road || 'Dakar';
        let preciseAddress = '';

        if (road && suburb) {
          preciseNeighborhood = `${suburb} (${road})`;
          preciseAddress = `${road}, ${suburb}, Dakar, Sénégal`;
        } else if (road) {
          preciseNeighborhood = road;
          preciseAddress = `${road}, Dakar, Sénégal`;
        } else if (suburb) {
          preciseNeighborhood = suburb;
          preciseAddress = `${suburb}, Dakar, Sénégal`;
        }

        if (preciseNeighborhood && preciseAddress) {
          const res = {
            neighborhood: preciseNeighborhood,
            fullAddress: preciseAddress,
            zone: 'Région de Dakar',
          };
          geocodeCache.set(cacheKey, res);
          return res;
        }
      }
    }
  } catch {
    // Continuer vers BigDataCloud / Centroïdes
  }

  // 3. RECHERCHE VIA BIGDATACLOUD
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const bdcRes = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=fr`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (bdcRes.ok) {
      const data = await bdcRes.json();
      const locality = data.locality || data.city || data.principalSubdivision;
      if (locality && locality.length > 2 && !locality.toLowerCase().includes('unknown')) {
        const res = {
          neighborhood: locality,
          fullAddress: `${locality}, ${data.city || 'Dakar'}, Sénégal`,
          zone: 'Région de Dakar',
        };
        geocodeCache.set(cacheKey, res);
        return res;
      }
    }
  } catch {
    // Fallback centroïdes
  }

  // 4. CENTROÏDES CERTIFIÉS DE SECOURS
  let closestNeighborhood = 'Grand Dakar';
  let closestZone = 'Dakar Centre';
  let minDistance = Infinity;

  for (const [name, data] of Object.entries(DAKAR_GEO_PRESETS)) {
    const dist = calculateDistanceKm({ lat, lng }, { lat: data.lat, lng: data.lng });
    if (dist < minDistance) {
      minDistance = dist;
      closestNeighborhood = name;
      closestZone = data.zone;
    }
  }

  const result = {
    neighborhood: closestNeighborhood,
    fullAddress: `${closestNeighborhood}, Dakar, Sénégal`,
    zone: closestZone,
  };

  geocodeCache.set(cacheKey, result);
  return result;
}

/**
 * Gestionnaire de suivi GPS en direct pour l'utilisateur (Client)
 * Notifie instantanément lors de tout déplacement (> 3m).
 */
export class ClientLiveLocationWatcher {
  private watchId: number | null = null;
  private lastLat: number | null = null;
  private lastLng: number | null = null;
  private lastUpdateTime: number = 0;
  private onLocationChange: (loc: ExactLocation) => void;
  private onError?: (err: Error) => void;

  constructor(
    onLocationChange: (loc: ExactLocation) => void,
    onError?: (err: Error) => void
  ) {
    this.onLocationChange = onLocationChange;
    this.onError = onError;
  }

  public start() {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      if (this.onError) this.onError(new Error('GPS non supporté'));
      return;
    }
    if (this.watchId !== null) return;

    this.watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = pos.coords.accuracy || 5;
        const now = Date.now();

        // Calcul de la distance déplacée depuis la dernière notification
        let movedMeters = Infinity;
        if (this.lastLat !== null && this.lastLng !== null) {
          movedMeters = calculateDistanceKm({ lat, lng }, { lat: this.lastLat, lng: this.lastLng }) * 1000;
        }

        // On déclenche la mise à jour si :
        // - Première mesure (lastLat === null)
        // - Déplacement >= 3 mètres
        // - Ou au moins toutes les 10 secondes si accuracy s'améliore
        const shouldUpdate =
          this.lastLat === null ||
          movedMeters >= 3 ||
          (now - this.lastUpdateTime >= 10000);

        if (shouldUpdate) {
          this.lastLat = lat;
          this.lastLng = lng;
          this.lastUpdateTime = now;

          const exactLoc: ExactLocation = {
            lat,
            lng,
            accuracy,
            timestamp: pos.timestamp || now,
            altitude: pos.coords.altitude,
            speed: pos.coords.speed,
            heading: pos.coords.heading,
            isApproximate: accuracy > 35,
          };

          this.onLocationChange(exactLoc);
        }
      },
      (err) => {
        if (this.onError) this.onError(new Error(err.message || 'Signal GPS perdu'));
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 8000,
      }
    );
  }

  public stop() {
    if (this.watchId !== null && typeof window !== 'undefined') {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }
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
    // Lien universel https (pas le schéma maps:// qui échoue silencieusement si Apple Maps
    // n'est pas enregistré dans le contexte courant). Pas de "q=" en même temps que
    // saddr/daddr : Apple Maps l'interprète comme une recherche et ignore l'itinéraire.
    if (originLat && originLng) {
      return `https://maps.apple.com/?saddr=${originLat},${originLng}&daddr=${destLat},${destLng}&dirflg=d`;
    }
    return `https://maps.apple.com/?daddr=${destLat},${destLng}&q=${encodeURIComponent(label)}&dirflg=d`;
  }

  if (originLat && originLng) {
    return `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destLat},${destLng}&travelmode=driving`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}&travelmode=driving`;
}

/**
 * Récupère un vrai tracé routier (qui suit les routes, pas une ligne droite)
 * entre deux points via OSRM (service public gratuit, sans clé API,
 * qui utilise les mêmes données OpenStreetMap que la carte de l'app).
 */
export async function fetchRoadRoute(from: GeoPoint, to: GeoPoint): Promise<GeoPoint[] | null> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const coords = data?.routes?.[0]?.geometry?.coordinates;
    if (!Array.isArray(coords) || coords.length === 0) return null;
    return coords.map(([lng, lat]: [number, number]) => ({ lat, lng }));
  } catch {
    return null;
  }
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
