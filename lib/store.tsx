'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  UserRole, 
  Restaurant, 
  MenuItem, 
  Order, 
  OrderItem, 
  Courier, 
  PlatformMetrics, 
  OrderStatus,
  PaymentMethod,
  Reservation,
  OutingPlan,
  CourierStatus,
  PaymentTransaction
} from './types';
import { 
  RESTAURANTS as initialRestaurants, 
  MENU_ITEMS as initialMenuItems, 
  INITIAL_ORDERS, 
  INITIAL_COURIERS, 
  INITIAL_METRICS,
  INITIAL_RESERVATIONS,
  INITIAL_OUTING_PLANS
} from './mock-data';
import { 
  GeoPoint, 
  calculateDistanceKm, 
  DAKAR_GEO_PRESETS, 
  reverseGeocodeDakar, 
  DAKAR_DEFAULT_COORDS 
} from './geolocation';
import { supabase } from './supabase';

interface CartItem {
  item: MenuItem;
  quantity: number;
  notes?: string;
}

interface AppContextType {
  // Role switcher
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;

  // Data
  restaurants: Restaurant[];
  menuItems: MenuItem[];
  orders: Order[];
  couriers: Courier[];
  metrics: PlatformMetrics;
  reservations: Reservation[];
  outingPlans: OutingPlan[];
  favoriteRestaurantIds: string[];

  // Geolocation & Spatial Features
  clientCoords: GeoPoint | null;
  clientAccuracy: number; // en mètres (ex: 4.8)
  clientGpsTimestamp: number;
  clientIsApproximate: boolean;
  clientAddress: string;
  clientNeighborhood: string;
  isClientGpsActive: boolean;
  radiusFilterKm: number;
  setRadiusFilterKm: (km: number) => void;
  setClientLocation: (coords: GeoPoint, address?: string, neighborhood?: string, accuracy?: number) => void;
  requestClientGps: () => Promise<{ coords: GeoPoint; accuracy: number }>;
  updateOrderDeliveryLocation: (orderId: string, newCoords: GeoPoint, accuracy?: number, landmark?: string) => void;
  getNearbyRestaurants: (radiusKm?: number) => (Restaurant & { distanceKm: number })[];
  getNearbyCouriers: (radiusKm?: number) => (Courier & { distanceKm: number })[];
  updateCourierLocation: (courierId: string, coords: GeoPoint, status?: CourierStatus, accuracy?: number, bearing?: number) => void;
  updateRestaurantLocation: (restoId: string, coords: GeoPoint, address?: string, neighborhood?: string, accuracy?: number) => void;

  // Client Cart & Orders
  cart: CartItem[];
  addToCart: (item: MenuItem, notes?: string) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQuantity: (itemId: string, delta: number) => void;
  clearCart: () => void;
  cartRestaurant: Restaurant | null;
  cartTotal: number;
  cartCount: number;
  placeOrder: (details: {
    clientName: string;
    clientPhone: string;
    neighborhood: string;
    street: string;
    details?: string;
    landmark?: string;
    instructions?: string;
    coords?: GeoPoint;
    accuracy?: number;
    paymentMethod: PaymentMethod;
  }) => Order;


  // Reservations & Outings
  createReservation: (data: Omit<Reservation, 'id' | 'reservationNumber' | 'status' | 'createdAt'>) => Reservation;
  cancelReservation: (id: string) => void;
  createOutingPlan: (data: Omit<OutingPlan, 'id' | 'createdAt'>) => OutingPlan;
  deleteOutingPlan: (id: string) => void;
  toggleFavoriteRestaurant: (id: string) => void;

  // Restaurant Actions & Active Session
  currentRestaurantId: string;
  setCurrentRestaurantId: (id: string) => void;
  currentRestaurant: Restaurant;
  registerNewRestaurant: (data: {
    name: string;
    logo: string;
    type?: string;
    address: string;
    neighborhood: string;
    phone?: string;
    coverImage?: string;
    coordinates?: { lat: number; lng: number };
  }) => Restaurant;
  updateCurrentRestaurant: (updates: Partial<Restaurant>) => void;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  toggleMenuItemAvailability: (itemId: string) => void;
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (itemId: string, updates: Partial<MenuItem>) => void;
  deleteMenuItem: (itemId: string) => void;
  updateRestaurantShowcase: (restoId: string, updates: Partial<Restaurant>) => void;

  // Courier Actions
  toggleCourierOnline: (courierId: string) => void;
  setCourierStatus: (courierId: string, status: CourierStatus) => void;
  acceptDeliveryMission: (courierId: string, orderId: string) => void;
  completeDeliveryMission: (courierId: string, orderId: string) => void;
  registerCourier: (data: {
    firstName: string;
    lastName: string;
    phone: string;
    photo?: string;
    vehicle?: string;
    plateNumber?: string;
    coordinates?: { lat: number; lng: number };
  }) => Courier;

  // Client Profile & Auth
  clientName: string;
  clientPhone: string;
  setClientProfile: (name: string, phone: string, address?: string, neighborhood?: string, coords?: GeoPoint) => void;
  loginWithOAuth: (provider: 'google' | 'facebook') => Promise<{ success: boolean; error?: string }>;
  logoutUser: () => Promise<void>;

  // Payments & Transactions
  transactions: PaymentTransaction[];
  recordPaymentTransaction: (tx: PaymentTransaction) => void;

  // Tracking Modal
  activeTrackingOrder: Order | null;
  setActiveTrackingOrder: (order: Order | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentRole, setCurrentRole] = useState<UserRole>('client');
  const [restaurants, setRestaurants] = useState<Restaurant[]>(initialRestaurants);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [currentRestaurantId, setCurrentRestaurantId] = useState<string>('');
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [couriers, setCouriers] = useState<Courier[]>(INITIAL_COURIERS);
  const [metrics, setMetrics] = useState<PlatformMetrics>(INITIAL_METRICS);
  const [reservations, setReservations] = useState<Reservation[]>(INITIAL_RESERVATIONS);
  const [outingPlans, setOutingPlans] = useState<OutingPlan[]>(INITIAL_OUTING_PLANS);
  const [favoriteRestaurantIds, setFavoriteRestaurantIds] = useState<string[]>([]);
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');

  // Geolocation states
  const [clientCoords, setClientCoords] = useState<GeoPoint | null>(null);
  const [clientAccuracy, setClientAccuracy] = useState<number>(5.0);
  const [clientGpsTimestamp, setClientGpsTimestamp] = useState<number>(Date.now());
  const [clientIsApproximate, setClientIsApproximate] = useState<boolean>(false);
  const [clientAddress, setClientAddress] = useState<string>('Dakar, Sénégal');
  const [clientNeighborhood, setClientNeighborhood] = useState<string>('Tous les quartiers');
  const [isClientGpsActive, setIsClientGpsActive] = useState<boolean>(false);
  const [radiusFilterKm, setRadiusFilterKm] = useState<number>(5);

  // Load saved data from localStorage & Supabase Realtime
  useEffect(() => {
    // 0. Invalidate legacy mock localStorage from dev tests
    const STORAGE_VERSION = 'thiob_prod_clean_v5';
    if (typeof window !== 'undefined' && localStorage.getItem('thiob_storage_version') !== STORAGE_VERSION) {
      localStorage.clear();
      localStorage.setItem('thiob_storage_version', STORAGE_VERSION);
    }

    // 1. Local storage fallback
    try {
      const savedRestoId = localStorage.getItem('thiob_active_restaurant_id');
      const savedRestos = localStorage.getItem('thiob_custom_restaurants');
      const savedCouriers = localStorage.getItem('thiob_custom_couriers');

      const savedClientName = localStorage.getItem('thiob_client_name');
      const savedClientPhone = localStorage.getItem('thiob_client_phone');
      const savedClientCoords = localStorage.getItem('thiob_client_coords');
      const savedClientAddress = localStorage.getItem('thiob_client_address');
      const savedClientNeighborhood = localStorage.getItem('thiob_client_neighborhood');
      const savedClientAccuracy = localStorage.getItem('thiob_client_accuracy');

      if (savedRestos) {
        const parsed: Restaurant[] = JSON.parse(savedRestos);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRestaurants((prev) => {
            const combined = [...parsed, ...prev.filter(p => !parsed.some(c => c.id === p.id))];
            return combined;
          });
        }
      }
      if (savedCouriers) {
        const parsed: Courier[] = JSON.parse(savedCouriers);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCouriers((prev) => {
            const combined = [...parsed, ...prev.filter(c => !parsed.some(p => p.id === c.id))];
            return combined;
          });
        }
      }
      if (savedRestoId) setCurrentRestaurantId(savedRestoId);
      if (savedClientName) setClientName(savedClientName);
      if (savedClientPhone) setClientPhone(savedClientPhone);
      if (savedClientCoords) {
        const parsedCoords = JSON.parse(savedClientCoords);
        setClientCoords(parsedCoords);
        setIsClientGpsActive(true);
      }
      if (savedClientAccuracy) setClientAccuracy(Number(savedClientAccuracy));
      if (savedClientAddress) setClientAddress(savedClientAddress);
      if (savedClientNeighborhood) setClientNeighborhood(savedClientNeighborhood);
    } catch {}

    // 2. Fetch from Supabase Central Database
    const fetchSupabaseData = async () => {
      try {
        const { data: dbRestos } = await supabase.from('restaurants').select('*');
        if (dbRestos && dbRestos.length > 0) {
          setRestaurants((prev) => {
            const mapped: Restaurant[] = dbRestos.map((r: any) => ({
              id: r.id,
              name: r.name,
              logo: r.logo || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80',
              coverImage: r.cover_image || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
              tagline: r.tagline || 'L’Excellence et la Saveur de Dakar',
              description: r.description || '',
              neighborhood: r.neighborhood || 'Dakar',
              address: r.address || 'Dakar, Sénégal',
              coordinates: { lat: r.latitude || 14.7431, lng: r.longitude || -17.5186 },
              phone: r.phone || '+221 77 100 00 00',
              ownerName: r.owner_name || 'Chef Partenaire',
              rating: Number(r.rating) || 5.0,
              reviewCount: r.review_count || 1,
              priceRange: r.price_range || '2 500 - 6 500 FCFA',
              deliveryTimeEstimate: r.delivery_time_estimate || '20-30 min',
              deliveryFee: r.delivery_fee || 1500,
              minOrder: r.min_order || 3000,
              isOpen: r.is_open ?? true,
              featuredTags: r.featured_tags || ['Nouveau Resto Dakar'],
              openingHours: r.opening_hours || '11h30 - 23h30 (7j/7)',
              gallery: r.gallery || [],
              ambianceTags: r.ambiance_tags || ['Terrasse', 'Fait Maison'],
              amenities: r.amenities || ['Wifi', 'Paiement Wave'],
            }));
            const merged = [...mapped, ...prev.filter(p => !mapped.some(m => m.id === p.id))];
            return merged;
          });
        }

        const { data: dbItems } = await supabase.from('menu_items').select('*');
        if (dbItems && dbItems.length > 0) {
          setMenuItems((prev) => {
            const mapped: MenuItem[] = dbItems.map((m: any) => ({
              id: m.id,
              restaurantId: m.restaurant_id,
              name: m.name,
              description: m.description || '',
              price: m.price,
              category: m.category_id || 'cat-thieb',
              image: m.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
              isAvailable: m.is_available ?? true,
              isPopular: m.is_popular ?? false,
              preparationTimeMinutes: m.preparation_time_minutes || 20,
              tags: m.tags || [],
            }));
            return [...mapped, ...prev.filter(p => !mapped.some(m => m.id === p.id))];
          });
        }

        const { data: dbOrders } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (dbOrders && dbOrders.length > 0) {
          setOrders(dbOrders.map((o: any) => ({
            id: o.id,
            orderNumber: o.order_number,
            createdAt: 'Récemment',
            clientId: o.client_id || 'client-anon',
            clientName: o.client_name || 'Client Thiob',
            clientPhone: o.client_phone || '',
            restaurantId: o.restaurant_id,
            restaurantName: o.restaurant_name || 'Restaurant Partenaire',
            courierId: o.courier_id,
            courierName: o.courier_name,
            courierPhone: o.courier_phone,
            status: o.status || 'pending',
            items: o.items || [],
            subtotal: o.subtotal || 0,
            deliveryFee: o.delivery_fee || 1500,
            platformFee: o.platform_fee || 500,
            total: o.total || 0,
            paymentMethod: o.payment_method || 'wave',
            paymentStatus: o.payment_status || 'paid',
            deliveryAddress: {
              neighborhood: o.delivery_neighborhood || 'Dakar',
              street: o.delivery_street || '',
              details: o.delivery_details || '',
            },
          })));
        }
      } catch (err) {
        console.warn('Supabase fetch error:', err);
      }
    };

    fetchSupabaseData();

    // 3. Setup Supabase Realtime Subscriptions
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'restaurants' }, () => {
        fetchSupabaseData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchSupabaseData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items' }, () => {
        fetchSupabaseData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);


  const DEFAULT_EMPTY_RESTO: Restaurant = {
    id: '',
    name: 'Mon Restaurant Dakar',
    tagline: 'L’Excellence et la Saveur de Dakar',
    description: 'Bienvenue sur votre espace restaurant.',
    coverImage: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
    logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80',
    neighborhood: 'Almadies',
    address: 'Dakar, Sénégal',
    coordinates: DAKAR_DEFAULT_COORDS,
    phone: '+221 77 000 00 00',
    ownerName: 'Chef Partenaire',
    rating: 5.0,
    reviewCount: 0,
    priceRange: '2 500 - 6 500 FCFA',
    deliveryTimeEstimate: '20-30 min',
    deliveryFee: 1500,
    minOrder: 3000,
    isOpen: true,
    featuredTags: ['Nouveau Resto Dakar'],
    openingHours: '11h30 - 23h30 (7j/7)',
    gallery: [],
    ambianceTags: ['Terrasse', 'Fait Maison'],
    amenities: ['Wifi', 'Paiement Wave'],
  };

  const currentRestaurant: Restaurant = restaurants.find((r) => r.id === currentRestaurantId) || (restaurants.length > 0 ? restaurants[0] : DEFAULT_EMPTY_RESTO);


  // Client Geolocation Handler with exact accuracy
  const setClientLocation = (
    coords: GeoPoint,
    address?: string,
    neighborhood?: string,
    accuracy: number = 5.0
  ) => {
    setClientCoords(coords);
    setClientAccuracy(accuracy);
    setClientGpsTimestamp(Date.now());
    setClientIsApproximate(accuracy > 40);
    setIsClientGpsActive(true);
    if (address) setClientAddress(address);
    if (neighborhood) setClientNeighborhood(neighborhood);

    try {
      localStorage.setItem('thiob_client_coords', JSON.stringify(coords));
      localStorage.setItem('thiob_client_accuracy', accuracy.toString());
      if (address) localStorage.setItem('thiob_client_address', address);
      if (neighborhood) localStorage.setItem('thiob_client_neighborhood', neighborhood);
    } catch {}
  };

  const requestClientGps = async (): Promise<{ coords: GeoPoint; accuracy: number }> => {
    const { getHighAccuracyLocation } = await import('./geolocation');
    const exact = await getHighAccuracyLocation(6000, 10);
    const coords = { lat: exact.lat, lng: exact.lng };
    const geo = await reverseGeocodeDakar(coords.lat, coords.lng);
    setClientLocation(coords, geo.fullAddress, geo.neighborhood, exact.accuracy);
    return { coords, accuracy: exact.accuracy };
  };

  // Update delivery destination for an existing or active order
  const updateOrderDeliveryLocation = (
    orderId: string,
    newCoords: GeoPoint,
    accuracy: number = 5.0,
    landmark?: string
  ) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              deliveryCoords: {
                lat: newCoords.lat,
                lng: newCoords.lng,
                accuracy,
                timestamp: Date.now(),
              },
              deliveryAccuracy: accuracy,
              deliveryLandmark: landmark || o.deliveryLandmark,
            }
          : o
      )
    );
  };


  // Nearby Restaurants Spatial Query
  const getNearbyRestaurants = (radiusKm: number = radiusFilterKm) => {
    const origin = clientCoords || DAKAR_DEFAULT_COORDS;

    return restaurants
      .map((r) => {
        const rCoords = r.coordinates || (r.latitude && r.longitude ? { lat: r.latitude, lng: r.longitude } : DAKAR_GEO_PRESETS[r.neighborhood] || DAKAR_DEFAULT_COORDS);
        const distanceKm = calculateDistanceKm(origin, rCoords);
        return {
          ...r,
          coordinates: rCoords,
          distanceKm,
        };
      })
      .filter((r) => r.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);
  };

  // Nearby Available Couriers Spatial Query
  const getNearbyCouriers = (radiusKm: number = radiusFilterKm) => {
    const defaultCoords = DAKAR_DEFAULT_COORDS;
    const restoCoords = currentRestaurant ? (currentRestaurant.coordinates || DAKAR_GEO_PRESETS[currentRestaurant.neighborhood] || defaultCoords) : defaultCoords;
    const origin = clientCoords || restoCoords;

    return couriers
      .filter((c) => c.isOnline && (c.isAvailable !== false || c.status === 'AVAILABLE'))
      .map((c) => {
        const cCoords = c.coordinates || (c.latitude && c.longitude ? { lat: c.latitude, lng: c.longitude } : DAKAR_GEO_PRESETS[c.currentNeighborhood] || DAKAR_DEFAULT_COORDS);
        const distanceKm = calculateDistanceKm(origin, cCoords);
        return {
          ...c,
          coordinates: cCoords,
          distanceKm,
        };
      })
      .filter((c) => c.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);
  };

  // Courier location & status updater with exact accuracy and bearing
  const updateCourierLocation = (
    courierId: string,
    coords: GeoPoint,
    status?: CourierStatus,
    accuracy: number = 5.0,
    bearing: number = 0.0
  ) => {
    setCouriers((prev) =>
      prev.map((c) =>
        c.id === courierId
          ? {
              ...c,
              latitude: coords.lat,
              longitude: coords.lng,
              coordinates: { lat: coords.lat, lng: coords.lng, accuracy },
              locationAccuracy: accuracy,
              bearing: bearing,
              status: status || c.status || 'AVAILABLE',
              lastLocationUpdate: 'À l’instant',
            }
          : c
      )
    );

    // Sync to Supabase RPC if configured
    try {
      supabase.rpc('update_courier_gps', {
        p_courier_id: courierId,
        p_lat: coords.lat,
        p_lng: coords.lng,
        p_accuracy: accuracy,
        p_bearing: bearing,
        p_status: status || 'AVAILABLE',
      }).then();
    } catch {}
  };

  const updateRestaurantLocation = (
    restoId: string,
    coords: GeoPoint,
    address?: string,
    neighborhood?: string,
    accuracy: number = 5.0
  ) => {
    setRestaurants((prev) =>
      prev.map((r) =>
        r.id === restoId
          ? {
              ...r,
              latitude: coords.lat,
              longitude: coords.lng,
              coordinates: coords,
              locationAccuracy: accuracy,
              locationTimestamp: Date.now(),
              address: address || r.address,
              neighborhood: neighborhood || r.neighborhood,
            }
          : r
      )
    );

    try {
      const custom = localStorage.getItem('thiob_custom_restaurants');
      const list: Restaurant[] = custom ? JSON.parse(custom) : [];
      const updatedList = list.map((r) =>
        r.id === restoId
          ? {
              ...r,
              latitude: coords.lat,
              longitude: coords.lng,
              coordinates: coords,
              locationAccuracy: accuracy,
              locationTimestamp: Date.now(),
              address: address || r.address,
              neighborhood: neighborhood || r.neighborhood,
            }
          : r
      );
      localStorage.setItem('thiob_custom_restaurants', JSON.stringify(updatedList));
    } catch {}

    // Sync to Supabase
    try {
      supabase.rpc('update_restaurant_location', {
        p_restaurant_id: restoId,
        p_lat: coords.lat,
        p_lng: coords.lng,
        p_address: address,
        p_neighborhood: neighborhood,
      }).then();
    } catch {}
  };


  const registerNewRestaurant = (data: {
    name: string;
    logo: string;
    type?: string;
    address: string;
    neighborhood: string;
    phone?: string;
    coverImage?: string;
    coordinates?: { lat: number; lng: number };
  }): Restaurant => {
    const newId = `resto-${Date.now()}`;
    const presetCoords = DAKAR_GEO_PRESETS[data.neighborhood] || DAKAR_GEO_PRESETS['Almadies'];
    const coords = data.coordinates || { lat: presetCoords.lat, lng: presetCoords.lng };

    const newResto: Restaurant = {
      id: newId,
      name: data.name,
      logo: data.logo || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80',
      coverImage: data.coverImage || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
      tagline: 'L’Excellence et la Saveur de Dakar',
      description: `Bienvenue chez ${data.name}. Nous préparons des plats faits maison avec les ingrédients les plus frais de Dakar.`,
      neighborhood: data.neighborhood || 'Almadies',
      address: data.address || 'Dakar, Sénégal',
      coordinates: coords,
      phone: data.phone || '+221 77 100 00 00',
      ownerName: 'Chef Propriétaire',
      rating: 5.0,
      reviewCount: 1,
      priceRange: '2 500 - 6 500 FCFA',
      deliveryTimeEstimate: '20-30 min',
      deliveryFee: 1500,
      minOrder: 3000,
      isOpen: true,
      featuredTags: ['Nouveau Resto Dakar', 'Qualité Chef', 'Livraison Express'],
      openingHours: '11h30 - 23h30 (7j/7)',
      gallery: [
        'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
      ],
      ambianceTags: ['Terrasse Vue Océan', 'Service Rapide', 'Téranga Dakaroise', 'Fait Maison'],
      amenities: ['Wifi Ultra Rapide', 'Climatisation VIP', 'Paiement Wave & CB', 'Terrasse Panoramique'],
    };

    // Create 3 starter dishes for this new restaurant
    const starterDishes: MenuItem[] = [
      {
        id: `dish-${Date.now()}-1`,
        restaurantId: newId,
        name: `Thiéboudienne Spécial ${data.name}`,
        description: 'Le chef-d’œuvre de la maison au Thiof frais de l’Atlantique, riz rouge aux légumes dorés et piment.',
        price: 4500,
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
        category: 'cat-thieb',
        isAvailable: true,
        preparationTimeMinutes: 25,
        tags: ['Signature', 'Populaire', 'Épicé doux'],
      },
      {
        id: `dish-${Date.now()}-2`,
        restaurantId: newId,
        name: 'Dibi Agneau Braisé au Feu de Bois',
        description: 'Morceaux d’agneau fondants marinés aux épices dakaroises, oignons caramélisés et moutarde.',
        price: 5500,
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
        category: 'cat-dibi',
        isAvailable: true,
        preparationTimeMinutes: 20,
        tags: ['Grillade', 'Best-seller'],
      },
      {
        id: `dish-${Date.now()}-3`,
        restaurantId: newId,
        name: 'Bissap & Gingembre Maison Frais (50cl)',
        description: 'Infusion artisanale de fleurs d’hibiscus et gingembre avec une touche de menthe fraîche.',
        price: 1500,
        image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
        category: 'cat-poisson',
        isAvailable: true,
        preparationTimeMinutes: 5,
        tags: ['Boisson', 'Bio'],
      },
    ];

    setRestaurants((prev) => [newResto, ...prev]);
    setMenuItems((prev) => [...starterDishes, ...prev]);
    setCurrentRestaurantId(newId);

    // Save to localStorage for instant persistence
    try {
      localStorage.setItem('thiob_active_restaurant_id', newId);
      const existingCustom = localStorage.getItem('thiob_custom_restaurants');
      const list = existingCustom ? JSON.parse(existingCustom) : [];
      localStorage.setItem('thiob_custom_restaurants', JSON.stringify([newResto, ...list]));
    } catch {}

    // Push to Supabase for multi-device cross-platform sync
    try {
      supabase.from('restaurants').insert({
        id: newId,
        name: newResto.name,
        tagline: newResto.tagline,
        description: newResto.description,
        cover_image: newResto.coverImage,
        logo: newResto.logo,
        neighborhood: newResto.neighborhood,
        address: newResto.address,
        latitude: coords.lat,
        longitude: coords.lng,
        delivery_time_estimate: newResto.deliveryTimeEstimate,
        delivery_fee: newResto.deliveryFee,
        min_order: newResto.minOrder,
        is_open: true,
        phone: newResto.phone,
        owner_name: newResto.ownerName,
      }).then(() => {
        supabase.from('menu_items').insert(starterDishes.map(d => ({
          id: d.id,
          restaurant_id: newId,
          name: d.name,
          description: d.description,
          price: d.price,
          category_id: d.category,
          image: d.image,
          is_available: d.isAvailable,
          is_popular: d.isPopular,
          preparation_time_minutes: d.preparationTimeMinutes,
          tags: d.tags || [],
        }))).then();
      });
    } catch {}


    return newResto;
  };


  const updateCurrentRestaurant = (updates: Partial<Restaurant>) => {
    setRestaurants((prev) => {
      const updated = prev.map((r) => (r.id === currentRestaurantId ? { ...r, ...updates } : r));
      try {
        const customRestos = updated.filter(r => r.id.startsWith('resto-') || r.id === currentRestaurantId);
        localStorage.setItem('thiob_custom_restaurants', JSON.stringify(customRestos));
      } catch {}
      return updated;
    });

    try {
      supabase.from('restaurants').update({
        name: updates.name,
        tagline: updates.tagline,
        description: updates.description,
        cover_image: updates.coverImage,
        logo: updates.logo,
        neighborhood: updates.neighborhood,
        address: updates.address,
        phone: updates.phone,
        owner_name: updates.ownerName,
        price_range: updates.priceRange,
        opening_hours: typeof updates.openingHours === 'string' ? updates.openingHours : undefined,
        gallery: updates.gallery,
        ambiance_tags: updates.ambianceTags,
        amenities: updates.amenities,
      }).eq('id', currentRestaurantId).then();
    } catch {}
  };

  const toggleMenuItemAvailability = (itemId: string) => {
    setMenuItems((prev) =>
      prev.map((m) => {
        if (m.id === itemId) {
          const newStatus = !m.isAvailable;
          try {
            supabase.from('menu_items').update({ is_available: newStatus }).eq('id', itemId).then();
          } catch {}
          return { ...m, isAvailable: newStatus };
        }
        return m;
      })
    );
  };

  const addMenuItem = (itemData: Omit<MenuItem, 'id'>): MenuItem => {
    const newId = `dish-${Date.now()}`;
    const newItem: MenuItem = {
      ...itemData,
      id: newId,
      isAvailable: itemData.isAvailable ?? true,
      isPopular: itemData.isPopular ?? false,
      preparationTimeMinutes: itemData.preparationTimeMinutes || 20,
      tags: itemData.tags || [],
    };

    setMenuItems((prev) => [newItem, ...prev]);

    try {
      supabase.from('menu_items').insert({
        id: newId,
        restaurant_id: newItem.restaurantId,
        name: newItem.name,
        description: newItem.description || '',
        price: newItem.price,
        category_id: newItem.category || 'cat-thieb',
        image: newItem.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
        is_available: newItem.isAvailable,
        is_popular: newItem.isPopular,
        preparation_time_minutes: newItem.preparationTimeMinutes,
        tags: newItem.tags,
      }).then(({ error }) => {
        if (error) console.error('Supabase dish insert error:', error);
      });
    } catch {}

    return newItem;
  };

  const updateMenuItem = (itemId: string, updates: Partial<MenuItem>) => {
    setMenuItems((prev) =>
      prev.map((m) => (m.id === itemId ? { ...m, ...updates } : m))
    );
    try {
      supabase.from('menu_items').update({
        name: updates.name,
        description: updates.description,
        price: updates.price,
        image: updates.image,
        category_id: updates.category,
        is_available: updates.isAvailable,
        is_popular: updates.isPopular,
      }).eq('id', itemId).then();
    } catch {}
  };

  const deleteMenuItem = (itemId: string) => {
    setMenuItems((prev) => prev.filter((m) => m.id !== itemId));
    try {
      supabase.from('menu_items').delete().eq('id', itemId).then();
    } catch {}
  };


  const [activeTrackingOrder, setActiveTrackingOrder] = useState<Order | null>(null);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);

  const [cart, setCart] = useState<CartItem[]>([]);

  // Identify the restaurant of the items in cart
  const cartRestaurant = cart.length > 0
    ? restaurants.find((r) => r.id === cart[0].item.restaurantId) || null
    : null;

  const cartTotal = cart.reduce((acc, curr) => acc + curr.item.price * curr.quantity, 0);
  const cartCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);

  const addToCart = (item: MenuItem, notes?: string) => {
    setCart((prev) => {
      // If adding from another restaurant, reset cart or handle
      if (prev.length > 0 && prev[0].item.restaurantId !== item.restaurantId) {
        if (!confirm('Votre panier contient déjà des plats d’un autre restaurant. Voulez-vous remplacer votre panier ?')) {
          return prev;
        }
        return [{ item, quantity: 1, notes }];
      }

      const existingIndex = prev.findIndex((i) => i.item.id === item.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        if (notes) updated[existingIndex].notes = notes;
        return updated;
      }
      return [...prev, { item, quantity: 1, notes }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((i) => i.item.id !== itemId));
  };

  const updateCartQuantity = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.item.id === itemId) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => setCart([]);

  const placeOrder = (details: {
    clientName: string;
    clientPhone: string;
    neighborhood: string;
    street: string;
    details?: string;
    landmark?: string;
    instructions?: string;
    coords?: GeoPoint;
    accuracy?: number;
    paymentMethod: PaymentMethod;
  }): Order => {
    const restaurant = cartRestaurant || restaurants[0];
    const subtotal = cartTotal;
    const deliveryFee = restaurant.deliveryFee;
    const platformFee = 500;
    const total = subtotal + deliveryFee + platformFee;

    const baseCoords = details.coords || clientCoords || DAKAR_GEO_PRESETS[details.neighborhood] || DAKAR_DEFAULT_COORDS;
    const exactAccuracy = details.accuracy || clientAccuracy || 5.0;
    const destCoords = {
      lat: baseCoords.lat,
      lng: baseCoords.lng,
      accuracy: exactAccuracy,
      timestamp: Date.now(),
    };

    const pickupCoords = restaurant.coordinates || DAKAR_GEO_PRESETS[restaurant.neighborhood] || DAKAR_DEFAULT_COORDS;
    const assignedCourier = couriers.find((c) => c.isOnline) || couriers[0];

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `DKR-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: 'À l’instant',
      clientId: 'current-user-client',
      clientName: details.clientName,
      clientPhone: details.clientPhone,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      courierId: assignedCourier?.id,
      courierName: assignedCourier?.name,
      courierPhone: assignedCourier?.phone,
      status: 'pending',
      items: cart.map((c) => ({
        menuItemId: c.item.id,
        name: c.item.name,
        price: c.item.price,
        quantity: c.quantity,
        notes: c.notes,
      })),
      subtotal,
      deliveryFee,
      platformFee,
      total,
      paymentMethod: details.paymentMethod,
      paymentStatus: 'paid',
      deliveryAddress: {
        neighborhood: details.neighborhood,
        street: details.street,
        details: details.details,
        landmark: details.landmark,
        instructions: details.instructions,
      },
      deliveryCoords: destCoords,
      deliveryAccuracy: exactAccuracy,
      deliveryLandmark: details.landmark,
      deliveryInstructions: details.instructions,
      pickupCoords: { lat: pickupCoords.lat, lng: pickupCoords.lng },
      courierCoords: assignedCourier?.coordinates ? { lat: assignedCourier.coordinates.lat, lng: assignedCourier.coordinates.lng } : { lat: pickupCoords.lat, lng: pickupCoords.lng },
      estimatedDeliveryTime: restaurant.deliveryTimeEstimate,
    };

    setOrders((prev) => [newOrder, ...prev]);
    setMetrics((prev) => ({
      ...prev,
      totalOrdersToday: prev.totalOrdersToday + 1,
      totalRevenueGmv: prev.totalRevenueGmv + total,
      platformCommissionEarned: prev.platformCommissionEarned + platformFee + Math.round(subtotal * 0.12),
    }));

    clearCart();
    setActiveTrackingOrder(newOrder);

    // Push order to Supabase for multi-device cross-platform sync
    try {
      supabase.from('orders').insert({
        id: newOrder.id,
        order_number: newOrder.orderNumber,
        client_name: newOrder.clientName,
        client_phone: newOrder.clientPhone,
        restaurant_id: newOrder.restaurantId,
        restaurant_name: newOrder.restaurantName,
        courier_id: newOrder.courierId,
        courier_name: newOrder.courierName,
        courier_phone: newOrder.courierPhone,
        status: newOrder.status,
        subtotal: newOrder.subtotal,
        delivery_fee: newOrder.deliveryFee,
        platform_fee: newOrder.platformFee,
        total: newOrder.total,
        payment_method: newOrder.paymentMethod,
        payment_status: newOrder.paymentStatus,
        delivery_neighborhood: newOrder.deliveryAddress.neighborhood,
        delivery_street: newOrder.deliveryAddress.street,
        delivery_details: newOrder.deliveryAddress.details,
        items: newOrder.items,
      }).then();
    } catch {}

    return newOrder;
  };



  // Reservations
  const createReservation = (data: Omit<Reservation, 'id' | 'reservationNumber' | 'status' | 'createdAt'>): Reservation => {
    const newRes: Reservation = {
      ...data,
      id: `res-${Date.now()}`,
      reservationNumber: `RES-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };
    setReservations((prev) => [newRes, ...prev]);
    return newRes;
  };

  const cancelReservation = (id: string) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'cancelled' } : r))
    );
  };

  // Outing Plans
  const createOutingPlan = (data: Omit<OutingPlan, 'id' | 'createdAt'>): OutingPlan => {
    const newPlan: OutingPlan = {
      ...data,
      id: `outing-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setOutingPlans((prev) => [newPlan, ...prev]);
    return newPlan;
  };

  const deleteOutingPlan = (id: string) => {
    setOutingPlans((prev) => prev.filter((p) => p.id !== id));
  };

  // Favorite Restaurants
  const toggleFavoriteRestaurant = (id: string) => {
    setFavoriteRestaurantIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Update Restaurant Showcase (for Dashboard)
  const updateRestaurantShowcase = (restoId: string, updates: Partial<Restaurant>) => {
    setRestaurants((prev) =>
      prev.map((r) => (r.id === restoId ? { ...r, ...updates } : r))
    );
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const updated = { ...o, status: newStatus };
          if (activeTrackingOrder?.id === orderId) {
            setActiveTrackingOrder(updated);
          }
          return updated;
        }
        return o;
      })
    );
  };

  const toggleCourierOnline = (courierId: string) => {
    setCouriers((prev) =>
      prev.map((c) => {
        if (c.id === courierId) {
          const nextOnline = !c.isOnline;
          const nextStatus: CourierStatus = nextOnline ? 'AVAILABLE' : 'OFFLINE';
          return { 
            ...c, 
            isOnline: nextOnline, 
            isAvailable: nextOnline, 
            status: nextStatus 
          };
        }
        return c;
      })
    );
  };

  const setCourierStatus = (courierId: string, status: CourierStatus) => {
    setCouriers((prev) =>
      prev.map((c) =>
        c.id === courierId
          ? {
              ...c,
              status,
              isOnline: status !== 'OFFLINE',
              isAvailable: status === 'AVAILABLE' || status === 'ONLINE',
            }
          : c
      )
    );
  };

  const acceptDeliveryMission = (courierId: string, orderId: string) => {
    const courier = couriers.find((c) => c.id === courierId);
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'in_transit',
              courierId,
              courierName: courier?.name,
              courierPhone: courier?.phone,
              courierCoords: courier?.coordinates,
            }
          : o
      )
    );
    setCouriers((prev) =>
      prev.map((c) => (c.id === courierId ? { ...c, activeOrderId: orderId, status: 'BUSY', isAvailable: false } : c))
    );
  };

  const completeDeliveryMission = (courierId: string, orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    const earnings = order ? order.deliveryFee : 1500;

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'delivered' } : o))
    );
    setCouriers((prev) =>
      prev.map((c) =>
        c.id === courierId
          ? {
              ...c,
              activeOrderId: undefined,
              status: 'AVAILABLE',
              isAvailable: true,
              completedDeliveries: c.completedDeliveries + 1,
              todayEarnings: c.todayEarnings + earnings,
            }
          : c
      )
    );
  };

  const registerCourier = (data: {
    firstName: string;
    lastName: string;
    phone: string;
    photo?: string;
    vehicle?: string;
    plateNumber?: string;
    coordinates?: { lat: number; lng: number };
  }): Courier => {
    const fullName = `${data.firstName} ${data.lastName}`.trim() || 'Livreur Tiak-Tiak';
    const newId = `courier-${Date.now()}`;
    const newCourier: Courier = {
      id: newId,
      name: fullName,
      phone: data.phone,
      photo: data.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      vehicleType: (data.vehicle as any) || 'moto',
      vehicleName: data.vehicle === 'scooter' ? 'Scooter 125cc' : data.vehicle === 'voiture' ? 'Véhicule Urbain' : data.vehicle === 'velo' ? 'Vélo Coursier' : 'Moto Jakarta Express',
      plateNumber: data.plateNumber || 'DK-7842-AB',
      rating: 5.0,
      completedDeliveries: 0,
      todayEarnings: 0,
      isOnline: true,
      isAvailable: true,
      status: 'AVAILABLE',
      currentNeighborhood: 'Plateau',
      coordinates: data.coordinates || { lat: 14.6937, lng: -17.4441 },
      locationAccuracy: 5.0,
      lastUpdate: Date.now(),
    };

    setCouriers((prev) => [newCourier, ...prev]);
    try {
      const existing = localStorage.getItem('thiob_custom_couriers');
      const list = existing ? JSON.parse(existing) : [];
      localStorage.setItem('thiob_custom_couriers', JSON.stringify([newCourier, ...list]));
    } catch {}

    return newCourier;
  };

  const setClientProfile = (
    name: string,
    phone: string,
    address?: string,
    neighborhood?: string,
    coords?: GeoPoint
  ) => {
    if (name) {
      setClientName(name);
      try { localStorage.setItem('thiob_client_name', name); } catch {}
    }
    if (phone) {
      setClientPhone(phone);
      try { localStorage.setItem('thiob_client_phone', phone); } catch {}
    }
    if (coords) {
      setClientLocation(coords, address, neighborhood);
    }
  };

  const loginWithOAuth = async (provider: 'google' | 'facebook'): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
        },
      });
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.warn(`OAuth error (${provider}):`, err?.message);
      return { success: false, error: err?.message || 'Erreur lors de la connexion' };
    }
  };

  const logoutUser = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    try {
      localStorage.removeItem('thiob_user_session');
    } catch {}
    setCurrentRole('client');
  };

  const recordPaymentTransaction = (tx: PaymentTransaction) => {
    setTransactions((prev) => [tx, ...prev]);
    try {
      const existing = localStorage.getItem('thiob_payment_transactions');
      const list = existing ? JSON.parse(existing) : [];
      localStorage.setItem('thiob_payment_transactions', JSON.stringify([tx, ...list]));
    } catch {}
  };

  return (
    <AppContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        restaurants,
        menuItems,
        orders,
        couriers,
        metrics,
        reservations,
        outingPlans,
        favoriteRestaurantIds,
        clientCoords,
        clientAccuracy,
        clientGpsTimestamp,
        clientIsApproximate,
        clientAddress,
        clientNeighborhood,
        isClientGpsActive,
        radiusFilterKm,
        setRadiusFilterKm,
        setClientLocation,
        requestClientGps,
        updateOrderDeliveryLocation,
        getNearbyRestaurants,
        getNearbyCouriers,
        updateCourierLocation,
        updateRestaurantLocation,

        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartRestaurant,
        cartTotal,
        cartCount,
        placeOrder,
        createReservation,
        cancelReservation,
        createOutingPlan,
        deleteOutingPlan,
        toggleFavoriteRestaurant,
        currentRestaurantId,
        setCurrentRestaurantId,
        currentRestaurant,
        registerNewRestaurant,
        updateCurrentRestaurant,
        updateOrderStatus,
        toggleMenuItemAvailability,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        updateRestaurantShowcase,
        toggleCourierOnline,
        setCourierStatus,
        acceptDeliveryMission,
        completeDeliveryMission,
        registerCourier,
        clientName,
        clientPhone,
        setClientProfile,
        loginWithOAuth,
        logoutUser,
        transactions,
        recordPaymentTransaction,
        activeTrackingOrder,
        setActiveTrackingOrder,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
