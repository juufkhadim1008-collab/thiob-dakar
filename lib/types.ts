export type UserRole = 'client' | 'restaurant' | 'courier' | 'admin';

export type PaymentMethod = 'wave' | 'orange_money' | 'card' | 'cash';

export type OrderStatus = 
  | 'pending'           // En attente d'acceptation par le resto
  | 'accepted'          // Acceptée
  | 'preparing'         // En cuisine
  | 'ready_for_pickup'  // Prête pour le livreur
  | 'in_transit'        // En cours de livraison à Dakar
  | 'delivered'         // Livrée avec succès
  | 'cancelled';        // Annulée

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number; // en FCFA
  category: string;
  image: string;
  isAvailable: boolean;
  isPopular?: boolean;
  preparationTimeMinutes: number;
  tags?: string[];
}

export interface RestaurantReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  avatar?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  tagline: string;
  description: string;
  coverImage: string;
  gallery: string[]; // Photos de la façade, terrasse, intérieur, ambiance
  logo: string;
  rating: number;
  reviewCount: number;
  reviews?: RestaurantReview[];
  neighborhood: string; // Ex: Almadies, Plateau, Point E, Mermoz, Ngor, Yoff, Pikine
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  priceRange?: string;
  ambianceTags?: string[]; // Ex: "Vue Océan", "Romantique", "Sortie Couple", "Rooftop", "Ambiance Teranga", "Cosy"
  amenities?: string[]; // Ex: "Terrasse vue mer", "Climatisation", "Parking gardé", "Wifi haut débit", "Espace VIP"
  openingHours?: string | {
    [key: string]: string; // Ex: "Lundi - Dimanche": "11h30 - 23h30"
  };
  deliveryTimeEstimate: string; // Ex: "25-35 min"
  deliveryFee: number; // en FCFA
  minOrder: number; // en FCFA
  isOpen: boolean;
  featuredTags: string[];
  ownerName: string;
  phone: string;
  whatsapp?: string;
  instagram?: string;
}

export interface Reservation {
  id: string;
  reservationNumber: string;
  restaurantId: string;
  restaurantName: string;
  clientName: string;
  clientPhone: string;
  date: string; // Ex: "2026-09-05"
  time: string; // Ex: "20:00"
  guestsCount: number; // Ex: 2
  occasion: string; // Ex: "Sortie avec ma copine", "Anniversaire", "Dîner d'affaires", "Dîner en amoureux", "Famille"
  status: 'confirmed' | 'pending' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface OutingPlan {
  id: string;
  title: string; // Ex: "Sortie aux Almadies en amoureux"
  restaurantId: string;
  restaurantName: string;
  neighborhood: string;
  plannedDate: string; // Ex: "Samedi 5 Septembre 20h00"
  targetTag: string; // Ex: "Sortie Couple"
  notes?: string;
  createdAt: string;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  restaurantId: string;
  restaurantName: string;
  courierId?: string;
  courierName?: string;
  courierPhone?: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'paid' | 'pending' | 'failed';
  deliveryAddress: {
    neighborhood: string;
    street: string;
    details?: string;
  };
  estimatedDeliveryTime?: string;
}

export interface Courier {
  id: string;
  name: string;
  phone: string;
  vehicleType: 'moto' | 'scooter' | 'velo';
  plateNumber: string;
  isOnline: boolean;
  currentNeighborhood: string;
  rating: number;
  completedDeliveries: number;
  todayEarnings: number; // FCFA
  activeOrderId?: string;
}

export interface PlatformMetrics {
  totalRevenueGmv: number;
  platformCommissionEarned: number;
  totalOrdersToday: number;
  activeRestaurantsCount: number;
  activeCouriersCount: number;
  satisfactionRate: number;
}
