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
  OutingPlan
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
  acceptDeliveryMission: (courierId: string, orderId: string) => void;
  completeDeliveryMission: (courierId: string, orderId: string) => void;

  // Tracking Modal
  activeTrackingOrder: Order | null;
  setActiveTrackingOrder: (order: Order | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentRole, setCurrentRole] = useState<UserRole>('client');
  const [restaurants, setRestaurants] = useState<Restaurant[]>(initialRestaurants);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [currentRestaurantId, setCurrentRestaurantId] = useState<string>('resto-kamiss');
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [couriers, setCouriers] = useState<Courier[]>(INITIAL_COURIERS);
  const [metrics, setMetrics] = useState<PlatformMetrics>(INITIAL_METRICS);
  const [reservations, setReservations] = useState<Reservation[]>(INITIAL_RESERVATIONS);
  const [outingPlans, setOutingPlans] = useState<OutingPlan[]>(INITIAL_OUTING_PLANS);
  const [favoriteRestaurantIds, setFavoriteRestaurantIds] = useState<string[]>(['resto-kamiss', 'resto-1']);

  // Load registered restaurant from localStorage on startup if available
  useEffect(() => {
    try {
      const savedRestoId = localStorage.getItem('thiob_active_restaurant_id');
      const savedRestos = localStorage.getItem('thiob_custom_restaurants');
      if (savedRestos) {
        const parsed: Restaurant[] = JSON.parse(savedRestos);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRestaurants((prev) => {
            const combined = [...parsed, ...prev.filter(p => !parsed.some(c => c.id === p.id))];
            return combined;
          });
        }
      }
      if (savedRestoId) {
        setCurrentRestaurantId(savedRestoId);
      }
    } catch {}
  }, []);

  const currentRestaurant = restaurants.find((r) => r.id === currentRestaurantId) || restaurants[0];

  const registerNewRestaurant = (data: {
    name: string;
    logo: string;
    type?: string;
    address: string;
    neighborhood: string;
    phone?: string;
    coverImage?: string;
  }): Restaurant => {
    const newId = `resto-${Date.now()}`;
    const newResto: Restaurant = {
      id: newId,
      name: data.name,
      logo: data.logo || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80',
      coverImage: data.coverImage || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
      tagline: 'L’Excellence et la Saveur de Dakar',
      description: `Bienvenue chez ${data.name}. Nous préparons des plats faits maison avec les ingrédients les plus frais de Dakar.`,
      neighborhood: data.neighborhood || 'Almadies',
      address: data.address || 'Dakar, Sénégal',
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

    return newResto;
  };

  const updateCurrentRestaurant = (updates: Partial<Restaurant>) => {
    setRestaurants((prev) => {
      const updated = prev.map((r) => (r.id === currentRestaurantId ? { ...r, ...updates } : r));
      try {
        const customRestos = updated.filter(r => r.id.startsWith('resto-1') || r.id === currentRestaurantId);
        localStorage.setItem('thiob_custom_restaurants', JSON.stringify(customRestos));
      } catch {}
      return updated;
    });
  };

  const updateMenuItem = (itemId: string, updates: Partial<MenuItem>) => {
    setMenuItems((prev) =>
      prev.map((m) => (m.id === itemId ? { ...m, ...updates } : m))
    );
  };

  const deleteMenuItem = (itemId: string) => {
    setMenuItems((prev) => prev.filter((m) => m.id !== itemId));
  };

  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeTrackingOrder, setActiveTrackingOrder] = useState<Order | null>(null);

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
    paymentMethod: PaymentMethod;
  }): Order => {
    const restaurant = cartRestaurant || restaurants[0];
    const subtotal = cartTotal;
    const deliveryFee = restaurant.deliveryFee;
    const platformFee = 500;
    const total = subtotal + deliveryFee + platformFee;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `DKR-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: 'À l’instant',
      clientId: 'current-user-client',
      clientName: details.clientName,
      clientPhone: details.clientPhone,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
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
      },
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

  const toggleMenuItemAvailability = (itemId: string) => {
    setMenuItems((prev) =>
      prev.map((m) => (m.id === itemId ? { ...m, isAvailable: !m.isAvailable } : m))
    );
  };

  const addMenuItem = (item: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      ...item,
      id: `menu-${Date.now()}`,
    };
    setMenuItems((prev) => [newItem, ...prev]);
  };

  const toggleCourierOnline = (courierId: string) => {
    setCouriers((prev) =>
      prev.map((c) => (c.id === courierId ? { ...c, isOnline: !c.isOnline } : c))
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
            }
          : o
      )
    );
    setCouriers((prev) =>
      prev.map((c) => (c.id === courierId ? { ...c, activeOrderId: orderId } : c))
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
              completedDeliveries: c.completedDeliveries + 1,
              todayEarnings: c.todayEarnings + earnings,
            }
          : c
      )
    );
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
        acceptDeliveryMission,
        completeDeliveryMission,
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
