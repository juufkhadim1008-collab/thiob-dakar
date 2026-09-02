'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/lib/store';
import { formatFCFA, getStatusBadge } from '@/lib/utils';
import { 
  ChefHat, 
  TrendingUp, 
  Clock, 
  ShoppingBag, 
  Bell, 
  CheckCircle2, 
  Plus, 
  ToggleLeft, 
  ToggleRight, 
  Power, 
  Utensils, 
  MapPin,
  Calendar,
  Camera,
  Star,
  Sparkles,
  Users,
  Search,
  ChevronDown,
  Printer,
  Smartphone,
  Flame,
  ArrowRight,
  ShieldCheck,
  Tag,
  Sliders,
  DollarSign,
  Phone,
  MessageCircle,
  Share2,
  ExternalLink,
  Eye,
  LayoutDashboard,
  Store,
  Layers,
  Heart
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function RestaurantSpace() {
  const { 
    restaurants, 
    menuItems, 
    orders, 
    reservations,
    updateOrderStatus, 
    toggleMenuItemAvailability, 
    addMenuItem,
    updateRestaurantShowcase,
    createReservation,
    addToCart
  } = useApp();

  // Top-level Two Buttons View Switcher: 'vitrine' | 'dashboard'
  const [viewMode, setViewMode] = useState<'vitrine' | 'dashboard'>('vitrine');

  const [selectedRestoId, setSelectedRestoId] = useState('resto-kamiss');
  const [dashboardTab, setDashboardTab] = useState<'kds' | 'vitrine_studio' | 'menu' | 'reservations' | 'analytics'>('vitrine_studio');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(true);

  // Active selected order for right panel POS detail
  const [selectedOrderForPos, setSelectedOrderForPos] = useState<string | null>(null);

  // Vitrine Client Website Interactive State
  const [activeMenuCategory, setActiveMenuCategory] = useState('all');
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<string | null>(null);
  const [isBookTableModalOpen, setIsBookTableModalOpen] = useState(false);
  const [bookName, setBookName] = useState('');
  const [bookPhone, setBookPhone] = useState('');
  const [bookDate, setBookDate] = useState('2026-09-05');
  const [bookTime, setBookTime] = useState('20:00');
  const [bookGuests, setBookGuests] = useState(2);
  const [bookOccasion, setBookOccasion] = useState('Sortie avec ma copine');
  const [bookNotes, setBookNotes] = useState('');
  const [isLiked, setIsLiked] = useState(false);

  // Table assignments in dashboard
  const [assignedTables, setAssignedTables] = useState<{ [resId: string]: string }>({
    'res-1': 'Table 4 (Terrasse Vue Océan)',
    'res-2': 'Table 12 (Salon VIP Climatisation)',
  });

  // New Dish Modal
  const [showAddDishModal, setShowAddDishModal] = useState(false);
  const [newDishName, setNewDishName] = useState('');
  const [newDishDesc, setNewDishDesc] = useState('');
  const [newDishPrice, setNewDishPrice] = useState(4500);
  const [newDishCategory, setNewDishCategory] = useState('cat-thieb');
  const [newDishImage, setNewDishImage] = useState('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80');

  const currentResto = restaurants.find((r) => r.id === selectedRestoId) || restaurants[0];
  const restoOrders = orders.filter((o) => o.restaurantId === currentResto.id);
  const restoDishes = menuItems.filter((m) => m.restaurantId === currentResto.id);
  const restoReservations = reservations.filter((res) => res.restaurantId === currentResto.id || res.restaurantName.toLowerCase().includes(currentResto.name.toLowerCase()));

  const pendingOrders = restoOrders.filter((o) => o.status === 'pending' || o.status === 'accepted');
  const preparingOrders = restoOrders.filter((o) => o.status === 'preparing');
  const readyOrders = restoOrders.filter((o) => o.status === 'ready_for_pickup' || o.status === 'in_transit');
  const completedOrders = restoOrders.filter((o) => o.status === 'delivered');

  const activeTicketOrder = restoOrders.find((o) => o.id === selectedOrderForPos) || restoOrders[0] || null;

  const totalRevenue = restoOrders
    .filter((o) => o.status !== 'cancelled')
    .reduce((acc, o) => acc + o.subtotal, 0);

  const filteredDishes = restoDishes.filter((dish) => {
    const matchesCat = selectedCategory === 'all' || dish.category === selectedCategory;
    const matchesSearch = dish.name.toLowerCase().includes(searchQuery.toLowerCase()) || dish.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const vitrineFilteredDishes = restoDishes.filter((dish) => {
    return activeMenuCategory === 'all' || dish.category === activeMenuCategory;
  });

  const handleCreateDish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDishName) return;
    addMenuItem({
      restaurantId: currentResto.id,
      name: newDishName,
      description: newDishDesc || 'Plat authentique sénégalais préparé à la minute.',
      price: Number(newDishPrice),
      category: newDishCategory,
      image: newDishImage,
      isAvailable: true,
      preparationTimeMinutes: 20,
    });
    setNewDishName('');
    setNewDishDesc('');
    setShowAddDishModal(false);
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#064E2B', '#0A6E3B', '#FF7824']
      });
    } catch {}
  };

  const handleAssignTable = (resId: string, tableName: string) => {
    setAssignedTables((prev) => ({ ...prev, [resId]: tableName }));
  };

  const handleBookTableSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createReservation({
      restaurantId: currentResto.id,
      restaurantName: currentResto.name,
      clientName: bookName || 'Client Dakarois',
      clientPhone: bookPhone || '+221 77 123 45 67',
      date: bookDate,
      time: bookTime,
      guestsCount: Number(bookGuests),
      occasion: bookOccasion,
      notes: bookNotes,
    });
    setIsBookTableModalOpen(false);
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.5 },
        colors: ['#064E2B', '#FF7824', '#F5B738']
      });
    } catch {}
    alert(`🎉 Réservation confirmée chez ${currentResto.name} pour le ${bookDate} à ${bookTime} !`);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-2 sm:px-4 lg:px-6 py-6 font-sans select-none text-[#081A10] space-y-6">
      
      {/* =========================================================================
          TOP TWO-BUTTON SWITCHER WITH ULTRA-MODERN ICE GLASSMORPHISM & GREEN-BLACK THEME
         ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 ice-glass-card p-3.5 sm:p-4 rounded-[28px] shadow-xl">
        
        {/* Restaurant selector on left */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#02180C] to-[#10B981] p-0.5 shadow-md shrink-0 ring-2 ring-emerald-500/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentResto.logo}
              alt={currentResto.name}
              className="w-full h-full rounded-[14px] object-cover bg-white"
            />
          </div>
          <div>
            <span className="text-[9px] uppercase font-extrabold tracking-widest text-[#0A6E3B] block">
              Sénégal Teranga Gourmet
            </span>
            <select
              value={selectedRestoId}
              onChange={(e) => setSelectedRestoId(e.target.value)}
              className="font-black text-base text-[#081A10] bg-transparent border-none focus:outline-hidden cursor-pointer p-0"
            >
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.neighborhood})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* THE TWO CLEAN BUTTONS: Vitrine | Dashboard with Ice & Green-Black Glassmorphism */}
        <div className="relative p-1.5 bg-[#E8F1EB]/90 backdrop-blur-xl rounded-2xl border border-white/80 shadow-inner flex items-center gap-2 w-full sm:w-auto justify-center">
          
          {/* Button 1: Vitrine */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setViewMode('vitrine')}
            className={`relative px-7 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 z-10 ${
              viewMode === 'vitrine'
                ? 'text-white'
                : 'text-gray-600 hover:text-[#081A10]'
            }`}
          >
            {viewMode === 'vitrine' && (
              <motion.div
                layoutId="activeRestoViewMode"
                className="absolute inset-0 dark-green-obsidian rounded-xl shadow-lg shadow-emerald-950/40 -z-10 border border-emerald-400/30 sheen-effect"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <Store className={`w-4 h-4 ${viewMode === 'vitrine' ? 'text-emerald-300' : 'text-gray-500'}`} />
            <span>Vitrine</span>
            {viewMode === 'vitrine' && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </motion.button>

          {/* Button 2: Dashboard */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setViewMode('dashboard')}
            className={`relative px-7 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 z-10 ${
              viewMode === 'dashboard'
                ? 'text-white'
                : 'text-gray-600 hover:text-[#081A10]'
            }`}
          >
            {viewMode === 'dashboard' && (
              <motion.div
                layoutId="activeRestoViewMode"
                className="absolute inset-0 bg-gradient-to-r from-[#03150B] to-[#082A17] rounded-xl shadow-lg shadow-black/40 -z-10 border border-white/15 sheen-effect"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <LayoutDashboard className={`w-4 h-4 ${viewMode === 'dashboard' ? 'text-emerald-400' : 'text-gray-500'}`} />
            <span>Dashboard</span>
            {viewMode === 'dashboard' && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </motion.button>

        </div>

        {/* Live helper tag on right */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-gray-500 bg-white/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/80 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>
            {viewMode === 'vitrine' ? '👁️ Vue Client en Direct' : '🛠️ Pilotage KDS & Vitrine'}
          </span>
        </div>

      </div>

      {/* =========================================================================
          MODE 1: VITRINE (SITE WEB PUBLIC DU RESTAURANT - ZERO GESTION/BACKEND)
         ========================================================================= */}
      <AnimatePresence mode="wait">
        {viewMode === 'vitrine' && (
          <motion.div
            key="vitrine_mode"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            
            {/* 1. Hero Showcase Website Banner */}
            <div className="relative h-[380px] sm:h-[460px] rounded-[36px] overflow-hidden bg-gray-900 border border-[#D8EADB] shadow-2xl group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentResto.coverImage}
                alt={currentResto.name}
                className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/20" />

              {/* Floating badges on top */}
              <div className="absolute top-6 inset-x-6 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <span className="px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-black flex items-center gap-1.5 shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Ouvert à Dakar</span>
                  </span>
                  <span className="px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-xs font-bold">
                    📍 {currentResto.neighborhood}
                  </span>
                </div>

                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`w-11 h-11 rounded-2xl backdrop-blur-md border border-white/30 flex items-center justify-center transition-all ${
                    isLiked ? 'bg-rose-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Bottom Identity & Call to Actions */}
              <div className="absolute bottom-6 inset-x-6 flex flex-col md:flex-row md:items-end justify-between gap-6 text-white">
                <div className="flex items-end gap-4 min-w-0">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden border-3 border-white shadow-2xl bg-white shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={currentResto.logo}
                      alt={currentResto.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="font-black text-2xl sm:text-4xl text-white tracking-tight drop-shadow-md">
                        {currentResto.name}
                      </h1>
                      <span className="px-3 py-1 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-black text-xs shadow-md">
                        ⭐ {currentResto.rating} ({currentResto.reviewCount} avis)
                      </span>
                    </div>

                    <p className="text-sm sm:text-base text-gray-200 font-medium line-clamp-1 italic max-w-2xl drop-shadow-xs">
                      "{currentResto.tagline || 'Le cadre gastronomique idéal pour vos déjeuners et dîners à Dakar.'}"
                    </p>

                    <div className="flex items-center gap-3 text-xs text-gray-300 flex-wrap pt-1 font-semibold">
                      <span>💰 {currentResto.priceRange || '2 500 - 6 500 FCFA'}</span>
                      <span>•</span>
                      <span>⏰ {typeof currentResto.openingHours === 'string' ? currentResto.openingHours : '11h30 - 23h30 (7j/7)'}</span>
                      <span>•</span>
                      <span>📍 {currentResto.address}</span>
                    </div>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    onClick={() => setIsBookTableModalOpen(true)}
                    className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#FF7824] to-[#ff9147] text-white font-black text-xs sm:text-sm shadow-xl hover:opacity-95 active:scale-95 transition-all flex items-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Réserver une Table</span>
                  </button>

                  <a
                    href={`https://wa.me/221770000000?text=Bonjour%20${encodeURIComponent(currentResto.name)},%20je%20souhaite%20des%20informations`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xl flex items-center justify-center transition-all"
                    title="Contacter sur WhatsApp"
                  >
                    <MessageCircle className="w-5 h-5" />
                  </a>
                </div>
              </div>

            </div>

            {/* 2. Ambiance Tags & Certified Amenities Badges */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Ambiance Badges */}
              <div className="bg-white p-5 rounded-3xl border border-[#D8EADB] shadow-sm space-y-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-gray-400 block">
                  Ambiance & Cadre de Vie
                </span>
                <div className="flex flex-wrap gap-2">
                  {currentResto.ambianceTags?.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3.5 py-1.5 rounded-2xl bg-[#E6F5EC] text-[#0A6E3B] text-xs font-extrabold border border-[#0A6E3B]/20 shadow-2xs flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3 h-3 text-[#FF7824]" />
                      <span>{tag}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Certified Amenities */}
              <div className="bg-white p-5 rounded-3xl border border-[#D8EADB] shadow-sm space-y-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-gray-400 block">
                  Commodités & Services Certifiés
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {currentResto.amenities?.map((amenity, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-[#F4F7F4] border border-[#D8EADB] font-bold text-[#081A10] flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#0A6E3B] shrink-0" />
                      <span className="truncate">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* 3. HD Multi-View Gallery (Façade, Terrasse, VIP, Cuisine) */}
            <div className="bg-white p-6 rounded-3xl border border-[#D8EADB] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-lg text-[#081A10] flex items-center gap-2">
                    <Camera className="w-5 h-5 text-[#0A6E3B]" />
                    <span>Visite Virtuelle & Différentes Vues ({currentResto.gallery?.length || 0})</span>
                  </h3>
                  <p className="text-xs text-gray-400">Cliquez sur une vue pour l'agrandir en plein écran</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {currentResto.gallery?.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedGalleryImage(imgUrl)}
                    className="relative aspect-4/3 rounded-2xl overflow-hidden bg-gray-100 border border-[#D8EADB] cursor-pointer group shadow-xs hover:shadow-md transition-all"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imgUrl}
                      alt={`Vue ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5">
                      <span className="text-[10px] text-white font-extrabold truncate">
                        {idx === 0 ? 'Façade & Entrée' : idx === 1 ? 'Terrasse Mer' : idx === 2 ? 'Salon Cosy VIP' : idx === 3 ? 'Cuisine Ouverte' : `Vue ${idx + 1}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Complete Interactive Restaurant Menu */}
            <div className="bg-white p-6 rounded-3xl border border-[#D8EADB] shadow-sm space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-black text-xl text-[#081A10] flex items-center gap-2">
                    <Utensils className="w-5 h-5 text-[#0A6E3B]" />
                    <span>Carte & Menu Gastronomique</span>
                  </h3>
                  <p className="text-xs text-gray-400">Plats frais préparés avec passion par le Chef</p>
                </div>

                {/* Categories tab */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                  {[
                    { id: 'all', label: 'Toute la Carte' },
                    { id: 'cat-thieb', label: 'Thiéboudienne' },
                    { id: 'cat-dibi', label: 'Dibi & Grillades' },
                    { id: 'cat-pastels', label: 'Pastels & Snacks' },
                    { id: 'cat-drinks', label: 'Boissons & Desserts' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveMenuCategory(cat.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                        activeMenuCategory === cat.id
                          ? 'bg-[#0A6E3B] text-white shadow-md'
                          : 'bg-[#F4F7F4] text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dishes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vitrineFilteredDishes.map((dish) => (
                  <div
                    key={dish.id}
                    className="bg-[#F4F7F4] rounded-3xl p-4 border border-[#D8EADB] flex flex-col justify-between space-y-3 shadow-2xs hover:shadow-md transition-all group"
                  >
                    <div className="flex gap-3.5">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white shrink-0 border border-[#D8EADB]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={dish.image}
                          alt={dish.name}
                          className="w-full h-full object-cover group-hover:scale-108 transition-transform"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-extrabold text-sm text-[#081A10] truncate">{dish.name}</h4>
                          {dish.isPopular && (
                            <span className="text-[8px] font-black bg-[#FF7824] text-white px-1.5 py-0.5 rounded-md shrink-0">
                              Top
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{dish.description}</p>
                        <span className="text-sm font-black text-[#0A6E3B] mt-1.5 block">
                          {formatFCFA(dish.price)}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#D8EADB] flex items-center justify-between">
                      <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{dish.preparationTimeMinutes || 20} min</span>
                      </span>

                      <button
                        onClick={() => {
                          addToCart(dish);
                          alert(`🛒 "${dish.name}" ajouté à la commande !`);
                        }}
                        className="px-3.5 py-1.5 rounded-xl brand-gradient text-white text-xs font-bold shadow-xs hover:opacity-95 active:scale-95 transition-all flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Commander</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>

            {/* 5. Verified Customer Reviews & Teranga Experience */}
            <div className="bg-white p-6 rounded-3xl border border-[#D8EADB] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-lg text-[#081A10]">Avis & Expérience Teranga</h3>
                  <p className="text-xs text-gray-400">Ce que disent les clients dakarois de notre établissement</p>
                </div>
                <span className="text-xs font-black text-[#0A6E3B] bg-[#E6F5EC] px-3 py-1 rounded-full">
                  ⭐ {currentResto.rating} / 5 ({currentResto.reviewCount} avis)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentResto.reviews?.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-2xl bg-[#F4F7F4] border border-[#D8EADB] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-700 text-white text-xs font-bold flex items-center justify-center">
                          {rev.author.charAt(0)}
                        </div>
                        <span className="font-bold text-xs text-[#081A10]">{rev.author}</span>
                      </div>
                      <span className="text-amber-500 text-xs font-bold">⭐⭐⭐⭐⭐</span>
                    </div>
                    <p className="text-xs text-gray-600 italic">"{rev.comment}"</p>
                  </div>
                ))}
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          MODE 2: DASHBOARD (ESPACE DE GESTION & MODIFICATION DE LA VITRINE)
         ========================================================================= */}
      <AnimatePresence mode="wait">
        {viewMode === 'dashboard' && (
          <motion.div
            key="dashboard_mode"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="bg-[#F4F7F4] rounded-[36px] border border-[#D8EADB] shadow-2xl overflow-hidden flex flex-col lg:flex-row min-h-[860px]"
          >
            
            {/* Sidebar Navigation */}
            <div className="w-full lg:w-72 bg-[#0B1E13] text-white p-5 flex flex-col justify-between shrink-0 border-r border-white/10">
              
              <div className="space-y-6">
                
                {/* Brand Title */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#064E2B] to-[#10B981] p-0.5 shadow-lg shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={currentResto.logo}
                      alt={currentResto.name}
                      className="w-full h-full rounded-[14px] object-cover bg-white"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 block">
                      Thiob Pro KDS
                    </span>
                    <h2 className="text-sm font-black text-white truncate">{currentResto.name}</h2>
                    <p className="text-[10px] text-gray-400 truncate">{currentResto.neighborhood}</p>
                  </div>
                </div>

                {/* Navigation Links */}
                <nav className="space-y-1.5 text-xs font-bold">
                  {[
                    { id: 'vitrine_studio', label: 'Studio Modifier Vitrine', icon: Sparkles },
                    { id: 'kds', label: 'Flux KDS & Commandes', icon: Flame, badge: pendingOrders.length + preparingOrders.length },
                    { id: 'menu', label: `Carte & Plats (${restoDishes.length})`, icon: Utensils },
                    { id: 'reservations', label: `Tables Réservées (${restoReservations.length})`, icon: Calendar, badge: restoReservations.length },
                    { id: 'analytics', label: 'Chiffres & Teranga', icon: TrendingUp },
                  ].map((item) => {
                    const isSel = dashboardTab === item.id;
                    const Icon = item.icon;

                    return (
                      <button
                        key={item.id}
                        onClick={() => setDashboardTab(item.id as any)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-all ${
                          isSel
                            ? 'bg-gradient-to-r from-[#064E2B] to-[#0A6E3B] text-white shadow-lg shadow-emerald-950/40 border border-emerald-500/30'
                            : 'text-gray-300 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 ${isSel ? 'text-emerald-300' : 'text-gray-400'}`} />
                          <span>{item.label}</span>
                        </div>
                        {Boolean(item.badge) && (
                          <span className="px-2 py-0.5 rounded-full bg-[#FF7824] text-white text-[10px] font-black shadow-xs">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>

              </div>

              {/* Service Status Toggle */}
              <div className="pt-4 border-t border-white/10 space-y-3">
                <div className="flex items-center justify-between bg-white/5 p-2.5 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                    <span className="text-xs font-bold text-gray-200">
                      {isOpen ? 'Cuisine Ouverte' : 'Service en Pause'}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`p-1.5 rounded-xl text-xs font-bold transition-all ${
                      isOpen ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>

            {/* Center Content */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#F4F7F4] overflow-hidden">
              
              {/* Top search & Add dish */}
              <div className="p-5 border-b border-[#D8EADB] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-3 flex-1 max-w-md">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Rechercher une commande, plat ou client..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-[#F4F7F4] border border-[#D8EADB] rounded-2xl text-xs font-semibold focus:outline-hidden focus:border-[#0A6E3B]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('vitrine')}
                    className="px-3.5 py-2 rounded-2xl bg-[#E6F5EC] text-[#0A6E3B] border border-[#0A6E3B]/30 text-xs font-bold flex items-center gap-1.5 hover:bg-[#d4edd0]"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Voir ma Vitrine ➔</span>
                  </button>

                  <button
                    onClick={() => setShowAddDishModal(true)}
                    className="px-3.5 py-2 rounded-2xl brand-gradient text-white text-xs font-black shadow-md flex items-center gap-1.5 active:scale-95 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Nouveau Plat</span>
                  </button>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6 no-scrollbar">
                
                {/* 1. STUDIO MODIFIER VITRINE (COMPLETE EDITING SUITE) */}
                {dashboardTab === 'vitrine_studio' && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-3xl border border-[#D8EADB] p-6 shadow-sm space-y-6">
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2ECE5] pb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                            <h3 className="font-extrabold text-xl text-[#081A10]">
                              Studio de Personnalisation de la Vitrine
                            </h3>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Modifiez en direct chaque élément. Cliquez ensuite sur <strong>Vitrine</strong> en haut pour admirer le rendu final !
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const newName = prompt('Nouveau nom du restaurant :', currentResto.name);
                              if (newName) updateRestaurantShowcase(currentResto.id, { name: newName });
                            }}
                            className="px-4 py-2 rounded-xl bg-[#E6F5EC] text-[#0A6E3B] text-xs font-bold border border-[#0A6E3B]/30 hover:bg-[#d5eedf] transition-all"
                          >
                            ✏️ Renommer
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        
                        {/* Cover photo & Logo */}
                        <div className="space-y-4">
                          <h4 className="font-bold text-sm text-[#081A10]">Photo de Couverture & Logo</h4>
                          <div className="relative h-52 rounded-3xl overflow-hidden bg-gray-900 border border-[#D8EADB] group shadow-inner">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={currentResto.coverImage} alt="" className="w-full h-full object-cover opacity-90" />
                            <button
                              onClick={() => {
                                const newUrl = prompt('Entrez l\'URL de votre nouvelle photo de couverture :', currentResto.coverImage);
                                if (newUrl) updateRestaurantShowcase(currentResto.id, { coverImage: newUrl });
                              }}
                              className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-black/60 text-white text-xs font-bold backdrop-blur-xs flex items-center gap-1 border border-white/20 shadow-md"
                            >
                              <Camera className="w-3.5 h-3.5" />
                              <span>Changer Couverture</span>
                            </button>

                            <div className="absolute bottom-3 inset-x-3 flex items-end justify-between text-white">
                              <div className="flex items-end gap-2.5">
                                <div className="relative group/logo">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={currentResto.logo}
                                    alt=""
                                    className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-lg bg-white"
                                  />
                                  <button
                                    onClick={() => {
                                      const newLogo = prompt('Entrez l\'URL du logo :', currentResto.logo);
                                      if (newLogo) updateRestaurantShowcase(currentResto.id, { logo: newLogo });
                                    }}
                                    className="absolute inset-0 bg-black/60 rounded-2xl text-[9px] text-white font-bold flex items-center justify-center opacity-0 group-hover/logo:opacity-100 transition-opacity"
                                  >
                                    Changer
                                  </button>
                                </div>
                                <div>
                                  <h5 className="font-black text-sm">{currentResto.name}</h5>
                                  <p className="text-[10px] text-gray-200 line-clamp-1">{currentResto.tagline}</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Gallery Photos */}
                          <div className="space-y-3 pt-2">
                            <div className="flex justify-between items-center">
                              <h4 className="font-bold text-sm text-[#081A10]">
                                Galerie HD ({currentResto.gallery?.length || 0})
                              </h4>
                              <button
                                onClick={() => {
                                  const p = prompt('URL de la photo à ajouter :');
                                  if (p) updateRestaurantShowcase(currentResto.id, { gallery: [...(currentResto.gallery || []), p] });
                                }}
                                className="text-xs font-bold text-[#0A6E3B] hover:underline"
                              >
                                + Ajouter photo
                              </button>
                            </div>

                            <div className="grid grid-cols-4 gap-2">
                              {currentResto.gallery?.map((img, idx) => (
                                <div key={idx} className="relative aspect-4/3 rounded-xl overflow-hidden bg-gray-100 border border-[#D8EADB] group shadow-2xs">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={img} alt="" className="w-full h-full object-cover" />
                                  <button
                                    onClick={() => {
                                      const cur = currentResto.gallery || [];
                                      updateRestaurantShowcase(currentResto.id, { gallery: cur.filter((_, i) => i !== idx) });
                                    }}
                                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[9px] opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Presentation info, Badges & Amenities */}
                        <div className="space-y-4">
                          
                          {/* Slogan & Address */}
                          <div className="p-4 rounded-3xl bg-[#F4F7F4] border border-[#D8EADB] space-y-2.5 text-xs">
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-sm text-[#081A10]">Informations Publiques</h4>
                              <button
                                onClick={() => {
                                  const tag = prompt('Slogan d\'ambiance :', currentResto.tagline || '');
                                  const range = prompt('Fourchette tarifaire :', currentResto.priceRange || '');
                                  if (tag !== null || range !== null) {
                                    updateRestaurantShowcase(currentResto.id, {
                                      tagline: tag || currentResto.tagline,
                                      priceRange: range || currentResto.priceRange,
                                    });
                                  }
                                }}
                                className="text-xs font-bold text-[#0A6E3B] hover:underline"
                              >
                                ✏️ Modifier
                              </button>
                            </div>

                            <div className="grid grid-cols-2 gap-2 bg-white p-3 rounded-2xl border border-[#D8EADB]">
                              <div>
                                <span className="text-[9px] text-gray-400 block font-bold">Fourchette</span>
                                <span className="font-black text-xs text-[#0A6E3B]">{currentResto.priceRange || '2 500 - 6 500 FCFA'}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-gray-400 block font-bold">Quartier</span>
                                <span className="font-bold text-xs text-[#081A10]">{currentResto.neighborhood}</span>
                              </div>
                            </div>
                          </div>

                          {/* Badges */}
                          <div className="p-4 rounded-3xl bg-[#F4F7F4] border border-[#D8EADB] space-y-2.5">
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-sm text-[#081A10]">Badges d'Ambiance</h4>
                              <button
                                onClick={() => {
                                  const tag = prompt('Nouveau badge (ex: Vue Océan, Live Band, Romantique) :');
                                  if (tag && tag.trim()) {
                                    const cur = currentResto.ambianceTags || [];
                                    updateRestaurantShowcase(currentResto.id, { ambianceTags: [...cur, tag.trim()] });
                                  }
                                }}
                                className="text-xs font-bold text-[#0A6E3B] hover:underline"
                              >
                                + Ajouter
                              </button>
                            </div>

                            <div className="flex flex-wrap gap-1.5">
                              {currentResto.ambianceTags?.map((tag, idx) => (
                                <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#E6F5EC] text-[#0A6E3B] text-xs font-bold border border-[#0A6E3B]/20">
                                  <span>✨ {tag}</span>
                                  <button
                                    onClick={() => {
                                      const cur = currentResto.ambianceTags || [];
                                      updateRestaurantShowcase(currentResto.id, { ambianceTags: cur.filter((t) => t !== tag) });
                                    }}
                                    className="text-rose-500 font-bold ml-1"
                                  >
                                    ✕
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Amenities */}
                          <div className="p-4 rounded-3xl bg-[#F4F7F4] border border-[#D8EADB] space-y-2.5">
                            <h4 className="font-bold text-sm text-[#081A10]">Commodités Certifiées (Cochez pour activer)</h4>
                            <div className="grid grid-cols-2 gap-1.5 text-xs">
                              {['Wifi Fibre Gratuit', 'Parking Privé Gardé', 'Terrasse Panoramique', 'Salle Climatisée', 'Paiement Wave & OM', 'Espace Prière'].map((amenity, idx) => {
                                const isChecked = currentResto.amenities?.includes(amenity);
                                return (
                                  <button
                                    key={idx}
                                    onClick={() => {
                                      const cur = currentResto.amenities || [];
                                      const updated = cur.includes(amenity) ? cur.filter((a) => a !== amenity) : [...cur, amenity];
                                      updateRestaurantShowcase(currentResto.id, { amenities: updated });
                                    }}
                                    className={`p-2 rounded-xl border text-left flex items-center justify-between text-[11px] ${
                                      isChecked ? 'bg-[#E6F5EC] border-[#0A6E3B]/30 text-[#081A10] font-bold' : 'bg-white border-[#D8EADB] text-gray-400'
                                    }`}
                                  >
                                    <span>{amenity}</span>
                                    <span className={isChecked ? 'text-[#0A6E3B] font-bold' : 'text-gray-300'}>{isChecked ? '✓' : '+'}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                        </div>

                      </div>

                    </div>
                  </div>
                )}

                {/* 2. FLUX KDS & ORDER QUEUES */}
                {dashboardTab === 'kds' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {restoOrders.map((ord) => (
                        <div
                          key={ord.id}
                          onClick={() => setSelectedOrderForPos(ord.id)}
                          className="p-4 rounded-3xl border border-[#D8EADB] bg-white shadow-xs space-y-3 cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-black text-xs text-[#081A10]">{ord.orderNumber}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-gray-100 text-gray-700">
                              {ord.deliveryAddress.neighborhood}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-bold text-xs text-[#081A10]">{ord.clientName}</h4>
                            <p className="text-[10px] text-gray-400">{ord.clientPhone}</p>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                            <span className="font-black text-[#0A6E3B]">{formatFCFA(ord.subtotal)}</span>
                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                              {ord.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. MENU DISHES */}
                {dashboardTab === 'menu' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
                    {filteredDishes.map((dish) => (
                      <div key={dish.id} className="bg-white rounded-3xl border border-[#D8EADB] p-3.5 flex flex-col justify-between space-y-3 shadow-xs">
                        <div className="flex gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={dish.image} alt={dish.name} className="w-16 h-16 rounded-2xl object-cover bg-gray-100" />
                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-xs text-[#081A10] truncate">{dish.name}</h4>
                            <p className="text-[10px] text-gray-400 line-clamp-1">{dish.description}</p>
                            <span className="text-xs font-black text-[#0A6E3B] mt-1 block">{formatFCFA(dish.price)}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                          <button
                            onClick={() => toggleMenuItemAvailability(dish.id)}
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-black ${
                              dish.isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {dish.isAvailable ? 'En Stock 🟢' : 'Rupture 🔴'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 4. TABLE RESERVATIONS */}
                {dashboardTab === 'reservations' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {restoReservations.map((res) => (
                      <div key={res.id} className="p-4 rounded-2xl border border-[#D8EADB] bg-white space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-black text-xs text-[#081A10]">{res.clientName}</h4>
                            <p className="text-[10px] text-gray-400">{res.clientPhone} • Code : {res.reservationNumber}</p>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-[#FF7824]/10 text-[#FF7824] text-[10px] font-bold">
                            {res.occasion}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs bg-[#F4F7F4] p-2.5 rounded-xl">
                          <div>
                            <span className="text-[9px] text-gray-400 block font-bold">Créneau</span>
                            <span className="font-black text-[#081A10]">{res.date} • {res.time}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-gray-400 block font-bold">Convives</span>
                            <span className="font-black text-[#081A10]">{res.guestsCount} personnes</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 5. ANALYTICS */}
                {dashboardTab === 'analytics' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-5 rounded-3xl border border-[#D8EADB] shadow-xs">
                      <span className="text-xs font-bold text-gray-400 uppercase">Chiffre du Jour</span>
                      <h3 className="text-2xl font-black text-[#0A6E3B] mt-2">{formatFCFA(totalRevenue)}</h3>
                    </div>
                    <div className="bg-white p-5 rounded-3xl border border-[#D8EADB] shadow-xs">
                      <span className="text-xs font-bold text-gray-400 uppercase">Note Teranga</span>
                      <h3 className="text-2xl font-black text-amber-500 mt-2">⭐ {currentResto.rating} / 5</h3>
                    </div>
                    <div className="bg-white p-5 rounded-3xl border border-[#D8EADB] shadow-xs">
                      <span className="text-xs font-bold text-gray-400 uppercase">Commandes traitées</span>
                      <h3 className="text-2xl font-black text-[#081A10] mt-2">{restoOrders.length}</h3>
                    </div>
                  </div>
                )}

              </div>

            </div>

            {/* Right Panel POS Detail */}
            <div className="w-full lg:w-80 bg-white p-5 border-t lg:border-t-0 lg:border-l border-[#D8EADB] flex flex-col justify-between shrink-0">
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-[#064E2B] to-[#0A6E3B] text-white p-4 rounded-3xl shadow-md space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">Solde Caisse du Jour</span>
                  <h3 className="text-2xl font-black text-white">{formatFCFA(totalRevenue)}</h3>
                </div>

                {activeTicketOrder && (
                  <div className="space-y-3 text-xs">
                    <div className="bg-[#F4F7F4] p-3 rounded-2xl border border-[#D8EADB] space-y-1">
                      <p className="font-black text-[#081A10]">{activeTicketOrder.clientName}</p>
                      <p className="text-[10px] text-gray-400">{activeTicketOrder.clientPhone} • {activeTicketOrder.deliveryAddress.neighborhood}</p>
                    </div>

                    <div className="space-y-2">
                      {activeTicketOrder.items.map((it, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-[#F4F7F4]">
                          <span className="font-bold">{it.quantity}x {it.name}</span>
                          <span className="font-black text-[#0A6E3B]">{formatFCFA(it.price * it.quantity)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex justify-between font-black text-sm">
                      <span>Total net</span>
                      <span className="text-[#FF7824]">{formatFCFA(activeTicketOrder.subtotal)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          MODAL: RÉSERVER UNE TABLE (CLIENT VITRINE)
         ========================================================================= */}
      <AnimatePresence>
        {isBookTableModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBookTableModalOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative z-10 w-full max-w-md bg-white rounded-3xl p-6 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h3 className="font-black text-base text-[#081A10]">Réserver une Table</h3>
                  <p className="text-xs text-gray-400">Chez {currentResto.name} ({currentResto.neighborhood})</p>
                </div>
                <button
                  onClick={() => setIsBookTableModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleBookTableSubmit} className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500">Votre Nom Complet</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Mastü Sarr"
                    value={bookName}
                    onChange={(e) => setBookName(e.target.value)}
                    className="w-full p-2.5 bg-[#F4F7F4] border border-[#D8EADB] rounded-xl font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500">Téléphone / WhatsApp</label>
                    <input
                      type="tel"
                      required
                      placeholder="+221 77..."
                      value={bookPhone}
                      onChange={(e) => setBookPhone(e.target.value)}
                      className="w-full p-2.5 bg-[#F4F7F4] border border-[#D8EADB] rounded-xl font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500">Nombre de personnes</label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={bookGuests}
                      onChange={(e) => setBookGuests(Number(e.target.value))}
                      className="w-full p-2.5 bg-[#F4F7F4] border border-[#D8EADB] rounded-xl font-bold text-[#0A6E3B]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500">Date</label>
                    <input
                      type="date"
                      value={bookDate}
                      onChange={(e) => setBookDate(e.target.value)}
                      className="w-full p-2.5 bg-[#F4F7F4] border border-[#D8EADB] rounded-xl font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500">Heure du dîner</label>
                    <input
                      type="time"
                      value={bookTime}
                      onChange={(e) => setBookTime(e.target.value)}
                      className="w-full p-2.5 bg-[#F4F7F4] border border-[#D8EADB] rounded-xl font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500">Occasion de la sortie</label>
                  <select
                    value={bookOccasion}
                    onChange={(e) => setBookOccasion(e.target.value)}
                    className="w-full p-2.5 bg-[#F4F7F4] border border-[#D8EADB] rounded-xl font-bold text-[#081A10]"
                  >
                    <option value="Sortie avec ma copine">Sortie avec ma copine (Dîner en amoureux)</option>
                    <option value="Anniversaire">Anniversaire & Célébration</option>
                    <option value="Dîner d'affaires">Dîner d'affaires</option>
                    <option value="Sortie en famille">Sortie en famille & amis</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl brand-gradient text-white font-black text-xs shadow-md mt-2"
                >
                  Confirmer ma Réservation ➔
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          MODAL: PLEIN ÉCRAN IMAGE LIGHTBOX
         ========================================================================= */}
      <AnimatePresence>
        {selectedGalleryImage && (
          <div
            onClick={() => setSelectedGalleryImage(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          >
            <div className="relative max-w-2xl w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedGalleryImage}
                alt="Ambiance restaurant Dakar"
                className="w-full h-auto max-h-[85vh] rounded-3xl object-contain shadow-2xl border border-white/10"
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
          MODAL: NOUVEAU PLAT AU MENU
         ========================================================================= */}
      <AnimatePresence>
        {showAddDishModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddDishModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="relative z-10 bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <h3 className="font-extrabold text-lg text-[#081A10]">
                Ajouter un nouveau plat au menu
              </h3>
              
              <form onSubmit={handleCreateDish} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Nom du plat</label>
                  <input
                    type="text"
                    required
                    value={newDishName}
                    onChange={(e) => setNewDishName(e.target.value)}
                    placeholder="Ex: Yassa Crevettes de Casamance"
                    className="w-full px-3 py-2 bg-[#F4F7F4] border border-[#D8EADB] rounded-xl text-xs focus:bg-white focus:border-[#0A6E3B] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Description & Ingrédients</label>
                  <textarea
                    rows={2}
                    required
                    value={newDishDesc}
                    onChange={(e) => setNewDishDesc(e.target.value)}
                    placeholder="Ex: Crevettes marinées, oignons caramélisés..."
                    className="w-full px-3 py-2 bg-[#F4F7F4] border border-[#D8EADB] rounded-xl text-xs focus:bg-white focus:border-[#0A6E3B] focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Prix (FCFA)</label>
                    <input
                      type="number"
                      required
                      value={newDishPrice}
                      onChange={(e) => setNewDishPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[#F4F7F4] border border-[#D8EADB] rounded-xl text-xs focus:bg-white focus:border-[#0A6E3B] focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Catégorie</label>
                    <select
                      value={newDishCategory}
                      onChange={(e) => setNewDishCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F4F7F4] border border-[#D8EADB] rounded-xl text-xs focus:bg-white focus:border-[#0A6E3B] focus:outline-hidden"
                    >
                      <option value="cat-thieb">Thiéboudienne</option>
                      <option value="cat-dibi">Dibi & Grillades</option>
                      <option value="cat-pastels">Street Food & Pastels</option>
                      <option value="cat-drinks">Jus & Desserts</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#D8EADB] flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddDishModal(false)}
                    className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-600"
                  >
                    Annuler
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    type="submit"
                    className="px-5 py-2 rounded-xl brand-gradient text-white text-xs font-bold shadow-md"
                  >
                    Créer le plat
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
