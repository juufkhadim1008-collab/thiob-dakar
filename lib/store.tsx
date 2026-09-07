'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
  PaymentTransaction,
  AppNotification,
  NotificationType
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
  INITIAL_NOTIFICATIONS, 
  TERANGA_DAILY_MESSAGES, 
  UPCOMING_FEATURES_ANNOUNCEMENTS 
} from './notifications-data';
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
  createReservation: (
    data: Omit<Reservation, 'id' | 'reservationNumber' | 'status' | 'createdAt'>,
    paymentInfo?: { depositAmount?: number; paymentMethod?: string }
  ) => Reservation;
  cancelReservation: (id: string) => void;
  createOutingPlan: (data: Omit<OutingPlan, 'id' | 'createdAt'>) => OutingPlan;
  deleteOutingPlan: (id: string) => void;
  toggleFavoriteRestaurant: (id: string) => void;

  // Restaurant Actions & Active Session
  currentRestaurantId: string;
  setCurrentRestaurantId: (id: string) => void;
  currentRestaurant: Restaurant | null;
  registerNewRestaurant: (data: {
    name: string;
    logo: string;
    type?: string;
    address: string;
    neighborhood: string;
    phone?: string;
    coverImage?: string;
    coordinates?: { lat: number; lng: number };
    userId?: string;
  }) => Restaurant;
  updateCurrentRestaurant: (updates: Partial<Restaurant>) => void;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  toggleMenuItemAvailability: (itemId: string) => void;
  addMenuItem: (item: Omit<MenuItem, 'id'>) => MenuItem | null;
  updateMenuItem: (itemId: string, updates: Partial<MenuItem>) => void;
  deleteMenuItem: (itemId: string) => void;
  updateRestaurantShowcase: (restoId: string, updates: Partial<Restaurant>) => void;

  // Courier Actions & Active Session
  currentCourierId: string;
  setCurrentCourierId: (id: string) => void;
  currentCourier: Courier | null;
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
    userId?: string;
  }) => Courier;

  // Client Profile & Auth
  clientName: string;
  clientPhone: string;
  setClientProfile: (name: string, phone: string, address?: string, neighborhood?: string, coords?: GeoPoint) => void;
  loginWithOAuth: (provider: 'google' | 'facebook') => Promise<{ success: boolean; error?: string }>;
  isPushEnabled: boolean;
  enablePushNotifications: (role: 'client' | 'restaurant' | 'courier', targetId?: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (email: string, password: string, fullName?: string) => Promise<{ success: boolean; userId?: string; error?: string }>;
  signInWithEmail: (email: string, password: string) => Promise<{
    success: boolean;
    userId?: string;
    restaurant?: Restaurant;
    courier?: Courier;
    fullName?: string;
    needsConfirmation?: boolean;
    error?: string;
  }>;
  resendConfirmationEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  sendPhoneOtp: (phone: string) => Promise<{ success: boolean; error?: string }>;
  verifyPhoneOtp: (phone: string, code: string) => Promise<{
    success: boolean;
    userId?: string;
    restaurant?: Restaurant;
    courier?: Courier;
    error?: string;
  }>;
  logoutUser: () => Promise<void>;

  // Payments & Transactions
  transactions: PaymentTransaction[];
  recordPaymentTransaction: (tx: PaymentTransaction) => void;

  // Tracking Modal
  activeTrackingOrder: Order | null;
  setActiveTrackingOrder: (order: Order | null) => void;

  // In-App Notifications & Messaging Center
  notifications: AppNotification[];
  unreadNotificationsCount: number;
  activeInAppToast: AppNotification | null;
  isNotificationCenterOpen: boolean;
  setIsNotificationCenterOpen: (open: boolean) => void;
  addNotification: (notif: Omit<AppNotification, 'id' | 'createdAt' | 'read' | 'timestamp'>) => AppNotification;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  dismissInAppToast: () => void;
  triggerDailyTerangaMessage: () => void;
  triggerProximityNotification: (neighborhood: string) => void;
  triggerSystemUpdateNotification: (title?: string, message?: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

async function queryDb(table: string): Promise<{ data: any[] | null; error: any }> {
  try {
    const res = await fetch(`/api/db?table=${table}`);
    if (res.ok) {
      const json = await res.json();
      return { data: json.data || [], error: null };
    }
  } catch {}
  return supabase.from(table).select('*');
}

async function mutateDb(table: string, data: any, action: 'insert' | 'upsert' | 'update' | 'delete' = 'insert', match?: any): Promise<{ data: any | null; error: any }> {
  try {
    const res = await fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table, data, action, match }),
    });
    if (res.ok) {
      const json = await res.json();
      return { data: json.data, error: null };
    }
  } catch {}
  return supabase.from(table).insert(data);
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentRole, setCurrentRole] = useState<UserRole>('client');
  const [restaurants, setRestaurants] = useState<Restaurant[]>(initialRestaurants);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [currentRestaurantId, setCurrentRestaurantIdState] = useState<string>('');
  const [currentCourierId, setCurrentCourierIdState] = useState<string>('');
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [couriers, setCouriers] = useState<Courier[]>(INITIAL_COURIERS);
  const [metrics, setMetrics] = useState<PlatformMetrics>(INITIAL_METRICS);
  const [reservations, setReservations] = useState<Reservation[]>(INITIAL_RESERVATIONS);
  const [outingPlans, setOutingPlans] = useState<OutingPlan[]>(INITIAL_OUTING_PLANS);
  const [favoriteRestaurantIds, setFavoriteRestaurantIds] = useState<string[]>([]);
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');

  // In-App Notifications & Messaging Center State
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [activeInAppToast, setActiveInAppToast] = useState<AppNotification | null>(null);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState<boolean>(false);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prevClientNeighborhoodRef = useRef<string>('Tous les quartiers');

  const setCurrentRestaurantId = (id: string) => {
    setCurrentRestaurantIdState(id);
    try {
      if (id) {
        localStorage.setItem('thiob_active_restaurant_id', id);
      } else {
        localStorage.removeItem('thiob_active_restaurant_id');
      }
    } catch {}
  };

  const setCurrentCourierId = (id: string) => {
    setCurrentCourierIdState(id);
    try {
      if (id) {
        localStorage.setItem('thiob_active_courier_id', id);
      } else {
        localStorage.removeItem('thiob_active_courier_id');
      }
    } catch {}
  };

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
      const savedCourierId = localStorage.getItem('thiob_active_courier_id');
      const savedRestos = localStorage.getItem('thiob_custom_restaurants');
      const savedCouriers = localStorage.getItem('thiob_custom_couriers');
      const savedNotifs = localStorage.getItem('thiob_app_notifications');

      if (savedNotifs) {
        try {
          const parsed = JSON.parse(savedNotifs);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setNotifications(parsed);
          }
        } catch {}
      }

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
      if (savedRestoId) setCurrentRestaurantIdState(savedRestoId);
      if (savedCourierId) setCurrentCourierIdState(savedCourierId);
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

    // 2. Fetch from Central Database via Proxy
    const fetchSupabaseData = async () => {
      try {
        console.log('[Database] Fetching central data from database...');
        const { data: dbRestos, error: rErr } = await queryDb('restaurants');
        if (rErr) console.error('[Database] Error restaurants:', rErr);

        if (dbRestos && dbRestos.length > 0) {
          const mapped: Restaurant[] = dbRestos.map((r: any) => ({
            id: r.id,
            name: r.name,
            logo: r.logo || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80',
            coverImage: r.cover_image || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
            tagline: r.tagline || 'L’Excellence et la Saveur de Dakar',
            description: r.description || '',
            neighborhood: r.neighborhood || 'Dakar',
            address: r.address || 'Dakar, Sénégal',
            coordinates: { lat: Number(r.latitude) || 14.7431, lng: Number(r.longitude) || -17.5186 },
            phone: r.phone || '+221 77 100 00 00',
            ownerName: r.owner_name || 'Chef Partenaire',
            rating: Number(r.rating) || 5.0,
            reviewCount: Number(r.review_count) || 1,
            priceRange: r.price_range || '2 500 - 6 500 FCFA',
            deliveryTimeEstimate: r.delivery_time_estimate || '20-30 min',
            deliveryFee: Number(r.delivery_fee) || 1500,
            minOrder: Number(r.min_order) || 3000,
            isOpen: r.is_open ?? true,
            featuredTags: r.featured_tags || ['Nouveau Resto Dakar'],
            openingHours: r.opening_hours || '11h30 - 23h30 (7j/7)',
            gallery: r.gallery || [],
            ambianceTags: r.ambiance_tags || ['Terrasse', 'Fait Maison'],
            amenities: r.amenities || ['Wifi', 'Paiement Wave'],
          }));
          setRestaurants(mapped);
        }

        const { data: dbItems, error: mErr } = await queryDb('menu_items');
        if (mErr) console.error('[Database] Error menu_items:', mErr);

        if (dbItems && dbItems.length > 0) {
          const mapped: MenuItem[] = dbItems.map((m: any) => ({
            id: m.id,
            restaurantId: m.restaurant_id,
            name: m.name,
            description: m.description || '',
            price: Number(m.price) || 0,
            category: m.category_id || 'cat-plat-local',
            image: m.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
            isAvailable: m.is_available ?? true,
            isPopular: m.is_popular ?? false,
            preparationTimeMinutes: Number(m.preparation_time_minutes) || 20,
            tags: m.tags || [],
          }));
          setMenuItems(mapped);
        }

        const { data: dbOrders, error: oErr } = await queryDb('orders');
        if (oErr) console.error('[Database] Error orders:', oErr);
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

        const { data: dbReservations, error: resErr } = await queryDb('reservations');
        if (resErr) console.error('[Database] Error reservations:', resErr);
        if (dbReservations && dbReservations.length > 0) {
          setReservations(dbReservations.map((r: any) => ({
            id: r.id,
            reservationNumber: r.reservation_number,
            restaurantId: r.restaurant_id,
            restaurantName: r.restaurant_name,
            clientName: r.client_name,
            clientPhone: r.client_phone,
            date: r.date,
            time: r.time,
            guestsCount: r.guests_count || 2,
            occasion: r.occasion || '',
            status: r.status || 'confirmed',
            notes: r.notes || '',
            createdAt: r.created_at,
          })));
        }
      } catch (err) {
        console.warn('Database fetch error:', err);
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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, () => {
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
    gallery: [],
    ambianceTags: [],
    amenities: [],
    openingHours: '11h30 - 23h30',
  };

  // 🔒 RESTAURANT & LIVREUR SÉCURISÉS : STRICTEMENT LE COMPTE DE L'UTILISATEUR AUTHENTIFIÉ
  // NE JAMAIS FAIRE DE FALLBACK SUR RESTAURANTS[0] OU COURIERS[0]
  const currentRestaurant: Restaurant | null = currentRestaurantId
    ? (restaurants.find((r) => r.id === currentRestaurantId) || null)
    : null;

  const currentCourier: Courier | null = currentCourierId
    ? (couriers.find((c) => c.id === currentCourierId) || null)
    : null;

  // 🔔 NOTIFICATION ENGINE & AUDIO CHIME
  const playNotificationChime = () => {
    if (typeof window === 'undefined') return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2); // G5
      gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.65);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.65);
    } catch {}
  };

  // Envoie une vraie notification push (arrive même app/onglet fermé) — best-effort, ne bloque jamais l'action en cours
  const sendPushNotification = (target: { role?: 'client' | 'restaurant' | 'courier'; restaurantId?: string; all?: boolean }, title: string, body: string) => {
    try {
      fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, title, body, icon: '/images/Icone app.png', url: '/' }),
      }).catch(() => {});
    } catch {}
  };

  const addNotification = (notif: Omit<AppNotification, 'id' | 'createdAt' | 'read' | 'timestamp'>): AppNotification => {
    const now = Date.now();
    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${now}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: now,
      timestamp: 'À l’instant',
      read: false,
    };

    setNotifications((prev) => {
      const updated = [newNotif, ...prev.filter((n) => n.id !== newNotif.id)].slice(0, 50);
      try {
        localStorage.setItem('thiob_app_notifications', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Display floating in-app banner toast
    setActiveInAppToast(newNotif);
    playNotificationChime();

    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setActiveInAppToast((current) => (current?.id === newNotif.id ? null : current));
    }, 6500);

    return newNotif;
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      try {
        localStorage.setItem('thiob_app_notifications', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      try {
        localStorage.setItem('thiob_app_notifications', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      try {
        localStorage.setItem('thiob_app_notifications', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    try {
      localStorage.removeItem('thiob_app_notifications');
    } catch {}
  };

  const dismissInAppToast = () => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setActiveInAppToast(null);
  };

  const triggerDailyTerangaMessage = () => {
    const randomIndex = Math.floor(Math.random() * TERANGA_DAILY_MESSAGES.length);
    const tmpl = TERANGA_DAILY_MESSAGES[randomIndex];
    addNotification({
      type: 'teranga_daily',
      title: tmpl.title,
      message: tmpl.message,
      icon: tmpl.icon,
      priority: 'high',
      actionRole: 'client',
    });
  };

  const triggerProximityNotification = (neighborhood: string) => {
    if (!neighborhood || neighborhood === 'Tous les quartiers') return;
    const matchingRestos = restaurants.filter((r) =>
      r.neighborhood.toLowerCase().includes(neighborhood.toLowerCase())
    );
    const restoNames = matchingRestos.slice(0, 2).map((r) => r.name).join(' & ');
    addNotification({
      type: 'geo_proximity',
      title: `📍 Vous êtes à ${neighborhood} !`,
      message:
        matchingRestos.length > 0
          ? `${matchingRestos.length} restaurant(s) réputés sont tout près (${restoNames}...). Découvrez leurs cartes !`
          : `Découvrez les délicieux plats de Dakar livrés rapidement dans la zone ${neighborhood}.`,
      icon: '📍',
      actionRole: 'client',
      actionData: { neighborhood },
      priority: 'high',
    });
  };

  const triggerSystemUpdateNotification = (title?: string, message?: string) => {
    const randomIndex = Math.floor(Math.random() * UPCOMING_FEATURES_ANNOUNCEMENTS.length);
    const tmpl = UPCOMING_FEATURES_ANNOUNCEMENTS[randomIndex];
    addNotification({
      type: 'system_update',
      title: title || tmpl.title,
      message: message || tmpl.message,
      icon: tmpl.icon || '🚀',
      priority: 'normal',
      actionRole: 'client',
    });
  };

  // 🇸🇳 VÉRIFICATION AUTOMATIQUE DU MESSAGE DE TERANGA QUOTIDIEN À 10H & BROADCAST
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Déclencher le toast pop-up du message Teranga diffusé à l'ouverture
    const broadcastTimer = setTimeout(() => {
      const topNotif = INITIAL_NOTIFICATIONS[0];
      if (topNotif) {
        setActiveInAppToast(topNotif);
        playNotificationChime();
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = setTimeout(() => {
          setActiveInAppToast((cur) => (cur?.id === topNotif.id ? null : cur));
        }, 7500);
      }
    }, 1200);

    const check10hTeranga = () => {
      const now = new Date();
      const todayDateKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
      const lastSent = localStorage.getItem('thiob_last_teranga_date');

      if (now.getHours() >= 10 && lastSent !== todayDateKey) {
        localStorage.setItem('thiob_last_teranga_date', todayDateKey);
        triggerDailyTerangaMessage();
      }
    };

    const timer = setTimeout(check10hTeranga, 2000);
    const interval = setInterval(check10hTeranga, 10 * 60 * 1000);
    return () => {
      clearTimeout(broadcastTimer);
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  // Client Geolocation Handler with exact accuracy & proximity alerts
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
    if (neighborhood) {
      setClientNeighborhood(neighborhood);
      // Trigger proximity recommendation when user moves to a new neighborhood
      if (
        neighborhood !== 'Tous les quartiers' &&
        neighborhood !== prevClientNeighborhoodRef.current
      ) {
        if (prevClientNeighborhoodRef.current !== 'Tous les quartiers') {
          triggerProximityNotification(neighborhood);
        }
        prevClientNeighborhoodRef.current = neighborhood;
      }
    }

    try {
      localStorage.setItem('thiob_client_coords', JSON.stringify(coords));
      localStorage.setItem('thiob_client_accuracy', accuracy.toString());
      if (address) localStorage.setItem('thiob_client_address', address);
      if (neighborhood) localStorage.setItem('thiob_client_neighborhood', neighborhood);
    } catch {}
  };

  // 📡 Démarrage automatique & suivi GPS ultra-précis en temps réel lors de chaque déplacement
  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) return;

    let isMounted = true;
    let watcher: any = null;

    const startLiveTracking = async () => {
      try {
        const { ClientLiveLocationWatcher } = await import('./geolocation');
        watcher = new ClientLiveLocationWatcher(
          async (loc) => {
            if (!isMounted) return;
            const coords = { lat: loc.lat, lng: loc.lng };
            const geo = await reverseGeocodeDakar(loc.lat, loc.lng);
            if (!isMounted) return;
            setClientLocation(coords, geo.fullAddress, geo.neighborhood, loc.accuracy);
          },
          (err) => {
            console.warn('[Live GPS Watcher] Notification :', err.message);
          }
        );
        watcher.start();
      } catch {}
    };

    startLiveTracking();

    return () => {
      isMounted = false;
      if (watcher) watcher.stop();
    };
  }, []);

  const requestClientGps = async (): Promise<{ coords: GeoPoint; accuracy: number }> => {
    const { getHighAccuracyLocation } = await import('./geolocation');
    const exact = await getHighAccuracyLocation(6000, 8);
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
      }).then(({ error }) => {
        if (error) console.error('🔴 [Supabase] Échec RPC update_courier_gps :', error);
      });
    } catch (err) {
      console.error('🔴 [Supabase] Exception RPC update_courier_gps :', err);
    }
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
      }).then(({ error }) => {
        if (error) console.error('🔴 [Supabase] Échec RPC update_restaurant_location (fonction absente du schéma SQL ?) :', error);
      });
    } catch (err) {
      console.error('🔴 [Supabase] Exception RPC update_restaurant_location :', err);
    }
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
    userId?: string;
  }): Restaurant => {
    const newId = `resto-${Date.now()}`;
    const presetCoords = DAKAR_GEO_PRESETS[data.neighborhood] || DAKAR_GEO_PRESETS['Almadies'];
    const coords = data.coordinates || { lat: presetCoords.lat, lng: presetCoords.lng };

    const newResto: Restaurant = {
      id: newId,
      userId: data.userId,
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
        category: 'cat-plat-local',
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
        category: 'cat-plat-local',
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
        category: 'cat-jus-degue',
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
        user_id: data.userId || null,
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
      }).then(({ error }) => {
        if (error) {
          console.error('🔴 [Supabase] Échec de création du restaurant (le restaurant restera invisible sur les autres appareils tant que ceci n’est pas corrigé) :', error);
          return;
        }
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
        }))).then(({ error: dishError }) => {
          if (dishError) console.error('🔴 [Supabase] Échec de création des plats de démarrage :', dishError);
        });
      });
    } catch (err) {
      console.error('🔴 [Supabase] Exception lors de la création du restaurant :', err);
    }

    // 🔔 Notification in-app automatique pour informer les utilisateurs
    addNotification({
      type: 'new_restaurant',
      title: `🎉 Nouveau restaurant : ${newResto.name} !`,
      message: `Bienvenue à "${newResto.name}" aux ${newResto.neighborhood}. Découvrez dès maintenant leurs plats faits maison en livraison !`,
      icon: '🍽️',
      image: newResto.logo || newResto.coverImage,
      actionRole: 'client',
      actionData: {
        restaurantId: newResto.id,
        neighborhood: newResto.neighborhood,
      },
      priority: 'normal',
    });

    sendPushNotification(
      { role: 'client' },
      `🎉 Nouveau restaurant : ${newResto.name} !`,
      `Bienvenue à "${newResto.name}" aux ${newResto.neighborhood}. Découvrez dès maintenant leurs plats faits maison en livraison !`
    );

    return newResto;
  };


  const updateCurrentRestaurant = (updates: Partial<Restaurant>) => {
    if (!currentRestaurantId) return;
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
      }).eq('id', currentRestaurantId).then(({ error }) => {
        if (error) console.error('🔴 [Supabase] Échec de mise à jour du restaurant :', error);
      });
    } catch (err) {
      console.error('🔴 [Supabase] Exception lors de la mise à jour du restaurant :', err);
    }
  };

  const toggleMenuItemAvailability = (itemId: string) => {
    setMenuItems((prev) =>
      prev.map((m) => {
        if (m.id === itemId && m.restaurantId === currentRestaurantId) {
          const newStatus = !m.isAvailable;
          try {
            supabase.from('menu_items').update({ is_available: newStatus }).eq('id', itemId).eq('restaurant_id', currentRestaurantId).then();
          } catch {}
          return { ...m, isAvailable: newStatus };
        }
        return m;
      })
    );
  };

  const addMenuItem = (itemData: Omit<MenuItem, 'id'>): MenuItem | null => {
    // 🔒 VÉRIFICATION DE SÉCURITÉ STRICTE
    if (!currentRestaurantId || itemData.restaurantId !== currentRestaurantId) {
      console.error('🔒 [Security] Tentative d’ajout de plat non autorisée.');
      return null;
    }

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
        category_id: newItem.category || 'cat-plat-local',
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
      prev.map((m) => (m.id === itemId && m.restaurantId === currentRestaurantId ? { ...m, ...updates } : m))
    );
    if (!currentRestaurantId) return;
    try {
      supabase.from('menu_items').update({
        name: updates.name,
        description: updates.description,
        price: updates.price,
        image: updates.image,
        category_id: updates.category,
        is_available: updates.isAvailable,
        is_popular: updates.isPopular,
      }).eq('id', itemId).eq('restaurant_id', currentRestaurantId).then();
    } catch {}
  };

  const deleteMenuItem = (itemId: string) => {
    setMenuItems((prev) => prev.filter((m) => m.id !== itemId || m.restaurantId !== currentRestaurantId));
    if (!currentRestaurantId) return;
    try {
      supabase.from('menu_items').delete().eq('id', itemId).eq('restaurant_id', currentRestaurantId).then();
    } catch {}
  };

  const updateRestaurantShowcase = (restoId: string, updates: Partial<Restaurant>) => {
    // 🔒 VÉRIFICATION DE SÉCURITÉ : Un restaurateur ne peut modifier QUE son propre restaurant
    if (!currentRestaurantId || restoId !== currentRestaurantId) {
      console.error('🔒 [Security] Tentative de modification non autorisée d’un restaurant tiers.');
      return;
    }
    setRestaurants((prev) =>
      prev.map((r) => (r.id === restoId ? { ...r, ...updates } : r))
    );
    try {
      supabase.from('restaurants').update({
        name: updates.name,
        tagline: updates.tagline,
        price_range: updates.priceRange,
        opening_hours: typeof updates.openingHours === 'string' ? updates.openingHours : undefined,
        address: updates.address,
        neighborhood: updates.neighborhood,
        phone: updates.phone,
        cover_image: updates.coverImage,
        logo: updates.logo,
        gallery: updates.gallery,
        amenities: updates.amenities,
        ambiance_tags: updates.ambianceTags,
      }).eq('id', restoId).then();
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
      }).then(({ error }) => {
        if (error) {
          console.error('🔴 [Supabase] Échec d’enregistrement de la commande :', error);
          return;
        }
        sendPushNotification(
          { restaurantId: newOrder.restaurantId },
          '🛎️ Nouvelle commande !',
          `${newOrder.clientName} vient de commander pour ${newOrder.total.toLocaleString('fr-FR')} FCFA (${newOrder.orderNumber}).`
        );
      });
    } catch (err) {
      console.error('🔴 [Supabase] Exception lors de l’enregistrement de la commande :', err);
    }

    return newOrder;
  };



  // Reservations
  const createReservation = (
    data: Omit<Reservation, 'id' | 'reservationNumber' | 'status' | 'createdAt'>,
    paymentInfo?: { depositAmount?: number; paymentMethod?: string }
  ): Reservation => {
    const newRes: Reservation = {
      ...data,
      id: `res-${Date.now()}`,
      reservationNumber: `RES-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };
    setReservations((prev) => [newRes, ...prev]);

    // Push to Supabase for multi-device cross-platform sync (le restaurant doit voir la réservation)
    try {
      supabase.from('reservations').insert({
        id: newRes.id,
        reservation_number: newRes.reservationNumber,
        restaurant_id: newRes.restaurantId,
        restaurant_name: newRes.restaurantName,
        client_name: newRes.clientName,
        client_phone: newRes.clientPhone,
        date: newRes.date,
        time: newRes.time,
        guests_count: newRes.guestsCount,
        occasion: newRes.occasion,
        notes: newRes.notes || '',
        status: newRes.status,
        deposit_amount: paymentInfo?.depositAmount || 0,
        payment_method: paymentInfo?.paymentMethod || 'wave',
      }).then(({ error }) => {
        if (error) {
          console.error('🔴 [Supabase] Échec de synchronisation de la réservation (le restaurant ne la verra pas) :', error);
          return;
        }
        sendPushNotification(
          { restaurantId: newRes.restaurantId },
          '📅 Nouvelle réservation !',
          `${newRes.clientName} a réservé pour ${newRes.guestsCount} personne(s) le ${newRes.date} à ${newRes.time} (${newRes.reservationNumber}).`
        );
      });
    } catch (err) {
      console.error('🔴 [Supabase] Exception lors de la synchronisation de la réservation :', err);
    }

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


  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    let targetOrder: Order | undefined;
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          targetOrder = o;
          const updated = { ...o, status: newStatus };
          if (activeTrackingOrder?.id === orderId) {
            setActiveTrackingOrder(updated);
          }
          return updated;
        }
        return o;
      })
    );

    // 🔔 Notifications in-app de suivi en temps réel pour le client
    if (targetOrder) {
      const num = targetOrder.orderNumber;
      const rName = targetOrder.restaurantName;
      if (newStatus === 'accepted') {
        addNotification({
          type: 'order_status',
          title: `✅ Commande validée par ${rName}`,
          message: `Votre commande #${num} a été confirmée et entre en préparation en cuisine !`,
          icon: '👨‍🍳',
          priority: 'high',
          actionRole: 'client',
          actionData: { orderId },
        });
      } else if (newStatus === 'preparing') {
        addNotification({
          type: 'order_status',
          title: `🔥 En cuisine chez ${rName}`,
          message: `Les chefs s'activent pour préparer vos plats frais avec amour.`,
          icon: '🍲',
          priority: 'normal',
          actionRole: 'client',
          actionData: { orderId },
        });
      } else if (newStatus === 'ready_for_pickup') {
        addNotification({
          type: 'order_status',
          title: `📦 Commande #${num} prête !`,
          message: `Votre commande est emballée et prête pour la prise en charge par le livreur.`,
          icon: '🛵',
          priority: 'normal',
          actionRole: 'client',
          actionData: { orderId },
        });
      } else if (newStatus === 'in_transit') {
        addNotification({
          type: 'order_status',
          title: `🛵 Livreur en route avec votre repas !`,
          message: `Votre commande #${num} est en route dans les rues de Dakar. Suivez l'arrivée en direct !`,
          icon: '⚡',
          priority: 'urgent',
          actionRole: 'client',
          actionData: { orderId },
        });
      } else if (newStatus === 'delivered') {
        addNotification({
          type: 'order_status',
          title: `🎉 Bon appétit ! Commande livrée`,
          message: `Votre commande #${num} a été livrée avec succès. Bon appétit et Teranga rek ! ❤️`,
          icon: '🍽️',
          priority: 'high',
          actionRole: 'client',
          actionData: { orderId },
        });
      }
    }
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
    userId?: string;
  }): Courier => {
    const fullName = `${data.firstName} ${data.lastName}`.trim() || 'Livreur Tiak-Tiak';
    const newId = `courier-${Date.now()}`;
    const newCourier: Courier = {
      id: newId,
      userId: data.userId,
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

    // Push to Supabase for multi-device cross-platform sync
    try {
      supabase.from('couriers').insert({
        id: newId,
        user_id: data.userId || null,
        name: newCourier.name,
        phone: newCourier.phone,
        photo: newCourier.photo,
        vehicle_type: newCourier.vehicleType,
        vehicle_name: newCourier.vehicleName,
        plate_number: newCourier.plateNumber,
        is_online: true,
        is_available: true,
        status: 'AVAILABLE',
        current_neighborhood: newCourier.currentNeighborhood,
        latitude: newCourier.coordinates?.lat,
        longitude: newCourier.coordinates?.lng,
      }).then(({ error }) => {
        if (error) console.error('🔴 [Supabase] Échec de création du livreur (invisible sur les autres appareils) :', error);
      });
    } catch (err) {
      console.error('🔴 [Supabase] Exception lors de la création du livreur :', err);
    }

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

  // Recherche le restaurant / livreur réellement lié à ce compte (auth.uid())
  // et met à jour l'état de l'app en conséquence. Partagé par la connexion
  // e-mail/mot de passe et la connexion par SMS.
  const resolveOwnedAccountsByUserId = async (
    userId: string
  ): Promise<{ restaurant?: Restaurant; courier?: Courier }> => {
    const [{ data: restoRows }, { data: courierRows }] = await Promise.all([
      supabase.from('restaurants').select('*').eq('user_id', userId).limit(1),
      supabase.from('couriers').select('*').eq('user_id', userId).limit(1),
    ]);

    let foundRestaurant: Restaurant | undefined;
    if (restoRows && restoRows.length > 0) {
      const r: any = restoRows[0];
      foundRestaurant = {
        id: r.id,
        userId: r.user_id,
        name: r.name,
        tagline: r.tagline || 'L’Excellence et la Saveur de Dakar',
        description: r.description || '',
        coverImage: r.cover_image,
        logo: r.logo,
        neighborhood: r.neighborhood,
        address: r.address,
        coordinates: { lat: Number(r.latitude) || 14.7431, lng: Number(r.longitude) || -17.5186 },
        phone: r.phone,
        ownerName: r.owner_name,
        rating: Number(r.rating) || 5.0,
        reviewCount: Number(r.review_count) || 0,
        priceRange: r.price_range,
        deliveryTimeEstimate: r.delivery_time_estimate,
        deliveryFee: Number(r.delivery_fee) || 1500,
        minOrder: Number(r.min_order) || 3000,
        isOpen: r.is_open ?? true,
        featuredTags: r.featured_tags || [],
        openingHours: r.opening_hours,
        gallery: r.gallery || [],
        ambianceTags: r.ambiance_tags || [],
        amenities: r.amenities || [],
      };
      const resolvedResto = foundRestaurant;
      setRestaurants((prev) => (prev.some((p) => p.id === resolvedResto.id) ? prev.map((p) => (p.id === resolvedResto.id ? resolvedResto : p)) : [resolvedResto, ...prev]));
      setCurrentRestaurantId(resolvedResto.id);
      try { localStorage.setItem('thiob_active_restaurant_id', resolvedResto.id); } catch {}
    }

    let foundCourier: Courier | undefined;
    if (courierRows && courierRows.length > 0) {
      const c: any = courierRows[0];
      foundCourier = {
        id: c.id,
        userId: c.user_id,
        name: c.name,
        phone: c.phone,
        photo: c.photo,
        vehicleType: c.vehicle_type,
        vehicleName: c.vehicle_name,
        plateNumber: c.plate_number,
        isOnline: c.is_online,
        isAvailable: c.is_available,
        status: c.status,
        currentNeighborhood: c.current_neighborhood,
        coordinates: { lat: Number(c.latitude) || 14.6937, lng: Number(c.longitude) || -17.4441 },
        rating: Number(c.rating) || 5.0,
        completedDeliveries: c.completed_deliveries || 0,
        todayEarnings: c.today_earnings || 0,
      };
      const resolvedCourier = foundCourier;
      setCouriers((prev) => (prev.some((p) => p.id === resolvedCourier.id) ? prev.map((p) => (p.id === resolvedCourier.id ? resolvedCourier : p)) : [resolvedCourier, ...prev]));
    }

    return { restaurant: foundRestaurant, courier: foundCourier };
  };

  const normalizePhoneForAuth = (raw: string) => raw.replace(/[\s-]/g, '');

  // Envoie un code de vérification par SMS (Supabase Auth Phone OTP).
  // Fonctionne aussi bien pour une première inscription que pour une
  // reconnexion : Supabase crée le compte au premier verifyOtp réussi.
  const sendPhoneOtp = async (phone: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone: normalizePhoneForAuth(phone) });
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error('🔴 [Supabase Auth] Échec envoi code SMS :', err);
      const friendly = err?.code === 'phone_provider_disabled'
        ? 'La vérification par SMS n’est pas encore activée sur ce projet (configurez un fournisseur SMS dans Supabase → Authentication → Providers → Phone).'
        : err?.message || 'Erreur lors de l’envoi du code SMS';
      return { success: false, error: friendly };
    }
  };

  // Vérifie le code SMS et récupère le restaurant / livreur associé s'il existe.
  const verifyPhoneOtp = async (
    phone: string,
    code: string
  ): Promise<{ success: boolean; userId?: string; restaurant?: Restaurant; courier?: Courier; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: normalizePhoneForAuth(phone),
        token: code.trim(),
        type: 'sms',
      });
      if (error) throw error;
      const userId = data.user?.id;
      if (!userId) throw new Error('Vérification impossible, veuillez réessayer.');

      const { restaurant, courier } = await resolveOwnedAccountsByUserId(userId);
      return { success: true, userId, restaurant, courier };
    } catch (err: any) {
      console.error('🔴 [Supabase Auth] Échec vérification code SMS :', err);
      return { success: false, error: err?.message || 'Code invalide ou expiré, veuillez réessayer.' };
    }
  };

  // Inscription réelle par e-mail / mot de passe (Supabase Auth)
  const signUpWithEmail = async (
    email: string,
    password: string,
    fullName?: string
  ): Promise<{ success: boolean; userId?: string; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: fullName ? { data: { full_name: fullName } } : undefined,
      });
      if (error) throw error;
      if (!data.user) throw new Error('Compte non créé, veuillez réessayer.');
      return { success: true, userId: data.user.id };
    } catch (err: any) {
      console.error('🔴 [Supabase Auth] Échec inscription :', err);
      return { success: false, error: err?.message || 'Erreur lors de la création du compte' };
    }
  };

  // Connexion réelle par e-mail / mot de passe (Supabase Auth) + récupération
  // du restaurant ou du livreur réellement associé à ce compte (auth.uid()).
  const signInWithEmail = async (
    email: string,
    password: string
  ): Promise<{
    success: boolean;
    userId?: string;
    restaurant?: Restaurant;
    courier?: Courier;
    fullName?: string;
    needsConfirmation?: boolean;
    error?: string;
  }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const userId = data.user?.id;
      if (!userId) throw new Error('Connexion impossible, veuillez réessayer.');

      const { restaurant, courier } = await resolveOwnedAccountsByUserId(userId);

      const fullName: string | undefined = data.user?.user_metadata?.full_name;
      if (fullName) {
        setClientProfile(fullName, data.user?.phone || '');
      }

      return { success: true, userId, restaurant, courier, fullName };
    } catch (err: any) {
      console.error('🔴 [Supabase Auth] Échec connexion :', err);
      if (err?.code === 'email_not_confirmed') {
        return {
          success: false,
          needsConfirmation: true,
          error: 'Veuillez confirmer votre e-mail (lien reçu à l’inscription) avant de vous connecter.',
        };
      }
      return { success: false, error: err?.message === 'Invalid login credentials' ? 'E-mail ou mot de passe incorrect.' : (err?.message || 'Erreur lors de la connexion') };
    }
  };

  // Renvoie l'e-mail de confirmation d'inscription (si le compte n'est pas encore confirmé)
  const resendConfirmationEmail = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email });
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error('🔴 [Supabase Auth] Échec renvoi e-mail de confirmation :', err);
      return { success: false, error: err?.message || 'Erreur lors du renvoi de l’e-mail' };
    }
  };

  // Active les notifications push réelles (arrivent même app/onglet fermé).
  // Nécessite un geste utilisateur (bouton) : les navigateurs bloquent la
  // demande de permission si elle n'est pas déclenchée par un clic.
  const [isPushEnabled, setIsPushEnabled] = useState(false);
  useEffect(() => {
    try {
      if (localStorage.getItem('thiob_push_enabled') === '1') setIsPushEnabled(true);
    } catch {}
  }, []);

  const enablePushNotifications = async (
    role: 'client' | 'restaurant' | 'courier',
    targetId?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
        return { success: false, error: 'Les notifications push ne sont pas supportées sur ce navigateur.' };
      }

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        return { success: false, error: 'Permission refusée. Activez les notifications dans les réglages du navigateur.' };
      }

      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
      if (!vapidPublicKey) throw new Error('Clé VAPID publique manquante côté serveur.');

      const urlBase64ToUint8Array = (base64String: string) => {
        const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = atob(base64);
        return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
      };

      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });
      }

      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          role,
          restaurantId: role === 'restaurant' ? targetId : undefined,
          courierId: role === 'courier' ? targetId : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Échec de l’enregistrement de l’abonnement.');

      setIsPushEnabled(true);
      try { localStorage.setItem('thiob_push_enabled', '1'); } catch {}
      return { success: true };
    } catch (err: any) {
      console.error('🔴 [Push] Échec activation :', err);
      return { success: false, error: err?.message || 'Erreur lors de l’activation des notifications.' };
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
        currentCourierId,
        setCurrentCourierId,
        currentCourier,
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
        isPushEnabled,
        enablePushNotifications,
        signUpWithEmail,
        signInWithEmail,
        resendConfirmationEmail,
        sendPhoneOtp,
        verifyPhoneOtp,
        logoutUser,
        transactions,
        recordPaymentTransaction,
        activeTrackingOrder,
        setActiveTrackingOrder,

        // In-App Notifications & Messaging Center
        notifications,
        unreadNotificationsCount,
        activeInAppToast,
        isNotificationCenterOpen,
        setIsNotificationCenterOpen,
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        clearAllNotifications,
        dismissInAppToast,
        triggerDailyTerangaMessage,
        triggerProximityNotification,
        triggerSystemUpdateNotification,
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
