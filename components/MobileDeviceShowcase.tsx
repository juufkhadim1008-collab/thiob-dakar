'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/lib/store';
import { UserRole } from '@/lib/types';
import { 
  Smartphone, 
  RotateCcw, 
  Sparkles, 
  Compass, 
  ChefHat, 
  Bike, 
  ShieldCheck,
  Search,
  ShoppingBag,
  User,
  Bell,
  UtensilsCrossed,
  DollarSign,
  MapPin,
  Flame,
  Star,
  Clock,
  Plus,
  Minus,
  Check,
  CheckCircle2,
  Navigation,
  Phone,
  Power,
  ToggleLeft,
  ToggleRight,
  ArrowRight,
  TrendingUp,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { CATEGORIES, DAKAR_NEIGHBORHOODS } from '@/lib/mock-data';
import { MenuItem, Restaurant, Order, OrderStatus, PaymentMethod } from '@/lib/types';
import { formatFCFA, getStatusBadge } from '@/lib/utils';
import confetti from 'canvas-confetti';

// =========================================================================
// 1. MOBILE APP CLIENT VIEW (Marketplace, Cart, Tracking, Profile)
// =========================================================================
function MobileClientApp({ onOpenTracking }: { onOpenTracking: (ord: Order) => void }) {
  const { 
    restaurants, 
    menuItems, 
    cart, 
    addToCart, 
    updateCartQuantity, 
    removeFromCart, 
    clearCart,
    cartTotal, 
    cartCount, 
    cartRestaurant,
    placeOrder,
    orders,
    activeTrackingOrder,
    setActiveTrackingOrder
  } = useApp();

  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'orders' | 'profile'>('home');
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('Tous les quartiers');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);
  const [dishNotes, setDishNotes] = useState('');
  const [isCartSheetOpen, setIsCartSheetOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'payment' | 'done'>('cart');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('wave');
  const [clientName, setClientName] = useState('Moussa Diop');
  const [clientPhone, setClientPhone] = useState('+221 77 654 32 10');
  const [deliveryStreet, setDeliveryStreet] = useState('Route des Almadies');

  // Filtered dishes
  const filteredDishes = menuItems.filter((dish) => {
    const matchCat = selectedCat === 'all' || dish.category === selectedCat;
    const matchSearch = searchQuery === '' || 
      dish.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      dish.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const filteredRestaurants = restaurants.filter((resto) => {
    const matchNeighborhood = selectedNeighborhood === 'Tous les quartiers' || resto.neighborhood === selectedNeighborhood;
    const matchSearch = searchQuery === '' || resto.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchNeighborhood && matchSearch;
  });

  const deliveryFee = cartRestaurant?.deliveryFee || 1500;
  const platformFee = 500;
  const grandTotal = cartTotal + deliveryFee + platformFee;

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    const order = placeOrder({
      clientName,
      clientPhone,
      neighborhood: selectedNeighborhood === 'Tous les quartiers' ? 'Almadies' : selectedNeighborhood,
      street: deliveryStreet,
      paymentMethod,
    });
    setCheckoutStep('done');
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#07431E', '#008235', '#FA8038'],
      });
    } catch {}
  };

  return (
    <div className="h-full flex flex-col bg-[#F7FAF7] relative overflow-hidden">
      {/* Top Header Client */}
      <div className="pt-2 px-4 pb-3 bg-white border-b border-[#E2ECE5] flex items-center justify-between shrink-0 shadow-2xs z-20">
        <div>
          <span className="text-[10px] font-bold text-[#008235] uppercase tracking-wider block">
            Livraison à Dakar
          </span>
          <div className="flex items-center gap-1 cursor-pointer">
            <MapPin className="w-3.5 h-3.5 text-[#FA8038]" />
            <select
              value={selectedNeighborhood}
              onChange={(e) => setSelectedNeighborhood(e.target.value)}
              className="bg-transparent text-xs font-black text-[#07431E] focus:outline-hidden cursor-pointer"
            >
              {DAKAR_NEIGHBORHOODS.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Order Shortcut if active */}
        {activeTrackingOrder && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onOpenTracking(activeTrackingOrder)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EBF7EE] text-[#008235] border border-[#008235]/30 text-[10px] font-bold"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#FA8038] animate-ping" />
            <span>Suivi {activeTrackingOrder.orderNumber}</span>
          </motion.button>
        )}
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
        
        {/* TAB 1: HOME */}
        {activeTab === 'home' && (
          <div className="p-4 space-y-5">
            {/* Promo Hero Banner */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="brand-gradient rounded-2xl p-4 text-white shadow-md relative overflow-hidden"
            >
              <div className="relative z-10 space-y-1.5">
                <span className="px-2 py-0.5 rounded-full bg-[#FA8038] text-[9px] font-black uppercase tracking-wider inline-block">
                  🔥 Teranga Dakaroise
                </span>
                <h3 className="text-base font-black leading-tight">
                  Ceebu Jën Rouge & Blanc
                </h3>
                <p className="text-[11px] text-white/80 line-clamp-2">
                  Le goût authentique de Saint-Louis et Dakar livré chaud en 25-35 min.
                </p>
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs font-black text-[#FA8038]">Dès 3 800 FCFA</span>
                  <button 
                    onClick={() => setSelectedCat('cat-thieb')}
                    className="px-3 py-1 bg-white text-[#07431E] rounded-full text-[10px] font-bold shadow-xs active:scale-95"
                  >
                    Voir les Thiébs
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Categories Scroll */}
            <div className="space-y-2">
              <h4 className="text-xs font-black text-[#07431E] uppercase tracking-wider">
                Spécialités Populaires
              </h4>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                <button
                  onClick={() => setSelectedCat('all')}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${
                    selectedCat === 'all'
                      ? 'brand-gradient text-white shadow-xs'
                      : 'bg-white text-gray-700 border border-[#E2ECE5]'
                  }`}
                >
                  Tous
                </button>
                {CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCat(c.id)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap flex items-center gap-1 transition-all ${
                      selectedCat === c.id
                        ? 'brand-gradient text-white shadow-xs'
                        : 'bg-white text-gray-700 border border-[#E2ECE5]'
                    }`}
                  >
                    <span>{c.icon}</span>
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Popular Dishes Mobile Cards */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-[#07431E] uppercase tracking-wider">
                  Les Incontournables
                </h4>
                <span className="text-[10px] font-bold text-[#008235]">
                  {filteredDishes.length} plats
                </span>
              </div>

              <div className="space-y-3">
                {filteredDishes.map((dish) => (
                  <motion.div
                    key={dish.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedDish(dish)}
                    className="bg-white p-3 rounded-2xl border border-[#E2ECE5] flex gap-3 cursor-pointer shadow-2xs"
                  >
                    <img
                      src={dish.image}
                      alt={dish.name}
                      className="w-20 h-20 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <h5 className="font-bold text-xs text-[#0D1C12] truncate">{dish.name}</h5>
                          {dish.isPopular && (
                            <span className="text-[9px] font-black text-[#FA8038] bg-[#FA8038]/10 px-1.5 py-0.5 rounded">
                              Top
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-500 line-clamp-2 mt-0.5">
                          {dish.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs font-black text-[#07431E]">
                          {formatFCFA(dish.price)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(dish);
                          }}
                          className="w-6 h-6 rounded-lg brand-gradient-orange text-white flex items-center justify-center shadow-xs active:scale-90"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Restaurants Carousel */}
            <div className="space-y-2.5 pt-2">
              <h4 className="text-xs font-black text-[#07431E] uppercase tracking-wider">
                Restaurants à {selectedNeighborhood}
              </h4>
              <div className="space-y-3">
                {filteredRestaurants.map((resto) => (
                  <div
                    key={resto.id}
                    className="bg-white rounded-2xl border border-[#E2ECE5] overflow-hidden shadow-2xs"
                  >
                    <div className="h-28 relative">
                      <img src={resto.coverImage} alt={resto.name} className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-xs text-[#07431E] font-bold text-[10px] flex items-center gap-1">
                        <Star className="w-3 h-3 text-[#F5B738] fill-[#F5B738]" />
                        <span>{resto.rating}</span>
                      </div>
                    </div>
                    <div className="p-3">
                      <h5 className="font-bold text-xs text-[#07431E]">{resto.name}</h5>
                      <p className="text-[10px] text-gray-500 line-clamp-1">{resto.tagline}</p>
                      <div className="flex items-center justify-between text-[10px] text-gray-500 mt-2 pt-2 border-t border-[#E2ECE5]">
                        <span className="text-[#008235] font-semibold">📍 {resto.neighborhood}</span>
                        <span>{resto.deliveryTimeEstimate} • {formatFCFA(resto.deliveryFee)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SEARCH */}
        {activeTab === 'search' && (
          <div className="p-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                autoFocus
                placeholder="Rechercher un plat (Dibi, Thiéb, Pastels...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#E2ECE5] rounded-xl text-xs focus:border-[#008235] focus:outline-hidden shadow-2xs"
              />
            </div>

            <div className="space-y-2">
              <h5 className="text-[11px] font-bold text-gray-500 uppercase">
                {searchQuery ? `Résultats (${filteredDishes.length})` : 'Suggestions du chef'}
              </h5>
              <div className="space-y-2">
                {filteredDishes.map((dish) => (
                  <div
                    key={dish.id}
                    onClick={() => setSelectedDish(dish)}
                    className="bg-white p-2.5 rounded-xl border border-[#E2ECE5] flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-[#0D1C12] truncate">{dish.name}</p>
                      <p className="text-[10px] text-[#FA8038] font-bold">{formatFCFA(dish.price)}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(dish);
                      }}
                      className="px-2.5 py-1 rounded-lg brand-gradient-orange text-white text-[10px] font-bold"
                    >
                      + Ajouter
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ORDERS */}
        {activeTab === 'orders' && (
          <div className="p-4 space-y-4">
            <h4 className="text-xs font-black text-[#07431E] uppercase tracking-wider">
              Mes Commandes Récentes
            </h4>
            {orders.length === 0 ? (
              <div className="text-center py-12 text-xs text-gray-400">
                Aucune commande pour le moment.
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((ord) => {
                  const badge = getStatusBadge(ord.status);
                  return (
                    <motion.div
                      key={ord.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onOpenTracking(ord)}
                      className="bg-white p-3.5 rounded-2xl border border-[#E2ECE5] space-y-2.5 cursor-pointer shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xs text-[#07431E]">{ord.orderNumber}</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}>
                          {badge.label}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600">
                        <p className="font-bold text-[#0D1C12]">{ord.restaurantName}</p>
                        <p className="text-[10px] text-gray-400">{ord.items.length} articles • {ord.createdAt}</p>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-[#E2ECE5] text-xs">
                        <span className="font-black text-[#FA8038]">{formatFCFA(ord.total)}</span>
                        <span className="text-[10px] font-bold text-[#008235] flex items-center gap-1">
                          <span>Suivre en direct</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PROFILE */}
        {activeTab === 'profile' && (
          <div className="p-4 space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-[#E2ECE5] text-center space-y-2 shadow-2xs">
              <div className="w-14 h-14 rounded-full brand-gradient text-white flex items-center justify-center font-black text-lg mx-auto shadow-sm">
                MD
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#07431E]">Moussa Diop</h4>
                <p className="text-xs text-gray-500">+221 77 654 32 10</p>
              </div>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#EBF7EE] text-[#008235] text-[10px] font-bold">
                🇸🇳 Client Fidèle Dakar
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-[#E2ECE5] divide-y divide-[#E2ECE5] text-xs">
              <div className="p-3 flex justify-between items-center cursor-pointer hover:bg-gray-50">
                <span>📍 Adresses enregistrées (Almadies, Plateau)</span>
                <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
              </div>
              <div className="p-3 flex justify-between items-center cursor-pointer hover:bg-gray-50">
                <span>💳 Mode de paiement par défaut (Wave)</span>
                <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
              </div>
              <div className="p-3 flex justify-between items-center cursor-pointer hover:bg-gray-50">
                <span>📞 Support & Service Client Thiob</span>
                <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Floating Bottom Cart Bar (if items exist) */}
      {cartCount > 0 && !isCartSheetOpen && (
        <div className="absolute bottom-16 left-3 right-3 z-30">
          <motion.button
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setIsCartSheetOpen(true)}
            className="w-full py-3 px-4 rounded-2xl brand-gradient-orange text-white font-extrabold text-xs shadow-xl flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-black/20 text-white flex items-center justify-center text-[10px]">
                {cartCount}
              </span>
              <span>Voir le panier</span>
            </div>
            <span>{formatFCFA(cartTotal)}</span>
          </motion.button>
        </div>
      )}

      {/* Mobile Bottom Tab Bar */}
      <div className="absolute bottom-0 inset-x-0 h-14 bg-white/95 backdrop-blur-md border-t border-[#E2ECE5] flex items-center justify-around z-30 px-2 shadow-lg">
        {[
          { tab: 'home', label: 'Découvrir', icon: <Compass className="w-4 h-4" /> },
          { tab: 'search', label: 'Recherche', icon: <Search className="w-4 h-4" /> },
          { tab: 'orders', label: 'Commandes', icon: <ShoppingBag className="w-4 h-4" />, badge: orders.length },
          { tab: 'profile', label: 'Profil', icon: <User className="w-4 h-4" /> },
        ].map((item) => {
          const isActive = activeTab === item.tab;
          return (
            <button
              key={item.tab}
              onClick={() => setActiveTab(item.tab as any)}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
                isActive ? 'text-[#008235] font-black scale-105' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <div className="relative">
                {item.icon}
                {Boolean(item.badge && item.badge > 0) && (
                  <span className="absolute -top-1 -right-2 w-3.5 h-3.5 bg-[#FA8038] text-white text-[8px] font-black rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[9px] mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Dish Detail Bottom Sheet Modal */}
      <AnimatePresence>
        {selectedDish && (
          <div className="absolute inset-0 z-40 flex flex-col justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDish(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              className="relative z-10 bg-white rounded-t-3xl overflow-hidden max-h-[85%] flex flex-col shadow-2xl"
            >
              <div className="h-40 relative shrink-0">
                <img src={selectedDish.image} alt={selectedDish.name} className="w-full h-full object-cover" />
                <button
                  onClick={() => setSelectedDish(null)}
                  className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center text-xs"
                >
                  ✕
                </button>
              </div>
              <div className="p-4 overflow-y-auto space-y-3">
                <div>
                  <span className="text-[9px] font-bold uppercase text-[#008235]">Spécialité Dakaroise</span>
                  <h3 className="font-extrabold text-sm text-[#07431E]">{selectedDish.name}</h3>
                  <p className="text-xs text-gray-600 mt-1">{selectedDish.description}</p>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Instructions pour le chef :</label>
                  <textarea
                    rows={2}
                    value={dishNotes}
                    onChange={(e) => setDishNotes(e.target.value)}
                    placeholder="Piment bien séparé, sauce tamarin..."
                    className="w-full p-2 bg-[#F7FAF7] border border-[#E2ECE5] rounded-xl text-xs focus:outline-hidden"
                  />
                </div>
                <div className="pt-2 flex items-center justify-between border-t border-[#E2ECE5]">
                  <div>
                    <span className="text-[9px] text-gray-400 uppercase font-bold block">Prix</span>
                    <span className="text-sm font-black text-[#FA8038]">{formatFCFA(selectedDish.price)}</span>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      addToCart(selectedDish, dishNotes);
                      setDishNotes('');
                      setSelectedDish(null);
                    }}
                    className="px-5 py-2.5 rounded-full brand-gradient-orange text-white text-xs font-bold shadow-md"
                  >
                    Ajouter au panier
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cart & Checkout Sheet */}
      <AnimatePresence>
        {isCartSheetOpen && (
          <div className="absolute inset-0 z-40 flex flex-col justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartSheetOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              className="relative z-10 bg-white rounded-t-3xl overflow-hidden max-h-[90%] flex flex-col shadow-2xl"
            >
              <div className="p-3.5 border-b border-[#E2ECE5] flex items-center justify-between bg-[#F7FAF7]">
                <h4 className="font-extrabold text-xs text-[#07431E]">
                  {checkoutStep === 'cart' && `Mon Panier (${cartCount})`}
                  {checkoutStep === 'payment' && 'Règlement & Adresse'}
                  {checkoutStep === 'done' && 'Commande Validée 🎉'}
                </h4>
                <button
                  onClick={() => setIsCartSheetOpen(false)}
                  className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs"
                >
                  ✕
                </button>
              </div>

              <div className="p-4 overflow-y-auto space-y-3">
                {checkoutStep === 'cart' && (
                  <>
                    {cart.map((c) => (
                      <div key={c.item.id} className="p-2.5 rounded-xl bg-[#F7FAF7] border border-[#E2ECE5] flex justify-between items-center">
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-xs text-[#0D1C12] truncate">{c.item.name}</p>
                          <p className="text-[10px] text-[#FA8038] font-bold">{formatFCFA(c.item.price)}</p>
                        </div>
                        <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-lg border border-[#E2ECE5]">
                          <button onClick={() => updateCartQuantity(c.item.id, -1)} className="text-gray-500 font-bold text-xs">-</button>
                          <span className="text-xs font-bold w-4 text-center">{c.quantity}</span>
                          <button onClick={() => updateCartQuantity(c.item.id, 1)} className="text-gray-500 font-bold text-xs">+</button>
                        </div>
                      </div>
                    ))}

                    <div className="pt-2 border-t border-[#E2ECE5] space-y-1 text-[11px] text-gray-600">
                      <div className="flex justify-between"><span>Sous-total</span><span>{formatFCFA(cartTotal)}</span></div>
                      <div className="flex justify-between"><span>Livraison Dakar</span><span>{formatFCFA(deliveryFee)}</span></div>
                      <div className="flex justify-between font-black text-xs text-[#07431E] pt-1">
                        <span>Total</span>
                        <span className="text-[#FA8038]">{formatFCFA(grandTotal)}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setCheckoutStep('payment')}
                      className="w-full py-2.5 rounded-xl brand-gradient-orange text-white text-xs font-black shadow-md mt-2"
                    >
                      Continuer vers le paiement ({formatFCFA(grandTotal)})
                    </button>
                  </>
                )}

                {checkoutStep === 'payment' && (
                  <form onSubmit={handleCheckout} className="space-y-3 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-700 mb-1">Téléphone Wave / OM</label>
                      <input
                        type="tel"
                        required
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        className="w-full p-2 bg-[#F7FAF7] border border-[#E2ECE5] rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-700 mb-1">Adresse à {selectedNeighborhood}</label>
                      <input
                        type="text"
                        required
                        value={deliveryStreet}
                        onChange={(e) => setDeliveryStreet(e.target.value)}
                        className="w-full p-2 bg-[#F7FAF7] border border-[#E2ECE5] rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-700 mb-1">Mode de règlement</label>
                      <div className="grid grid-cols-2 gap-2">
                        <div
                          onClick={() => setPaymentMethod('wave')}
                          className={`p-2 rounded-xl border text-center cursor-pointer ${paymentMethod === 'wave' ? 'border-[#3FB9F7] bg-[#3FB9F7]/10 font-bold' : 'border-gray-200'}`}
                        >
                          🌊 Wave
                        </div>
                        <div
                          onClick={() => setPaymentMethod('orange_money')}
                          className={`p-2 rounded-xl border text-center cursor-pointer ${paymentMethod === 'orange_money' ? 'border-[#FF7900] bg-[#FF7900]/10 font-bold' : 'border-gray-200'}`}
                        >
                          🟠 Orange Money
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl brand-gradient text-white font-black text-xs shadow-md mt-3"
                    >
                      Payer {formatFCFA(grandTotal)} & Commander
                    </button>
                  </form>
                )}

                {checkoutStep === 'done' && (
                  <div className="text-center py-6 space-y-3">
                    <CheckCircle2 className="w-12 h-12 text-[#008235] mx-auto" />
                    <h4 className="font-extrabold text-sm text-[#07431E]">Commande confirmée !</h4>
                    <p className="text-[11px] text-gray-500">Le restaurant prépare vos délices.</p>
                    <button
                      onClick={() => {
                        setIsCartSheetOpen(false);
                        setCheckoutStep('cart');
                        setActiveTab('orders');
                      }}
                      className="w-full py-2.5 rounded-xl brand-gradient text-white text-xs font-bold"
                    >
                      Voir mes commandes
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// =========================================================================
// 2. MOBILE APP RESTAURANT VIEW (Kitchen Orders, Menu stock, Caisse)
// =========================================================================
function MobileRestaurantApp() {
  const { restaurants, menuItems, orders, updateOrderStatus, toggleMenuItemAvailability } = useApp();
  const currentResto = restaurants[0];
  const restoOrders = orders.filter((o) => o.restaurantId === currentResto.id);
  const restoDishes = menuItems.filter((m) => m.restaurantId === currentResto.id);

  const [restoTab, setRestoTab] = useState<'live' | 'menu' | 'stats'>('live');
  const [isOpen, setIsOpen] = useState(true);

  const pending = restoOrders.filter((o) => o.status === 'pending');
  const preparing = restoOrders.filter((o) => o.status === 'preparing');
  const ready = restoOrders.filter((o) => o.status === 'ready_for_pickup' || o.status === 'in_transit');

  const totalCA = restoOrders.reduce((acc, o) => acc + o.subtotal, 0);

  return (
    <div className="h-full flex flex-col bg-[#F7FAF7] relative overflow-hidden">
      {/* Resto Mobile Header */}
      <div className="pt-2 px-4 pb-3 bg-[#07431E] text-white flex items-center justify-between shrink-0 shadow-md z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center font-bold text-sm">
            👨‍🍳
          </div>
          <div>
            <h4 className="font-extrabold text-xs leading-tight">{currentResto.name}</h4>
            <span className="text-[10px] text-emerald-300">Cuisine Direct Dakar</span>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${isOpen ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40' : 'bg-rose-500/20 text-rose-300 border-rose-400/40'}`}
        >
          {isOpen ? '🟢 Ouvert' : '🔴 Fermé'}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 pb-20 space-y-4">
        
        {/* TAB 1 : COMMANDES LIVE */}
        {restoTab === 'live' && (
          <div className="space-y-4">
            {/* Quick KPI pills */}
            <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
              <div className="bg-white p-2 rounded-xl border border-[#E2ECE5]">
                <span className="text-gray-400 block font-semibold">En attente</span>
                <span className="font-black text-amber-600 text-xs">{pending.length}</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-[#E2ECE5]">
                <span className="text-gray-400 block font-semibold">En cuisine</span>
                <span className="font-black text-orange-600 text-xs">{preparing.length}</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-[#E2ECE5]">
                <span className="text-gray-400 block font-semibold">Prêtes</span>
                <span className="font-black text-[#008235] text-xs">{ready.length}</span>
              </div>
            </div>

            {/* Orders Feed */}
            <div className="space-y-3">
              <AnimatePresence>
                {restoOrders.map((ord) => {
                  const badge = getStatusBadge(ord.status);
                  return (
                    <motion.div
                      key={ord.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`bg-white p-3.5 rounded-2xl border ${ord.status === 'pending' ? 'border-2 border-amber-400 ring-2 ring-amber-100' : 'border-[#E2ECE5]'} shadow-2xs space-y-2`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xs text-[#07431E]">{ord.orderNumber}</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}>
                          {badge.label}
                        </span>
                      </div>

                      <div className="bg-[#F7FAF7] p-2 rounded-xl text-[11px] text-gray-700">
                        <p className="font-bold">{ord.clientName} ({ord.clientPhone})</p>
                        <p className="text-gray-500">📍 {ord.deliveryAddress.neighborhood}</p>
                      </div>

                      <div className="space-y-1 text-xs">
                        {ord.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between text-[11px]">
                            <span>{it.quantity}x {it.name}</span>
                            <span className="font-bold">{formatFCFA(it.price * it.quantity)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-[#E2ECE5] flex items-center justify-between">
                        <span className="text-xs font-black text-[#FA8038]">{formatFCFA(ord.subtotal)}</span>

                        {ord.status === 'pending' && (
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => updateOrderStatus(ord.id, 'preparing')}
                            className="px-3 py-1.5 rounded-xl brand-gradient text-white text-[10px] font-bold shadow-xs flex items-center gap-1"
                          >
                            <ChefHat className="w-3 h-3" />
                            <span>Cuisiner</span>
                          </motion.button>
                        )}

                        {ord.status === 'preparing' && (
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => updateOrderStatus(ord.id, 'ready_for_pickup')}
                            className="px-3 py-1.5 rounded-xl brand-gradient-orange text-white text-[10px] font-bold shadow-xs flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Plat Prêt</span>
                          </motion.button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* TAB 2 : MENU STOCK */}
        {restoTab === 'menu' && (
          <div className="space-y-3">
            <h4 className="text-xs font-black text-[#07431E] uppercase tracking-wider">
              Disponibilité des Plats en Direct
            </h4>
            <div className="space-y-2">
              {restoDishes.map((dish) => (
                <div key={dish.id} className="bg-white p-3 rounded-2xl border border-[#E2ECE5] flex items-center justify-between gap-3 shadow-2xs">
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-[#0D1C12] truncate">{dish.name}</p>
                    <p className="text-[10px] font-black text-[#008235]">{formatFCFA(dish.price)}</p>
                  </div>
                  <button
                    onClick={() => toggleMenuItemAvailability(dish.id)}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 border ${dish.isAvailable ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-400'}`}
                  >
                    {dish.isAvailable ? <ToggleRight className="w-4 h-4 text-[#008235]" /> : <ToggleLeft className="w-4 h-4 text-gray-400" />}
                    <span>{dish.isAvailable ? 'En stock' : 'Épuisé'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3 : STATS & CA */}
        {restoTab === 'stats' && (
          <div className="space-y-3">
            <div className="bg-white p-4 rounded-2xl border border-[#E2ECE5] text-center space-y-1 shadow-2xs">
              <span className="text-[10px] text-gray-400 uppercase font-bold">Chiffre d'affaires du jour</span>
              <h3 className="text-2xl font-black text-[#008235]">{formatFCFA(totalCA)}</h3>
              <p className="text-[10px] text-gray-500">Total {restoOrders.length} commandes traitées</p>
            </div>
          </div>
        )}

      </div>

      {/* Resto Bottom Bar */}
      <div className="absolute bottom-0 inset-x-0 h-14 bg-white/95 backdrop-blur-md border-t border-[#E2ECE5] flex items-center justify-around z-30 px-2 shadow-lg">
        <button
          onClick={() => setRestoTab('live')}
          className={`flex flex-col items-center justify-center flex-1 py-1 ${restoTab === 'live' ? 'text-[#008235] font-black' : 'text-gray-400'}`}
        >
          <div className="relative">
            <Bell className="w-4 h-4" />
            {pending.length > 0 && (
              <span className="absolute -top-1 -right-2 w-3.5 h-3.5 bg-amber-500 text-white text-[8px] font-black rounded-full flex items-center justify-center">
                {pending.length}
              </span>
            )}
          </div>
          <span className="text-[9px] mt-0.5">Commandes</span>
        </button>

        <button
          onClick={() => setRestoTab('menu')}
          className={`flex flex-col items-center justify-center flex-1 py-1 ${restoTab === 'menu' ? 'text-[#008235] font-black' : 'text-gray-400'}`}
        >
          <UtensilsCrossed className="w-4 h-4" />
          <span className="text-[9px] mt-0.5">Carte Menu</span>
        </button>

        <button
          onClick={() => setRestoTab('stats')}
          className={`flex flex-col items-center justify-center flex-1 py-1 ${restoTab === 'stats' ? 'text-[#008235] font-black' : 'text-gray-400'}`}
        >
          <TrendingUp className="w-4 h-4" />
          <span className="text-[9px] mt-0.5">Caisse</span>
        </button>
      </div>
    </div>
  );
}

// =========================================================================
// 3. MOBILE APP COURIER VIEW (Radar Courses, GPS, Prise de service)
// =========================================================================
function MobileCourierApp() {
  const { couriers, orders, toggleCourierOnline, acceptDeliveryMission, completeDeliveryMission } = useApp();
  const currentCourier = couriers[0];
  const isOnline = currentCourier.isOnline;

  const activeOrder = orders.find((o) => o.id === currentCourier.activeOrderId);
  const availableOrders = orders.filter((o) => (o.status === 'ready_for_pickup' || o.status === 'preparing') && !o.courierId);

  return (
    <div className="h-full flex flex-col bg-[#F7FAF7] relative overflow-hidden">
      {/* Courier Mobile Header */}
      <div className="pt-2 px-4 pb-3 bg-[#07431E] text-white flex items-center justify-between shrink-0 shadow-md z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center font-bold text-sm">
            🛵
          </div>
          <div>
            <h4 className="font-extrabold text-xs leading-tight">{currentCourier.name}</h4>
            <span className="text-[10px] text-emerald-300">Moto Jakarta ({currentCourier.plateNumber})</span>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => toggleCourierOnline(currentCourier.id)}
          className={`px-3 py-1 rounded-full text-[10px] font-black border flex items-center gap-1 ${isOnline ? 'bg-[#008235] text-white border-white/20' : 'bg-gray-700 text-gray-300 border-gray-600'}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-white animate-ping' : 'bg-gray-400'}`} />
          <span>{isOnline ? 'EN SERVICE' : 'HORS LIGNE'}</span>
        </motion.button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 pb-20 space-y-4">
        
        {/* Earnings banner */}
        <div className="grid grid-cols-2 gap-2 text-center text-xs">
          <div className="bg-white p-3 rounded-2xl border border-[#E2ECE5] shadow-2xs">
            <span className="text-[9px] text-gray-400 uppercase font-bold block">Gains du jour</span>
            <span className="text-base font-black text-[#008235]">{formatFCFA(currentCourier.todayEarnings)}</span>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-[#E2ECE5] shadow-2xs">
            <span className="text-[9px] text-gray-400 uppercase font-bold block">Courses Réussies</span>
            <span className="text-base font-black text-[#07431E]">{currentCourier.completedDeliveries}</span>
          </div>
        </div>

        {/* ACTIVE MISSION */}
        {activeOrder && (
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-white p-4 rounded-2xl border-2 border-[#008235] shadow-md space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#008235] bg-[#EBF7EE] px-2 py-0.5 rounded-full">
                Course en cours {activeOrder.orderNumber}
              </span>
              <span className="text-xs font-black text-[#008235]">+{formatFCFA(activeOrder.deliveryFee)}</span>
            </div>

            <div className="bg-[#F7FAF7] p-2.5 rounded-xl text-xs space-y-2">
              <div>
                <span className="text-[9px] font-bold text-gray-400 uppercase block">1. Récupération</span>
                <p className="font-extrabold text-[#07431E]">{activeOrder.restaurantName}</p>
              </div>
              <div className="pt-1 border-t border-[#E2ECE5]">
                <span className="text-[9px] font-bold text-gray-400 uppercase block">2. Client</span>
                <p className="font-extrabold text-[#07431E]">{activeOrder.clientName} ({activeOrder.deliveryAddress.neighborhood})</p>
                <p className="text-[10px] text-gray-500">{activeOrder.deliveryAddress.street}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`tel:${activeOrder.clientPhone}`}
                className="px-3 py-2 rounded-xl bg-gray-100 text-gray-700 text-xs font-bold flex items-center gap-1"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Appeler</span>
              </a>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => completeDeliveryMission(currentCourier.id, activeOrder.id)}
                className="flex-1 py-2 rounded-xl brand-gradient text-white text-xs font-black shadow-md flex items-center justify-center gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Livré avec succès</span>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* RADAR AVAILABLE ORDERS */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-[#07431E] uppercase tracking-wider flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-[#FA8038]" />
              <span>Radar Courses Dakar ({availableOrders.length})</span>
            </h4>
          </div>

          {!isOnline ? (
            <div className="p-6 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-300 text-xs text-gray-500">
              Passez en service pour recevoir les courses à Dakar.
            </div>
          ) : availableOrders.length === 0 && !activeOrder ? (
            <div className="p-6 text-center bg-white rounded-2xl border border-[#E2ECE5] text-xs text-gray-400">
              En attente de commandes prêtes en cuisine...
            </div>
          ) : (
            <div className="space-y-2.5">
              {availableOrders.map((m) => (
                <div key={m.id} className="bg-white p-3 rounded-2xl border border-[#E2ECE5] flex items-center justify-between gap-3 shadow-2xs">
                  <div>
                    <span className="font-bold text-xs text-[#0D1C12] block">{m.restaurantName}</span>
                    <span className="text-[10px] text-gray-500">➔ {m.deliveryAddress.neighborhood}</span>
                    <span className="text-[10px] font-black text-[#008235] block mt-0.5">+{formatFCFA(m.deliveryFee)}</span>
                  </div>
                  <motion.button
                    disabled={Boolean(activeOrder)}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => acceptDeliveryMission(currentCourier.id, m.id)}
                    className="px-3.5 py-1.5 rounded-xl brand-gradient-orange text-white text-[11px] font-black shadow-xs disabled:opacity-40"
                  >
                    Accepter
                  </motion.button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// =========================================================================
// 4. MAIN SMARTPHONE SHELL & SHOWCASE CONTAINER
// =========================================================================
export default function MobileDeviceShowcase() {
  const { currentRole, setCurrentRole } = useApp();
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<Order | null>(null);

  return (
    <div className="min-h-screen bg-[#071F11] text-white flex flex-col items-center justify-start py-6 px-4 relative overflow-x-hidden selection:bg-[#008235]">
      
      {/* Background Ambience & Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#008235]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#FA8038]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Studio Controls : Role Switcher for the 3 Mobile Accounts */}
      <header className="w-full max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-4 z-20 mb-6 pb-4 border-b border-white/10">
        
        {/* App Branding */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl brand-gradient flex items-center justify-center text-white font-black shadow-lg">
            TD
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl font-black tracking-tight text-white">
                Thiob<span className="text-[#FA8038]">.</span>Dakar
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#008235] text-white">
                App Mobile
              </span>
            </div>
            <p className="text-[11px] text-white/60">
              Plateforme Mobile Restauration & Livraison à Dakar
            </p>
          </div>
        </div>

        {/* 3 Mobile Roles Selector */}
        <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/15 shadow-md">
          {[
            { role: 'client' as UserRole, label: '📱 App Client', desc: 'Commander' },
            { role: 'restaurant' as UserRole, label: '👨‍🍳 App Resto', desc: 'Cuisine' },
            { role: 'courier' as UserRole, label: '🛵 App Livreur', desc: 'Courses' },
          ].map((item) => {
            const isActive = currentRole === item.role;
            return (
              <button
                key={item.role}
                onClick={() => setCurrentRole(item.role)}
                className="relative px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all z-10"
              >
                {isActive && (
                  <motion.div
                    layoutId="activePhoneRole"
                    className="absolute inset-0 bg-[#FA8038] rounded-xl shadow-md -z-10"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <span className={isActive ? 'text-white' : 'text-white/70 hover:text-white'}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </header>

      {/* 📱 SMARTPHONE MOCKUP FRAME (iOS / Android Studio) */}
      <div className="relative z-10 w-full max-w-[390px] h-[780px] sm:h-[810px] rounded-[52px] bg-[#1a1a1a] p-3.5 shadow-[0_25px_70px_rgba(0,0,0,0.8),0_0_0_12px_#2a2a2a,0_0_0_14px_#111] flex flex-col justify-between">
        
        {/* Device Screen Frame */}
        <div className="w-full h-full rounded-[42px] bg-[#F7FAF7] text-[#0D1C12] overflow-hidden flex flex-col relative">
          
          {/* iOS Dynamic Island & Status Bar */}
          <div className="h-10 bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0 relative z-30">
            <span className="text-[11px] font-black text-black tracking-tight">09:41</span>
            
            {/* Dynamic Island Pill */}
            <div className="w-24 h-5 rounded-full bg-black flex items-center justify-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#008235] animate-pulse" />
              <span className="text-[8px] font-bold text-white uppercase tracking-wider">Thiob</span>
            </div>

            {/* Battery / Wifi icons */}
            <div className="flex items-center gap-1.5 text-black">
              <span className="text-[9px] font-bold">5G</span>
              <div className="w-4 h-2 rounded-sm border border-black flex items-center p-0.5">
                <div className="w-full h-full bg-black rounded-2xs" />
              </div>
            </div>
          </div>

          {/* Active Screen Rendering with AnimatePresence */}
          <div className="flex-1 overflow-hidden relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentRole}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full"
              >
                {currentRole === 'client' && (
                  <MobileClientApp onOpenTracking={(ord) => setSelectedOrderForTracking(ord)} />
                )}
                {currentRole === 'restaurant' && <MobileRestaurantApp />}
                {currentRole === 'courier' && <MobileCourierApp />}
                {currentRole === 'admin' && (
                  <div className="p-6 text-center space-y-4">
                    <h3 className="font-black text-sm text-[#07431E]">Mode Super Admin</h3>
                    <p className="text-xs text-gray-500">Basculez sur l'un des 3 comptes mobiles ci-dessus pour tester.</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* iOS Bottom Home Indicator Bar */}
          <div className="h-4 bg-white flex items-center justify-center shrink-0 z-30">
            <div className="w-32 h-1 rounded-full bg-gray-300" />
          </div>

        </div>

      </div>

      {/* Live Order Tracking Modal inside Mobile Showcase */}
      <AnimatePresence>
        {selectedOrderForTracking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrderForTracking(null)}
              className="absolute inset-0 bg-black/70 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative z-10 bg-white text-[#0D1C12] w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-[#008235] bg-[#EBF7EE] px-2 py-0.5 rounded-full">
                    Commande {selectedOrderForTracking.orderNumber}
                  </span>
                  <h4 className="font-extrabold text-sm text-[#07431E] mt-1">Suivi de livraison en direct</h4>
                </div>
                <button
                  onClick={() => setSelectedOrderForTracking(null)}
                  className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-[#F7FAF7] border border-[#E2ECE5] space-y-1">
                  <p className="font-bold text-[#07431E]">Livreur : {selectedOrderForTracking.courierName || 'Ibrahima Fall (Moto Jakarta)'}</p>
                  <p className="text-[11px] text-gray-500">Destination : {selectedOrderForTracking.deliveryAddress.street}, {selectedOrderForTracking.deliveryAddress.neighborhood}</p>
                </div>

                <div className="p-2.5 rounded-xl bg-[#EBF7EE] text-[#008235] font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#008235] animate-ping" />
                  <span>En cours de livraison à Dakar</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedOrderForTracking(null)}
                className="w-full py-2.5 rounded-xl brand-gradient text-white text-xs font-bold"
              >
                Fermer
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
