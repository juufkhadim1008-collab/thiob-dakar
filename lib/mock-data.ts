import { Category, Restaurant, MenuItem, Order, Courier, PlatformMetrics, Reservation, OutingPlan, RestaurantReview } from './types';

export const DAKAR_NEIGHBORHOODS = [
  'Tous les quartiers',
  'Malika',
  'Keur Massar',
  'Yeumbeul',
  'Tivaouane Peulh',
  'Guédiawaye',
  'Pikine',
  'Thiaroye',
  'Mbao',
  'Almadies',
  'Ngor',
  'Yoff',
  'Ouakam',
  'Mermoz',
  'Sacré-Cœur',
  'Point E',
  'Fann Résidence',
  'Plateau',
  'Médina',
  'Grand Dakar',
  'Hann Maristes',
  'Rufisque',
  'Diamniadio',
];


export interface DakarZoneItem {
  id: string;
  name: string;
  shortName: string;
  image: string;
  neighborhood: string;
}

export const DAKAR_ZONES: DakarZoneItem[] = [
  {
    id: 'zone-almadies',
    name: 'Zone Almadies',
    shortName: 'Almadies',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=200&q=80',
    neighborhood: 'Almadies',
  },
  {
    id: 'zone-plateau',
    name: 'Zone Plateau',
    shortName: 'Plateau',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=200&q=80',
    neighborhood: 'Plateau',
  },
  {
    id: 'zone-vdn',
    name: 'Zone VDN',
    shortName: 'VDN',
    image: 'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?auto=format&fit=crop&w=200&q=80',
    neighborhood: 'Mermoz',
  },
  {
    id: 'zone-pikine',
    name: 'Zone Pikine',
    shortName: 'Pikine',
    image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=200&q=80',
    neighborhood: 'Pikine',
  },
  {
    id: 'zone-keur-massar',
    name: 'Zone Keur Massar',
    shortName: 'Keur Massar',
    image: 'https://images.unsplash.com/photo-1509749837427-ac94a2553d0e?auto=format&fit=crop&w=200&q=80',
    neighborhood: 'Keur Massar',
  },
  {
    id: 'zone-ngor',
    name: 'Zone Ngor Virage',
    shortName: 'Ngor',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=200&q=80',
    neighborhood: 'Ngor',
  },
];

export const CATEGORIES: Category[] = [
  {
    id: 'cat-thieb',
    name: 'Thiéboudienne',
    slug: 'thieb',
    icon: '🍲',
    description: 'Le roi de la teranga : Penda Mbaye, Thiéb blanc au poisson frais ou viande',
  },
  {
    id: 'cat-yassa',
    name: 'Yassa & Mafé',
    slug: 'yassa-mafe',
    icon: '🍋',
    description: 'Poulet mariné au citron et oignons confits, sauce arachide onctueuse',
  },
  {
    id: 'cat-dibi',
    name: 'Dibi & Grillades',
    slug: 'dibi',
    icon: '🥩',
    description: 'Agneau rôti au feu de bois façon Dibiterie dakaroise, oignons et piment',
  },
  {
    id: 'cat-poisson',
    name: 'Poissons & Fruits de Mer',
    slug: 'fruits-de-mer',
    icon: '🐟',
    description: 'Thiof braisé, brochettes de lotte, gambas des côtes de Ngor',
  },
  {
    id: 'cat-street',
    name: 'Street Food & Pastels',
    slug: 'street-food',
    icon: '🥟',
    description: 'Pastels dorés croustillants au poisson, Fataya, accras et beignets',
  },
  {
    id: 'cat-boissons',
    name: 'Jus Locaux & Desserts',
    slug: 'boissons-desserts',
    icon: '🍹',
    description: 'Bissap frais à la menthe, Bouye onctueux, Ditakh et Thiakry au yaourt doux',
  },
];

export const RESTAURANTS: Restaurant[] = [];

export const INITIAL_RESERVATIONS: Reservation[] = [];

export const INITIAL_OUTING_PLANS: OutingPlan[] = [];

export const MENU_ITEMS: MenuItem[] = [];

export const INITIAL_ORDERS: Order[] = [];

export const INITIAL_COURIERS: Courier[] = [];

export const INITIAL_METRICS: PlatformMetrics = {
  totalRevenueGmv: 0,
  platformCommissionEarned: 0,
  totalOrdersToday: 0,
  activeRestaurantsCount: 0,
  activeCouriersCount: 0,
  satisfactionRate: 100,
};
