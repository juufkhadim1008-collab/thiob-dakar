'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useApp } from '@/lib/store';
import { CATEGORIES } from '@/lib/mock-data';
import { Restaurant, MenuItem } from '@/lib/types';
import { formatFCFA } from '@/lib/utils';
import { 
  Star, 
  Clock, 
  Bike, 
  Sparkles, 
  Plus, 
  Flame, 
  MapPin, 
  Check
} from 'lucide-react';

interface ClientSpaceProps {
  selectedNeighborhood: string;
  searchQuery: string;
}

export default function ClientSpace({
  selectedNeighborhood,
  searchQuery,
}: ClientSpaceProps) {
  const { restaurants, menuItems, addToCart } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [selectedDishForModal, setSelectedDishForModal] = useState<MenuItem | null>(null);
  const [dishNotes, setDishNotes] = useState<string>('');
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  // Filter restaurants by neighborhood and search
  const filteredRestaurants = restaurants.filter((resto) => {
    const matchNeighborhood =
      selectedNeighborhood === 'Tous les quartiers' ||
      resto.neighborhood.toLowerCase().includes(selectedNeighborhood.toLowerCase());

    const matchSearch =
      searchQuery.trim() === '' ||
      resto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resto.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resto.featuredTags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchNeighborhood && matchSearch;
  });

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

      {/* 🍽️ SECTION : PLATS POPULAIRES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
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
                      <span className="text-[10px] text-gray-400 uppercase font-semibold block">Prix</span>
                      <span className="text-sm font-black text-[#07431E]">
                        {formatFCFA(dish.price)}
                      </span>
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={(e) => handleQuickAdd(dish, e)}
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${
                        isAdded
                          ? 'bg-[#008235] text-white scale-110'
                          : 'bg-[#FA8038] hover:bg-[#E36D26] text-white shadow-md'
                      }`}
                      title="Ajouter au panier"
                    >
                      {isAdded ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* 🏢 SECTION : RESTAURANTS PARTENAIRES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#008235]"></span>
              <h2 className="text-xl sm:text-2xl font-black text-[#07431E]">
                Restaurants Partenaires à {selectedNeighborhood}
              </h2>
            </div>
            <p className="text-xs text-[#576A5E] mt-1">
              Les adresses incontournables des Almadies, du Plateau, de Mermoz et Ngor
            </p>
          </div>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {filteredRestaurants.map((resto) => (
            <motion.div
              key={resto.id}
              variants={cardVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedRestaurant(resto)}
              className="bg-white rounded-3xl border border-[#E2ECE5] overflow-hidden card-hover-lift cursor-pointer flex flex-col sm:flex-row group shadow-xs"
            >
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
                    <span>{resto.neighborhood}</span>
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
          ))}
        </motion.div>
      </section>

      {/* 🍲 MODAL : PERSONNALISATION DU PLAT WITH ANIMATEPRESENCE */}
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
                    <span className="text-base font-black text-[#FA8038]">
                      {formatFCFA(selectedDishForModal.price)}
                    </span>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddWithCustomNotes}
                    className="px-6 py-2.5 rounded-full brand-gradient-orange text-white text-xs font-bold shadow-lg flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Ajouter au panier</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🏢 MODAL : DETAIL D'UN RESTAURANT WITH ANIMATEPRESENCE */}
      <AnimatePresence>
        {selectedRestaurant && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRestaurant(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="relative z-10 bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="relative h-44 w-full">
                <img
                  src={selectedRestaurant.coverImage}
                  alt={selectedRestaurant.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent"></div>
                <button
                  onClick={() => setSelectedRestaurant(null)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
                >
                  ✕
                </button>
                <div className="absolute bottom-4 left-6 text-white">
                  <span className="text-xs font-bold bg-[#008235] px-2.5 py-0.5 rounded-md">
                    📍 {selectedRestaurant.neighborhood}
                  </span>
                  <h3 className="text-2xl font-black mt-1">{selectedRestaurant.name}</h3>
                  <p className="text-xs text-white/80">{selectedRestaurant.address}</p>
                </div>
              </div>

              <div className="p-6 overflow-y-auto space-y-4">
                <h4 className="font-extrabold text-sm text-[#07431E] uppercase tracking-wider">
                  Menu & Spécialités du Restaurant
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {menuItems
                    .filter((m) => m.restaurantId === selectedRestaurant.id)
                    .map((dish) => (
                      <div
                        key={dish.id}
                        className="p-3.5 rounded-2xl bg-[#F7FAF7] border border-[#E2ECE5] flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <h5 className="font-bold text-xs text-[#0D1C12] truncate">{dish.name}</h5>
                          <p className="text-[11px] text-[#FA8038] font-bold mt-0.5">
                            {formatFCFA(dish.price)}
                          </p>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.92 }}
                          onClick={() => {
                            addToCart(dish);
                            setSelectedRestaurant(null);
                          }}
                          className="px-3 py-1.5 rounded-xl brand-gradient-orange text-white text-xs font-bold shadow-xs"
                        >
                          + Ajouter
                        </motion.button>
                      </div>
                    ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
