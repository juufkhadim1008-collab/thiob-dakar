'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useApp } from '@/lib/store';
import { CATEGORIES, DAKAR_NEIGHBORHOODS } from '@/lib/mock-data';
import { Restaurant, MenuItem } from '@/lib/types';
import { formatFCFA } from '@/lib/utils';
import { calculateDistanceKm, formatDistanceString, DAKAR_DEFAULT_COORDS, DAKAR_GEO_PRESETS } from '@/lib/geolocation';
import dynamic from 'next/dynamic';
import { 
  Star, 
  Clock, 
  Bike, 
  Sparkles, 
  Plus, 
  Flame, 
  MapPin, 
  Check,
  Navigation,
  Map as MapIcon,
  SlidersHorizontal,
  ChevronDown,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { MapMarkerItem } from './map/ThiobMap';

const ThiobMap = dynamic(() => import('./map/ThiobMap'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-[#F0F5F2] rounded-3xl flex items-center justify-center text-xs text-gray-500 animate-pulse">
      Chargement de la Carte Thiob Dakar...
    </div>
  )
});

interface ClientSpaceProps {
  selectedNeighborhood: string;
  searchQuery: string;
}

export default function ClientSpace({
  selectedNeighborhood,
  searchQuery,
}: ClientSpaceProps) {
  const { 
    restaurants, 
    menuItems, 
    addToCart,
    clientCoords,
    clientAddress,
    clientNeighborhood,
    isClientGpsActive,
    requestClientGps,
    radiusFilterKm,
    setRadiusFilterKm,
    setClientLocation,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [selectedDishForModal, setSelectedDishForModal] = useState<MenuItem | null>(null);
  const [dishNotes, setDishNotes] = useState<string>('');
  const [justAddedId, setJustAddedId] = useState<string | null>(null);
  const [showMapViewModal, setShowMapViewModal] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isNeighborhoodDropdownOpen, setIsNeighborhoodDropdownOpen] = useState<boolean>(false);

  const activeOrigin = clientCoords || (selectedNeighborhood !== 'Tous les quartiers' && DAKAR_GEO_PRESETS[selectedNeighborhood] ? { lat: DAKAR_GEO_PRESETS[selectedNeighborhood].lat, lng: DAKAR_GEO_PRESETS[selectedNeighborhood].lng } : DAKAR_DEFAULT_COORDS);

  // Filter restaurants by neighborhood, search query, and distance
  const enrichedRestaurants = restaurants.map((resto) => {
    const restoCoords = resto.coordinates || (resto.latitude && resto.longitude ? { lat: resto.latitude, lng: resto.longitude } : DAKAR_GEO_PRESETS[resto.neighborhood] || DAKAR_DEFAULT_COORDS);
    const distanceKm = calculateDistanceKm(activeOrigin, restoCoords);
    return {
      ...resto,
      coordinates: restoCoords,
      distanceKm,
    };
  });

  // Filter restaurants
  const filteredRestaurants = enrichedRestaurants.filter((resto) => {
    const matchNeighborhood =
      selectedNeighborhood === 'Tous les quartiers' ||
      resto.neighborhood.toLowerCase().includes(selectedNeighborhood.toLowerCase());

    const matchSearch =
      searchQuery.trim() === '' ||
      resto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resto.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resto.featuredTags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchRadius = !isClientGpsActive || radiusFilterKm >= 15 || resto.distanceKm <= radiusFilterKm;

    return matchNeighborhood && matchSearch && matchRadius;
  }).sort((a, b) => a.distanceKm - b.distanceKm);

  // Filter dishes by category and search
  const filteredDishes = menuItems.filter((dish) => {
    const matchCat = selectedCategory === 'all' || dish.category === selectedCategory;
    const matchSearch =
      searchQuery.trim() === '' ||
      dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dish.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleQuickAdd = (dish: MenuItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    addToCart(dish);
    setJustAddedId(dish.id);
    setTimeout(() => setJustAddedId(null), 1200);
  };

  const handleAddWithCustomNotes = () => {
    if (!selectedDishForModal) return;
    addToCart(selectedDishForModal, dishNotes);
    setDishNotes('');
    setSelectedDishForModal(null);
  };

  const handleRequestGps = async () => {
    setIsLocating(true);
    setGpsError(null);
    try {
      await requestClientGps();
    } catch (err: any) {
      setGpsError(err.message || 'Impossible d’activer la localisation.');
    } finally {
      setIsLocating(false);
    }
  };

  const handleSelectNeighborhoodPreset = (name: string) => {
    const preset = DAKAR_GEO_PRESETS[name];
    if (preset) {
      setClientLocation({ lat: preset.lat, lng: preset.lng }, preset.name, preset.shortName);
    }
    setIsNeighborhoodDropdownOpen(false);
  };

  // Map markers for all visible restaurants + client
  const mapMarkers: MapMarkerItem[] = [
    ...(clientCoords ? [{
      id: 'client-position',
      lat: clientCoords.lat,
      lng: clientCoords.lng,
      type: 'client' as const,
      title: 'Votre Position',
      subtitle: clientAddress,
      statusText: `Zone : ${clientNeighborhood}`,
    }] : []),
    ...filteredRestaurants.map((r) => ({
      id: r.id,
      lat: r.coordinates?.lat || 14.7167,
      lng: r.coordinates?.lng || -17.4677,
      type: 'restaurant' as const,
      title: r.name,
      subtitle: `${r.neighborhood} • ${formatDistanceString(r.distanceKm)}`,
      statusText: `${r.deliveryTimeEstimate} • ${formatFCFA(r.deliveryFee)}`,
    })),
  ];

  // Stagger animation container
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="pb-24">
      
      {/* 📍 GEOLOCATION STATUS BAR / BANNER */}
      <div className="bg-[#07431E] text-white py-2.5 px-4 sm:px-6 lg:px-8 border-b border-[#008235]/30">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          
          {/* Location info or request prompt */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FA8038] animate-ping shrink-0" />
            {isClientGpsActive ? (
              <div className="flex items-center gap-1.5 font-bold">
                <span className="text-emerald-300">📍 Vous êtes à :</span>
                <span className="text-white bg-white/15 px-2.5 py-0.5 rounded-full border border-white/20">
                  {clientNeighborhood}
                </span>
                <span className="text-gray-300 text-[11px] hidden md:inline">({clientAddress})</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[#FA8038]">Activez votre localisation :</span>
                <span className="text-white/80">Pour afficher les restaurants les plus proches de vous à Dakar.</span>
              </div>
            )}
          </div>

          {/* Quick Location Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleRequestGps}
              disabled={isLocating}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#008235] to-[#FA8038] text-white font-black text-[11px] flex items-center gap-1.5 shadow-sm hover:opacity-95 transition-all disabled:opacity-50"
            >
              {isLocating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
              <span>{isLocating ? 'Détection...' : isClientGpsActive ? 'Actualiser GPS' : '📍 Autoriser ma localisation'}</span>
            </button>

            {/* Neighborhood quick switcher */}
            <div className="relative">
              <button
                onClick={() => setIsNeighborhoodDropdownOpen(!isNeighborhoodDropdownOpen)}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-[11px] flex items-center gap-1 border border-white/20"
              >
                <span>Changer de zone</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {isNeighborhoodDropdownOpen && (
                <div className="absolute right-0 mt-1 w-52 bg-white rounded-2xl shadow-2xl border border-gray-200 p-2 z-50 text-gray-800 text-xs font-bold space-y-1 max-h-60 overflow-y-auto">
                  <div className="px-2 py-1 text-[10px] text-gray-400 uppercase font-black">
                    Quartiers de Dakar
                  </div>
                  {Object.keys(DAKAR_GEO_PRESETS).map((key) => (
                    <button
                      key={key}
                      onClick={() => handleSelectNeighborhoodPreset(key)}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#EBF7EE] hover:text-[#008235] transition-colors flex items-center justify-between"
                    >
                      <span>{key}</span>
                      {clientNeighborhood === key && <Check className="w-3.5 h-3.5 text-[#008235]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Map View Toggle Button */}
            <button
              onClick={() => setShowMapViewModal(!showMapViewModal)}
              className="px-3 py-1.5 rounded-xl bg-white text-[#07431E] font-black text-[11px] flex items-center gap-1.5 shadow-sm hover:bg-[#EBF7EE] transition-all"
            >
              <MapIcon className="w-3.5 h-3.5 text-[#008235]" />
              <span>🗺️ Carte ({filteredRestaurants.length})</span>
            </button>
          </div>

        </div>

        {gpsError && (
          <div className="max-w-7xl mx-auto mt-2 p-2 rounded-xl bg-amber-500/20 text-amber-200 text-[11px] flex items-center gap-1.5 border border-amber-400/30">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{gpsError}</span>
          </div>
        )}
      </div>

      {/* 🌟 HERO SECTION */}
      <section className="relative overflow-hidden brand-gradient text-white py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#FA8038_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Content */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="lg:col-span-7 space-y-5"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-[#FA8038]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>La référence de la cuisine dakaroise en livraison</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
                Le meilleur du <span className="text-[#FA8038]">Thiéboudienne</span> & des délices de Dakar chez vous.
              </h1>

              <p className="text-sm sm:text-base text-white/80 max-w-xl font-normal leading-relaxed">
                Commandez auprès des maîtres restaurateurs de la capitale. Thiof royal, Dibi d'agneau au feu de bois, Yassa fondant et jus locaux livrés chauds à votre porte.
              </p>

              {/* Quick Highlight Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/15 max-w-lg">
                <div>
                  <h4 className="text-xl font-black text-white">25-35 min</h4>
                  <p className="text-[11px] text-white/70">Livraison moyenne</p>
                </div>
                <div>
                  <h4 className="text-xl font-black text-[#FA8038]">100% Frais</h4>
                  <p className="text-[11px] text-white/70">Cuisiné à la commande</p>
                </div>
                <div>
                  <h4 className="text-xl font-black text-emerald-400">🌊 Wave & OM</h4>
                  <p className="text-[11px] text-white/70">Paiement instantané</p>
                </div>
              </div>
            </motion.div>

            {/* Right Card / Promo Highlight */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="lg:col-span-5"
            >
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl shadow-2xl relative overflow-hidden group">
                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-[#FA8038]/30 rounded-full blur-2xl"></div>
                <span className="inline-block px-3 py-1 rounded-full bg-[#FA8038] text-white text-[11px] font-extrabold uppercase tracking-wider mb-3">
                  🔥 Plat Signature du Jour
                </span>
                <h3 className="text-xl font-extrabold text-white">
                  Ceebu Jën Rouge Royal au Thiof
                </h3>
                <p className="text-xs text-white/80 mt-1 line-clamp-2">
                  Préparé selon la tradition de Saint-Louis avec gros Thiof braisé, légumes de terroir et sauce Beugueudj.
                </p>
                <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/20">
                  <div>
                    <span className="text-xs text-white/70 block">Prix spécial</span>
                    <span className="text-lg font-black text-[#FA8038]">4 500 FCFA</span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleQuickAdd(menuItems[0])}
                    className="px-5 py-2.5 rounded-full bg-white text-[#07431E] hover:bg-[#FA8038] hover:text-white transition-colors text-xs font-bold shadow-md flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Ajouter direct</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 🍲 CATEGORIES CAROUSEL */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="bg-white p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-lg border border-[#E2ECE5] flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`relative px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-2 z-10 ${
              selectedCategory === 'all'
                ? 'text-white'
                : 'bg-[#F7FAF7] text-[#07431E] hover:bg-[#EBF7EE]'
            }`}
          >
            {selectedCategory === 'all' && (
              <motion.div
                layoutId="activeCategoryPill"
                className="absolute inset-0 brand-gradient rounded-xl shadow-xs -z-10"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span>🍽️ Tous les plats</span>
          </button>

          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`relative px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-2 z-10 ${
                  isSelected
                    ? 'text-white'
                    : 'bg-[#F7FAF7] text-[#07431E] hover:bg-[#EBF7EE]'
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="activeCategoryPill"
                    className="absolute inset-0 brand-gradient rounded-xl shadow-xs -z-10"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 🗺️ INTERACTIVE MAP ACCORDION / DRAWER */}
      <AnimatePresence>
        {showMapViewModal && (
          <motion.section
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 overflow-hidden"
          >
            <div className="bg-white p-5 rounded-3xl border border-[#D0E2D6] shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#008235] animate-ping" />
                    <h3 className="text-base font-black text-[#07431E]">Carte Interactive des Restaurants Dakar</h3>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {filteredRestaurants.length} restaurants ouverts autour de vous dans la presqu'île
                  </p>
                </div>

                {/* Radius selector buttons */}
                <div className="flex items-center gap-1 bg-[#F0F5F2] p-1 rounded-xl">
                  <span className="text-[10px] font-bold text-gray-400 px-2 uppercase">Rayon :</span>
                  {[
                    { km: 1, label: '1 km' },
                    { km: 2, label: '2 km' },
                    { km: 5, label: '5 km' },
                    { km: 10, label: '10 km' },
                    { km: 20, label: 'Tout Dakar' },
                  ].map((r) => (
                    <button
                      key={r.km}
                      onClick={() => setRadiusFilterKm(r.km)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        radiusFilterKm === r.km
                          ? 'bg-[#008235] text-white shadow-xs'
                          : 'text-gray-600 hover:text-black'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <ThiobMap
                center={activeOrigin}
                zoom={13}
                markers={mapMarkers}
                radiusMeters={radiusFilterKm * 1000}
                radiusCenter={activeOrigin}
                height="320px"
              />
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* 🏪 SECTION : RESTAURANTS À PROXIMITÉ (POSTGIS GÉOLOCALISÉS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#008235]"></span>
              <h2 className="text-xl sm:text-2xl font-black text-[#07431E]">
                Restaurants à Proximité
              </h2>
            </div>
            <p className="text-xs text-[#576A5E] mt-1">
              Calcul de distance en temps réel par rapport à votre position ({clientNeighborhood})
            </p>
          </div>

          {/* Quick Radius Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { km: 1, label: '1 km' },
              { km: 2, label: '2 km' },
              { km: 5, label: '5 km' },
              { km: 10, label: '10 km' },
              { km: 20, label: 'Tous' },
            ].map((r) => (
              <button
                key={r.km}
                onClick={() => setRadiusFilterKm(r.km)}
                className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all border ${
                  radiusFilterKm === r.km
                    ? 'bg-[#008235] text-white border-[#008235] shadow-xs'
                    : 'bg-white text-gray-600 border-[#E2ECE5] hover:bg-[#F7FAF7]'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Restaurants Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {filteredRestaurants.length === 0 ? (
            <div className="col-span-2 bg-white rounded-3xl border border-[#E2ECE5] p-8 text-center space-y-3">
              <span className="text-3xl">📍</span>
              <h4 className="font-extrabold text-base text-[#07431E]">Aucun restaurant trouvé dans un rayon de {radiusFilterKm} km</h4>
              <p className="text-xs text-gray-500">Nous élargissons automatiquement la recherche à 10 km pour vous proposer nos partenaires de Dakar.</p>
              <button
                onClick={() => setRadiusFilterKm(10)}
                className="px-4 py-2 rounded-xl brand-gradient text-white text-xs font-bold shadow-md"
              >
                Élargir à 10 km ➔
              </button>
            </div>
          ) : (
            filteredRestaurants.map((resto) => (
              <motion.div
                key={resto.id}
                variants={cardVariants}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedRestaurant(resto)}
                className="bg-white rounded-3xl border border-[#E2ECE5] overflow-hidden card-hover-lift cursor-pointer flex flex-col sm:flex-row group shadow-xs relative"
              >
                {/* Distance Badge on Card */}
                <div className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-full bg-[#008235] text-white text-[11px] font-black shadow-md flex items-center gap-1">
                  <Navigation className="w-3 h-3 text-[#FA8038]" />
                  <span>{formatDistanceString(resto.distanceKm)}</span>
                </div>

                {/* Image */}
                <div className="relative sm:w-2/5 h-48 sm:h-auto overflow-hidden bg-gray-100">
                  <img
                    src={resto.coverImage}
                    alt={resto.name}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-xs text-[#07431E] font-bold text-xs flex items-center gap-1 shadow-sm">
                    <Star className="w-3.5 h-3.5 text-[#F5B738] fill-[#F5B738]" />
                    <span>{resto.rating}</span>
                    <span className="text-gray-400 text-[10px]">({resto.reviewCount})</span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-5 sm:w-3/5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-[#008235] font-semibold mb-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{resto.neighborhood} • {resto.address}</span>
                    </div>
                    <h3 className="font-extrabold text-base text-[#07431E] group-hover:text-[#008235] transition-colors">
                      {resto.name}
                    </h3>
                    <p className="text-xs text-[#576A5E] mt-1 line-clamp-2">
                      {resto.tagline}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#E2ECE5] space-y-2">
                    <div className="flex flex-wrap gap-1.5">
                      {resto.featuredTags.map((tag, idx) => (
                        <span key={idx} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#F7FAF7] text-[#07431E] border border-[#E2ECE5]">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#008235]" />
                        <span>{resto.deliveryTimeEstimate}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bike className="w-3.5 h-3.5 text-[#FA8038]" />
                        <span>Livraison {formatFCFA(resto.deliveryFee)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </section>

      {/* 🍽️ SECTION : PLATS POPULAIRES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FA8038]"></span>
              <h2 className="text-xl sm:text-2xl font-black text-[#07431E]">
                Nos Plats Sénégalais à Découvrir
              </h2>
            </div>
            <p className="text-xs text-[#576A5E] mt-1">
              Sélection préparée avec passion par les meilleurs chefs de Dakar
            </p>
          </div>
          <span className="text-xs font-bold text-[#008235] bg-[#EBF7EE] px-3 py-1 rounded-full">
            {filteredDishes.length} plats disponibles
          </span>
        </div>

        {/* Dishes Animated Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filteredDishes.map((dish) => {
            const isAdded = justAddedId === dish.id;
            const parentResto = restaurants.find((r) => r.id === dish.restaurantId);

            return (
              <motion.div
                key={dish.id}
                variants={cardVariants}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedDishForModal(dish)}
                className="bg-white rounded-3xl border border-[#E2ECE5] overflow-hidden card-hover-lift flex flex-col cursor-pointer group shadow-xs"
              >
                {/* Dish Image Banner */}
                <div className="relative h-44 w-full overflow-hidden bg-gray-100">
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent"></div>
                  
                  {dish.isPopular && (
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#FA8038] text-white text-[10px] font-extrabold flex items-center gap-1 shadow-md">
                      <Flame className="w-3 h-3 fill-white" />
                      <span>Best Seller</span>
                    </div>
                  )}

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                    <span className="text-xs font-bold bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-md truncate max-w-[180px]">
                      {parentResto?.name}
                    </span>
                    <span className="text-xs font-medium bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#FA8038]" />
                      <span>{dish.preparationTimeMinutes} min</span>
                    </span>
                  </div>
                </div>

                {/* Dish Details */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-extrabold text-sm text-[#0D1C12] group-hover:text-[#008235] transition-colors line-clamp-1">
                      {dish.name}
                    </h3>
                    <p className="text-xs text-[#576A5E] mt-1.5 line-clamp-2 leading-relaxed">
                      {dish.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#E2ECE5] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 block font-bold">Prix</span>
                      <span className="text-sm font-black text-[#008235]">
                        {formatFCFA(dish.price)}
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleQuickAdd(dish, e)}
                      className={`px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                        isAdded
                          ? 'bg-[#008235] text-white'
                          : 'bg-[#F7FAF7] text-[#07431E] hover:bg-[#008235] hover:text-white'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Ajouté !</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Ajouter</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* 🍲 MODAL : PERSONNALISATION DU PLAT */}
      <AnimatePresence>
        {selectedDishForModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDishForModal(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="relative z-10 bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
            >
              {/* Header Image */}
              <div className="relative h-48 w-full">
                <img
                  src={selectedDishForModal.image}
                  alt={selectedDishForModal.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setSelectedDishForModal(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 space-y-4">
                <div>
                  <span className="text-[11px] font-bold uppercase text-[#008235] tracking-wider">
                    Détail du plat
                  </span>
                  <h3 className="text-lg font-black text-[#07431E] mt-0.5">
                    {selectedDishForModal.name}
                  </h3>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    {selectedDishForModal.description}
                  </p>
                </div>

                {/* Special Instructions / Notes */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Instructions spécifiques au Chef (Piment, sans oignon, etc.) :
                  </label>
                  <textarea
                    rows={2}
                    value={dishNotes}
                    onChange={(e) => setDishNotes(e.target.value)}
                    placeholder="Ex: Piment bien séparé, sauce tamarin en plus svp..."
                    className="w-full p-2.5 bg-[#F7FAF7] border border-[#E2ECE5] rounded-xl text-xs focus:bg-white focus:border-[#008235] focus:outline-hidden"
                  />
                </div>

                {/* Modal Footer */}
                <div className="pt-3 border-t border-[#E2ECE5] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Prix</span>
                    <span className="text-xl font-black text-[#008235]">
                      {formatFCFA(selectedDishForModal.price)}
                    </span>
                  </div>

                  <button
                    onClick={handleAddWithCustomNotes}
                    className="px-6 py-3 rounded-2xl brand-gradient text-white text-xs font-bold shadow-md hover:opacity-95 transition-all flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Ajouter au panier</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
