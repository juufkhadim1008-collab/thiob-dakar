export type UserRole = 'client' | 'restaurant' | 'courier' | 'admin';

export type PaymentMethod = 'wave' | 'orange_money' | 'free_money' | 'card' | 'cash';

export interface PaymentTransaction {
  id: string;
  orderId: string;
  orderNumber: string;
  amount: number;
  method: PaymentMethod;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  reference: string;
  phoneNumber?: string;
  cardLast4?: string;
  cashGiven?: number;
  cashChangeAmount?: number;
  clientName: string;
  restaurantName: string;
  createdAt: number;
}

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
  latitude?: number;
  longitude?: number;
  locationAccuracy?: number; // en mètres
  locationTimestamp?: number;
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
    landmark?: string; // Ex: "Maison derrière la pharmacie, portail bleu"
    instructions?: string; // Ex: "Sonner à l'interphone 2B"
  };
  deliveryCoords?: { lat: number; lng: number; accuracy?: number; timestamp?: number };
  pickupCoords?: { lat: number; lng: number; accuracy?: number };
  courierCoords?: { lat: number; lng: number; accuracy?: number; bearing?: number; timestamp?: number };
  deliveryAccuracy?: number;
  deliveryLandmark?: string;
  deliveryInstructions?: string;
  estimatedDeliveryTime?: string;
}

export type CourierStatus = 'OFFLINE' | 'ONLINE' | 'AVAILABLE' | 'BUSY';

export interface Courier {
  id: string;
  name: string;
  phone: string;
  photo?: string;
  vehicleType: 'moto' | 'scooter' | 'velo' | 'voiture';
  vehicleName?: string;
  plateNumber: string;
  isOnline: boolean;
  isAvailable?: boolean;
  status?: CourierStatus;
  currentNeighborhood: string;
  latitude?: number;
  longitude?: number;
  locationAccuracy?: number;
  bearing?: number;
  coordinates?: { lat: number; lng: number; accuracy?: number };
  lastLocationUpdate?: string;
  lastUpdate?: number;
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

export interface UserAddress {
  id: string;
  label: string; // Ex: "Maison", "Bureau", "Chez Maman"
  neighborhood: string; // Ex: "Almadies", "Plateau", "Point E"
  street: string;
  details?: string;
  landmark?: string;
  isDefault?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  terangaPoints: number; // Programme de fidélité Thiéb & Co
  addresses: UserAddress[];
  defaultPaymentMethod?: PaymentMethod;
  restaurantId?: string; // Si compte restaurateur
  courierId?: string; // Si compte coursier
  createdAt: string;
  isVerified?: boolean;
}

export type AuthMethod = 'phone' | 'email' | 'demo';

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}


