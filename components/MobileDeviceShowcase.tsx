'use client';

import React, { useState, useEffect } from 'react';
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
  X,
  Heart,
  ChevronRight,
  Gift,
  Percent,
  Calendar,
  Users,
  ExternalLink,
  MessageCircle,
  Map,
  Camera,
  Bookmark,
  Share2,
  Info,
  Menu
} from 'lucide-react';
import { CATEGORIES, DAKAR_NEIGHBORHOODS, DAKAR_ZONES } from '@/lib/mock-data';
import { MenuItem, Restaurant, Order, OrderStatus, PaymentMethod, Reservation, OutingPlan } from '@/lib/types';
import { formatFCFA, getStatusBadge } from '@/lib/utils';
import confetti from 'canvas-confetti';
import { calculateDistanceKm, formatDistanceString, DAKAR_DEFAULT_COORDS, DAKAR_GEO_PRESETS } from '@/lib/geolocation';
import MiniLocationPicker from '@/components/map/MiniLocationPicker';
import CourierLiveRadar from '@/components/map/CourierLiveRadar';
import dynamic from 'next/dynamic';

const ThiobMap = dynamic(() => import('@/components/map/ThiobMap'), { 
  ssr: false,
  loading: () => <div className="h-44 bg-[#F0F5F2] rounded-2xl flex items-center justify-center text-xs text-gray-500 animate-pulse">Chargement de la carte...</div>
});


// =========================================================================
// 1. MOBILE APP CLIENT VIEW (INSPIRÉ DES MAQUETTES FOODKO, KFC & DELICIOUS FOOD)
// =========================================================================
function MobileClientApp({ onOpenTracking, onLogout }: { onOpenTracking: (ord: Order) => void; onLogout?: () => void }) {
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
    setActiveTrackingOrder,
    reservations,
    outingPlans,
    favoriteRestaurantIds,
    createReservation,
    cancelReservation,
    createOutingPlan,
    deleteOutingPlan,
    toggleFavoriteRestaurant,
    updateRestaurantShowcase,
    clientCoords,
    clientAccuracy,
    clientNeighborhood,
    clientAddress,
    isClientGpsActive,
    requestClientGps,
    setClientLocation,
  } = useApp();


  const [activeTab, setActiveTab] = useState<'home' | 'menu' | 'orders' | 'favorites' | 'profile' | 'courier'>('home');
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('Tous les quartiers');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);
  const [dishQuantity, setDishQuantity] = useState(1);
  const [dishNotes, setDishNotes] = useState('');
  const [isCartSheetOpen, setIsCartSheetOpen] = useState(false);
  const [isNeighborhoodPickerOpen, setIsNeighborhoodPickerOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'payment' | 'done'>('cart');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('wave');
  const [clientName, setClientName] = useState('Moussa Diop');
  const [clientPhone, setClientPhone] = useState('+221 77 654 32 10');
  const [deliveryStreet, setDeliveryStreet] = useState('Malika, Dakar');
  
  // Yango / Yassir style Live GPS & Locality Filter
  const userLiveLocation = clientNeighborhood || 'Malika';
  const [localitySearchQuery, setLocalitySearchQuery] = useState('');


  // 🏛️ Vitrine Numérique Dédiée (Showcase Modal)
  const [selectedShowcaseResto, setSelectedShowcaseResto] = useState<Restaurant | null>(null);
  const [showcaseSubTab, setShowcaseSubTab] = useState<'menu' | 'gallery' | 'location' | 'reviews' | 'hours'>('menu');
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<string | null>(null);
  const [isFullScreenLocationOpen, setIsFullScreenLocationOpen] = useState(false);


  // 📅 Réservation de Table
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [reservationResto, setReservationResto] = useState<Restaurant | null>(null);
  const [reservationDate, setReservationDate] = useState('Samedi 5 Septembre');
  const [reservationTime, setReservationTime] = useState('20:00');
  const [reservationGuests, setReservationGuests] = useState(2);
  const [reservationOccasion, setReservationOccasion] = useState('Sortie avec ma copine');
  const [reservationNotes, setReservationNotes] = useState('');
  const [confirmedReservationCode, setConfirmedReservationCode] = useState<string | null>(null);

  // ❤️ Programmer une Sortie
  const [isOutingModalOpen, setIsOutingModalOpen] = useState(false);
  const [outingResto, setOutingResto] = useState<Restaurant | null>(null);
  const [outingTitle, setOutingTitle] = useState('Sortie en amoureux aux Almadies');
  const [outingDate, setOutingDate] = useState('Samedi 5 Septembre • 20h00');
  const [outingNotes, setOutingNotes] = useState('');

  // 🌟 Filtres de Découverte des Restaurants
  const [restoDiscoveryFilter, setRestoDiscoveryFilter] = useState<'all' | 'rated' | 'ocean' | 'couple' | 'grill' | 'budget'>('all');
  const [favoritesSubTab, setFavoritesSubTab] = useState<'outings' | 'dishes'>('outings');
  const [routeModalResto, setRouteModalResto] = useState<Restaurant | null>(null);

  // Interactive state
  const [favoriteIds, setFavoriteIds] = useState<string[]>(['menu-thieb-jeun', 'menu-dibi-agneau']);
  const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showAllDishes, setShowAllDishes] = useState(false);
  const [quickAddedId, setQuickAddedId] = useState<string | null>(null);

  // =========================================================================
  // ⚡ CALCULATEUR DE DISTANCE & TRAJET (GPS DAKAR)
  // =========================================================================
  const getDistanceEstimate = (userLoc: string, restoLoc: string) => {
    const u = userLoc.toLowerCase();
    const r = restoLoc.toLowerCase();
    if (u === r) return { dist: '850 m', time: '10 min', route: 'Proximité immédiate', cost: '~1 000 FCFA Tiak-Tiak' };
    if (u.includes('pikine') || u.includes('guediawaye') || u.includes('massar')) {
      if (r.includes('almadies') || r.includes('ngor')) return { dist: '18.4 km', time: '25 min via VDN', route: 'Autoroute de l\'Avenir ➔ Échangeur VDN', cost: '~2 500 FCFA VTC / Taxi' };
      if (r.includes('plateau')) return { dist: '14.2 km', time: '20 min via Autoroute', route: 'Autoroute vers Centre-ville', cost: '~2 000 FCFA' };
      if (r.includes('mermoz') || r.includes('ouakam')) return { dist: '15.0 km', time: '22 min via VDN', route: 'Patte d\'Oie ➔ VDN', cost: '~2 000 FCFA' };
      if (r.includes('yoff')) return { dist: '16.5 km', time: '25 min', route: 'Route de l\'Aéroport', cost: '~2 200 FCFA' };
      return { dist: '12.0 km', time: '20 min', route: 'Trajet urbain rapide', cost: '~1 800 FCFA' };
    }
    if (u.includes('ngor') || u.includes('almadies')) {
      if (r.includes('almadies') || r.includes('ngor')) return { dist: '1.8 km', time: '5 min', route: 'Corniche des Almadies', cost: '~1 000 FCFA' };
      if (r.includes('yoff')) return { dist: '4.2 km', time: '10 min', route: 'Route du Virage', cost: '~1 200 FCFA' };
      if (r.includes('plateau')) return { dist: '15.5 km', time: '25 min', route: 'Corniche Ouest', cost: '~2 500 FCFA' };
    }
    return { dist: '6.5 km', time: '15 min', route: 'Presqu\'île de Dakar', cost: '~1 500 FCFA' };
  };

  // =========================================================================
  // ⚡ DIAPORAMA AUTOMATIQUE DES RESTAURANTS À PROXIMITÉ (TOUTES LES 2 SECONDES)
  // =========================================================================
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isSlideshowPaused, setIsSlideshowPaused] = useState(false);

  // Multi-criteria natural query parsing
  const cleanSearchQuery = searchQuery.trim().toLowerCase();
  const isSearchMatchingAlmadies = cleanSearchQuery.includes('almadies');
  const isSearchMatchingNgor = cleanSearchQuery.includes('ngor');
  const isSearchMatchingPlateau = cleanSearchQuery.includes('plateau');
  const isSearchMatchingYoff = cleanSearchQuery.includes('yoff');
  const isSearchMatchingMermoz = cleanSearchQuery.includes('mermoz');
  const isSearchMatchingOuakam = cleanSearchQuery.includes('ouakam');

  const activeRestaurants = restaurants.filter((resto) => {
    if (selectedNeighborhood !== 'Tous les quartiers') {
      return resto.neighborhood.toLowerCase().includes(selectedNeighborhood.toLowerCase());
    }
    if (isSearchMatchingAlmadies) return resto.neighborhood.toLowerCase().includes('almadies');
    if (isSearchMatchingNgor) return resto.neighborhood.toLowerCase().includes('ngor');
    if (isSearchMatchingPlateau) return resto.neighborhood.toLowerCase().includes('plateau');
    if (isSearchMatchingYoff) return resto.neighborhood.toLowerCase().includes('yoff');
    if (isSearchMatchingMermoz) return resto.neighborhood.toLowerCase().includes('mermoz');
    if (isSearchMatchingOuakam) return resto.neighborhood.toLowerCase().includes('ouakam');
    return true;
  });

  const featuredRestaurants = activeRestaurants.length > 0 ? activeRestaurants : restaurants;

  useEffect(() => {
    if (isSlideshowPaused || featuredRestaurants.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % featuredRestaurants.length);
    }, 5000); // Défilement automatique toutes les 5 secondes

    return () => clearInterval(timer);
  }, [isSlideshowPaused, featuredRestaurants.length]);

  const currentRestaurant = featuredRestaurants[currentSlideIndex % featuredRestaurants.length];

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavoriteIds((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Filtered dishes
  const filteredDishes = menuItems.filter((dish) => {
    const matchCat = selectedCat === 'all' || dish.category === selectedCat;
    const matchSearch = cleanSearchQuery === '' || 
      dish.name.toLowerCase().includes(cleanSearchQuery) || 
      dish.description.toLowerCase().includes(cleanSearchQuery);
    const matchNeighborhood = selectedNeighborhood === 'Tous les quartiers' || 
      restaurants.find(r => r.id === dish.restaurantId)?.neighborhood.toLowerCase().includes(selectedNeighborhood.toLowerCase());
    return matchCat && matchSearch && (selectedNeighborhood === 'Tous les quartiers' || matchNeighborhood);
  });

  const displayedDishes = showAllDishes ? filteredDishes : filteredDishes.slice(0, 6);
  const favoriteDishes = menuItems.filter((dish) => favoriteIds.includes(dish.id));
  const favoriteRestoList = restaurants.filter((r) => favoriteRestaurantIds.includes(r.id));

  const deliveryFee = cartRestaurant?.deliveryFee || 1000;
  const platformFee = 500;
  const grandTotal = cartTotal + deliveryFee + platformFee;

  const handleQuickAdd = (dish: MenuItem, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(dish);
    setQuickAddedId(dish.id);
    setTimeout(() => setQuickAddedId(null), 1200);
  };

  const handleAddDishModal = () => {
    if (!selectedDish) return;
    for (let i = 0; i < dishQuantity; i++) {
      addToCart(selectedDish);
    }
    setQuickAddedId(selectedDish.id);
    setSelectedDish(null);
    setDishQuantity(1);
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#0A6E3B', '#10B981', '#FF7824']
      });
    } catch {}
  };

  const handleOpenShowcase = (resto: Restaurant) => {
    setSelectedShowcaseResto(resto);
    setShowcaseSubTab('menu');
  };

  const handleOpenReservation = (resto: Restaurant) => {
    setReservationResto(resto);
    setConfirmedReservationCode(null);
    setIsReservationModalOpen(true);
  };

  const handleConfirmReservation = () => {
    if (!reservationResto) return;
    const res = createReservation({
      restaurantId: reservationResto.id,
      restaurantName: reservationResto.name,
      clientName,
      clientPhone,
      date: reservationDate,
      time: reservationTime,
      guestsCount: reservationGuests,
      occasion: reservationOccasion,
      notes: reservationNotes,
    });
    setConfirmedReservationCode(res.reservationNumber);
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.5 },
        colors: ['#064E2B', '#0A6E3B', '#FF7824', '#F5B738']
      });
    } catch {}
  };

  const handleOpenOuting = (resto: Restaurant) => {
    setOutingResto(resto);
    setOutingTitle(`Sortie à ${resto.name} (${resto.neighborhood})`);
    setIsOutingModalOpen(true);
  };

  const handleConfirmOuting = () => {
    if (!outingResto) return;
    createOutingPlan({
      title: outingTitle,
      restaurantId: outingResto.id,
      restaurantName: outingResto.name,
      neighborhood: outingResto.neighborhood,
      plannedDate: outingDate,
      targetTag: 'Sortie Dakar',
      notes: outingNotes,
    });
    setIsOutingModalOpen(false);
    setActiveTab('favorites');
    setFavoritesSubTab('outings');
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#064E2B', '#0A6E3B', '#FF7824']
      });
    } catch {}
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    const order = placeOrder({
      clientName,
      clientPhone,
      neighborhood: selectedNeighborhood === 'Tous les quartiers' ? userLiveLocation : selectedNeighborhood,
      street: deliveryStreet,
      paymentMethod,
    });
    setCheckoutStep('done');
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#064E2B', '#0A6E3B', '#FF7824', '#F5B738']
      });
    } catch {}
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-[#0A6E3B] via-[#064E2B] to-[#041F11] relative overflow-hidden font-sans select-none">

      {/* =========================================================================
          1. HEADER YANGO FOOD & YASSIR STYLE (FROSTED GLASS & GPS LIVE)
         ========================================================================= */}
      <div className="relative z-10 pt-4 px-4 pb-3 bg-[#F2EFE7] shrink-0 space-y-3">

        {/* Top line: Hamburger (localité/GPS) + Logo Thiob Express + Notifications & Panier */}
        <div className="flex items-center justify-between gap-2">

          {/* Hamburger : ouvre le sélecteur de localité / GPS en direct avec Glassmorphism */}
          <motion.button
            whileHover={{ scale: 1.08, y: -2 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setIsNeighborhoodPickerOpen(true)}
            className="glass-btn relative w-11 h-11 rounded-2xl flex items-center justify-center text-[#081A10] shrink-0"
            aria-label="Menu et localisation"
          >
            <Menu className="w-5 h-5" />
            {isClientGpsActive && (
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white animate-pulse" />
            )}
          </motion.button>

          {/* Logo Thiob Express */}
          <motion.div
            whileTap={{ scale: 0.96 }}
            onClick={() => setActiveTab('home')}
            className="flex-1 flex items-center justify-center cursor-pointer select-none"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/shapes/logo-thiob.svg" alt="Thiob Express" className="h-10 w-auto" />
          </motion.div>

          {/* Notifications & Panier avec Glassmorphism */}
          <div className="flex items-center gap-2 shrink-0">
            <motion.button
              whileHover={{ scale: 1.08, y: -2 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => setIsNotificationsOpen(true)}
              className="glass-btn relative w-10 h-10 rounded-2xl flex items-center justify-center text-[#0A6E3B]"
            >
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF7824] text-white text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-white">
                2
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.08, y: -2 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => { setIsCartSheetOpen(true); setCheckoutStep('cart'); }}
              className="glass-btn relative w-10 h-10 rounded-2xl flex items-center justify-center text-[#0A6E3B]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/shapes/panier-icon.svg" alt="Panier" className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF7824] text-white text-[9px] font-black rounded-full flex items-center justify-center animate-bounce shadow-xs ring-2 ring-white">
                  {cartCount}
                </span>
              )}
            </motion.button>
          </div>
        </div>

        {/* Barre de recherche + bouton filtre avec Glassmorphism */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0A6E3B]/70" />
            <input
              type="text"
              placeholder="Recherche par plat, restaurant et secteur"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setActiveTab('menu');
              }}
              className="glass-panel-light w-full pl-10 pr-8 py-3 rounded-full text-xs text-[#081A10] placeholder-gray-400 focus:bg-white/95 focus:ring-2 focus:ring-[#0A6E3B]/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.08, y: -2 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setIsFilterOpen(true)}
            className="glass-btn w-11 h-11 rounded-2xl flex items-center justify-center text-[#081A10] shrink-0"
            aria-label="Filtres"
          >
            <SlidersHorizontal className="w-4.5 h-4.5" />
          </motion.button>
        </div>



      </div>

      {/* =========================================================================
          2. MAIN TAB CONTENT AREA
         ========================================================================= */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-28 relative z-10">
        
        {/* =====================================================================
            TAB 1: HOME (ACCUEIL & DIAPORAMA 2 SECONDES)
           ===================================================================== */}
        {activeTab === 'home' && (
          <div className="relative z-10 pb-8 space-y-0">
            
            {/* Upper Cream Canvas Container with Slideshow & Categories */}
            <div className="bg-[#F2EFE7] pt-2 space-y-4">
              
              {/* Locality Filter Active Banner */}
              {selectedNeighborhood !== 'Tous les quartiers' && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="px-4"
                >
                  <div className="bg-[#E6F5EC] border border-[#0A6E3B]/30 rounded-2xl p-2.5 px-3 flex items-center justify-between text-xs shadow-2xs">
                    <div className="flex items-center gap-2 text-[#081A10]">
                      <MapPin className="w-3.5 h-3.5 text-[#0A6E3B] shrink-0" />
                      <span className="text-[11px]">
                        Restos à <strong>{selectedNeighborhood}</strong> ({activeRestaurants.length} trouvé{activeRestaurants.length > 1 ? 's' : ''})
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedNeighborhood('Tous les quartiers')}
                      className="text-[10px] font-black text-[#0A6E3B] bg-white px-2 py-0.5 rounded-lg border border-[#0A6E3B]/20 hover:bg-gray-50 shadow-2xs"
                    >
                      Tout Dakar ✕
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Live Order Ribbon if tracking active */}
              {activeTrackingOrder && (
                <div className="px-4">
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => onOpenTracking(activeTrackingOrder)}
                    className="p-3 rounded-2xl brand-gradient text-white flex items-center justify-between cursor-pointer shadow-md border border-white/20"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#FF7824] animate-ping"></span>
                      <span className="text-xs font-bold">Commande en cours • {activeTrackingOrder.orderNumber}</span>
                    </div>
                    <span className="text-[10px] bg-white/20 px-2.5 py-1 rounded-full font-bold">Suivre ➔</span>
                  </motion.div>
                </div>
              )}

              {/* =================================================================
                  🌟 HERO : RESTO À PROXIMITÉ (DIAPORAMA 2s)
                 ================================================================= */}
              <div className="px-4 space-y-2">
                <h3 className="text-sm font-black text-[#FF7824] tracking-tight">
                  Resto à proximité
                </h3>

                {/* Slideshow Card Animated */}
                <div className="relative">
                  <div
                    onMouseEnter={() => setIsSlideshowPaused(true)}
                    onMouseLeave={() => setIsSlideshowPaused(false)}
                    onTouchStart={() => setIsSlideshowPaused(true)}
                    onTouchEnd={() => setIsSlideshowPaused(false)}
                    className="relative h-52 overflow-hidden shadow-lg bg-black text-white group cursor-pointer rounded-[18px_18px_18px_36px]"
                    onClick={() => {
                      if (currentRestaurant) {
                        handleOpenShowcase(currentRestaurant);
                      }
                    }}
                  >
                    <AnimatePresence mode="popLayout">
                      {currentRestaurant && (
                        <motion.div
                          key={currentRestaurant.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
                          className="absolute inset-0"
                        >
                          {/* Cover Photo with slow ambient zoom */}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <motion.img
                            src={currentRestaurant.coverImage}
                            alt={currentRestaurant.name}
                            initial={{ scale: 1.08 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 5, ease: 'easeOut' }}
                            className="w-full h-full object-cover brightness-[0.82]"
                          />

                          {/* Dégradé vert haut vers bas pour sublimer et contraster les textes */}
                          <div className="absolute inset-0 bg-gradient-to-b from-[#052814]/90 via-[#0A6E3B]/45 to-transparent pointer-events-none" />

                          {/* Dégradé sombre bas vers haut pour les badges de localisation */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />

                          {/* Top Info : Restaurant + Nom avec animation fluide */}
                          <div className="absolute top-4 left-4 z-10 space-y-0.5">
                            <motion.span
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.4, delay: 0.15 }}
                              className="text-[11px] font-medium text-white/80 block tracking-wide"
                            >
                              Restaurant
                            </motion.span>
                            <motion.h4
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5, delay: 0.22, ease: 'easeOut' }}
                              className="text-xl font-black text-white leading-tight drop-shadow-md"
                            >
                              {currentRestaurant.name}
                            </motion.h4>
                            <motion.p
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.45, delay: 0.3 }}
                              className="text-xs text-white/80 font-medium"
                            >
                              {currentRestaurant.neighborhood}
                            </motion.p>
                          </div>

                          {/* Bottom-left : pin + quartier avec légère animation d'entrée */}
                          <motion.button
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.45, delay: 0.28 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenShowcase(currentRestaurant);
                              setShowcaseSubTab('location');
                            }}
                            className="absolute bottom-3.5 left-3.5 z-10 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-[#081A10] text-xs font-bold shadow-md hover:bg-white transition-colors"
                          >
                            <MapPin className="w-3.5 h-3.5 text-[#0A6E3B]" />
                            <span>{currentRestaurant.neighborhood}</span>
                          </motion.button>

                          {/* Bottom-right : bouton flèche vers les restaurants de Dakar */}
                          <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, delay: 0.32 }}
                            whileHover={{ scale: 1.08, y: -3 }}
          whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveTab('menu');
                            }}
                            className="absolute bottom-3.5 right-3.5 z-10 w-9 h-9 rounded-full brand-gradient flex items-center justify-center shadow-md hover:brightness-110 transition-all cursor-pointer"
                            aria-label="Explorer tous les restaurants de Dakar"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/shapes/arrow.svg" alt="" className="w-4.5 h-auto" />
                          </motion.button>

                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Progress bar for 5s timer */}
                    <div className="absolute bottom-0 inset-x-0 h-1 bg-white/20 z-20 overflow-hidden">
                      <motion.div
                        key={currentSlideIndex}
                        initial={{ width: '0%' }}
                        animate={{ width: isSlideshowPaused ? '0%' : '100%' }}
                        transition={{ duration: 5, ease: 'linear' }}
                        className="h-full bg-[#10B981]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* =================================================================
                  🍲 SECTION CATÉGORIES DE PLATS (BADGES ORGANIQUES)
                 ================================================================= */}
              <div className="space-y-2 pt-1 pb-2">
                <div className="flex items-start gap-4 overflow-x-auto no-scrollbar px-4 pb-1">
                  {[
                    { id: 'all', name: 'Tous', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80' },
                    { id: 'cat-thieb', name: 'Thiéb', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80' },
                    { id: 'cat-yassa', name: 'Yassa', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80' },
                    { id: 'cat-dibi', name: 'Dibi', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400&q=80' },
                    { id: 'cat-street', name: 'Burgers', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80' },
                    { id: 'cat-fish', name: 'Poissons', image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=400&q=80' },
                    { id: 'cat-pastels', name: 'Pastels', image: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=400&q=80' },
                    { id: 'cat-boissons', name: 'Jus & Dégué', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=400&q=80' },
                  ].map((catItem) => {
                    const isCatSelected = selectedCat === catItem.id;
                    return (
                      <motion.div
                        key={catItem.id}
                        whileHover={{ y: -3, scale: 1.05 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => {
                          setSelectedCat(catItem.id === selectedCat ? 'all' : catItem.id);
                        }}
                        className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <div className={`relative transition-all ${isCatSelected ? 'scale-105' : 'opacity-95 hover:opacity-100'}`}>
                          <svg 
                            viewBox="0 0 210 186" 
                            className="w-16 h-auto" 
                            style={{ 
                              filter: isCatSelected 
                                ? 'drop-shadow(0 6px 14px rgba(10,110,59,0.55)) drop-shadow(0 2px 5px rgba(0,0,0,0.2))' 
                                : 'drop-shadow(0 5px 12px rgba(0,0,0,0.22)) drop-shadow(0 2px 4px rgba(10,110,59,0.3))' 
                            }}
                          >
                            <defs>
                              <clipPath id={`catClip-${catItem.id}`}>
                                <path d="M189.1,48.89c-2.48-5.07-6.96-8.56-12.27-9.67-5.35-6.63-11.38-11.1-11.49-11.18-13.13-9.45-27.81-11.71-41.73-12.75-3.41-.25-6.8-.41-10.07-.55-3.35-.15-6.51-.29-9.69-.53l-1.35-.1c-5.34-.4-11.19-.84-17.07-1,.01-.02.02-.04.03-.05-6.61.64-13.41.35-20.03,1.67-2,.4-4.31.98-6.66,1.37-1.3.56-2.58,1.08-3.87,1.52h0c-1.68.76-3.42,1.65-5.22,2.67l-.16-1.31-17.25,7.59c-4.7,2.07-14.17,8.6-16.44,18.56-.92,4.06-.49,8.16,1.16,11.81l-.78.99,2.95,7.19c.06.34.13.94.18,1.4.09.77.2,1.72.39,2.78-3.91,6.06-5.66,13.66-4.23,20.75.96,4.78,3.28,8.85,6.57,11.93-1.28,3.38-1.91,7.03-1.8,10.73.06,2.07.37,4.09.9,6.01-3.36,7.93-3.39,17.31.5,24.82,6.33,12.2,18.84,14.93,27.99,16.91,1.37.3,2.67.58,3.89.88,2.07.5,4.22,1.08,6.51,1.69,2.78.74,5.66,1.51,8.47,2.16,10.08,2.35,19.1,2.59,27.82,2.83l2.37.06c9.21.26,18.63-.46,26.93-1.09l.5-.04c16.68-1.27,29.69-3.23,42.97-9.08.89-.39,1.79-.81,2.68-1.23,9.98-4.79,17.07-15.22,18.07-26.56.54-6.12-.74-11.81-3.61-16.54.13-2.67-.13-5.27-.78-7.73,5.76-4.83,8.96-12.46,8.59-21.13-.23-5.34-1.85-11.19-4.75-16.45,2.54-6.25,2.56-13.66-.21-19.31Z" />
                              </clipPath>
                            </defs>
                            <path 
                              d="M189.1,48.89c-2.48-5.07-6.96-8.56-12.27-9.67-5.35-6.63-11.38-11.1-11.49-11.18-13.13-9.45-27.81-11.71-41.73-12.75-3.41-.25-6.8-.41-10.07-.55-3.35-.15-6.51-.29-9.69-.53l-1.35-.1c-5.34-.4-11.19-.84-17.07-1,.01-.02.02-.04.03-.05-6.61.64-13.41.35-20.03,1.67-2,.4-4.31.98-6.66,1.37-1.3.56-2.58,1.08-3.87,1.52h0c-1.68.76-3.42,1.65-5.22,2.67l-.16-1.31-17.25,7.59c-4.7,2.07-14.17,8.6-16.44,18.56-.92,4.06-.49,8.16,1.16,11.81l-.78.99,2.95,7.19c.06.34.13.94.18,1.4.09.77.2,1.72.39,2.78-3.91,6.06-5.66,13.66-4.23,20.75.96,4.78,3.28,8.85,6.57,11.93-1.28,3.38-1.91,7.03-1.8,10.73.06,2.07.37,4.09.9,6.01-3.36,7.93-3.39,17.31.5,24.82,6.33,12.2,18.84,14.93,27.99,16.91,1.37.3,2.67.58,3.89.88,2.07.5,4.22,1.08,6.51,1.69,2.78.74,5.66,1.51,8.47,2.16,10.08,2.35,19.1,2.59,27.82,2.83l2.37.06c9.21.26,18.63-.46,26.93-1.09l.5-.04c16.68-1.27,29.69-3.23,42.97-9.08.89-.39,1.79-.81,2.68-1.23,9.98-4.79,17.07-15.22,18.07-26.56.54-6.12-.74-11.81-3.61-16.54.13-2.67-.13-5.27-.78-7.73,5.76-4.83,8.96-12.46,8.59-21.13-.23-5.34-1.85-11.19-4.75-16.45,2.54-6.25,2.56-13.66-.21-19.31Z" 
                              fill="#0A6E3B"
                            />
                            <image href={catItem.image} width="210" height="186" preserveAspectRatio="xMidYMid slice" clipPath={`url(#catClip-${catItem.id})`} />
                            {/* Contour vert élégant */}
                            <path 
                              d="M189.1,48.89c-2.48-5.07-6.96-8.56-12.27-9.67-5.35-6.63-11.38-11.1-11.49-11.18-13.13-9.45-27.81-11.71-41.73-12.75-3.41-.25-6.8-.41-10.07-.55-3.35-.15-6.51-.29-9.69-.53l-1.35-.1c-5.34-.4-11.19-.84-17.07-1,.01-.02.02-.04.03-.05-6.61.64-13.41.35-20.03,1.67-2,.4-4.31.98-6.66,1.37-1.3.56-2.58,1.08-3.87,1.52h0c-1.68.76-3.42,1.65-5.22,2.67l-.16-1.31-17.25,7.59c-4.7,2.07-14.17,8.6-16.44,18.56-.92,4.06-.49,8.16,1.16,11.81l-.78.99,2.95,7.19c.06.34.13.94.18,1.4.09.77.2,1.72.39,2.78-3.91,6.06-5.66,13.66-4.23,20.75.96,4.78,3.28,8.85,6.57,11.93-1.28,3.38-1.91,7.03-1.8,10.73.06,2.07.37,4.09.9,6.01-3.36,7.93-3.39,17.31.5,24.82,6.33,12.2,18.84,14.93,27.99,16.91,1.37.3,2.67.58,3.89.88,2.07.5,4.22,1.08,6.51,1.69,2.78.74,5.66,1.51,8.47,2.16,10.08,2.35,19.1,2.59,27.82,2.83l2.37.06c9.21.26,18.63-.46,26.93-1.09l.5-.04c16.68-1.27,29.69-3.23,42.97-9.08.89-.39,1.79-.81,2.68-1.23,9.98-4.79,17.07-15.22,18.07-26.56.54-6.12-.74-11.81-3.61-16.54.13-2.67-.13-5.27-.78-7.73,5.76-4.83,8.96-12.46,8.59-21.13-.23-5.34-1.85-11.19-4.75-16.45,2.54-6.25,2.56-13.66-.21-19.31Z" 
                              fill="none" 
                              stroke={isCatSelected ? '#0A6E3B' : 'rgba(10, 110, 59, 0.75)'} 
                              strokeWidth={isCatSelected ? '6' : '5'}
                            />
                          </svg>
                          {isCatSelected && (
                            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#0A6E3B] text-white flex items-center justify-center text-[8px] font-black ring-2 ring-white">
                              ✓
                            </div>
                          )}
                        </div>


                        <span className={`text-[10px] font-black text-center max-w-[70px] line-clamp-1 ${
                          isCatSelected ? 'text-[#0A6E3B]' : 'text-[#081A10]'
                        }`}>
                          {catItem.name}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* =========================================================================
                  FORME BLANCHE ORGANIQUE (SVG /shapes/cream-mask.svg)
                 ========================================================================= */}
              <div className="w-full -mt-2 overflow-visible pointer-events-none relative z-0">
                <svg
                  viewBox="0 0 1374.24 450"
                  preserveAspectRatio="none"
                  className="w-full h-10 block"
                >
                  <path 
                    fill="#F2EFE7" 
                    d="M1374.24,0v440c-57.67-18.18-114.2-44.05-167.93-76.99-162.39-99.57-225.7-238.28-430.52-277.02-192.74-36.46-267.39,48.68-436.29,98.52-111.55,32.91-228.8,45.97-339.5,16.06V0h1374.24Z" 
                  />
                </svg>
              </div>

            </div>

            {/* =================================================================
                🌿 FORME VERTE + SECTION DES PLATS (TOUJOURS AU-DESSUS)
               ================================================================= */}
            <div className="relative z-10 -mt-2 pt-2 pb-6 px-3.5 space-y-3">
              
              {/* Texture SVG des pétales superposée sur le fond vert continu de l'app */}
              <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/shapes/bottom-petals.svg"
                  alt=""
                  className="w-full h-full object-cover opacity-60 mix-blend-screen pointer-events-none"
                />
              </div>

              {/* Grille des plats en cartes (3 par ligne) - dépasse légèrement sur le haut de la forme verte */}
              <div className="grid grid-cols-3 gap-2.5 relative z-20 -mt-6">


                {displayedDishes.map((dish) => {
                  const isItemFav = favoriteIds.includes(dish.id);
                  return (
                    <motion.div
                      key={dish.id}
                      whileHover={{ y: -3, scale: 1.02 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => { setSelectedDish(dish); setDishQuantity(1); }}
                      className="relative flex flex-col cursor-pointer group transition-all select-none bg-white rounded-[14px] shadow-[0_6px_16px_rgba(0,0,0,0.2)] p-1.5 pb-2.5 justify-between"
                      style={{ aspectRatio: '100 / 126' }}
                    >
                      {/* Photo du plat */}
                      <div className="relative w-full aspect-square overflow-hidden rounded-[10px] bg-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={dish.image} 
                          alt={dish.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        
                        {/* Quick add button floating on corner with Glassmorphism */}
                        <button
                          onClick={(e) => handleQuickAdd(dish, e)}
                          className={`absolute bottom-1 right-1 w-5.5 h-5.5 rounded-full flex items-center justify-center shadow-md backdrop-blur-md border border-white/40 transition-all ${
                            quickAddedId === dish.id
                              ? 'bg-emerald-600/90 text-white scale-110'
                              : 'bg-[#FF7824]/90 text-white hover:bg-[#FF7824]'
                          }`}
                          aria-label="Ajouter au panier"
                        >
                          {quickAddedId === dish.id ? <Check className="w-2.5 h-2.5" /> : <Plus className="w-2.5 h-2.5" />}
                        </button>
                      </div>

                      {/* Info plat décalé en bas : Titre + Prix + Cœur Favori */}
                      <div className="px-0.5 pt-1 flex items-end justify-between gap-1">
                        <div className="min-w-0 flex-1">
                          <h5 className="font-black text-[10.5px] text-[#081A10] leading-tight truncate">
                            {dish.name}
                          </h5>
                          <span className="text-[10.5px] font-black text-[#FF7824] block leading-tight mt-0.5">
                            {dish.price} Fcfa
                          </span>
                        </div>

                        <button
                          onClick={(e) => toggleFavorite(dish.id, e)}
                          className="p-0.5 shrink-0 active:scale-75 transition-transform"
                          aria-label="Favori"
                        >
                          <Heart className={`w-3.5 h-3.5 ${isItemFav ? 'fill-[#E52E2E] text-[#E52E2E]' : 'text-gray-400 stroke-[1.5]'}`} />
                        </button>
                      </div>
                    </motion.div>

                  );
                })}
              </div>

              {/* Bouton "Tout ➔" avec Glassmorphism */}
              <div className="flex justify-center pt-2">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAllDishes(!showAllDishes)}
                  className="px-6 py-2 rounded-full bg-[#052112]/85 backdrop-blur-md text-white text-xs font-black flex items-center gap-2 shadow-xl border border-white/20 hover:bg-[#08301B]/95 hover:border-white/40 transition-all"
                >
                  <span>{showAllDishes ? 'Voir moins' : 'Tout'}</span>
                  <span>➔</span>
                </motion.button>
              </div>

            </div>


          </div>
        )}

        {/* =====================================================================
            TAB: LIVREURS À PROXIMITÉ EN DIRECT (RADAR GPS & DISPONIBILITÉ)
           ===================================================================== */}
        {activeTab === 'courier' && (
          <div className="p-4 space-y-4 pb-16">
            
            {/* Header avec statut GPS en direct */}
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <h3 className="font-black text-sm text-white">
                    Livreurs Express à Proximité
                  </h3>
                </div>
                <p className="text-[10px] text-white/80 mt-0.5">
                  Radar GPS temps réel autour de <strong className="text-white">{selectedNeighborhood !== 'Tous les quartiers' ? selectedNeighborhood : (userLiveLocation || 'Dakar')}</strong>
                </p>
              </div>

              <div className="px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white text-[10px] font-black flex items-center gap-1">
                <Bike className="w-3 h-3 text-emerald-300" />
                <span>6 Actifs</span>
              </div>
            </div>

            {/* Radar GPS Live Map Preview */}
            <div className="relative rounded-3xl overflow-hidden shadow-md border border-white/20">
              <CourierLiveRadar
                courierPos={DAKAR_GEO_PRESETS[selectedNeighborhood] || DAKAR_GEO_PRESETS['Mermoz']}
                restaurantPos={DAKAR_GEO_PRESETS['Ngor']}
                destinationPos={DAKAR_GEO_PRESETS['Plateau']}
                courierName="Ibrahima Fall"
                restaurantName="Chez Kamiss"
                destinationAddress={userLiveLocation || 'Dakar'}
                orderNumber="RADAR-LIVE"
                isSimulatingLiveMove={true}
              />
            </div>

            {/* Filtre de zone pour les livreurs */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-white/80">
                Secteurs de Dakar
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {['Tous les quartiers', 'Almadies', 'Ngor', 'Mermoz', 'Plateau', 'Yoff', 'Pikine'].map((zone) => {
                  const isSel = selectedNeighborhood === zone;
                  return (
                    <button
                      key={zone}
                      onClick={() => setSelectedNeighborhood(zone)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all border ${
                        isSel
                          ? 'bg-emerald-500 text-white border-emerald-400 shadow-xs'
                          : 'bg-white/15 text-white border-white/20 hover:bg-white/25 backdrop-blur-md'
                      }`}
                    >
                      {zone === 'Tous les quartiers' ? '🌍 Tout Dakar' : `📍 ${zone}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Liste des livreurs disponibles à proximité */}
            <div className="space-y-3 pt-1">
              <span className="text-xs font-black text-white">
                Livreurs disponibles pour vos courses
              </span>

              {[
                {
                  id: 'courier-1',
                  name: 'Ibrahima Fall',
                  phone: '+221 77 845 12 34',
                  moto: 'Yamaha NMAX 155',
                  plaque: 'DK-4921-AZ',
                  distance: '350m',
                  eta: '2 min',
                  rating: 4.9,
                  trips: 420,
                  zone: 'Almadies',
                  photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
                  status: 'Disponible immédiatement',
                },
                {
                  id: 'courier-2',
                  name: 'Moussa Diop',
                  phone: '+221 78 321 65 98',
                  moto: 'Honda CG 125',
                  plaque: 'DK-8104-BB',
                  distance: '800m',
                  eta: '4 min',
                  rating: 4.8,
                  trips: 310,
                  zone: 'Ngor',
                  photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
                  status: 'En patrouille active',
                },
                {
                  id: 'courier-3',
                  name: 'Cheikh Ndiaye',
                  phone: '+221 76 555 43 21',
                  moto: 'Yamaha T-Max 530',
                  plaque: 'DK-1290-CC',
                  distance: '1.2 km',
                  eta: '5 min',
                  rating: 5.0,
                  trips: 650,
                  zone: 'Mermoz',
                  photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
                  status: 'Disponible express',
                },
                {
                  id: 'courier-4',
                  name: 'Modou Sow',
                  phone: '+221 77 666 77 88',
                  moto: 'Suzuki Address 110',
                  plaque: 'DK-9843-DD',
                  distance: '1.6 km',
                  eta: '7 min',
                  rating: 4.9,
                  trips: 280,
                  zone: 'Plateau',
                  photo: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80',
                  status: 'Disponible',
                },
                {
                  id: 'courier-5',
                  name: 'Babacar Gueye',
                  phone: '+221 78 999 00 11',
                  moto: 'KTM Duke 200',
                  plaque: 'DK-7722-EE',
                  distance: '2.1 km',
                  eta: '9 min',
                  rating: 4.8,
                  trips: 190,
                  zone: 'Yoff',
                  photo: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80',
                  status: 'Disponible',
                },
              ]
                .filter((c) => selectedNeighborhood === 'Tous les quartiers' || c.zone.toLowerCase() === selectedNeighborhood.toLowerCase())
                .map((courier) => (
                  <motion.div
                    key={courier.id}
                    whileHover={{ y: -3, scale: 1.01 }}
                    className="glass-panel-light p-3.5 rounded-2xl flex items-center justify-between gap-3 shadow-[0_8px_24px_rgba(6,56,29,0.12)] border border-white/90 hover:border-white transition-all"
                  >
                    {/* Courier Avatar + Info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={courier.photo}
                          alt={courier.name}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-[#0A6E3B]/40 shadow-xs"
                        />
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-black text-xs text-[#081A10] truncate">
                            {courier.name}
                          </h4>
                          <span className="text-[9px] bg-emerald-100/90 text-emerald-800 font-black px-2 py-0.5 rounded-full backdrop-blur-xs border border-emerald-300/50 shrink-0">
                            ⚡ Certifié
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-600 font-medium mt-0.5">
                          🏍️ {courier.moto} • <span className="font-mono text-[9px] font-bold text-gray-500">{courier.plaque}</span>
                        </p>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold mt-1 flex-wrap">
                          <span className="text-[#0A6E3B]">📍 {courier.zone} ({courier.distance})</span>
                          <span className="text-gray-300">•</span>
                          <span className="text-[#FF7824] bg-orange-50 px-1.5 py-0.2 rounded-md">~{courier.eta}</span>
                          <span className="text-gray-300">•</span>
                          <span className="text-gray-700">⭐ {courier.rating} ({courier.trips})</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions : Appel + Demande Liquid Glass */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <a
                        href={`tel:${courier.phone}`}
                        className="glass-btn w-10 h-10 rounded-xl flex items-center justify-center text-[#0A6E3B] hover:scale-105 transition-all text-sm"
                        title="Appeler le livreur"
                      >
                        📞
                      </a>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          alert(`Demande de course envoyée à ${courier.name} (${courier.moto}) ! Il arrive dans environ ${courier.eta}.`);
                        }}
                        className="px-3.5 py-2.5 rounded-xl brand-gradient text-white text-[11px] font-black shadow-md hover:brightness-110 transition-all cursor-pointer"
                      >
                        Commander
                      </motion.button>
                    </div>
                  </motion.div>

                ))}
            </div>

          </div>
        )}

        {/* =====================================================================
            TAB 2: DÉCOUVERTE RESTAURANTS & SORTIES À DAKAR (SHOWCASE HUB)
           ===================================================================== */}
        {activeTab === 'menu' && (
          <div className="p-4 space-y-4 pb-12">

            
            {/* Header with search context & live counter */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-sm text-white">
                  {selectedNeighborhood !== 'Tous les quartiers'
                    ? `Restaurants à ${selectedNeighborhood}`
                    : 'Explorer Dakar & ses Restaurants'}
                </h3>
                <p className="text-[10px] text-white/80">
                  {userLiveLocation ? `Depuis ${userLiveLocation} • ` : ''}
                  {activeRestaurants.length} établissement{activeRestaurants.length > 1 ? 's' : ''} trouvé{activeRestaurants.length > 1 ? 's' : ''}
                </p>
              </div>

              {selectedNeighborhood !== 'Tous les quartiers' && (
                <button
                  onClick={() => setSelectedNeighborhood('Tous les quartiers')}
                  className="px-2.5 py-1 rounded-lg bg-white/20 text-[10px] font-bold text-white hover:bg-white/30 transition-colors"
                >
                  Tout Dakar ✕
                </button>
              )}
            </div>

            {/* Ambiance & Lifestyle Discovery Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {[
                { id: 'all', label: 'Tous' },
                { id: 'rated', label: '⭐ Mieux Notés (4.8+)' },
                { id: 'ocean', label: '🌊 Vue Mer & Plage' },
                { id: 'couple', label: '❤️ Sortie Couple & Romantique' },
                { id: 'grill', label: '🔥 Grillades & Dibi' },
                { id: 'budget', label: '💰 Prix Doux' },
              ].map((flt) => {
                const isSel = restoDiscoveryFilter === flt.id;
                return (
                  <button
                    key={flt.id}
                    onClick={() => setRestoDiscoveryFilter(flt.id as any)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all border ${
                      isSel
                        ? 'bg-emerald-500 text-white border-emerald-400 shadow-xs'
                        : 'bg-white/15 text-white border-white/20 hover:bg-white/25 backdrop-blur-md'
                    }`}
                  >
                    {flt.label}
                  </button>
                );
              })}
            </div>


            {/* Restaurant Cards List */}
            {activeRestaurants.length === 0 ? (
              <div className="text-center py-16 space-y-3 bg-white rounded-3xl border border-[#D8EADB] p-6 shadow-2xs">
                <span className="text-4xl">🔍</span>
                <p className="font-bold text-xs text-gray-700">Aucun restaurant trouvé pour cette recherche</p>
                <button
                  onClick={() => { setSelectedNeighborhood('Tous les quartiers'); setSearchQuery(''); setRestoDiscoveryFilter('all'); }}
                  className="px-4 py-2 rounded-full brand-gradient text-white text-xs font-bold shadow-xs"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {activeRestaurants
                  .filter((resto) => {
                    if (restoDiscoveryFilter === 'rated') return resto.rating >= 4.85;
                    if (restoDiscoveryFilter === 'ocean') return resto.ambianceTags?.some(t => t.toLowerCase().includes('océan') || t.toLowerCase().includes('mer') || t.toLowerCase().includes('plage'));
                    if (restoDiscoveryFilter === 'couple') return resto.ambianceTags?.some(t => t.toLowerCase().includes('romantique') || t.toLowerCase().includes('couple') || t.toLowerCase().includes('coucher'));
                    if (restoDiscoveryFilter === 'grill') return resto.featuredTags?.some(t => t.toLowerCase().includes('dibi') || t.toLowerCase().includes('grillades')) || resto.ambianceTags?.some(t => t.toLowerCase().includes('dibi'));
                    if (restoDiscoveryFilter === 'budget') return resto.priceRange?.includes('1000') || resto.priceRange?.includes('2500');
                    return true;
                  })
                  .map((resto) => {
                    const distanceInfo = getDistanceEstimate(userLiveLocation, resto.neighborhood);
                    const isFav = favoriteRestaurantIds.includes(resto.id);

                    return (
                      <motion.div
                        key={resto.id}
                        whileHover={{ y: -3, scale: 1.01 }}
                        className="glass-panel-light rounded-[28px] overflow-hidden border border-white/90 shadow-[0_10px_30px_rgba(6,56,29,0.14)] hover:shadow-xl transition-all group"
                      >
                        {/* Cover image banner with overlays */}
                        <div className="relative h-44 w-full bg-gray-100 overflow-hidden cursor-pointer" onClick={() => handleOpenShowcase(resto)}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={resto.coverImage}
                            alt={resto.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#052112]/90 via-black/25 to-transparent" />

                          {/* Top Badges Liquid Glass */}
                          <div className="absolute top-3 left-3 flex items-center gap-1.5">
                            <span className="glass-btn px-2.5 py-1 rounded-full text-[#0A6E3B] text-[10px] font-black shadow-xs flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              Ouvert
                            </span>
                            <span className="glass-panel-dark px-2.5 py-1 rounded-full text-white text-[10px] font-bold">
                              📍 {resto.neighborhood}
                            </span>
                          </div>

                          {/* Top Right Favorite Button Liquid Glass */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavoriteRestaurant(resto.id);
                            }}
                            className="glass-btn absolute top-3 right-3 w-8 h-8 rounded-full text-gray-600 hover:text-rose-500 flex items-center justify-center text-xs shadow-md transition-transform active:scale-75"
                            aria-label="Ajouter aux favoris"
                          >
                            <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : 'text-gray-600'}`} />
                          </button>

                          {/* Bottom info on Image */}
                          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h4 className="font-black text-sm text-white drop-shadow-sm leading-tight">{resto.name}</h4>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              </div>
                              <p className="text-[10px] text-white/80 line-clamp-1 mt-0.5">{resto.tagline}</p>
                            </div>
                            <div className="px-2.5 py-1 rounded-xl bg-emerald-600/95 backdrop-blur-md text-white text-xs font-black shrink-0 flex items-center gap-1 shadow-md border border-white/30">
                              ⭐ {resto.rating}
                            </div>
                          </div>
                        </div>

                        {/* Content & Discovery Details */}
                        <div className="p-3.5 space-y-3">
                          
                          {/* Distance, Trajet & Gamme de Prix */}
                          <div className="flex items-center justify-between text-[11px] text-gray-600 pb-1 border-b border-gray-100/80">
                            <div className="flex items-center gap-1.5 text-[#081A10] font-bold">
                              <Navigation className="w-3 h-3 text-[#0A6E3B]" />
                              <span>Depuis {userLiveLocation} : <strong className="text-[#0A6E3B]">{distanceInfo.dist}</strong> ({distanceInfo.time})</span>
                            </div>
                            <span className="text-[10px] font-extrabold text-[#0A6E3B] bg-[#E6F5EC] border border-[#0A6E3B]/20 px-2 py-0.5 rounded-md">
                              {resto.priceRange || '2500 - 6000 FCFA'}
                            </span>
                          </div>

                          {/* Ambiance tags */}
                          <div className="flex flex-wrap gap-1.5">
                            {resto.ambianceTags?.slice(0, 3).map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-lg bg-[#0A6E3B]/10 border border-[#0A6E3B]/20 text-[#0A6E3B] text-[10px] font-black"
                              >
                                {tag}
                              </span>
                            ))}
                            {resto.gallery && resto.gallery.length > 0 && (
                              <span className="px-2 py-0.5 rounded-lg bg-gray-100/80 text-gray-600 text-[10px] font-semibold flex items-center gap-1">
                                <Camera className="w-2.5 h-2.5" />
                                {resto.gallery.length} photos
                              </span>
                            )}
                          </div>

                          {/* Action Buttons Liquid Glass */}
                          <div className="pt-1 flex items-center gap-2">
                            <button
                              onClick={() => handleOpenShowcase(resto)}
                              className="flex-1 py-2.5 rounded-xl brand-gradient text-white text-xs font-black shadow-md flex items-center justify-center gap-1.5 hover:brightness-110 transition-all cursor-pointer"
                            >
                              <span>👁️ Visiter la vitrine</span>
                            </button>
                            <button
                              onClick={() => handleOpenReservation(resto)}
                              className="glass-btn px-3 py-2.5 rounded-xl text-[#0A6E3B] text-xs font-black hover:bg-[#E6F5EC] transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <Calendar className="w-3.5 h-3.5" />
                              <span>Réserver</span>
                            </button>
                          </div>

                        </div>
                      </motion.div>

                    );
                  })}
              </div>
            )}

          </div>
        )}

        {/* =====================================================================
            TAB 3: ORDERS (MES COMMANDES)
           ===================================================================== */}
        {activeTab === 'orders' && (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm text-white">Mes Commandes</h3>
              <span className="text-[10px] font-black text-white bg-white/15 backdrop-blur-md border border-white/20 px-2.5 py-0.5 rounded-full">
                {orders.length} au total
              </span>
            </div>


            {orders.length === 0 ? (
              <div className="text-center py-16 space-y-3 bg-white rounded-3xl border border-[#D8EADB] p-6">
                <span className="text-4xl">📦</span>
                <p className="font-bold text-xs text-gray-700">Aucune commande en cours</p>
                <button
                  onClick={() => setActiveTab('home')}
                  className="px-5 py-2 rounded-full brand-gradient text-white text-xs font-bold shadow-md"
                >
                  Commander mon premier Thiéb
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((ord) => {
                  const isPreparing = ord.status === 'preparing' || ord.status === 'ready_for_pickup' || ord.status === 'in_transit';
                  return (
                    <div
                      key={ord.id}
                      className="bg-white p-3.5 rounded-2xl border border-[#D8EADB] space-y-2.5 shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-black text-[#081A10]">Commande {ord.orderNumber}</span>
                          <p className="text-[10px] text-gray-400">{ord.restaurantName}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isPreparing ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {isPreparing ? 'En préparation' : 'Livrée'}
                        </span>
                      </div>

                      <div className="text-[11px] text-gray-600 divide-y divide-gray-100">
                        {ord.items.map((it, i) => (
                          <div key={i} className="py-1 flex justify-between">
                            <span>{it.quantity}x {it.name}</span>
                            <span className="font-bold">{formatFCFA(it.price * it.quantity)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                        <span className="text-xs font-black text-[#0A6E3B]">Total : {formatFCFA(ord.total)}</span>
                        <button
                          onClick={() => onOpenTracking(ord)}
                          className="px-3 py-1.5 rounded-xl brand-gradient text-white text-[11px] font-bold shadow-xs"
                        >
                          Suivre ma commande ➔
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =====================================================================
            TAB 4: MES SORTIES, RÉSERVATIONS & FAVORIS
           ===================================================================== */}
        {activeTab === 'favorites' && (
          <div className="p-4 space-y-4 pb-12">
            
            {/* Sub-tabs: Mes Sorties / Plats Favoris */}
            <div className="flex bg-black/30 backdrop-blur-md p-1 rounded-2xl border border-white/15">
              <button
                onClick={() => setFavoritesSubTab('outings')}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                  favoritesSubTab === 'outings'
                    ? 'bg-white text-[#0A6E3B] shadow-md'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                ❤️ Sorties ({reservations.length + outingPlans.length})
              </button>
              <button
                onClick={() => setFavoritesSubTab('dishes')}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                  favoritesSubTab === 'dishes'
                    ? 'bg-white text-[#0A6E3B] shadow-md'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                🍲 Plats Favoris ({favoriteDishes.length})
              </button>
            </div>


            {/* Sub-tab 1: Outings, Reservations, and Saved Restaurants */}
            {favoritesSubTab === 'outings' && (
              <div className="space-y-4">
                
                {/* 1. Mes Réservations de Table Confirmées */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Tables Réservées ({reservations.length})</span>
                    </h4>
                  </div>

                  {reservations.length === 0 ? (
                    <div className="p-4 text-center glass-panel-light rounded-2xl border border-white/80 text-xs text-gray-600 space-y-1">
                      <p>Aucune réservation en cours.</p>
                      <button
                        onClick={() => setActiveTab('menu')}
                        className="text-[11px] text-[#0A6E3B] font-bold underline"
                      >
                        Réserver une table aux Almadies ou Ngor
                      </button>
                    </div>
                  ) : (
                    reservations.map((res) => (
                      <div
                        key={res.id}
                        className="glass-panel-light p-3.5 rounded-2xl border border-white/80 space-y-2 shadow-xs"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h5 className="font-black text-xs text-[#081A10]">{res.restaurantName}</h5>
                              <span className="px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-black">
                                {res.status === 'confirmed' ? '✓ Confirmée' : res.status}
                              </span>
                            </div>
                            <span className="text-[10px] text-gray-500 font-mono">Code : {res.reservationNumber}</span>
                          </div>
                          <span className="text-[11px] font-bold text-[#FF7824] bg-[#FF7824]/10 px-2 py-0.5 rounded-full">
                            {res.occasion}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] bg-white/70 p-2 rounded-xl border border-white/60">
                          <div>
                            <span className="text-gray-500 block text-[9px] font-bold">Date & Heure</span>
                            <span className="font-black text-[#081A10]">{res.date} • {res.time}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block text-[9px] font-bold">Convives</span>
                            <span className="font-black text-[#081A10]">{res.guestsCount} personne{res.guestsCount > 1 ? 's' : ''}</span>
                          </div>
                        </div>

                        {res.notes && (
                          <p className="text-[10px] text-amber-900 bg-amber-50/90 p-1.5 rounded-lg border border-amber-200/50">
                            📝 Note : {res.notes}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* 2. Sorties Programmées */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                      <span>✨ Sorties Prévues ({outingPlans.length})</span>
                    </h4>
                  </div>


                  {outingPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className="bg-white p-3.5 rounded-2xl border border-[#D8EADB] space-y-2 shadow-xs"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="font-black text-xs text-[#081A10]">{plan.title}</h5>
                          <p className="text-[10px] text-gray-400">{plan.restaurantName} • {plan.neighborhood}</p>
                        </div>
                        <span className="text-[10px] font-bold text-[#0A6E3B] bg-[#E6F5EC] px-2 py-0.5 rounded-full">
                          {plan.plannedDate}
                        </span>
                      </div>

                      {plan.notes && (
                        <p className="text-[10px] text-gray-600 bg-gray-50 p-2 rounded-xl">
                          {plan.notes}
                        </p>
                      )}

                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => {
                            const r = restaurants.find(item => item.id === plan.restaurantId);
                            if (r) handleOpenShowcase(r);
                          }}
                          className="flex-1 py-1.5 rounded-xl brand-gradient text-white text-[11px] font-bold shadow-2xs"
                        >
                          Voir la vitrine du resto ➔
                        </button>
                        <button
                          onClick={() => deleteOutingPlan(plan.id)}
                          className="px-2.5 py-1.5 rounded-xl bg-gray-100 text-gray-400 hover:text-rose-500 text-xs"
                          title="Supprimer"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 3. Restaurants Favoris Enregistrés */}
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">
                    ❤️ Restaurants Favoris ({favoriteRestoList.length})
                  </h4>

                  <div className="space-y-2.5">
                    {favoriteRestoList.map((resto) => (
                      <div
                        key={resto.id}
                        onClick={() => handleOpenShowcase(resto)}
                        className="glass-panel-light p-3 rounded-2xl border border-white/80 flex items-center justify-between gap-3 shadow-2xs cursor-pointer hover:border-[#0A6E3B] transition-all"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={resto.coverImage} alt={resto.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h5 className="font-bold text-xs text-[#081A10] truncate">{resto.name}</h5>
                          <p className="text-[10px] text-gray-500">📍 {resto.neighborhood} • ⭐ {resto.rating}</p>
                        </div>
                        <button className="px-3 py-1.5 rounded-xl bg-[#E6F5EC] text-[#0A6E3B] text-[11px] font-bold">
                          Vitrine ➔
                        </button>
                      </div>
                    ))}
                  </div>
                </div>


              </div>
            )}

            {/* Sub-tab 2: Favorite Dishes */}
            {favoritesSubTab === 'dishes' && (
              <div className="space-y-2.5">
                {favoriteDishes.length === 0 ? (
                  <div className="text-center py-16 space-y-2 bg-white rounded-3xl border border-[#D8EADB] p-6">
                    <span className="text-3xl">🤍</span>
                    <p className="font-bold text-xs text-gray-700">Aucun plat favori pour l'instant</p>
                    <button
                      onClick={() => setActiveTab('home')}
                      className="px-4 py-2 rounded-full brand-gradient text-white text-xs font-bold mt-2 shadow-xs"
                    >
                      Découvrir les plats
                    </button>
                  </div>
                ) : (
                  favoriteDishes.map((dish, idx) => (
                    <div
                      key={`${dish.id}-fav-${idx}`}
                      onClick={() => { setSelectedDish(dish); setDishQuantity(1); }}
                      className="bg-white p-3 rounded-2xl border border-[#D8EADB] flex items-center justify-between gap-3 shadow-2xs cursor-pointer"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={dish.image} alt={dish.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h5 className="font-bold text-xs text-[#081A10] truncate">{dish.name}</h5>
                        <p className="text-[11px] font-black text-[#0A6E3B]">{formatFCFA(dish.price)}</p>
                      </div>
                      <button
                        onClick={(e) => handleQuickAdd(dish, e)}
                        className="px-3 py-1.5 rounded-xl brand-gradient text-white text-xs font-bold shadow-xs active:scale-95"
                      >
                        + Ajouter
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

          </div>
        )}

        {/* =====================================================================
            TAB 5: PROFIL
           ===================================================================== */}
        {activeTab === 'profile' && (
          <div className="p-4 space-y-4">
            <div className="bg-white p-4 rounded-3xl border border-[#D8EADB] text-center space-y-2 shadow-2xs">
              <div className="w-14 h-14 rounded-full brand-gradient text-white flex items-center justify-center font-black text-lg mx-auto shadow-sm">
                MD
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#081A10]">Moussa Diop</h4>
                <p className="text-xs text-gray-500">+221 77 654 32 10</p>
              </div>
              <div className="flex justify-center gap-2 pt-1">
                <span className="px-2.5 py-0.5 rounded-full bg-[#E6F5EC] text-[#0A6E3B] text-[10px] font-bold">
                  🇸🇳 Dakar, Sénégal
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#FF7824]/10 text-[#FF7824] text-[10px] font-bold">
                  Membre VIP Téranga
                </span>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-[#D8EADB] divide-y divide-[#D8EADB] text-xs shadow-2xs overflow-hidden">
              <div className="p-3.5 flex justify-between items-center cursor-pointer hover:bg-gray-50">
                <div className="flex items-center gap-2">
                  <span>📍</span>
                  <span className="font-semibold text-gray-700">Adresses enregistrées</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
              </div>
              <div className="p-3.5 flex justify-between items-center cursor-pointer hover:bg-gray-50">
                <div className="flex items-center gap-2">
                  <span>🌊</span>
                  <span className="font-semibold text-gray-700">Wave & Orange Money</span>
                </div>
                <span className="text-[10px] font-bold text-[#0A6E3B]">Connecté</span>
              </div>
              <div className="p-3.5 flex justify-between items-center cursor-pointer hover:bg-gray-50">
                <div className="flex items-center gap-2">
                  <span>📞</span>
                  <span className="font-semibold text-gray-700">Support Thiob Express</span>
                </div>
                <span className="text-[10px] text-gray-400">+221 33 800 00 00</span>
              </div>
              {onLogout && (
                <div 
                  onClick={onLogout}
                  className="p-3.5 flex justify-between items-center cursor-pointer hover:bg-rose-50 text-rose-700"
                >
                  <div className="flex items-center gap-2">
                    <span>🚪</span>
                    <span className="font-bold">Déconnexion / Changer de compte</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-rose-400" />
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* =========================================================================
          FLOATING BOTTOM CART BUTTON (IF CART > 0)
         ========================================================================= */}
      {cartCount > 0 && !isCartSheetOpen && (
        <div className="absolute bottom-20 left-4 right-4 z-30">
          <motion.button
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => { setIsCartSheetOpen(true); setCheckoutStep('cart'); }}
            className="w-full py-3 px-4 rounded-2xl brand-gradient text-white font-extrabold text-xs shadow-xl flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-white/20 text-white flex items-center justify-center text-[10px] font-black">
                {cartCount}
              </span>
              <span>Voir mon panier</span>
            </div>
            <span>{formatFCFA(cartTotal)}</span>
          </motion.button>
        </div>
      )}

      {/* =========================================================================
          FLOATING ORGANIC BOTTOM DOCK NAVIGATION (WITH CUSTOM WAVE BACKGROUND)
         ========================================================================= */}
      <div className="absolute bottom-0 inset-x-0 z-30 pt-2 pb-2">
        
        {/* Wave Background SVG Shape */}
        <div className="absolute inset-0 top-1 pointer-events-none">
          <svg 
            viewBox="0 0 1000 240" 
            preserveAspectRatio="none" 
            className="w-full h-full drop-shadow-[0_-3px_10px_rgba(0,0,0,0.05)]"
          >
            <path 
              d="M0,95 C140,90 220,70 300,70 C420,70 520,115 640,115 C760,115 880,45 1000,20 L1000,240 L0,240 Z" 
              fill="#FFFFFF" 
            />
          </svg>
        </div>


        <div className="relative flex items-end justify-around px-2 z-10">

        {/* 1. Home */}
        <motion.button
          whileHover={{ scale: 1.08, y: -3 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setActiveTab('home')}
          className="flex flex-col items-center justify-center gap-1"
        >
          <div className="relative w-14" style={{ aspectRatio: '113.57 / 100.25' }}>
            <svg viewBox="0 0 113.57 100.25" className="absolute inset-0 w-full h-full" style={{ filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.18))' }}>
              <path d="M105.56,78.89c-2.32,1.87-5.72,3.82-8.46,5-16.51,7.12-39.56,9.67-56.82,16-11.63,1.93-22.17-3.95-26.76-14.9-4.03-9.62-7.73-31.38-10.1-42.53-2.32-10.9-6.62-21.78.52-31.81C9.09,3.41,15.22.62,23.91.18c16.3-.84,47.43,1.48,64.05,3.49,23.41,2.83,23.34,17.43,24.66,36.58.83,12.13,3.62,30.05-7.06,38.64Z" fill={activeTab === 'home' ? '#0A6E3B' : '#F6F5F1'} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg width="19" height="19" viewBox="0 0 24 24" fill={activeTab === 'home' ? '#FFFFFF' : '#FF7824'} xmlns="http://www.w3.org/2000/svg">
                <path d="M10 20V14H14V20H19V12H22L12 3L2 12H5V20H10Z"/>
              </svg>
            </div>
          </div>
          <span className={`text-[9px] font-black ${activeTab === 'home' ? 'text-[#0A6E3B]' : 'text-[#081A10]/70'}`}>
            Home
          </span>
        </motion.button>

        {/* 2. Livreur / Livreurs à proximité en direct */}
        <motion.button
          whileHover={{ scale: 1.08, y: -3 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setActiveTab('courier')}
          className="flex flex-col items-center justify-center gap-1"
        >
          <div className="relative w-14" style={{ aspectRatio: '113.57 / 100.25' }}>
            <svg viewBox="0 0 113.57 100.25" className="absolute inset-0 w-full h-full" style={{ filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.18))' }}>
              <path d="M105.56,78.89c-2.32,1.87-5.72,3.82-8.46,5-16.51,7.12-39.56,9.67-56.82,16-11.63,1.93-22.17-3.95-26.76-14.9-4.03-9.62-7.73-31.38-10.1-42.53-2.32-10.9-6.62-21.78.52-31.81C9.09,3.41,15.22.62,23.91.18c16.3-.84,47.43,1.48,64.05,3.49,23.41,2.83,23.34,17.43,24.66,36.58.83,12.13,3.62,30.05-7.06,38.64Z" fill={activeTab === 'courier' ? '#0A6E3B' : '#F6F5F1'} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Bike className={`w-4.5 h-4.5 ${activeTab === 'courier' ? 'text-white' : 'text-[#081A10]/60'}`} />
            </div>
          </div>
          <span className={`text-[9px] font-black ${activeTab === 'courier' ? 'text-[#0A6E3B]' : 'text-[#081A10]/70'}`}>
            Livreur
          </span>
        </motion.button>

        {/* 3. Orders / Commandes */}
        <motion.button
          whileHover={{ scale: 1.08, y: -3 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setActiveTab('orders')}
          className="flex flex-col items-center justify-center gap-1"
        >
          <div className="relative w-14" style={{ aspectRatio: '113.57 / 100.25' }}>
            <svg viewBox="0 0 113.57 100.25" className="absolute inset-0 w-full h-full" style={{ filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.18))' }}>
              <path d="M105.56,78.89c-2.32,1.87-5.72,3.82-8.46,5-16.51,7.12-39.56,9.67-56.82,16-11.63,1.93-22.17-3.95-26.76-14.9-4.03-9.62-7.73-31.38-10.1-42.53-2.32-10.9-6.62-21.78.52-31.81C9.09,3.41,15.22.62,23.91.18c16.3-.84,47.43,1.48,64.05,3.49,23.41,2.83,23.34,17.43,24.66,36.58.83,12.13,3.62,30.05-7.06,38.64Z" fill={activeTab === 'orders' ? '#0A6E3B' : '#F6F5F1'} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <ShoppingBag className={`w-4.5 h-4.5 ${activeTab === 'orders' ? 'text-white' : 'text-[#081A10]/60'}`} />
              {orders.length > 0 && (
                <span className="absolute top-1.5 right-2.5 w-2.5 h-2.5 bg-[#FF7824] rounded-full ring-2 ring-white animate-pulse" />
              )}
            </div>
          </div>
          <span className={`text-[9px] font-black ${activeTab === 'orders' ? 'text-[#0A6E3B]' : 'text-[#081A10]/70'}`}>
            Commandes
          </span>
        </motion.button>

        {/* 4. Favoris */}
        <motion.button
          whileHover={{ scale: 1.08, y: -3 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setActiveTab('favorites')}
          className="flex flex-col items-center justify-center gap-1"
        >
          <div className="relative w-14" style={{ aspectRatio: '113.57 / 100.25' }}>
            <svg viewBox="0 0 113.57 100.25" className="absolute inset-0 w-full h-full" style={{ filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.18))' }}>
              <path d="M105.56,78.89c-2.32,1.87-5.72,3.82-8.46,5-16.51,7.12-39.56,9.67-56.82,16-11.63,1.93-22.17-3.95-26.76-14.9-4.03-9.62-7.73-31.38-10.1-42.53-2.32-10.9-6.62-21.78.52-31.81C9.09,3.41,15.22.62,23.91.18c16.3-.84,47.43,1.48,64.05,3.49,23.41,2.83,23.34,17.43,24.66,36.58.83,12.13,3.62,30.05-7.06,38.64Z" fill={activeTab === 'favorites' ? '#0A6E3B' : '#F6F5F1'} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Star className={`w-4.5 h-4.5 ${activeTab === 'favorites' ? 'fill-white text-white' : 'text-[#081A10]/60'}`} />
              {favoriteIds.length > 0 && (
                <span className="absolute top-1.5 right-2 w-3.5 h-3.5 bg-[#FF7824] text-white text-[8px] font-black rounded-full flex items-center justify-center ring-1 ring-white">
                  {favoriteIds.length}
                </span>
              )}
            </div>
          </div>
          <span className={`text-[9px] font-black ${activeTab === 'favorites' ? 'text-[#0A6E3B]' : 'text-[#081A10]/70'}`}>
            Favoris
          </span>
        </motion.button>

        {/* 5. Profil */}
        <motion.button
          whileHover={{ scale: 1.08, y: -3 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setActiveTab('profile')}
          className="flex flex-col items-center justify-center gap-1"
        >
          <div className="relative w-14" style={{ aspectRatio: '113.57 / 100.25' }}>
            <svg viewBox="0 0 113.57 100.25" className="absolute inset-0 w-full h-full" style={{ filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.18))' }}>
              <path d="M105.56,78.89c-2.32,1.87-5.72,3.82-8.46,5-16.51,7.12-39.56,9.67-56.82,16-11.63,1.93-22.17-3.95-26.76-14.9-4.03-9.62-7.73-31.38-10.1-42.53-2.32-10.9-6.62-21.78.52-31.81C9.09,3.41,15.22.62,23.91.18c16.3-.84,47.43,1.48,64.05,3.49,23.41,2.83,23.34,17.43,24.66,36.58.83,12.13,3.62,30.05-7.06,38.64Z" fill={activeTab === 'profile' ? '#0A6E3B' : '#F6F5F1'} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <User className={`w-4.5 h-4.5 ${activeTab === 'profile' ? 'text-white' : 'text-[#081A10]/60'}`} />
            </div>
          </div>
          <span className={`text-[9px] font-black ${activeTab === 'profile' ? 'text-[#0A6E3B]' : 'text-[#081A10]/70'}`}>
            Profil
          </span>
        </motion.button>


        </div>
      </div>


      {/* =========================================================================
          3. MODAL PRODUCT DETAIL (INSPIRÉ DE L'ÉCRAN "DETAILS" DES MAQUETTES)
         ========================================================================= */}
      <AnimatePresence>
        {selectedDish && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
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
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="relative z-10 w-full max-w-sm bg-white rounded-t-[36px] sm:rounded-3xl overflow-hidden shadow-2xl max-h-[85vh] flex flex-col"
            >
              {/* Header Image with close button */}
              <div className="relative h-56 w-full shrink-0 bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={selectedDish.image} alt={selectedDish.name} className="w-full h-full object-cover" />
                <button
                  onClick={() => setSelectedDish(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center text-xs backdrop-blur-xs shadow-md"
                >
                  ✕
                </button>
                <div className="absolute bottom-3 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 text-white text-[10px] font-bold backdrop-blur-md">
                  <span>Authentique Sénégalais</span>
                </div>
              </div>

              {/* Dish Content Details */}
              <div className="p-5 space-y-4 overflow-y-auto flex-1">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-black text-[#081A10]">{selectedDish.name}</h3>
                    <span className="text-base font-black text-[#0A6E3B]">{formatFCFA(selectedDish.price)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{selectedDish.description}</p>
                </div>

                {/* Nutrition / Spice meters */}
                <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                  <div className="p-2 rounded-xl bg-[#F4F7F4] border border-[#D8EADB]">
                    <span className="text-gray-400 block font-bold">Épices</span>
                    <span className="font-extrabold text-[#FF7824]">🌶️ Doux / Piment</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#F4F7F4] border border-[#D8EADB]">
                    <span className="text-gray-400 block font-bold">Cuisson</span>
                    <span className="font-extrabold text-[#0A6E3B]">🔥 Minute</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#F4F7F4] border border-[#D8EADB]">
                    <span className="text-gray-400 block font-bold">Temps</span>
                    <span className="font-extrabold text-[#081A10]">⏱️ 20 min</span>
                  </div>
                </div>

                {/* Quantity selector & Add CTA */}
                <div className="pt-2 flex items-center gap-3">
                  <div className="flex items-center bg-[#F4F7F4] rounded-2xl border border-[#D8EADB] p-1 shrink-0">
                    <button
                      onClick={() => setDishQuantity((q) => Math.max(1, q - 1))}
                      className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-xs font-black text-[#081A10] shadow-2xs"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-black">{dishQuantity}</span>
                    <button
                      onClick={() => setDishQuantity((q) => q + 1)}
                      className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-xs font-black text-[#081A10] shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={handleAddDishModal}
                    className="flex-1 py-3 rounded-2xl brand-gradient text-white text-xs font-black shadow-md flex items-center justify-between px-4 hover:opacity-95 transition-opacity"
                  >
                    <span>Ajouter au panier</span>
                    <span>{formatFCFA(selectedDish.price * dishQuantity)}</span>
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          4. MODAL FILTRE DES RESTAURANTS PAR LOCALITÉ (STYLE YANGO FOOD & YASSIR)
         ========================================================================= */}
      <AnimatePresence>
        {isNeighborhoodPickerOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNeighborhoodPickerOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative z-10 w-full max-w-sm bg-white rounded-t-[36px] sm:rounded-3xl p-5 space-y-3.5 shadow-2xl max-h-[85vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h3 className="text-sm font-black text-[#081A10]">Filtrer les restaurants par localité</h3>
                  <p className="text-[10px] text-gray-400">Position GPS en direct & secteurs de Dakar</p>
                </div>
                <button
                  onClick={() => setIsNeighborhoodPickerOpen(false)}
                  className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500 hover:bg-gray-200 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* 1-Click GPS Quick Location Button (Style Yango / Yassir) */}
              <motion.div
                whileTap={{ scale: 0.98 }}
                onClick={async () => {
                  try {
                    await requestClientGps();
                  } catch {}
                  setSelectedNeighborhood(clientNeighborhood || 'Malika');
                  setIsNeighborhoodPickerOpen(false);
                }}
                className="p-3.5 rounded-2xl bg-gradient-to-r from-[#064E2B] to-[#0A6E3B] text-white flex items-center justify-between cursor-pointer shadow-md"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                    <Navigation className="w-4 h-4 fill-white text-white animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-emerald-200 font-extrabold block">
                      Ma position GPS en direct
                    </span>
                    <h4 className="text-xs font-black">{clientNeighborhood || userLiveLocation} (Autour de moi)</h4>
                  </div>
                </div>
                <span className="text-[10px] bg-white/20 px-2.5 py-1 rounded-full font-black text-white shrink-0">
                  Activer GPS ➔
                </span>
              </motion.div>


              {/* Search for Locality / Neighborhood */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher une zone (ex: Yoff, Almadies, Plateau...)"
                  value={localitySearchQuery}
                  onChange={(e) => setLocalitySearchQuery(e.target.value)}
                  className="w-full pl-9 pr-7 py-2 bg-[#F4F7F4] border border-[#D8EADB] rounded-xl text-xs text-[#081A10] placeholder-gray-400 focus:bg-white focus:border-[#0A6E3B] focus:outline-hidden transition-colors"
                />
                {localitySearchQuery && (
                  <button
                    onClick={() => setLocalitySearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* List of Neighborhoods with live restaurant counters */}
              <div className="space-y-2 overflow-y-auto flex-1 max-h-[45vh] pr-0.5">
                {/* Option: Tout Dakar */}
                <div
                  onClick={() => {
                    setSelectedNeighborhood('Tous les quartiers');
                    setIsNeighborhoodPickerOpen(false);
                  }}
                  className={`p-3 rounded-2xl flex items-center justify-between cursor-pointer border transition-all ${
                    selectedNeighborhood === 'Tous les quartiers'
                      ? 'bg-[#E6F5EC] border-[#0A6E3B] text-[#0A6E3B] font-black shadow-2xs'
                      : 'bg-white border-[#D8EADB] text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">🌍</span>
                    <div>
                      <span className="text-xs font-bold block">Tous les quartiers de Dakar</span>
                      <span className="text-[10px] text-gray-400 font-medium">{restaurants.length} restaurants disponibles</span>
                    </div>
                  </div>
                  {selectedNeighborhood === 'Tous les quartiers' && (
                    <Check className="w-4 h-4 text-[#0A6E3B] shrink-0" />
                  )}
                </div>

                {/* Filtered Neighborhoods */}
                {DAKAR_NEIGHBORHOODS.filter((nh) => nh !== 'Tous les quartiers' && (localitySearchQuery === '' || nh.toLowerCase().includes(localitySearchQuery.toLowerCase()))).map((nh) => {
                  const isSel = selectedNeighborhood.toLowerCase() === nh.toLowerCase();
                  const count = restaurants.filter((r) => r.neighborhood.toLowerCase().includes(nh.toLowerCase())).length;
                  const isUserLocation = nh.toLowerCase() === 'ngor';

                  return (
                    <div
                      key={nh}
                      onClick={() => {
                        setSelectedNeighborhood(nh);
                        setIsNeighborhoodPickerOpen(false);
                      }}
                      className={`p-3 rounded-2xl flex items-center justify-between cursor-pointer border transition-all ${
                        isSel 
                          ? 'bg-[#E6F5EC] border-[#0A6E3B] text-[#0A6E3B] font-black shadow-2xs' 
                          : 'bg-white border-[#D8EADB] text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                          isSel ? 'bg-[#0A6E3B] text-white' : 'bg-gray-100 text-gray-500'
                        }`}>
                          <MapPin className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold">{nh}</span>
                            {isUserLocation && (
                              <span className="text-[8px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-md">
                                Ma position
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-gray-400 font-medium">
                            {count > 0 ? `${count} restaurant${count > 1 ? 's' : ''} • 20-30 min` : 'Livraison express disponible'}
                          </span>
                        </div>
                      </div>
                      {isSel && <Check className="w-4 h-4 text-[#0A6E3B] shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          4.5 NOTIFICATIONS CENTER MODAL (LIQUID GLASS & ALERTES LIVE)
         ========================================================================= */}
      <AnimatePresence>
        {isNotificationsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNotificationsOpen(false)}
              className="absolute inset-0 bg-black/65 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative z-10 w-full max-w-sm glass-panel-light rounded-[32px] p-5 space-y-4 shadow-2xl border border-white/90 overflow-hidden"
            >
              {/* Header Modal */}
              <div className="flex items-center justify-between border-b border-gray-100/80 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl brand-gradient text-white flex items-center justify-center shadow-xs">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#081A10]">Notifications</h3>
                    <p className="text-[10px] text-gray-500">Alertes en temps réel & promos</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsNotificationsOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-gray-500 hover:text-gray-800 flex items-center justify-center text-xs shadow-xs transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Notification Items List */}
              <div className="space-y-2.5 max-h-[60vh] overflow-y-auto no-scrollbar pr-0.5">
                
                {/* Notif 1 : Promo Thiéb */}
                <div className="bg-white/90 p-3 rounded-2xl border border-[#D8EADB] space-y-1.5 shadow-2xs hover:border-[#0A6E3B]/40 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-wider text-[#FF7824] bg-orange-50 px-2 py-0.5 rounded-full">
                      🔥 Offre Flash Dakar
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">Il y a 5 min</span>
                  </div>
                  <h4 className="font-black text-xs text-[#081A10]">
                    -20% sur les Thiébs aux Almadies
                  </h4>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    Profitez de réductions exclusives sur les plats traditionnels avec livraison offerte à partir de 5 000 FCFA.
                  </p>
                  <button
                    onClick={() => {
                      setIsNotificationsOpen(false);
                      setSelectedCat('cat-thieb');
                    }}
                    className="text-[11px] font-black text-[#0A6E3B] hover:underline flex items-center gap-1 pt-1"
                  >
                    <span>Voir les plats</span>
                    <span>➔</span>
                  </button>
                </div>

                {/* Notif 2 : Livreur à proximité */}
                <div className="bg-white/90 p-3 rounded-2xl border border-[#D8EADB] space-y-1.5 shadow-2xs hover:border-[#0A6E3B]/40 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-wider text-[#0A6E3B] bg-[#E6F5EC] px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Livreur Disponible
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">Il y a 12 min</span>
                  </div>
                  <h4 className="font-black text-xs text-[#081A10]">
                    6 livreurs actifs autour de vous
                  </h4>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    Ibrahima et Moussa patrouillent dans votre secteur pour une livraison en moins de 15 minutes.
                  </p>
                  <button
                    onClick={() => {
                      setIsNotificationsOpen(false);
                      setActiveTab('courier');
                    }}
                    className="text-[11px] font-black text-[#0A6E3B] hover:underline flex items-center gap-1 pt-1"
                  >
                    <span>Ouvrir le Radar GPS</span>
                    <span>➔</span>
                  </button>
                </div>

                {/* Notif 3 : Nouveau Resto Partenaire */}
                <div className="bg-white/90 p-3 rounded-2xl border border-[#D8EADB] space-y-1.5 shadow-2xs hover:border-[#0A6E3B]/40 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                      ✨ Nouveau Restaurant
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">Aujourd'hui</span>
                  </div>
                  <h4 className="font-black text-xs text-[#081A10]">
                    Bienvenue à « Chez Kamiss »
                  </h4>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    Découvrez leurs spécialités Yassa Poulet braisé et Dibi d'agneau authentique avec vue panoramique.
                  </p>
                  <button
                    onClick={() => {
                      setIsNotificationsOpen(false);
                      setActiveTab('menu');
                    }}
                    className="text-[11px] font-black text-[#0A6E3B] hover:underline flex items-center gap-1 pt-1"
                  >
                    <span>Explorer le menu</span>
                    <span>➔</span>
                  </button>
                </div>

              </div>

              {/* Action Button */}
              <button
                onClick={() => setIsNotificationsOpen(false)}
                className="w-full py-3 rounded-2xl brand-gradient text-white text-xs font-black shadow-md hover:brightness-110 transition-all cursor-pointer"
              >
                Compris
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          5. CART & CHECKOUT SHEET (INSPIRÉ DE L'ÉCRAN PAIEMENT DES MAQUETTES)
         ========================================================================= */}

      <AnimatePresence>
        {isCartSheetOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
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
              className="relative z-10 w-full max-w-sm bg-white rounded-t-[36px] sm:rounded-3xl p-5 space-y-4 shadow-2xl max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-[#0A6E3B]" />
                  <h3 className="text-sm font-black text-[#081A10]">Mon Panier Thiob</h3>
                </div>
                <button
                  onClick={() => setIsCartSheetOpen(false)}
                  className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500"
                >
                  ✕
                </button>
              </div>

              {checkoutStep === 'done' ? (
                <div className="text-center py-8 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-[#E6F5EC] text-[#0A6E3B] flex items-center justify-center mx-auto text-2xl">
                    ✓
                  </div>
                  <h4 className="text-base font-black text-[#081A10]">Commande Confirmée !</h4>
                  <p className="text-xs text-gray-500">
                    Votre Thiéb est en cours de préparation en cuisine. Un livreur Tiak-Tiak est en route.
                  </p>
                  <button
                    onClick={() => {
                      setIsCartSheetOpen(false);
                      if (activeTrackingOrder) onOpenTracking(activeTrackingOrder);
                    }}
                    className="w-full py-3 rounded-2xl brand-gradient text-white text-xs font-black shadow-md mt-2"
                  >
                    Suivre ma commande en direct ➔
                  </button>
                </div>
              ) : (
                <div className="space-y-4 overflow-y-auto flex-1">
                  {/* Cart items */}
                  {cart.length === 0 ? (
                    <div className="text-center py-10 space-y-2">
                      <span className="text-3xl">🍲</span>
                      <p className="font-bold text-xs text-gray-600">Votre panier est vide</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5 divide-y divide-gray-100">
                      {cart.map((it) => (
                        <div key={it.item.id} className="pt-2 flex items-center justify-between gap-3 text-xs">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={it.item.image} alt={it.item.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-[#081A10] truncate">{it.item.name}</h5>
                            <span className="text-[11px] font-black text-[#0A6E3B]">{formatFCFA(it.item.price * it.quantity)}</span>
                          </div>
                          <div className="flex items-center gap-1 bg-[#F4F7F4] rounded-xl p-1 border border-[#D8EADB]">
                            <button
                              onClick={() => updateCartQuantity(it.item.id, -1)}
                              className="w-5 h-5 bg-white rounded-md flex items-center justify-center text-xs font-bold"
                            >
                              -
                            </button>
                            <span className="w-5 text-center text-xs font-black">{it.quantity}</span>
                            <button
                              onClick={() => updateCartQuantity(it.item.id, 1)}
                              className="w-5 h-5 bg-white rounded-md flex items-center justify-center text-xs font-bold"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Payment method selector */}
                  {cart.length > 0 && (
                    <div className="space-y-3 pt-2 border-t border-gray-100">
                      <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider block">Mode de paiement</span>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'wave', label: 'Wave', color: 'bg-sky-500' },
                          { id: 'orange_money', label: 'Orange M.', color: 'bg-orange-500' },
                          { id: 'cash', label: 'Espèces', color: 'bg-emerald-600' },
                        ].map((pm) => (
                          <div
                            key={pm.id}
                            onClick={() => setPaymentMethod(pm.id as PaymentMethod)}
                            className={`p-2 rounded-xl text-center cursor-pointer border text-xs font-bold transition-all ${
                              paymentMethod === pm.id
                                ? 'border-[#0A6E3B] bg-[#E6F5EC] text-[#0A6E3B]'
                                : 'border-[#D8EADB] bg-white text-gray-600'
                            }`}
                          >
                            {pm.label}
                          </div>
                        ))}
                      </div>

                      {/* Recup Totals */}
                      <div className="bg-[#F4F7F4] p-3 rounded-2xl border border-[#D8EADB] space-y-1.5 text-xs">
                        <div className="flex justify-between text-gray-500">
                          <span>Sous-total</span>
                          <span>{formatFCFA(cartTotal)}</span>
                        </div>
                        <div className="flex justify-between text-gray-500">
                          <span>Livraison Tiak-Tiak</span>
                          <span>{formatFCFA(deliveryFee)}</span>
                        </div>
                        <div className="flex justify-between text-[#081A10] font-black text-sm pt-1 border-t border-gray-200">
                          <span>Total</span>
                          <span className="text-[#0A6E3B]">{formatFCFA(grandTotal)}</span>
                        </div>
                      </div>

                      <button
                        onClick={handleCheckout}
                        className="w-full py-3.5 rounded-2xl brand-gradient text-white text-xs font-black shadow-md flex items-center justify-between px-5 hover:opacity-95"
                      >
                        <span>Confirmer & Commander</span>
                        <span>{formatFCFA(grandTotal)}</span>
                      </button>
                    </div>
                  )}

                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          6. DEDICATED RESTAURANT DIGITAL SHOWCASE (VITRINE NUMÉRIQUE IMMERSIVE)
         ========================================================================= */}
      <AnimatePresence>
        {selectedShowcaseResto && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedShowcaseResto(null)}
              className="absolute inset-0 bg-black/70 backdrop-blur-xs"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="relative z-10 w-full max-w-md bg-white rounded-t-[36px] sm:rounded-3xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col"
            >
              
              {/* Showcase Cover Header with Hero Image & Back Button */}
              <div className="relative h-48 w-full shrink-0 bg-gray-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedShowcaseResto.coverImage}
                  alt={selectedShowcaseResto.name}
                  className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                {/* Top Actions: Close, Favorite */}
                <div className="absolute top-4 inset-x-4 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedShowcaseResto(null)}
                    className="w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center text-xs backdrop-blur-xs shadow-md active:scale-90"
                  >
                    ✕
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleFavoriteRestaurant(selectedShowcaseResto.id)}
                      className="w-8 h-8 rounded-full bg-white/90 text-gray-700 hover:text-rose-500 flex items-center justify-center text-xs shadow-md active:scale-90"
                    >
                      <Heart className={`w-4 h-4 ${favoriteRestaurantIds.includes(selectedShowcaseResto.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Restaurant Brand Identity in Cover */}
                <div className="absolute bottom-3 inset-x-4 flex items-end gap-3 text-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedShowcaseResto.logo}
                    alt={selectedShowcaseResto.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md shrink-0 bg-white"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-base font-black text-white leading-tight truncate">
                        {selectedShowcaseResto.name}
                      </h3>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    </div>
                    <p className="text-[10px] text-gray-200 line-clamp-1">{selectedShowcaseResto.tagline}</p>
                    <div className="flex items-center gap-2 text-[10px] text-emerald-300 pt-0.5 font-bold">
                      <span>⭐ {selectedShowcaseResto.rating} ({selectedShowcaseResto.reviewCount} avis)</span>
                      <span>•</span>
                      <span>📍 {selectedShowcaseResto.neighborhood}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Showcase Navigation Sub-Tabs */}
              <div className="flex bg-[#F4F7F4] border-b border-[#D8EADB] p-1 shrink-0 overflow-x-auto no-scrollbar">
                {[
                  { id: 'menu', label: '🍽️ Carte & Menu' },
                  { id: 'gallery', label: '📸 Galerie & Ambiance' },
                  { id: 'location', label: '📍 Localisation' },
                  { id: 'reviews', label: '⭐ Avis & Infos' },
                ].map((tab) => {
                  const isSel = showcaseSubTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setShowcaseSubTab(tab.id as any)}
                      className={`flex-1 min-w-[90px] py-2 rounded-xl text-xs font-black transition-all ${
                        isSel
                          ? 'bg-white text-[#0A6E3B] shadow-2xs border border-[#0A6E3B]/20'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Showcase Content Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
                
                {/* 1. SUB-TAB: MENU & CARTE DÉDIÉE AU RESTAURANT */}
                {showcaseSubTab === 'menu' && (() => {
                  const restoDishes = menuItems.filter((m) => m.restaurantId === selectedShowcaseResto.id);

                  return (
                    <div className="space-y-4">
                      {/* Header info badge */}
                      <div className="bg-[#E6F5EC] p-3 rounded-2xl border border-[#0A6E3B]/20 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-[#081A10]">Commandez en ligne ou sur place</span>
                          <p className="text-[10px] text-gray-500">Livraison Tiak-Tiak en {selectedShowcaseResto.deliveryTimeEstimate || '25 min'}</p>
                        </div>
                        <span className="text-[10px] font-black text-[#0A6E3B] bg-white px-2.5 py-1 rounded-full shadow-2xs">
                          {selectedShowcaseResto.priceRange || '2500 - 6000 FCFA'}
                        </span>
                      </div>

                      {/* Menu Items List */}
                      {restoDishes.length === 0 ? (
                        <div className="p-6 text-center bg-gray-50 rounded-2xl border border-gray-200 text-gray-500 text-xs">
                          <p className="font-bold">Aucun plat publié pour le moment</p>
                          <p className="text-[10px] text-gray-400 mt-1">Le menu de cet établissement sera bientôt disponible.</p>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {restoDishes.map((dish) => {
                            const isAvailable = dish.isAvailable !== false;
                            return (
                              <div
                                key={dish.id}
                                onClick={() => {
                                  if (isAvailable) {
                                    setSelectedDish(dish);
                                    setDishQuantity(1);
                                  }
                                }}
                                className={`bg-white p-3 rounded-2xl border border-[#D8EADB] flex items-center justify-between gap-3 shadow-2xs transition-all ${
                                  isAvailable ? 'cursor-pointer hover:border-[#0A6E3B] group' : 'opacity-60 cursor-not-allowed'
                                }`}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={dish.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'}
                                  alt={dish.name}
                                  className="w-16 h-16 rounded-xl object-cover shrink-0 group-hover:scale-105 transition-transform bg-gray-100"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <h5 className="font-bold text-xs text-[#081A10] truncate">{dish.name}</h5>
                                    {isAvailable ? (
                                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-md">
                                        Disponible
                                      </span>
                                    ) : (
                                      <span className="text-[9px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded-md">
                                        Épuisé
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-gray-400 line-clamp-1">{dish.description}</p>
                                  <span className="text-xs font-black text-[#0A6E3B] mt-0.5 block">{formatFCFA(dish.price)}</span>
                                </div>
                                {isAvailable ? (
                                  <button
                                    onClick={(e) => handleQuickAdd(dish, e)}
                                    className="w-8 h-8 rounded-full bg-[#0A6E3B] text-white flex items-center justify-center text-xs font-black shadow-2xs shrink-0 hover:bg-[#064E2B] active:scale-90"
                                  >
                                    +
                                  </button>
                                ) : (
                                  <span className="text-[10px] font-bold text-gray-400 px-2 py-1 bg-gray-100 rounded-lg">
                                    Épuisé
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* 2. SUB-TAB: GALERIE & AMBIANCE */}
                {showcaseSubTab === 'gallery' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-xs text-[#081A10] uppercase">
                        Ambiance, Décoration & Terrasse ({selectedShowcaseResto.gallery?.length || 0} photos)
                      </h4>
                    </div>

                    {(!selectedShowcaseResto.gallery || selectedShowcaseResto.gallery.length === 0) ? (
                      <div className="p-6 text-center bg-gray-50 rounded-2xl border border-gray-200 text-gray-500 text-xs">
                        <p className="font-bold">Aucune photo de galerie pour le moment</p>
                        <p className="text-[10px] text-gray-400 mt-1">Cet établissement n'a pas encore téléversé de photos d'ambiance.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2.5">
                        {selectedShowcaseResto.gallery.map((imgUrl, i) => (
                          <div
                            key={i}
                            onClick={() => setSelectedGalleryImage(imgUrl)}
                            className="relative aspect-4/3 rounded-2xl overflow-hidden bg-gray-100 shadow-2xs cursor-pointer group"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={imgUrl}
                              alt={`${selectedShowcaseResto.name} photo ${i + 1}`}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                            <div className="absolute bottom-1.5 left-2 text-[9px] text-white font-bold drop-shadow-sm bg-black/40 px-1.5 py-0.2 rounded-md backdrop-blur-xs">
                              {i === 0 ? 'Façade' : i === 1 ? 'Terrasse' : i === 2 ? 'Intérieur' : 'Ambiance'}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Ambiance Highlights */}
                    {selectedShowcaseResto.amenities && selectedShowcaseResto.amenities.length > 0 && (
                      <div className="bg-[#F4F7F4] p-3.5 rounded-2xl border border-[#D8EADB] space-y-2">
                        <h5 className="text-xs font-black text-[#081A10]">Points forts de l'établissement</h5>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedShowcaseResto.amenities.map((amenity, idx) => (
                            <span key={idx} className="px-2.5 py-1 rounded-xl bg-white border border-[#D8EADB] text-xs font-bold text-[#081A10]">
                              ✨ {amenity}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}


                {/* 3. SUB-TAB: LOCALISATION & ACCÈS ULTRA-PRÉCIS */}
                {showcaseSubTab === 'location' && (() => {
                  const restoCoords = selectedShowcaseResto.coordinates || (selectedShowcaseResto.latitude && selectedShowcaseResto.longitude ? { lat: selectedShowcaseResto.latitude, lng: selectedShowcaseResto.longitude } : DAKAR_GEO_PRESETS[selectedShowcaseResto.neighborhood] || DAKAR_DEFAULT_COORDS);
                  const userOrigin = clientCoords || DAKAR_GEO_PRESETS[userLiveLocation] || DAKAR_DEFAULT_COORDS;
                  const distanceVal = calculateDistanceKm(userOrigin, restoCoords);
                  const distanceFormatted = formatDistanceString(distanceVal);

                  const showcaseMarkers: any[] = [
                    {
                      id: `resto-pin-${selectedShowcaseResto.id}`,
                      lat: restoCoords.lat,
                      lng: restoCoords.lng,
                      type: 'restaurant',
                      title: selectedShowcaseResto.name,
                      subtitle: selectedShowcaseResto.address,
                      statusText: `📍 ${selectedShowcaseResto.neighborhood}`,
                    },
                  ];

                  if (clientCoords) {
                    showcaseMarkers.push({
                      id: 'client-live-beacon',
                      lat: clientCoords.lat,
                      lng: clientCoords.lng,
                      type: 'client',
                      title: 'Votre Position GPS',
                      subtitle: clientAddress,
                      statusText: `Précision ± ${Math.round(clientAccuracy)}m`,
                    });
                  }

                  return (
                    <div className="space-y-3.5">
                      {/* Location Box with Real-Time Distance from User */}
                      <div className="bg-[#E6F5EC] p-3.5 rounded-2xl border border-[#0A6E3B]/20 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-[#0A6E3B] shrink-0 mt-0.5" />
                            <div>
                              <span className="text-[10px] text-gray-500 font-bold block">Où nous trouver ?</span>
                              <h5 className="font-black text-xs text-[#081A10]">{selectedShowcaseResto.name}</h5>
                              <p className="text-[11px] text-gray-600">{selectedShowcaseResto.address}, {selectedShowcaseResto.neighborhood}</p>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-[#0A6E3B] text-white font-black text-[10px] shrink-0">
                            À {distanceFormatted} de vous
                          </span>
                        </div>

                        <div className="pt-2 border-t border-[#0A6E3B]/20 grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-white p-2 rounded-xl border border-[#0A6E3B]/10">
                            <span className="text-[9px] text-gray-400 block font-bold">Votre zone</span>
                            <span className="font-black text-[#0A6E3B]">{clientNeighborhood || userLiveLocation}</span>
                          </div>
                          <div className="bg-white p-2 rounded-xl border border-[#0A6E3B]/10">
                            <span className="text-[9px] text-gray-400 block font-bold">Coordonnées fixes</span>
                            <span className="font-mono text-[10px] text-[#081A10] font-bold">{restoCoords.lat.toFixed(4)}, {restoCoords.lng.toFixed(4)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Interactive Leaflet Map on Street Level */}
                      <div className="rounded-2xl overflow-hidden border border-[#D8EADB] shadow-sm relative">
                        <ThiobMap
                          center={restoCoords}
                          zoom={14}
                          markers={showcaseMarkers}
                          height="180px"
                        />
                      </div>

                      {/* Action Buttons: Full Screen Map & Navigation GPS */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setIsFullScreenLocationOpen(true)}
                          className="py-2.5 px-3 rounded-xl bg-[#F4F7F4] border border-[#D8EADB] text-[#081A10] font-black text-xs flex items-center justify-center gap-1.5 hover:bg-gray-100 transition-colors shadow-2xs"
                        >
                          <span>🗺️ Voir en grand</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const { openInExternalMaps } = require('@/lib/geolocation');
                            openInExternalMaps(
                              restoCoords.lat,
                              restoCoords.lng,
                              selectedShowcaseResto.name,
                              clientCoords?.lat,
                              clientCoords?.lng
                            );
                          }}
                          className="py-2.5 px-3 rounded-xl brand-gradient text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md hover:opacity-95 transition-opacity"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>🧭 Itinéraire</span>
                        </button>
                      </div>

                    </div>
                  );
                })()}


                {/* 4. SUB-TAB: AVIS, INFOS & CONTACT DIRECT */}
                {showcaseSubTab === 'reviews' && (
                  <div className="space-y-4">
                    
                    {/* Direct Contact & WhatsApp card */}
                    <div className="bg-[#E6F5EC] p-3.5 rounded-2xl border border-[#0A6E3B]/20 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-gray-500 block">Contact Établissement</span>
                          <h5 className="font-black text-xs text-[#081A10]">Appel & WhatsApp Direct</h5>
                        </div>
                        {selectedShowcaseResto.ownerName && (
                          <span className="text-[10px] font-bold text-[#0A6E3B] bg-white px-2 py-0.5 rounded-lg border border-[#0A6E3B]/20">
                            Chef : {selectedShowcaseResto.ownerName}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <a
                          href={`tel:${selectedShowcaseResto.phone}`}
                          className="py-2.5 px-3 rounded-xl bg-white border border-[#0A6E3B]/30 text-[#0A6E3B] font-black text-xs flex items-center justify-center gap-1.5 shadow-2xs hover:bg-[#0A6E3B] hover:text-white transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Appeler</span>
                        </a>

                        <a
                          href={`https://wa.me/${(selectedShowcaseResto.whatsapp || selectedShowcaseResto.phone).replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2.5 px-3 rounded-xl bg-[#25D366] text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-2xs hover:opacity-95 transition-opacity"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                      <span className="text-[10px] text-gray-500 block text-center font-mono">
                        {selectedShowcaseResto.phone}
                      </span>
                    </div>

                    {/* About & Description */}
                    <div className="bg-white p-3.5 rounded-2xl border border-[#D8EADB] space-y-2">
                      <h5 className="font-black text-xs text-[#081A10]">À propos de l'établissement</h5>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {selectedShowcaseResto.description}
                      </p>
                    </div>

                    {/* Opening hours card */}
                    <div className="bg-white p-3.5 rounded-2xl border border-[#D8EADB] space-y-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#0A6E3B]" />
                        <h5 className="font-black text-xs text-[#081A10]">Horaires d'ouverture</h5>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1 divide-y divide-gray-100 pt-1">
                        {selectedShowcaseResto.openingHours && typeof selectedShowcaseResto.openingHours === 'object' ? (
                          Object.entries(selectedShowcaseResto.openingHours).map(([days, hours], idx) => (
                            <div key={idx} className="flex justify-between py-1">
                              <span>{days}</span>
                              <span className="font-bold text-[#081A10]">{hours}</span>
                            </div>
                          ))
                        ) : (
                          <div className="flex justify-between py-1">
                            <span>Lundi - Dimanche</span>
                            <span className="font-bold text-[#081A10]">11h30 - 23h30</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Customer reviews */}
                    <div className="space-y-2.5">
                      <h5 className="font-black text-xs text-[#081A10]">Avis clients vérifiés ⭐ {selectedShowcaseResto.rating} ({selectedShowcaseResto.reviewCount} avis)</h5>
                      {selectedShowcaseResto.reviews && selectedShowcaseResto.reviews.length > 0 ? (
                        selectedShowcaseResto.reviews.map((rev) => (
                          <div key={rev.id} className="bg-[#F4F7F4] p-3 rounded-2xl border border-[#D8EADB] space-y-1">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-black text-[#081A10]">{rev.author}</span>
                              <span className="text-[10px] text-gray-400">{rev.date}</span>
                            </div>
                            <p className="text-xs text-gray-600 leading-relaxed">{rev.comment}</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-xl text-center text-xs text-gray-400">
                          Aucun avis pour le moment
                        </div>
                      )}
                    </div>
                  </div>
                )}


              </div>

              {/* Fixed Bottom Action Dock on Showcase (Commander / Réserver / Sortie) */}
              <div className="absolute bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-[#D8EADB] p-3 flex items-center gap-2 shadow-2xl z-20">
                <button
                  onClick={() => {
                    handleOpenReservation(selectedShowcaseResto);
                  }}
                  className="flex-1 py-3 rounded-2xl bg-[#E6F5EC] border border-[#0A6E3B]/30 text-[#0A6E3B] text-xs font-black shadow-xs flex items-center justify-center gap-1.5 hover:bg-[#d5eedf] transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Réserver une table</span>
                </button>

                <button
                  onClick={() => {
                    handleOpenOuting(selectedShowcaseResto);
                  }}
                  className="px-3 py-3 rounded-2xl bg-[#F4F7F4] border border-[#D8EADB] text-gray-700 text-xs font-bold hover:bg-gray-100 flex items-center gap-1"
                  title="Programmer une sortie"
                >
                  <Heart className="w-3.5 h-3.5 text-[#0A6E3B]" />
                  <span>Sortie</span>
                </button>

                <button
                  onClick={() => {
                    setShowcaseSubTab('menu');
                  }}
                  className="flex-1 py-3 rounded-2xl brand-gradient text-white text-xs font-black shadow-md flex items-center justify-center gap-1.5 hover:opacity-95"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Commander</span>
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          7. TABLE RESERVATION MODAL (RÉSERVER UNE TABLE AUX ALMADIES / NGOR / DAKAR)
         ========================================================================= */}
      <AnimatePresence>
        {isReservationModalOpen && reservationResto && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReservationModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative z-10 w-full max-w-sm bg-white rounded-t-[36px] sm:rounded-3xl p-5 space-y-4 shadow-2xl max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#E6F5EC] text-[#0A6E3B] flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#081A10]">Réserver une table</h3>
                    <p className="text-[10px] text-gray-400">{reservationResto.name} • {reservationResto.neighborhood}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsReservationModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500"
                >
                  ✕
                </button>
              </div>

              {/* If already confirmed */}
              {confirmedReservationCode ? (
                <div className="text-center py-6 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-[#E6F5EC] text-[#0A6E3B] flex items-center justify-center mx-auto text-xl font-black">
                    ✓
                  </div>
                  <h4 className="text-base font-black text-[#081A10]">Table Réservée avec Succès !</h4>
                  <div className="bg-[#F4F7F4] p-3 rounded-2xl border border-[#D8EADB] text-xs space-y-1">
                    <p className="font-bold text-[#081A10]">{reservationResto.name}</p>
                    <p className="text-gray-500">{reservationDate} à {reservationTime} • {reservationGuests} personnes</p>
                    <span className="text-[11px] font-mono font-black text-[#0A6E3B] block pt-1">
                      Numéro : {confirmedReservationCode}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Le restaurant a bien reçu votre demande et vous attend avec la Teranga sénégalaise.
                  </p>
                  <button
                    onClick={() => {
                      setIsReservationModalOpen(false);
                      setActiveTab('favorites');
                      setFavoritesSubTab('outings');
                    }}
                    className="w-full py-3 rounded-2xl brand-gradient text-white text-xs font-black shadow-md"
                  >
                    Voir dans Mes Sorties & Tables ➔
                  </button>
                </div>
              ) : (
                <div className="space-y-3.5 overflow-y-auto flex-1">
                  
                  {/* Number of guests */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider block">Nombre de convives</span>
                    <div className="grid grid-cols-4 gap-2">
                      {[1, 2, 4, 6].map((count) => (
                        <button
                          key={count}
                          type="button"
                          onClick={() => setReservationGuests(count)}
                          className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                            reservationGuests === count
                              ? 'bg-[#0A6E3B] text-white border-[#0A6E3B] shadow-xs'
                              : 'bg-[#F4F7F4] text-gray-700 border-[#D8EADB]'
                          }`}
                        >
                          {count === 2 ? '2 (Couple)' : `${count} pers.`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Date choice */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider block">Date</span>
                    <div className="grid grid-cols-2 gap-2">
                      {['Ce soir', 'Demain soir', 'Samedi 5 Sept', 'Dimanche 6 Sept'].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setReservationDate(d)}
                          className={`py-2 px-2 rounded-xl text-xs font-bold border text-left truncate transition-all ${
                            reservationDate === d
                              ? 'bg-[#E6F5EC] text-[#0A6E3B] border-[#0A6E3B]'
                              : 'bg-white text-gray-700 border-[#D8EADB]'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time slots */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider block">Heure souhaitée</span>
                    <div className="grid grid-cols-4 gap-2">
                      {['12:30', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30'].map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setReservationTime(slot)}
                          className={`py-1.5 rounded-xl text-xs font-bold border text-center transition-all ${
                            reservationTime === slot
                              ? 'bg-[#0A6E3B] text-white border-[#0A6E3B]'
                              : 'bg-[#F4F7F4] text-gray-700 border-[#D8EADB]'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Occasion tag */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider block">Occasion</span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        '❤️ Sortie avec ma copine',
                        '🎂 Anniversaire',
                        '💼 Repas d\'affaires',
                        '👨‍👩‍👧‍👦 Famille',
                        '🥂 Sortie entre amis',
                      ].map((occ) => (
                        <button
                          key={occ}
                          type="button"
                          onClick={() => setReservationOccasion(occ)}
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all ${
                            reservationOccasion === occ
                              ? 'bg-[#FF7824] text-white border-[#FF7824]'
                              : 'bg-white text-gray-600 border-[#D8EADB]'
                          }`}
                        >
                          {occ}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Special Note */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider block">Précisions (Optionnel)</span>
                    <input
                      type="text"
                      placeholder="Ex: Table en terrasse face au coucher de soleil"
                      value={reservationNotes}
                      onChange={(e) => setReservationNotes(e.target.value)}
                      className="w-full p-2.5 bg-[#F4F7F4] border border-[#D8EADB] rounded-xl text-xs text-[#081A10] focus:bg-white focus:border-[#0A6E3B] focus:outline-hidden"
                    />
                  </div>

                  {/* Submit CTA */}
                  <button
                    onClick={handleConfirmReservation}
                    className="w-full py-3.5 rounded-2xl brand-gradient text-white text-xs font-black shadow-md mt-2 flex items-center justify-between px-4 hover:opacity-95"
                  >
                    <span>Confirmer la réservation</span>
                    <span>{reservationGuests} convives ➔</span>
                  </button>

                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          8. OUTING PLANNER MODAL (PROGRAMMER UNE SORTIE)
         ========================================================================= */}
      <AnimatePresence>
        {isOutingModalOpen && outingResto && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOutingModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative z-10 w-full max-w-sm bg-white rounded-t-[36px] sm:rounded-3xl p-5 space-y-4 shadow-2xl max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#E6F5EC] text-[#0A6E3B] flex items-center justify-center">
                    <Heart className="w-4 h-4 fill-[#0A6E3B]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#081A10]">Programmer une sortie</h3>
                    <p className="text-[10px] text-gray-400">{outingResto.name} • {outingResto.neighborhood}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOutingModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 overflow-y-auto flex-1 text-xs">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500">Titre de la sortie</label>
                  <input
                    type="text"
                    value={outingTitle}
                    onChange={(e) => setOutingTitle(e.target.value)}
                    className="w-full p-2.5 bg-[#F4F7F4] border border-[#D8EADB] rounded-xl font-bold text-[#081A10]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500">Date prévue</label>
                  <input
                    type="text"
                    value={outingDate}
                    onChange={(e) => setOutingDate(e.target.value)}
                    className="w-full p-2.5 bg-[#F4F7F4] border border-[#D8EADB] rounded-xl font-bold text-[#081A10]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500">Notes & Idées (Ex: Prendre la table coucher de soleil)</label>
                  <textarea
                    rows={3}
                    value={outingNotes}
                    onChange={(e) => setOutingNotes(e.target.value)}
                    placeholder="Tester le Thiébou jeun royal et les cocktails au crépuscule..."
                    className="w-full p-2.5 bg-[#F4F7F4] border border-[#D8EADB] rounded-xl text-xs text-[#081A10]"
                  />
                </div>

                <button
                  onClick={handleConfirmOuting}
                  className="w-full py-3 rounded-2xl brand-gradient text-white font-black text-xs shadow-md mt-2"
                >
                  Enregistrer dans Mes Sorties ➔
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          9. FULL SCREEN IMAGE VIEWER
         ========================================================================= */}
      <AnimatePresence>
        {selectedGalleryImage && (
          <div
            onClick={() => setSelectedGalleryImage(null)}
            className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          >
            <div className="relative max-w-lg w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedGalleryImage}
                alt="Ambiance restaurant Dakar"
                className="w-full h-auto max-h-[80vh] rounded-3xl object-contain shadow-2xl border border-white/10"
              />
              <button
                onClick={() => setSelectedGalleryImage(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          10. FULL SCREEN RESTAURANT LOCATION MODAL (CARTE PLEIN ÉCRAN & ITINÉRAIRE)
         ========================================================================= */}
      <AnimatePresence>
        {isFullScreenLocationOpen && selectedShowcaseResto && (() => {
          const restoCoords = selectedShowcaseResto.coordinates || (selectedShowcaseResto.latitude && selectedShowcaseResto.longitude ? { lat: selectedShowcaseResto.latitude, lng: selectedShowcaseResto.longitude } : DAKAR_GEO_PRESETS[selectedShowcaseResto.neighborhood] || DAKAR_DEFAULT_COORDS);
          const userOrigin = clientCoords || DAKAR_GEO_PRESETS[userLiveLocation] || DAKAR_DEFAULT_COORDS;
          const exactDistance = calculateDistanceKm(userOrigin, restoCoords);

          const fullScreenMarkers: any[] = [
            {
              id: `resto-full-${selectedShowcaseResto.id}`,
              lat: restoCoords.lat,
              lng: restoCoords.lng,
              type: 'restaurant',
              title: selectedShowcaseResto.name,
              subtitle: selectedShowcaseResto.address,
              statusText: `📍 ${selectedShowcaseResto.neighborhood}`,
            },
          ];

          if (clientCoords) {
            fullScreenMarkers.push({
              id: 'client-full-beacon',
              lat: clientCoords.lat,
              lng: clientCoords.lng,
              type: 'client',
              title: 'Vous êtes ici',
              subtitle: clientAddress,
              statusText: `Précision ± ${Math.round(clientAccuracy)}m`,
            });
          }

          return (
            <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                className="relative bg-white w-full max-w-md rounded-t-[36px] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              >
                {/* Header */}
                <div className="p-4 brand-gradient text-white flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-200 block">Emplacement Exact</span>
                    <h3 className="text-base font-black truncate">{selectedShowcaseResto.name}</h3>
                    <p className="text-xs text-white/80">{selectedShowcaseResto.address}, {selectedShowcaseResto.neighborhood}</p>
                  </div>
                  <button
                    onClick={() => setIsFullScreenLocationOpen(false)}
                    className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center text-xs hover:bg-white/30"
                  >
                    ✕
                  </button>
                </div>

                {/* Distance & Info Strip */}
                <div className="p-3 bg-[#E6F5EC] border-b border-[#D8EADB] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0A6E3B] animate-ping" />
                    <span className="font-bold text-[#081A10]">Distance : <strong className="text-[#0A6E3B] font-black">{formatDistanceString(exactDistance)}</strong></span>
                  </div>
                  <span className="text-[10px] font-mono text-gray-500 font-bold">
                    GPS: {restoCoords.lat.toFixed(5)}, {restoCoords.lng.toFixed(5)}
                  </span>
                </div>

                {/* Full Screen Interactive Leaflet Map */}
                <div className="h-72 w-full relative">
                  <ThiobMap
                    center={restoCoords}
                    zoom={15}
                    markers={fullScreenMarkers}
                    height="100%"
                  />
                </div>

                {/* Navigation CTA footer */}
                <div className="p-4 bg-white border-t border-gray-100 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const { openInExternalMaps } = require('@/lib/geolocation');
                      openInExternalMaps(
                        restoCoords.lat,
                        restoCoords.lng,
                        selectedShowcaseResto.name,
                        clientCoords?.lat,
                        clientCoords?.lng
                      );
                    }}
                    className="flex-1 py-3 rounded-2xl brand-gradient text-white font-black text-xs shadow-md flex items-center justify-center gap-2"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>Ouvrir l'Itinéraire (Maps / Waze)</span>
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

    </div>
  );
}


// =========================================================================
// 2. MOBILE APP RESTAURANT VIEW (Cuisine Dashboard & Vitrine Pro)
// =========================================================================
function MobileRestaurantApp({ onLogout }: { onLogout?: () => void }) {
  const { 
    orders, 
    updateOrderStatus, 
    reservations, 
    restaurants, 
    menuItems, 
    updateRestaurantShowcase,
    updateCurrentRestaurant,
    toggleMenuItemAvailability,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    currentRestaurant,
  } = useApp();

  const [mobileMode, setMobileMode] = useState<'vitrine' | 'dashboard'>('vitrine');
  const [restoTab, setRestoTab] = useState<'showcase' | 'orders' | 'reservations' | 'menu' | 'stats'>('showcase');
  const [isServiceActive, setIsServiceActive] = useState(true);
  const [vitrineCategory, setVitrineCategory] = useState('all');
  
  // Table reservation assignment state
  const [assignedTables, setAssignedTables] = useState<{ [resId: string]: string }>({
    'res-1': 'Table 4 (Terrasse Vue Mer)',
    'res-2': 'Table 12 (Salon VIP Climatisation)',
  });

  // Client Preview Modal for Restaurant Manager
  const [isPreviewClientModalOpen, setIsPreviewClientModalOpen] = useState(false);

  // Vitrine Customization Modals & States
  const [isEditGeneralModalOpen, setIsEditGeneralModalOpen] = useState(false);
  const [isEditCoverModalOpen, setIsEditCoverModalOpen] = useState(false);
  const [isEditLogoModalOpen, setIsEditLogoModalOpen] = useState(false);
  const [isAddGalleryPhotoModalOpen, setIsAddGalleryPhotoModalOpen] = useState(false);
  const [isManageTagsModalOpen, setIsManageTagsModalOpen] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  // Edit general info form state
  const [editName, setEditName] = useState('');
  const [editTagline, setEditTagline] = useState('');
  const [editPriceRange, setEditPriceRange] = useState('');
  const [editHours, setEditHours] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editNeighborhood, setEditNeighborhood] = useState('');
  const [editPhone, setEditPhone] = useState('');

  // Gallery photo state
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoLabel, setNewPhotoLabel] = useState('Terrasse Panoramique');

  // New tag input
  const [customTagInput, setCustomTagInput] = useState('');

  // New Dish modal state
  const [isAddDishModalOpen, setIsAddDishModalOpen] = useState(false);
  const [newDishName, setNewDishName] = useState('');
  const [newDishCategory, setNewDishCategory] = useState('cat-thieb');
  const [newDishPrice, setNewDishPrice] = useState(4000);
  const [newDishDesc, setNewDishDesc] = useState('');
  const [newDishImage, setNewDishImage] = useState('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80');

  // Active restaurant: Strictly the logged-in restaurant (persisted and dynamic)
  const currentResto = currentRestaurant;
  const myOrders = orders.filter((o) => o.restaurantId === currentResto.id);
  const myReservations = reservations.filter((res) => res.restaurantId === currentResto.id || res.restaurantName.toLowerCase().includes(currentResto.name.toLowerCase()));
  const myDishes = menuItems.filter((d) => d.restaurantId === currentResto.id);

  // Sync edit form on restaurant select or modal open
  const openEditGeneralModal = () => {
    setEditName(currentResto.name);
    setEditTagline(currentResto.tagline || '');
    setEditPriceRange(currentResto.priceRange || '2 500 - 6 500 FCFA');
    setEditHours(typeof currentResto.openingHours === 'string' ? currentResto.openingHours : '11h30 - 23h30 (7j/7)');
    setEditAddress(currentResto.address);
    setEditNeighborhood(currentResto.neighborhood);
    setEditPhone(currentResto.phone || '+221 77 000 00 00');
    setIsEditGeneralModalOpen(true);
  };

  const handleSaveGeneralInfo = (e: React.FormEvent) => {
    e.preventDefault();
    updateRestaurantShowcase(currentResto.id, {
      name: editName,
      tagline: editTagline,
      priceRange: editPriceRange,
      openingHours: editHours,
      address: editAddress,
      neighborhood: editNeighborhood,
      phone: editPhone,
    });
    setIsEditGeneralModalOpen(false);
    triggerSuccessFeedback('Informations générales mises à jour avec succès !');
  };

  const triggerSuccessFeedback = (msg: string) => {
    setSaveFeedback(msg);
    setTimeout(() => setSaveFeedback(null), 3000);
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#064E2B', '#0A6E3B', '#10B981']
      });
    } catch {}
  };

  // Helper for reading files directly from phone gallery
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (dataUrl: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          callback(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadCoverFromPhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(e, (dataUrl) => {
      updateRestaurantShowcase(currentResto.id, { coverImage: dataUrl });
      setIsEditCoverModalOpen(false);
      triggerSuccessFeedback('Photo de couverture importée depuis votre galerie !');
    });
  };

  const handleUploadLogoFromPhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(e, (dataUrl) => {
      updateRestaurantShowcase(currentResto.id, { logo: dataUrl });
      setIsEditLogoModalOpen(false);
      triggerSuccessFeedback('Logo importé depuis votre galerie !');
    });
  };

  const handleUploadGalleryFromPhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(e, (dataUrl) => {
      const currentGallery = currentResto.gallery || [];
      updateRestaurantShowcase(currentResto.id, {
        gallery: [dataUrl, ...currentGallery],
      });
      setIsAddGalleryPhotoModalOpen(false);
      triggerSuccessFeedback('Photo de votre restaurant ajoutée à la galerie !');
    });
  };

  const handleUploadDishPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(e, (dataUrl) => {
      setNewDishImage(dataUrl);
    });
  };

  const handleSelectCover = (imgUrl: string) => {
    updateRestaurantShowcase(currentResto.id, { coverImage: imgUrl });
    setIsEditCoverModalOpen(false);
    triggerSuccessFeedback('Photo de couverture mise à jour !');
  };

  const handleSelectLogo = (logoUrl: string) => {
    updateRestaurantShowcase(currentResto.id, { logo: logoUrl });
    setIsEditLogoModalOpen(false);
    triggerSuccessFeedback('Logo du restaurant mis à jour !');
  };

  const handleAddGalleryPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoUrl) return;
    const currentGallery = currentResto.gallery || [];
    updateRestaurantShowcase(currentResto.id, {
      gallery: [newPhotoUrl, ...currentGallery]
    });
    setNewPhotoUrl('');
    setIsAddGalleryPhotoModalOpen(false);
    triggerSuccessFeedback('Nouvelle photo ajoutée à la galerie !');
  };

  const handleDeleteGalleryPhoto = (indexToDelete: number) => {
    const currentGallery = currentResto.gallery || [];
    const updated = currentGallery.filter((_, i) => i !== indexToDelete);
    updateRestaurantShowcase(currentResto.id, { gallery: updated });
    triggerSuccessFeedback('Photo retirée de la galerie.');
  };

  const handleToggleAmenity = (amenity: string) => {
    const currentAmenities = currentResto.amenities || [];
    let updated: string[];
    if (currentAmenities.includes(amenity)) {
      updated = currentAmenities.filter((a) => a !== amenity);
    } else {
      updated = [...currentAmenities, amenity];
    }
    updateRestaurantShowcase(currentResto.id, { amenities: updated });
  };

  const handleAddTag = (tag: string) => {
    if (!tag.trim()) return;
    const currentTags = currentResto.ambianceTags || [];
    if (!currentTags.includes(tag.trim())) {
      updateRestaurantShowcase(currentResto.id, {
        ambianceTags: [...currentTags, tag.trim()]
      });
      triggerSuccessFeedback(`Badge "${tag.trim()}" ajouté !`);
    }
    setCustomTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = currentResto.ambianceTags || [];
    updateRestaurantShowcase(currentResto.id, {
      ambianceTags: currentTags.filter((t) => t !== tagToRemove)
    });
  };

  // Stats calculation
  const totalRevenue = myOrders
    .filter((o) => o.status !== 'cancelled')
    .reduce((acc, o) => acc + o.subtotal, 0);

  const pendingOrders = myOrders.filter((o) => o.status === 'pending' || o.status === 'accepted');
  const preparingOrders = myOrders.filter((o) => o.status === 'preparing');
  const readyOrders = myOrders.filter((o) => o.status === 'ready_for_pickup' || o.status === 'in_transit');
  const deliveredOrders = myOrders.filter((o) => o.status === 'delivered');

  const handleAddDish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDishName) return;
    addMenuItem({
      restaurantId: currentResto.id,
      name: newDishName,
      category: newDishCategory,
      price: Number(newDishPrice),
      description: newDishDesc || 'Préparé avec les ingrédients frais du terroir sénégalais.',
      image: newDishImage,
      isAvailable: true,
      preparationTimeMinutes: 25,
      isPopular: true,
    });
    setNewDishName('');
    setNewDishDesc('');
    setIsAddDishModalOpen(false);
    triggerSuccessFeedback('Nouveau plat ajouté au menu avec succès !');
  };

  const handleAssignTable = (resId: string, tableName: string) => {
    setAssignedTables((prev) => ({ ...prev, [resId]: tableName }));
  };

  // Preset covers & logos for quick picker
  const presetCovers = [
    { label: 'Terrasse Mer Almadies', url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Ngor Sunset Lounge', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Plateau Chic Gastronomie', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Teranga Sénégal Gourmande', url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Dibi Grillades en plein air', url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Jardin Cosy & Végétal', url: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1200&q=80' },
  ];

  const presetLogos = [
    { label: 'Kamiss Gourmet Gold', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80' },
    { label: 'Thiéb Royal Sceau', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=300&q=80' },
    { label: 'Teranga Dakar Emblème', url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=300&q=80' },
    { label: 'Almadies Ocean Club', url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=300&q=80' },
    { label: 'Dibi Centrale Grill', url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=300&q=80' },
    { label: 'Pastels & Délices', url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80' },
  ];

  const presetAmbianceSuggestions = [
    'Vue Océan', 'Sortie Romantique', 'Coucher de Soleil', 'Terrasse Lounge',
    'Famille & Enfants', 'Musique Live', 'Cadre Végétalisé', 'Business Lunch',
    'Spécialité Thiéboudienne', 'Grillades Dibi Nocturne', 'Climatisé VIP'
  ];

  const allAvailableAmenities = [
    { id: 'Wifi Fibre Gratuit', icon: '📶' },
    { id: 'Parking Privé Gardé', icon: '🚗' },
    { id: 'Terrasse Panoramique', icon: '🌊' },
    { id: 'Salle Climatisée', icon: '❄️' },
    { id: 'Paiement Wave & OM', icon: '💳' },
    { id: 'Accès PMR', icon: '♿' },
    { id: 'Espace Prière', icon: '🕌' },
    { id: 'Cocktails & Jus Locaux', icon: '🍹' },
  ];

  return (
    <div className="h-full flex flex-col bg-[#F4F7F4] relative overflow-hidden font-sans select-none">
      
      {/* Save feedback toast */}
      <AnimatePresence>
        {saveFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-2 inset-x-4 z-50 bg-[#064E2B] text-white p-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs border border-emerald-400/40"
          >
            <span className="text-base">✨</span>
            <span className="font-bold flex-1">{saveFeedback}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Ultra-Clean Minimalist Header: Just Logo & Name + Settings Button */}
      <div className="pt-3 px-4 pb-3 bg-white border-b border-[#D8EADB] shrink-0 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#064E2B] to-[#10B981] p-0.5 shadow-sm shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentResto.logo}
              alt={currentResto.name}
              className="w-full h-full rounded-[14px] object-cover bg-white"
            />
          </div>
          <div className="min-w-0">
            <h2 className="font-black text-sm text-[#081A10] truncate leading-tight">{currentResto.name}</h2>
            <p className="text-[10px] text-gray-400 truncate">📍 {currentResto.neighborhood} • Dakar</p>
          </div>
        </div>

        {/* Paramètres Button */}
        <button
          onClick={openEditGeneralModal}
          className="px-3 py-1.5 rounded-xl bg-[#E6F5EC] text-[#0A6E3B] font-black text-xs border border-[#0A6E3B]/20 flex items-center gap-1.5 shadow-2xs hover:bg-[#d8eedf] active:scale-95 transition-all"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>⚙️ Paramètres</span>
        </button>
      </div>

      {/* 2. THE TWO CLEAN BUTTONS: Vitrine vs Dashboard */}
      <div className="bg-[#F4F7F4] px-3 py-2 border-b border-[#D8EADB] shrink-0">
        <div className="p-1 bg-white/90 backdrop-blur-md rounded-2xl border border-white/80 shadow-xs flex items-center gap-1.5">
          <button
            onClick={() => setMobileMode('vitrine')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              mobileMode === 'vitrine'
                ? 'brand-gradient text-white shadow-md'
                : 'text-gray-500 hover:text-[#081A10]'
            }`}
          >
            <span>🏛️ Vitrine</span>
            {mobileMode === 'vitrine' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
          </button>
          <button
            onClick={() => setMobileMode('dashboard')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              mobileMode === 'dashboard'
                ? 'bg-[#0B1E13] text-white shadow-md'
                : 'text-gray-500 hover:text-[#081A10]'
            }`}
          >
            <span>📊 Dashboard</span>
            {mobileMode === 'dashboard' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
          </button>
        </div>
      </div>

      {/* 3. Dashboard KPI Strip & Sub-tabs (Only shown when Dashboard mode is active) */}
      {mobileMode === 'dashboard' && (
        <div className="bg-white border-b border-[#D8EADB] p-2 space-y-2 shrink-0">
          
          {/* Dashboard KPI Strip */}
          <div className="grid grid-cols-4 gap-1.5 text-center">
            <div className="bg-[#F4F7F4] rounded-xl p-1.5 border border-[#D8EADB]">
              <span className="text-[8px] uppercase block text-gray-400 font-bold">Revenus</span>
              <span className="text-[10px] font-black text-[#0A6E3B] truncate block">{formatFCFA(totalRevenue)}</span>
            </div>
            <div className="bg-[#F4F7F4] rounded-xl p-1.5 border border-[#D8EADB]">
              <span className="text-[8px] uppercase block text-gray-400 font-bold">Commandes</span>
              <span className="text-[11px] font-black text-[#081A10]">{myOrders.length}</span>
            </div>
            <div className="bg-[#F4F7F4] rounded-xl p-1.5 border border-[#D8EADB]">
              <span className="text-[8px] uppercase block text-gray-400 font-bold">Tables</span>
              <span className="text-[11px] font-black text-[#FF7824]">{myReservations.length}</span>
            </div>
            <div className="bg-[#F4F7F4] rounded-xl p-1.5 border border-[#D8EADB]">
              <span className="text-[8px] uppercase block text-gray-400 font-bold">Note Avis</span>
              <span className="text-[11px] font-black text-amber-500">⭐ {currentResto.rating}</span>
            </div>
          </div>

          {/* Sub-tabs */}
          <div className="flex overflow-x-auto no-scrollbar gap-1 pt-1">
            {[
              { id: 'showcase', label: '🏛️ Modifier Vitrine' },
              { id: 'orders', label: `📦 KDS (${myOrders.length})` },
              { id: 'reservations', label: `📅 Tables (${myReservations.length})` },
              { id: 'menu', label: `🍽️ Carte (${myDishes.length})` },
              { id: 'stats', label: '⭐ Chiffres' },
            ].map((tab) => {
              const isSel = restoTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setRestoTab(tab.id as any)}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-black shrink-0 transition-all ${
                    isSel
                      ? 'bg-[#E6F5EC] text-[#0A6E3B] border border-[#0A6E3B]/20 shadow-2xs'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Tab Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-3.5 pb-24 space-y-3.5">
        
        {/* =====================================================================
            MODE 1: VITRINE PUBLIQUE CLIENT (100% PROPRE, SANS BOUTON ADMIN)
           ===================================================================== */}
        {mobileMode === 'vitrine' && (
          <div className="space-y-3.5">
            
            {/* Live Client Hero Banner */}
            <div className="relative h-44 rounded-3xl overflow-hidden bg-gray-900 shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentResto.coverImage}
                alt={currentResto.name}
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

              <div className="absolute bottom-3 inset-x-3 flex items-end gap-3 text-white">
                <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-md bg-white shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={currentResto.logo} alt={currentResto.name} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-black text-sm text-white truncate">{currentResto.name}</h3>
                    <span className="px-1.5 py-0.5 rounded-md bg-amber-400 text-black font-black text-[9px]">
                      ⭐ {currentResto.rating}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-200 line-clamp-1 italic">
                    "{currentResto.tagline || 'Excellence gastronomique dakaroise'}"
                  </p>
                  <p className="text-[9px] text-gray-300 font-semibold">
                    📍 {currentResto.neighborhood} • 💰 {currentResto.priceRange || '2 500 - 6 500 FCFA'}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick action buttons for clients */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => alert(`Réservation de table chez ${currentResto.name} ouverte !`)}
                className="py-2.5 rounded-2xl brand-gradient text-white font-black flex items-center justify-center gap-1.5 shadow-md active:scale-95"
              >
                <span>📅 Réserver Table</span>
              </button>
              <a
                href={`https://wa.me/221770000000?text=Bonjour%20${encodeURIComponent(currentResto.name)}`}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-1.5 shadow-md active:scale-95"
              >
                <span>💬 WhatsApp</span>
              </a>
            </div>

            {/* Multi-view Gallery */}
            <div className="bg-white p-3 rounded-2xl border border-[#D8EADB] space-y-2 shadow-2xs">
              <span className="font-black text-xs text-[#081A10] block">📸 Cadre & Vues ({currentResto.gallery?.length || 0})</span>
              <div className="grid grid-cols-3 gap-1.5">
                {currentResto.gallery?.map((img, i) => (
                  <div key={i} className="relative aspect-4/3 rounded-xl overflow-hidden bg-gray-100 border border-[#D8EADB]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 inset-x-1 bg-black/70 text-[8px] text-white text-center rounded-md font-bold py-0.5 truncate px-1">
                      {i === 0 ? 'Façade' : i === 1 ? 'Terrasse' : i === 2 ? 'VIP' : 'Cuisine'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Badges & Amenities */}
            <div className="bg-white p-3 rounded-2xl border border-[#D8EADB] space-y-2 shadow-2xs text-xs">
              <span className="font-black text-xs text-[#081A10] block">✨ Ambiance & Services</span>
              <div className="flex flex-wrap gap-1">
                {currentResto.ambianceTags?.map((tag, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-lg bg-[#E6F5EC] text-[#0A6E3B] text-[10px] font-bold border border-[#0A6E3B]/20">
                    ✨ {tag}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-1 text-[10px] pt-1">
                {currentResto.amenities?.map((amenity, i) => (
                  <div key={i} className="p-1.5 rounded-lg bg-[#F4F7F4] font-semibold text-gray-700 flex items-center gap-1">
                    <span className="text-[#0A6E3B]">✓</span>
                    <span className="truncate">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Menu preview */}
            <div className="bg-white p-3 rounded-2xl border border-[#D8EADB] space-y-2 shadow-2xs">
              <span className="font-black text-xs text-[#081A10] block">🍽️ Carte des Plats ({myDishes.length})</span>
              <div className="space-y-2">
                {myDishes.slice(0, 4).map((d) => (
                  <div key={d.id} className="p-2 rounded-xl bg-[#F4F7F4] flex items-center justify-between gap-2 border border-[#D8EADB]">
                    <div className="flex items-center gap-2 min-w-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={d.image} alt={d.name} className="w-10 h-10 rounded-lg object-cover bg-white shrink-0" />
                      <div className="min-w-0">
                        <p className="font-black text-xs text-[#081A10] truncate">{d.name}</p>
                        <span className="text-[10px] font-black text-[#0A6E3B]">{formatFCFA(d.price)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* =====================================================================
            MODE 2: DASHBOARD (STUDIO DE PERSONNALISATION, KDS, TABLES, STATS)
           ===================================================================== */}
        {mobileMode === 'dashboard' && restoTab === 'showcase' && (
          <div className="space-y-3.5">
            
            {/* Top Toolbar: Live Status & Preview Button */}
            <div className="bg-white p-3 rounded-2xl border border-[#D8EADB] flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-black text-xs text-[#081A10]">Vitrine Publique Active</span>
              </div>

              <button
                onClick={() => setIsPreviewClientModalOpen(true)}
                className="px-3 py-1.5 rounded-xl brand-gradient text-white text-[10px] font-black shadow-xs flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <span>👁️ Voir comme client</span>
              </button>
            </div>

            {/* CARD 1: PHOTO DE COUVERTURE & LOGO (HERO BANNER CUSTOMIZER) */}
            <div className="bg-white rounded-3xl border border-[#D8EADB] overflow-hidden shadow-xs space-y-3 p-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-black text-xs text-[#081A10]">1. Photo de Couverture & Logo</h4>
                  <p className="text-[10px] text-gray-400">Première impression vue par les clients sur Dakar</p>
                </div>
              </div>

              {/* Live interactive banner preview */}
              <div className="relative h-36 rounded-2xl overflow-hidden bg-gray-900 group shadow-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentResto.coverImage}
                  alt={currentResto.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                {/* Edit Cover Overlay Button */}
                <button
                  onClick={() => setIsEditCoverModalOpen(true)}
                  className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-xl bg-black/60 hover:bg-black/80 text-white text-[10px] font-bold backdrop-blur-xs flex items-center gap-1 border border-white/20 shadow-md active:scale-95"
                >
                  <span>🖼️ Changer Couverture</span>
                </button>

                {/* Logo & Name preview with edit button */}
                <div className="absolute bottom-2.5 inset-x-3 flex items-end justify-between">
                  <div className="flex items-end gap-2.5">
                    <div className="relative group/logo">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={currentResto.logo}
                        alt={currentResto.name}
                        className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-md bg-white shrink-0"
                      />
                      <button
                        onClick={() => setIsEditLogoModalOpen(true)}
                        className="absolute inset-0 bg-black/60 rounded-xl text-[8px] text-white font-bold flex items-center justify-center opacity-0 group-hover/logo:opacity-100 transition-opacity"
                      >
                        Modifier
                      </button>
                    </div>

                    <div className="text-white min-w-0">
                      <h5 className="font-black text-xs leading-tight truncate">{currentResto.name}</h5>
                      <p className="text-[9px] text-gray-200 line-clamp-1">{currentResto.tagline || currentResto.address}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsEditLogoModalOpen(true)}
                    className="px-2 py-0.5 rounded-lg bg-white/90 text-[#081A10] text-[9px] font-black shadow-xs shrink-0"
                  >
                    Changer Logo
                  </button>
                </div>
              </div>
            </div>

            {/* CARD 2: PRÉSENTATION DE L'ÉTABLISSEMENT & INFOS */}
            <div className="bg-white p-3.5 rounded-3xl border border-[#D8EADB] space-y-3 shadow-xs text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-black text-xs text-[#081A10]">2. Présentation & Coordonnées</h4>
                  <p className="text-[10px] text-gray-400">Nom, slogan, prix, horaires et téléphone</p>
                </div>
                <button
                  onClick={openEditGeneralModal}
                  className="px-2.5 py-1 rounded-xl bg-[#E6F5EC] text-[#0A6E3B] text-[10px] font-black border border-[#0A6E3B]/20 hover:bg-[#d5eedf] transition-all flex items-center gap-1"
                >
                  <span>✏️ Modifier Infos</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-[#F4F7F4] p-3 rounded-2xl border border-[#D8EADB]">
                <div>
                  <span className="text-[9px] text-gray-400 font-bold block">Nom de l'établissement</span>
                  <span className="font-black text-[11px] text-[#081A10]">{currentResto.name}</span>
                </div>
                <div>
                  <span className="text-[9px] text-gray-400 font-bold block">Fourchette de Prix</span>
                  <span className="font-black text-[11px] text-[#0A6E3B]">{currentResto.priceRange || '2 500 - 6 500 FCFA'}</span>
                </div>
                <div>
                  <span className="text-[9px] text-gray-400 font-bold block">Horaires de Service</span>
                  <span className="font-bold text-[10px] text-[#081A10]">
                    {typeof currentResto.openingHours === 'string' ? currentResto.openingHours : '11h30 - 23h30 (7j/7)'}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-gray-400 font-bold block">Quartier & Téléphone</span>
                  <span className="font-bold text-[10px] text-[#081A10]">{currentResto.neighborhood} • {currentResto.phone || '+221 77 000 00 00'}</span>
                </div>
              </div>

              {currentResto.tagline && (
                <div className="p-2.5 rounded-xl bg-white border border-[#D8EADB]">
                  <span className="text-[9px] text-gray-400 font-bold block">Slogan / Description d'ambiance</span>
                  <p className="text-[11px] text-[#081A10] font-medium italic mt-0.5">"{currentResto.tagline}"</p>
                </div>
              )}
            </div>

            {/* CARD 3: GALERIE PHOTOS D'AMBIANCE & DIFFÉRENTES VUES (HD PHOTO STUDIO) */}
            <div className="bg-white p-3.5 rounded-3xl border border-[#D8EADB] space-y-3 shadow-xs text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-black text-xs text-[#081A10]">
                    3. Galerie Photos d'Ambiance ({currentResto.gallery?.length || 0})
                  </h4>
                  <p className="text-[10px] text-gray-400">Vues de la terrasse, façade, salle et cuisine</p>
                </div>
                <button
                  onClick={() => setIsAddGalleryPhotoModalOpen(true)}
                  className="px-2.5 py-1 rounded-xl brand-gradient text-white text-[10px] font-black shadow-xs flex items-center gap-1 active:scale-95"
                >
                  <Plus className="w-3 h-3" />
                  <span>Ajouter Vue</span>
                </button>
              </div>

              {/* Photo grid with delete buttons */}
              <div className="grid grid-cols-3 gap-2">
                {currentResto.gallery?.map((imgUrl, i) => (
                  <div
                    key={i}
                    className="relative aspect-4/3 rounded-2xl overflow-hidden bg-gray-100 border border-[#D8EADB] group shadow-2xs"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imgUrl} alt={`Vue ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    
                    {/* View tag label */}
                    <span className="absolute bottom-1 inset-x-1 bg-black/70 text-[8px] text-white text-center rounded-md font-bold py-0.5 backdrop-blur-2xs truncate px-1">
                      {i === 0 ? 'Façade' : i === 1 ? 'Terrasse Mer' : i === 2 ? 'Salle VIP' : i === 3 ? 'Cuisine' : `Vue ${i + 1}`}
                    </span>

                    {/* Delete action */}
                    <button
                      onClick={() => handleDeleteGalleryPhoto(i)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] shadow-md opacity-90 hover:opacity-100 active:scale-90"
                      title="Supprimer cette photo"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* CARD 4: BADGES D'AMBIANCE PERSONNALISABLES */}
            <div className="bg-white p-3.5 rounded-3xl border border-[#D8EADB] space-y-2.5 shadow-xs text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-black text-xs text-[#081A10]">4. Badges d'Ambiance Visibles</h4>
                  <p className="text-[10px] text-gray-400">Aident les clients à choisir selon l'occasion</p>
                </div>
                <button
                  onClick={() => setIsManageTagsModalOpen(true)}
                  className="px-2.5 py-1 rounded-xl bg-[#E6F5EC] text-[#0A6E3B] text-[10px] font-black border border-[#0A6E3B]/20"
                >
                  + Gérer Badges
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {currentResto.ambianceTags?.map((tag, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#E6F5EC] border border-[#0A6E3B]/20 text-[#0A6E3B] text-[10px] font-bold shadow-2xs"
                  >
                    <span>✨ {tag}</span>
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="text-rose-500 font-extrabold hover:text-rose-700 ml-0.5"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* CARD 5: COMMODITÉS ET SERVICES CERTIFIÉS */}
            <div className="bg-white p-3.5 rounded-3xl border border-[#D8EADB] space-y-2.5 shadow-xs text-xs">
              <div>
                <h4 className="font-black text-xs text-[#081A10]">5. Commodités & Services Certifiés</h4>
                <p className="text-[10px] text-gray-400">Cochez pour afficher sur la vitrine client</p>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {allAvailableAmenities.map((amenity) => {
                  const isChecked = currentResto.amenities?.includes(amenity.id);
                  return (
                    <button
                      key={amenity.id}
                      onClick={() => handleToggleAmenity(amenity.id)}
                      className={`p-2 rounded-xl border text-left flex items-center justify-between transition-all ${
                        isChecked
                          ? 'bg-[#E6F5EC] border-[#0A6E3B]/30 text-[#081A10] font-bold'
                          : 'bg-[#F4F7F4] border-[#D8EADB] text-gray-400'
                      }`}
                    >
                      <span className="flex items-center gap-1.5 text-[10px] truncate">
                        <span>{amenity.icon}</span>
                        <span className="truncate">{amenity.id}</span>
                      </span>
                      <span className={`text-xs font-black ${isChecked ? 'text-[#0A6E3B]' : 'text-gray-300'}`}>
                        {isChecked ? '✓' : '+'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* =====================================================================
            TAB 1: KDS CUISINE & COMMANDES (KITCHEN DISPLAY SYSTEM)
           ===================================================================== */}
        {restoTab === 'orders' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-[#081A10] uppercase tracking-wider flex items-center gap-1.5">
                <span>🔥 Flux Cuisine en Direct</span>
              </h4>
              <span className="text-[10px] text-gray-500 font-bold">
                {pendingOrders.length + preparingOrders.length} à traiter
              </span>
            </div>

            {myOrders.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-[#D8EADB] text-xs text-gray-400 space-y-2 shadow-2xs">
                <span className="text-3xl block">👨‍🍳</span>
                <p className="font-bold text-gray-700">Aucune commande en cuisine pour le moment.</p>
                <p className="text-[10px]">Dès qu'un client passe commande sur Thiob Express, elle apparaîtra ici en temps réel.</p>
              </div>
            ) : (
              myOrders.map((ord) => {
                const isPending = ord.status === 'pending' || ord.status === 'accepted';
                const isPreparing = ord.status === 'preparing';
                const isReady = ord.status === 'ready_for_pickup' || ord.status === 'in_transit';
                const isDelivered = ord.status === 'delivered';

                return (
                  <motion.div
                    key={ord.id}
                    layout
                    className={`bg-white p-3.5 rounded-2xl border transition-all space-y-2.5 shadow-xs ${
                      isPreparing ? 'border-amber-300 ring-1 ring-amber-200' : 'border-[#D8EADB]'
                    }`}
                  >
                    {/* Header line */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-xs text-[#081A10]">{ord.orderNumber}</span>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                            isPending ? 'bg-blue-100 text-blue-800' :
                            isPreparing ? 'bg-amber-100 text-amber-800 animate-pulse' :
                            isReady ? 'bg-purple-100 text-purple-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {isPending ? '🔔 Nouvelle' :
                             isPreparing ? '🔥 En cuisson' :
                             isReady ? '🛵 Livreur en route' : '✓ Livrée'}
                          </span>
                        </div>
                        <p className="text-[11px] font-bold text-gray-700 mt-0.5">
                          {ord.clientName} • <span className="text-gray-400">{ord.deliveryAddress.neighborhood}</span>
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-black text-[#0A6E3B]">{formatFCFA(ord.subtotal)}</span>
                        <span className="text-[9px] text-gray-400 block">{ord.paymentMethod.toUpperCase()}</span>
                      </div>
                    </div>

                    {/* Items detail list */}
                    <div className="bg-[#F4F7F4] p-2.5 rounded-xl border border-[#D8EADB] text-xs space-y-1 divide-y divide-gray-100">
                      {ord.items.map((it, i) => (
                        <div key={i} className="pt-1 first:pt-0 flex justify-between items-center">
                          <span className="font-bold text-[#081A10]">
                            <strong className="text-[#0A6E3B]">{it.quantity}x</strong> {it.name}
                          </span>
                          <span className="text-[10px] text-gray-400">{formatFCFA(it.price * it.quantity)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Courier assigned or status details */}
                    {ord.courierName && (
                      <div className="text-[10px] text-gray-600 flex items-center gap-1.5 bg-blue-50 p-1.5 rounded-lg border border-blue-100">
                        <span>🛵 Livreur :</span>
                        <span className="font-bold text-blue-900">{ord.courierName} ({ord.courierPhone})</span>
                      </div>
                    )}

                    {/* Action progression buttons */}
                    <div className="flex gap-2 pt-1">
                      {isPending && (
                        <button
                          onClick={() => updateOrderStatus(ord.id, 'preparing')}
                          className="flex-1 py-2 rounded-xl brand-gradient text-white text-xs font-black shadow-xs hover:opacity-95"
                        >
                          🔥 Lancer la préparation en cuisine
                        </button>
                      )}
                      {isPreparing && (
                        <button
                          onClick={() => updateOrderStatus(ord.id, 'ready_for_pickup')}
                          className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black shadow-xs flex items-center justify-center gap-1"
                        >
                          <span>🛵 Prêt ! Appeler le Tiak-Tiak</span>
                        </button>
                      )}
                      {isReady && (
                        <button
                          onClick={() => updateOrderStatus(ord.id, 'delivered')}
                          className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs"
                        >
                          ✓ Marquer comme Livré
                        </button>
                      )}
                      <button
                        onClick={() => alert(`Appel client : ${ord.clientPhone}`)}
                        className="px-3 py-2 rounded-xl bg-gray-100 text-gray-600 text-xs font-bold hover:bg-gray-200"
                        title="Appeler le client"
                      >
                        📞
                      </button>
                    </div>

                  </motion.div>
                );
              })
            )}
          </div>
        )}

        {/* =====================================================================
            TAB 2: RÉSERVATIONS DE TABLES REÇUES (MODULE SORTIES DAKAR)
           ===================================================================== */}
        {restoTab === 'reservations' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black text-[#081A10] uppercase tracking-wider">
                  Tables Réservées ({myReservations.length})
                </h4>
                <p className="text-[10px] text-gray-400">Reçues depuis le module de découverte client</p>
              </div>
            </div>

            {myReservations.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-[#D8EADB] text-xs text-gray-400 space-y-2 shadow-2xs">
                <span className="text-3xl block">🥂</span>
                <p className="font-bold text-gray-700">Aucune réservation de table reçue pour l'instant.</p>
                <p className="text-[10px]">Vos tables réservées par les clients (en couple, anniversaire, etc.) apparaîtront ici.</p>
              </div>
            ) : (
              myReservations.map((res) => {
                const assigned = assignedTables[res.id];

                return (
                  <div
                    key={res.id}
                    className="bg-white p-3.5 rounded-2xl border border-[#D8EADB] space-y-2.5 shadow-xs"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h5 className="font-black text-xs text-[#081A10]">{res.clientName}</h5>
                          <span className="text-[9px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.2 rounded-full">
                            Confirmée
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-gray-400 block">Code : {res.reservationNumber} • {res.clientPhone}</span>
                      </div>
                      <span className="text-[10px] font-bold text-[#FF7824] bg-[#FF7824]/10 px-2.5 py-0.5 rounded-full shrink-0">
                        {res.occasion}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#F4F7F4] p-2.5 rounded-xl border border-[#D8EADB]">
                      <div>
                        <span className="text-gray-400 block text-[9px] font-bold">Date & Heure</span>
                        <span className="font-black text-[#081A10]">{res.date} • {res.time}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[9px] font-bold">Nombre de convives</span>
                        <span className="font-black text-[#081A10]">{res.guestsCount} personnes</span>
                      </div>
                    </div>

                    {res.notes && (
                      <p className="text-[10px] text-amber-900 bg-amber-50 p-2 rounded-xl border border-amber-200/50">
                        📝 <strong>Souhait client :</strong> {res.notes}
                      </p>
                    )}

                    {/* Table Assignment Indicator */}
                    <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                      <div className="text-[10px]">
                        <span className="text-gray-400 font-bold">Emplacement : </span>
                        <span className="font-black text-[#0A6E3B]">
                          {assigned || 'Table non assignée'}
                        </span>
                      </div>

                      {/* Assign Table selector */}
                      <select
                        value={assigned || ''}
                        onChange={(e) => handleAssignTable(res.id, e.target.value)}
                        className="text-[10px] font-bold bg-[#E6F5EC] text-[#0A6E3B] border border-[#0A6E3B]/30 rounded-lg px-2 py-1 focus:outline-hidden"
                      >
                        <option value="">-- Assigner Table --</option>
                        <option value="Table 1 (Terrasse Océan)">Table 1 (Terrasse Océan)</option>
                        <option value="Table 4 (Terrasse Vue Mer)">Table 4 (Terrasse Vue Mer)</option>
                        <option value="Table 8 (Coin Romantique Couple)">Table 8 (Coin Romantique Couple)</option>
                        <option value="Table 12 (Salon VIP Climatisation)">Table 12 (Salon VIP Climatisation)</option>
                      </select>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        )}

        {/* =====================================================================
            TAB 4: GESTION DE LA CARTE & MENUS (MENU MANAGER)
           ===================================================================== */}
        {restoTab === 'menu' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black text-[#081A10] uppercase tracking-wider">
                  Menu & Plats ({myDishes.length})
                </h4>
                <p className="text-[10px] text-gray-400">Gérez vos stocks et tarifs en temps réel</p>
              </div>
              <button
                onClick={() => setIsAddDishModalOpen(true)}
                className="px-3 py-1.5 rounded-xl brand-gradient text-white text-[10px] font-black shadow-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nouveau plat</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {myDishes.map((dish) => (
                <div
                  key={dish.id}
                  className="bg-white p-3 rounded-2xl border border-[#D8EADB] flex items-center justify-between gap-3 shadow-2xs"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={dish.image} alt={dish.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h5 className="font-bold text-xs text-[#081A10] truncate">{dish.name}</h5>
                      {dish.isPopular && (
                        <span className="text-[8px] font-black bg-[#FF7824] text-white px-1.5 py-0.2 rounded-md">
                          Star
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 line-clamp-1">{dish.description}</p>
                    <span className="text-xs font-black text-[#0A6E3B]">{formatFCFA(dish.price)}</span>
                  </div>

                  {/* Availability toggle switch */}
                  <button
                    onClick={() => toggleMenuItemAvailability(dish.id)}
                    className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black transition-all ${
                      dish.isAvailable
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                    }`}
                  >
                    {dish.isAvailable ? 'En stock 🟢' : 'Épuisé 🔴'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 5: STATISTIQUES & AVIS CLIENTS (ANALYTICS & REVIEWS)
           ===================================================================== */}
        {restoTab === 'stats' && (
          <div className="space-y-3.5">
            
            {/* Revenue breakdown */}
            <div className="bg-white p-3.5 rounded-2xl border border-[#D8EADB] space-y-2.5 shadow-xs">
              <h4 className="font-black text-xs text-[#081A10]">Performances Financières du Jour</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-[#F4F7F4] p-2.5 rounded-xl border border-[#D8EADB]">
                  <span className="text-[9px] text-gray-400 block font-bold">Total Ventes</span>
                  <span className="font-black text-sm text-[#0A6E3B]">{formatFCFA(totalRevenue)}</span>
                </div>
                <div className="bg-[#F4F7F4] p-2.5 rounded-xl border border-[#D8EADB]">
                  <span className="text-[9px] text-gray-400 block font-bold">Panier Moyen</span>
                  <span className="font-black text-sm text-[#081A10]">{formatFCFA(myOrders.length ? totalRevenue / myOrders.length : 0)}</span>
                </div>
              </div>
            </div>

            {/* Verified Customer Reviews list with Chef reply */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-xs text-[#081A10] uppercase tracking-wider">
                  Avis Clients Dakarois ({currentResto.reviews?.length || 0})
                </h4>
                <span className="text-[10px] font-black text-[#0A6E3B] bg-[#E6F5EC] px-2 py-0.5 rounded-full">
                  ⭐ {currentResto.rating} / 5
                </span>
              </div>

              {currentResto.reviews?.map((rev) => (
                <div key={rev.id} className="bg-white p-3 rounded-2xl border border-[#D8EADB] space-y-1.5 shadow-2xs text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-black text-[#081A10]">{rev.author}</span>
                    <span className="text-[9px] text-gray-400">{rev.date}</span>
                  </div>
                  <p className="text-[11px] text-gray-600 leading-relaxed italic">"{rev.comment}"</p>
                  <div className="pt-1 flex items-center justify-between text-[10px]">
                    <span className="text-emerald-700 font-bold">Note : ⭐⭐⭐⭐⭐</span>
                    <button
                      onClick={() => alert(`Répondre à ${rev.author}`)}
                      className="text-[#0A6E3B] font-bold hover:underline"
                    >
                      Répondre ➔
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

      </div>

      {/* =========================================================================
          MODAL 1: CHANGER LA PHOTO DE COUVERTURE
         ========================================================================= */}
      <AnimatePresence>
        {isEditCoverModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditCoverModalOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-xs"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative z-10 w-full max-w-sm bg-white rounded-t-[36px] sm:rounded-3xl p-5 space-y-3.5 shadow-2xl max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                <div>
                  <h3 className="text-xs font-black text-[#081A10]">Changer la Photo de Couverture</h3>
                  <p className="text-[10px] text-gray-400">Importez depuis votre galerie photo ou choisissez un modèle</p>
                </div>
                <button
                  onClick={() => setIsEditCoverModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 overflow-y-auto flex-1 text-xs">
                {/* 📱 Big Phone Gallery Button */}
                <label className="w-full py-3.5 px-4 rounded-2xl bg-[#E6F5EC] border-2 border-dashed border-[#0A6E3B]/40 text-[#064E2B] font-black text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all hover:bg-[#d8eedf] shadow-2xs">
                  <Camera className="w-4 h-4 text-[#0A6E3B]" />
                  <span>📱 Choisir depuis la Galerie de mon Téléphone</span>
                  <input type="file" accept="image/*" onChange={handleUploadCoverFromPhone} className="hidden" />
                </label>

                <span className="text-[10px] font-bold text-gray-500 block pt-1">Ou choisir parmi les décors dakarois :</span>
                <div className="grid grid-cols-2 gap-2">
                  {presetCovers.map((preset, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectCover(preset.url)}
                      className="group cursor-pointer rounded-2xl overflow-hidden border-2 border-transparent hover:border-[#0A6E3B] transition-all relative aspect-video bg-gray-100 shadow-2xs"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={preset.url} alt={preset.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-1.5">
                        <span className="text-[8px] text-white font-bold truncate leading-tight">{preset.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          MODAL 2: CHANGER LE LOGO DU RESTAURANT
         ========================================================================= */}
      <AnimatePresence>
        {isEditLogoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditLogoModalOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-xs"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative z-10 w-full max-w-sm bg-white rounded-t-[36px] sm:rounded-3xl p-5 space-y-3.5 shadow-2xl max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                <div>
                  <h3 className="text-xs font-black text-[#081A10]">Changer le Logo Officiel</h3>
                  <p className="text-[10px] text-gray-400">Importez le logo officiel de votre restaurant</p>
                </div>
                <button
                  onClick={() => setIsEditLogoModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 overflow-y-auto flex-1 text-xs">
                {/* 📱 Big Phone Gallery Button for Logo */}
                <label className="w-full py-3.5 px-4 rounded-2xl bg-[#E6F5EC] border-2 border-dashed border-[#0A6E3B]/40 text-[#064E2B] font-black text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all hover:bg-[#d8eedf] shadow-2xs">
                  <Camera className="w-4 h-4 text-[#0A6E3B]" />
                  <span>📱 Importer mon Logo depuis mon Téléphone</span>
                  <input type="file" accept="image/*" onChange={handleUploadLogoFromPhone} className="hidden" />
                </label>

                <span className="text-[10px] font-bold text-gray-500 block pt-1">Ou choisir parmi nos logos modèles :</span>
                <div className="grid grid-cols-3 gap-2">
                  {presetLogos.map((preset, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectLogo(preset.url)}
                      className="group cursor-pointer rounded-2xl overflow-hidden border-2 border-transparent hover:border-[#0A6E3B] transition-all relative aspect-square bg-white shadow-2xs p-1 flex flex-col items-center justify-center"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={preset.url} alt={preset.label} className="w-12 h-12 rounded-xl object-cover" />
                      <span className="text-[8px] text-gray-700 font-bold truncate mt-1 w-full text-center">{preset.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          MODAL 3: MODIFIER LES INFOS GÉNÉRALES & COORDONNÉES
         ========================================================================= */}
      <AnimatePresence>
        {isEditGeneralModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditGeneralModalOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-xs"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative z-10 w-full max-w-sm bg-white rounded-t-[36px] sm:rounded-3xl p-5 space-y-3.5 shadow-2xl max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                <h3 className="text-xs font-black text-[#081A10]">Modifier les Informations</h3>
                <button
                  onClick={() => setIsEditGeneralModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveGeneralInfo} className="space-y-2.5 overflow-y-auto flex-1 text-xs">
                {/* Quick Shortcuts to change logo & cover */}
                <div className="grid grid-cols-2 gap-2 pb-1 border-b border-gray-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditGeneralModalOpen(false);
                      setIsEditLogoModalOpen(true);
                    }}
                    className="p-2 rounded-xl bg-[#E6F5EC] text-[#0A6E3B] font-bold text-[11px] flex items-center justify-center gap-1.5 border border-[#0A6E3B]/20"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Changer Logo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditGeneralModalOpen(false);
                      setIsEditCoverModalOpen(true);
                    }}
                    className="p-2 rounded-xl bg-[#E6F5EC] text-[#0A6E3B] font-bold text-[11px] flex items-center justify-center gap-1.5 border border-[#0A6E3B]/20"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Changer Couverture</span>
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500">Nom du restaurant</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full p-2 bg-[#F4F7F4] border border-[#D8EADB] rounded-xl font-bold text-[#081A10]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500">Slogan / Description de l'ambiance</label>
                  <input
                    type="text"
                    value={editTagline}
                    onChange={(e) => setEditTagline(e.target.value)}
                    placeholder="Ex: Le meilleur Thiébou Dieune face au coucher de soleil"
                    className="w-full p-2 bg-[#F4F7F4] border border-[#D8EADB] rounded-xl text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500">Fourchette de prix</label>
                    <input
                      type="text"
                      value={editPriceRange}
                      onChange={(e) => setEditPriceRange(e.target.value)}
                      placeholder="Ex: 3 000 - 7 000 FCFA"
                      className="w-full p-2 bg-[#F4F7F4] border border-[#D8EADB] rounded-xl font-bold text-[#0A6E3B]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500">Horaires de service</label>
                    <input
                      type="text"
                      value={editHours}
                      onChange={(e) => setEditHours(e.target.value)}
                      placeholder="Ex: 11h30 - 23h30 (7j/7)"
                      className="w-full p-2 bg-[#F4F7F4] border border-[#D8EADB] rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500">Quartier</label>
                    <input
                      type="text"
                      value={editNeighborhood}
                      onChange={(e) => setEditNeighborhood(e.target.value)}
                      className="w-full p-2 bg-[#F4F7F4] border border-[#D8EADB] rounded-xl text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500">Téléphone / WhatsApp</label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full p-2 bg-[#F4F7F4] border border-[#D8EADB] rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500">Adresse complète</label>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="w-full p-2 bg-[#F4F7F4] border border-[#D8EADB] rounded-xl text-xs"
                  />
                </div>

                {/* Localisation PostGIS sur carte */}
                <div className="pt-1">
                  <MiniLocationPicker
                    initialCoords={currentResto.coordinates || undefined}
                    initialAddress={editAddress}
                    title={editName || currentResto.name}
                    badgeLabel="Position Fixe Resto"
                    onLocationSelected={(geo) => {
                      setEditAddress(geo.address);
                      setEditNeighborhood(geo.neighborhood);
                      updateRestaurantShowcase(currentResto.id, {
                        address: geo.address,
                        neighborhood: geo.neighborhood,
                        coordinates: { lat: geo.lat, lng: geo.lng },
                        latitude: geo.lat,
                        longitude: geo.lng,
                      });
                    }}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl brand-gradient text-white font-black text-xs shadow-md mt-2"
                >
                  Enregistrer les modifications ➔
                </button>


                {onLogout && (
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[10px] text-gray-400">Session de connexion</span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditGeneralModalOpen(false);
                        onLogout();
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-rose-50 text-rose-700 font-bold text-[10px] border border-rose-200/60 hover:bg-rose-100 transition-colors"
                    >
                      🚪 Déconnexion / Changer de profil
                    </button>
                  </div>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          MODAL 4: AJOUTER UNE NOUVELLE VUE / PHOTO À LA GALERIE DEPUIS LE TÉLÉPHONE
         ========================================================================= */}
      <AnimatePresence>
        {isAddGalleryPhotoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddGalleryPhotoModalOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-xs"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative z-10 w-full max-w-sm bg-white rounded-t-[36px] sm:rounded-3xl p-5 space-y-3.5 shadow-2xl max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                <div>
                  <h3 className="text-xs font-black text-[#081A10]">Photos de votre Établissement</h3>
                  <p className="text-[10px] text-gray-400">Ajoutez des photos de votre terrasse, salle ou façade</p>
                </div>
                <button
                  onClick={() => setIsAddGalleryPhotoModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 overflow-y-auto flex-1 text-xs">
                {/* 📱 Big Phone Gallery Button for Restaurant Photos */}
                <label className="w-full py-3.5 px-4 rounded-2xl bg-[#E6F5EC] border-2 border-dashed border-[#0A6E3B]/40 text-[#064E2B] font-black text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all hover:bg-[#d8eedf] shadow-2xs">
                  <Camera className="w-4 h-4 text-[#0A6E3B]" />
                  <span>📱 Prendre une Photo / Choisir dans ma Galerie</span>
                  <input type="file" accept="image/*" onChange={handleUploadGalleryFromPhone} className="hidden" />
                </label>

                <div className="pt-1">
                  <span className="text-[10px] font-bold text-gray-500 block mb-1">Ou ajouter un cadre rapide :</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { label: 'Terrasse Mer', url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80' },
                      { label: 'Salle Cosy', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80' },
                      { label: 'Cuisine Direct', url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80' },
                      { label: 'Coin VIP', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80' },
                      { label: 'Jardin Soirée', url: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=800&q=80' },
                      { label: 'Buffet Royal', url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80' },
                    ].map((sample, i) => (
                      <button
                        type="button"
                        key={i}
                        onClick={() => {
                          const currentGallery = currentResto.gallery || [];
                          updateRestaurantShowcase(currentResto.id, {
                            gallery: [sample.url, ...currentGallery],
                          });
                          setIsAddGalleryPhotoModalOpen(false);
                          triggerSuccessFeedback(`Photo "${sample.label}" ajoutée !`);
                        }}
                        className="p-2 rounded-xl border text-[10px] font-bold bg-gray-50 border-gray-200 hover:bg-[#E6F5EC] hover:border-[#0A6E3B] text-center"
                      >
                        {sample.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          MODAL 5: GÉRER LES BADGES D'AMBIANCE
         ========================================================================= */}
      <AnimatePresence>
        {isManageTagsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsManageTagsModalOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-xs"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative z-10 w-full max-w-sm bg-white rounded-t-[36px] sm:rounded-3xl p-5 space-y-3.5 shadow-2xl max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                <h3 className="text-xs font-black text-[#081A10]">Gérer les Badges d'Ambiance</h3>
                <button
                  onClick={() => setIsManageTagsModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 overflow-y-auto flex-1 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500">Ajouter un badge personnalisé :</label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Ex: Vue sur l'île de Ngor"
                      value={customTagInput}
                      onChange={(e) => setCustomTagInput(e.target.value)}
                      className="flex-1 p-2 bg-[#F4F7F4] border border-[#D8EADB] rounded-xl text-xs font-bold"
                    />
                    <button
                      onClick={() => handleAddTag(customTagInput)}
                      className="px-3 py-2 brand-gradient text-white font-bold rounded-xl text-xs"
                    >
                      + Ajouter
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-gray-100">
                  <span className="text-[10px] font-bold text-gray-500 block">Suggestions rapides :</span>
                  <div className="flex flex-wrap gap-1.5">
                    {presetAmbianceSuggestions.map((sug, i) => {
                      const isAlreadyAdded = currentResto.ambianceTags?.includes(sug);
                      return (
                        <button
                          key={i}
                          disabled={isAlreadyAdded}
                          onClick={() => handleAddTag(sug)}
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all ${
                            isAlreadyAdded
                              ? 'bg-gray-100 text-gray-400 opacity-60'
                              : 'bg-[#E6F5EC] text-[#0A6E3B] border border-[#0A6E3B]/20 hover:bg-[#d5eedf]'
                          }`}
                        >
                          {isAlreadyAdded ? `✓ ${sug}` : `+ ${sug}`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          MODAL 6: AJOUTER UN PLAT / BOISSON AU MENU (AVEC IMPORT GALERIE TÉLÉPHONE)
         ========================================================================= */}
      <AnimatePresence>
        {isAddDishModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddDishModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative z-10 w-full max-w-sm bg-white rounded-t-[36px] sm:rounded-3xl p-5 space-y-3.5 shadow-2xl max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-sm font-black text-[#081A10]">Ajouter un plat / dégustation</h3>
                <button
                  onClick={() => setIsAddDishModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddDish} className="space-y-3 overflow-y-auto flex-1 text-xs">
                {/* 📱 Dish Photo Selector from Phone Gallery */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 block">Photo du Plat / Jus (depuis votre téléphone)</label>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 border border-[#0A6E3B]/30 shrink-0 shadow-2xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={newDishImage} alt="" className="w-full h-full object-cover" />
                    </div>
                    <label className="flex-1 py-3 px-3 rounded-xl bg-[#E6F5EC] border border-[#0A6E3B]/30 text-[#064E2B] font-black text-[11px] flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 transition-all hover:bg-[#d8eedf]">
                      <Camera className="w-4 h-4 text-[#0A6E3B]" />
                      <span>📱 Choisir dans ma Galerie</span>
                      <input type="file" accept="image/*" onChange={handleUploadDishPhoto} className="hidden" />
                    </label>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500">Nom du plat *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Thiébou Guinar Royal, Jus de Bissap..."
                    value={newDishName}
                    onChange={(e) => setNewDishName(e.target.value)}
                    className="w-full p-2.5 bg-[#F4F7F4] border border-[#D8EADB] rounded-xl font-bold text-[#081A10]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500">Catégorie</label>
                    <select
                      value={newDishCategory}
                      onChange={(e) => setNewDishCategory(e.target.value)}
                      className="w-full p-2 bg-[#F4F7F4] border border-[#D8EADB] rounded-xl font-bold text-[#081A10]"
                    >
                      <option value="cat-thieb">Thiéboudienne</option>
                      <option value="cat-dibi">Dibi & Grillades</option>
                      <option value="cat-poisson">Poissons & Fruits de mer</option>
                      <option value="cat-pastels">Pastels & Snacks</option>
                      <option value="cat-drinks">Jus & Boissons locales</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500">Prix (FCFA) *</label>
                    <input
                      type="number"
                      required
                      step="500"
                      value={newDishPrice}
                      onChange={(e) => setNewDishPrice(Number(e.target.value))}
                      className="w-full p-2 bg-[#F4F7F4] border border-[#D8EADB] rounded-xl font-bold text-[#0A6E3B]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Description savoureuse pour donner envie aux clients..."
                    value={newDishDesc}
                    onChange={(e) => setNewDishDesc(e.target.value)}
                    className="w-full p-2.5 bg-[#F4F7F4] border border-[#D8EADB] rounded-xl text-xs text-[#081A10]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl brand-gradient text-white font-black text-xs shadow-md mt-2"
                >
                  Ajouter à la carte en direct ➔
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          MODAL: PRÉVISUALISATION DIRECTE CLIENT
         ========================================================================= */}
      <AnimatePresence>
        {isPreviewClientModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPreviewClientModalOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-xs"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative z-10 w-full max-w-sm bg-white rounded-t-[36px] sm:rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
            >
              {/* Cover Header */}
              <div className="relative h-44 w-full shrink-0 bg-gray-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={currentResto.coverImage} alt={currentResto.name} className="w-full h-full object-cover opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                
                <button
                  onClick={() => setIsPreviewClientModalOpen(false)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center text-xs backdrop-blur-xs shadow-md"
                >
                  ✕
                </button>

                <div className="absolute bottom-3 inset-x-3 flex items-end gap-2.5 text-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={currentResto.logo} alt={currentResto.name} className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-md shrink-0 bg-white" />
                  <div className="min-w-0">
                    <span className="text-[9px] uppercase font-bold text-emerald-300">Aperçu Client en Direct</span>
                    <h3 className="text-sm font-black truncate">{currentResto.name}</h3>
                    <p className="text-[9px] text-gray-200 truncate">{currentResto.address}</p>
                  </div>
                </div>
              </div>

              {/* Showcase Body Preview */}
              <div className="p-4 space-y-3 overflow-y-auto flex-1 text-xs">
                <div className="bg-[#E6F5EC] p-3 rounded-2xl border border-[#0A6E3B]/20 space-y-1">
                  <div className="flex items-center justify-between font-black text-[#0A6E3B] text-[11px]">
                    <span>⭐ {currentResto.rating} ({currentResto.reviewCount} avis)</span>
                    <span>{currentResto.priceRange || '2 500 - 6 500 FCFA'}</span>
                  </div>
                  <p className="text-[10px] text-gray-600 italic">"{currentResto.tagline || 'Spécialités sénégalaises d’excellence'}"</p>
                </div>

                {/* Gallery preview */}
                <div className="space-y-1">
                  <span className="font-bold text-gray-700 text-[10px] block">Photos d'ambiance du restaurant :</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {currentResto.gallery?.map((img, i) => (
                      <div key={i} className="aspect-square rounded-xl overflow-hidden bg-gray-100 border border-[#D8EADB]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ambiance tags preview */}
                <div className="space-y-1">
                  <span className="font-bold text-gray-700 text-[10px] block">Ambiance certifiée :</span>
                  <div className="flex flex-wrap gap-1">
                    {currentResto.ambianceTags?.map((tag, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-lg bg-[#E6F5EC] text-[#0A6E3B] text-[9px] font-bold">
                        ✨ {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Amenities preview */}
                <div className="space-y-1">
                  <span className="font-bold text-gray-700 text-[10px] block">Commodités sur place :</span>
                  <div className="grid grid-cols-2 gap-1 text-[9px]">
                    {currentResto.amenities?.map((amenity, i) => (
                      <div key={i} className="p-1.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-700 font-semibold flex items-center gap-1 truncate">
                        <span className="text-emerald-600">✓</span>
                        <span className="truncate">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

// =========================================================================
// 3. MOBILE APP COURIER VIEW (Radar Livreur Dakar)
// =========================================================================
function MobileCourierApp({ onLogout }: { onLogout?: () => void }) {
  const { couriers, orders, toggleCourierOnline, acceptDeliveryMission, completeDeliveryMission } = useApp();
  const currentCourier = couriers[0];
  const isOnline = currentCourier?.isOnline;

  const activeOrder = orders.find((o) => o.id === currentCourier?.activeOrderId);
  const availableOrders = orders.filter((o) => (o.status === 'ready_for_pickup' || o.status === 'preparing') && !o.courierId);

  return (
    <div className="h-full flex flex-col bg-[#F4F7F4] relative overflow-hidden font-sans">
      <div className="pt-3 px-4 pb-3 bg-[#064E2B] text-white flex items-center justify-between shrink-0 shadow-md">
        <div>
          <h4 className="font-extrabold text-xs leading-tight">{currentCourier?.name || 'Ibrahima Fall'}</h4>
          <span className="text-[10px] text-emerald-300">Moto Jakarta Dakar</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleCourierOnline(currentCourier?.id || '')}
            className="px-3 py-1 rounded-full text-[10px] font-black bg-[#10B981] text-white"
          >
            {isOnline ? 'EN SERVICE' : 'HORS LIGNE'}
          </button>
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-1 text-white/80 hover:text-white"
              title="Déconnexion"
            >
              🚪
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-4 pb-20 space-y-3">
        <div className="grid grid-cols-2 gap-2 text-center text-xs">
          <div className="bg-white p-3 rounded-2xl border border-[#D8EADB] shadow-2xs">
            <span className="text-[9px] text-gray-400 uppercase font-bold block">Gains du jour</span>
            <span className="text-base font-black text-[#0A6E3B]">{formatFCFA(currentCourier?.todayEarnings || 15000)}</span>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-[#D8EADB] shadow-2xs">
            <span className="text-[9px] text-gray-400 uppercase font-bold block">Courses Réussies</span>
            <span className="text-base font-black text-[#081A10]">{currentCourier?.completedDeliveries || 8}</span>
          </div>
        </div>

        {activeOrder && (
          <div className="bg-white p-4 rounded-3xl border-2 border-[#0A6E3B] space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#0A6E3B]">🚨 Mission en cours {activeOrder.orderNumber}</span>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">GPS Actif</span>
            </div>
            <p className="text-xs font-bold text-[#081A10]">{activeOrder.restaurantName} ➔ {activeOrder.deliveryAddress.neighborhood}</p>
            
            <CourierLiveRadar
              courierPos={currentCourier?.coordinates || { lat: 14.708, lng: -17.472 }}
              restaurantPos={{ lat: 14.755, lng: -17.514 }}
              destinationPos={{ lat: 14.671, lng: -17.432 }}
              courierName={currentCourier?.name || 'Ibrahima Fall'}
              restaurantName={activeOrder.restaurantName}
              destinationAddress={activeOrder.deliveryAddress.neighborhood}
              orderNumber={activeOrder.orderNumber}
            />

            <button
              onClick={() => completeDeliveryMission(currentCourier.id, activeOrder.id)}
              className="w-full py-2.5 rounded-xl brand-gradient text-white text-xs font-black shadow-sm"
            >
              Confirmer la Livraison Réussie ✓
            </button>
          </div>
        )}


        <div className="space-y-2 pt-2">
          <h5 className="text-xs font-black text-[#081A10]">Missions disponibles ({availableOrders.length})</h5>
          {availableOrders.map((ord) => (
            <div key={ord.id} className="bg-white p-3 rounded-2xl border border-[#D8EADB] flex items-center justify-between text-xs shadow-2xs">
              <div>
                <p className="font-bold text-[#081A10]">{ord.restaurantName}</p>
                <p className="text-[10px] text-gray-400">Vers {ord.deliveryAddress.neighborhood} • {formatFCFA(ord.deliveryFee)}</p>
              </div>
              <button
                onClick={() => acceptDeliveryMission(currentCourier.id, ord.id)}
                className="px-3 py-1.5 rounded-xl brand-gradient text-white font-bold text-[10px]"
              >
                Prendre la course
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 4. MAIN SMARTPHONE SHELL & SHOWCASE CONTAINER
// =========================================================================
import OnboardingFlow from './OnboardingFlow';

export default function MobileDeviceShowcase() {
  const { currentRole, setCurrentRole, currentRestaurantId, setCurrentRestaurantId } = useApp();
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<Order | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // 1-Time Session Persistence: Only show onboarding on first launch ever
  useEffect(() => {
    try {
      const savedSession = localStorage.getItem('thiob_user_session');
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        if (parsed && parsed.isRegistered) {
          setShowOnboarding(false);
          if (parsed.role) {
            setCurrentRole(parsed.role);
          }
          if (parsed.restaurantId) {
            setCurrentRestaurantId(parsed.restaurantId);
          }
        } else {
          setShowOnboarding(true);
        }
      } else {
        setShowOnboarding(true);
      }
    } catch {
      setShowOnboarding(true);
    }
    setIsReady(true);
  }, [setCurrentRole, setCurrentRestaurantId]);

  const handleCompleteOnboarding = (newRole: UserRole) => {
    setCurrentRole(newRole);
    setShowOnboarding(false);
    try {
      localStorage.setItem('thiob_user_session', JSON.stringify({
        isRegistered: true,
        role: newRole,
        restaurantId: currentRestaurantId,
        timestamp: Date.now(),
      }));
    } catch {}
  };

  const handleLogoutOrReset = () => {
    try {
      localStorage.removeItem('thiob_user_session');
    } catch {}
    setShowOnboarding(true);
  };

  if (!isReady) {
    return (
      <div className="min-h-screen bg-[#064E2B] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F5F2] md:bg-[#062112] text-[#081A10] md:text-white flex flex-col items-center justify-start p-0 md:py-6 md:px-4 relative overflow-x-hidden selection:bg-[#0A6E3B]">
      
      {/* Background Ambience & Lighting (Desktop only) */}
      <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#0A6E3B]/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="hidden md:block absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#FF7824]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Studio Controls (Desktop only - Hidden on Real Mobile Devices) */}
      <header className="hidden md:flex w-full max-w-4xl flex-col sm:flex-row items-center justify-between gap-4 z-20 mb-6 pb-4 border-b border-white/10">
        
        {/* App Branding */}
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/Icone app.png"
            alt="Thiob.Dakar"
            className="w-11 h-11 rounded-2xl object-cover shadow-lg border border-emerald-400/40"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl font-black tracking-tight text-white">
                Thiob<span className="text-[#FF7824]">.</span>Dakar
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0A6E3B] text-white">
                App Mobile
              </span>
            </div>
            <p className="text-[11px] text-white/60">
              Plateforme Mobile Restauration & Livraison à Dakar
            </p>
          </div>
        </div>

        {/* 3 Mobile Roles Selector + Onboarding Trigger */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Onboarding Trigger Button */}
          <button
            onClick={() => setShowOnboarding(true)}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all border flex items-center gap-1.5 shadow-md ${
              showOnboarding
                ? 'bg-gradient-to-r from-[#FF7824] to-[#E86315] text-white border-orange-400 ring-2 ring-orange-400/40'
                : 'bg-white/10 text-emerald-200 border-white/15 hover:bg-white/20'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>✨ Parcours Onboarding</span>
          </button>

          {/* 3 Roles */}
          <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md p-1 rounded-2xl border border-white/15 shadow-md">
            {[
              { role: 'client' as UserRole, label: '📱 Client' },
              { role: 'restaurant' as UserRole, label: '👨‍🍳 Resto' },
              { role: 'courier' as UserRole, label: '🛵 Livreur' },
            ].map((item) => {
              const isActive = !showOnboarding && currentRole === item.role;
              return (
                <button
                  key={item.role}
                  onClick={() => {
                    setShowOnboarding(false);
                    setCurrentRole(item.role);
                  }}
                  className="relative px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all z-10"
                >
                  {isActive && (
                    <motion.div
                      layoutId="activePhoneRole"
                      className="absolute inset-0 bg-[#0A6E3B] rounded-xl shadow-md -z-10"
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
        </div>
      </header>

      {/* 📱 NATIVE FULL-SCREEN ON PHONES / MOCKUP SHELL ON DESKTOP */}
      <div className="w-full h-dvh md:h-[860px] md:max-w-[420px] rounded-none md:rounded-[54px] bg-[#F0F5F2] md:bg-[#1a1a1a] p-0 md:p-3.5 shadow-none md:shadow-[0_25px_70px_rgba(0,0,0,0.8),0_0_0_12px_#26332a,0_0_0_14px_#111] flex flex-col justify-between relative z-10 overflow-hidden">
        
        {/* Device Screen Frame */}
        <div className="w-full h-full rounded-none md:rounded-[42px] bg-[#F0F5F2] text-[#081A10] overflow-hidden flex flex-col relative">
          
          {/* iOS Dynamic Island & Status Bar (Only visible on Desktop Simulator) */}
          <div className="hidden md:flex h-10 bg-white border-b border-gray-100 items-center justify-between px-6 shrink-0 relative z-30">
            <span className="text-[11px] font-black text-black tracking-tight">09:41</span>
            
            {/* Dynamic Island Pill */}
            <div className="w-24 h-5 rounded-full bg-black flex items-center justify-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#0A6E3B] animate-pulse" />
              <span className="text-[8px] font-bold text-white uppercase tracking-wider">Thiob</span>
            </div>

            {/* Battery / Wifi icons */}
            <div className="flex items-center gap-1.5 text-black">
              <div className="w-4 h-2.5 rounded-[3px] border border-black/80 flex items-center p-0.5">
                <div className="w-full h-full bg-black rounded-[1px]" />
              </div>
            </div>
          </div>

          {/* Main App Content Viewport */}
          <div className="flex-1 overflow-hidden relative">
            <AnimatePresence mode="wait">
              {showOnboarding ? (
                <motion.div
                  key="onboarding_flow_screen"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.25 }}
                  className="w-full h-full"
                >
                  <OnboardingFlow
                    onComplete={handleCompleteOnboarding}
                  />
                </motion.div>
              ) : (
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* iOS Bottom Home Indicator Bar (Desktop Simulator only) */}
          <div className="hidden md:flex h-4 bg-white items-center justify-center shrink-0 z-30">
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
              className="relative z-10 bg-white text-[#081A10] w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-[#0A6E3B] bg-[#E6F5EC] px-2 py-0.5 rounded-full">
                    Commande {selectedOrderForTracking.orderNumber}
                  </span>
                  <h4 className="font-extrabold text-sm text-[#081A10] mt-1">Suivi de livraison en direct</h4>
                </div>
                <button
                  onClick={() => setSelectedOrderForTracking(null)}
                  className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2 text-xs">
                {/* Live Radar inside mobile modal */}
                <CourierLiveRadar
                  courierPos={{ lat: 14.708, lng: -17.472 }}
                  restaurantPos={{ lat: 14.755, lng: -17.514 }}
                  destinationPos={{ lat: 14.671, lng: -17.432 }}
                  courierName={selectedOrderForTracking.courierName || 'Ibrahima Fall (Moto Jakarta)'}
                  restaurantName={selectedOrderForTracking.restaurantName}
                  destinationAddress={`${selectedOrderForTracking.deliveryAddress.street}, ${selectedOrderForTracking.deliveryAddress.neighborhood}`}
                  orderNumber={selectedOrderForTracking.orderNumber}
                  isSimulatingLiveMove={true}
                />

                <div className="p-3 rounded-xl bg-[#F4F7F4] border border-[#D8EADB] space-y-1">
                  <p className="font-bold text-[#081A10]">Livreur : {selectedOrderForTracking.courierName || 'Ibrahima Fall (Moto Jakarta)'}</p>
                  <p className="text-[11px] text-gray-500">Destination : {selectedOrderForTracking.deliveryAddress.street}, {selectedOrderForTracking.deliveryAddress.neighborhood}</p>
                </div>

                <div className="p-2.5 rounded-xl bg-[#E6F5EC] text-[#0A6E3B] font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#0A6E3B] animate-ping" />
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
