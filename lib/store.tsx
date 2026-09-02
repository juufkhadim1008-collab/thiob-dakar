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

  // Restaurant Actions
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  toggleMenuItemAvailability: (itemId: string) => void;
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
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
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [couriers, setCouriers] = useState<Courier[]>(INITIAL_COURIERS);
  const [metrics, setMetrics] = useState<PlatformMetrics>(INITIAL_METRICS);
  const [reservations, setReservations] = useState<Reservation[]>(INITIAL_RESERVATIONS);
  const [outingPlans, setOutingPlans] = useState<OutingPlan[]>(INITIAL_OUTING_PLANS);
  const [favoriteRestaurantIds, setFavoriteRestaurantIds] = useState<string[]>(['resto-kamiss', 'resto-1']);

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
        updateOrderStatus,
        toggleMenuItemAvailability,
        addMenuItem,
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
