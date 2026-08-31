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

export interface Restaurant {
  id: string;
  name: string;
  tagline: string;
  description: string;
  coverImage: string;
  logo: string;
  rating: number;
  reviewCount: number;
  neighborhood: string; // Ex: Almadies, Plateau, Point E, Mermoz
  address: string;
  deliveryTimeEstimate: string; // Ex: "25-35 min"
  deliveryFee: number; // en FCFA
  minOrder: number; // en FCFA
  isOpen: boolean;
  featuredTags: string[];
  ownerName: string;
  phone: string;
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
