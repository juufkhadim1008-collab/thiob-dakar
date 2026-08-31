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
  MapPin 
} from 'lucide-react';

export default function RestaurantSpace() {
  const { 
    restaurants, 
    menuItems, 
    orders, 
    updateOrderStatus, 
    toggleMenuItemAvailability, 
    addMenuItem 
  } = useApp();

  const currentResto = restaurants[0]; // Le Thiéb Royal de Dakar
  const restoOrders = orders.filter((o) => o.restaurantId === currentResto.id);
  const restoDishes = menuItems.filter((m) => m.restaurantId === currentResto.id);

  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'stats'>('orders');
  const [isOpen, setIsOpen] = useState(true);

  // New Dish Modal
  const [showAddDishModal, setShowAddDishModal] = useState(false);
  const [newDishName, setNewDishName] = useState('');
  const [newDishDesc, setNewDishDesc] = useState('');
  const [newDishPrice, setNewDishPrice] = useState(4000);
  const [newDishCategory, setNewDishCategory] = useState('cat-thieb');

  const pendingOrders = restoOrders.filter((o) => o.status === 'pending');
  const preparingOrders = restoOrders.filter((o) => o.status === 'preparing');
  const readyOrders = restoOrders.filter((o) => o.status === 'ready_for_pickup' || o.status === 'in_transit');
  const completedOrders = restoOrders.filter((o) => o.status === 'delivered');

  const totalRevenue = restoOrders
    .filter((o) => o.status !== 'cancelled')
    .reduce((acc, o) => acc + o.subtotal, 0);

  const handleCreateDish = (e: React.FormEvent) => {
    e.preventDefault();
    addMenuItem({
      restaurantId: currentResto.id,
      name: newDishName,
      description: newDishDesc,
      price: Number(newDishPrice),
      category: newDishCategory,
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      isAvailable: true,
      preparationTimeMinutes: 20,
    });
    setNewDishName('');
    setNewDishDesc('');
    setShowAddDishModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Resto Pro */}
      <motion.div 
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-6 border border-[#E2ECE5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl brand-gradient flex items-center justify-center text-white text-2xl shadow-md">
            👨‍🍳
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#008235] bg-[#EBF7EE] px-2.5 py-0.5 rounded-full">
                Dashboard Partenaire Pro
              </span>
              <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${isOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-emerald-600 animate-pulse' : 'bg-rose-600'}`}></span>
                {isOpen ? 'Ouvert & Prêt à recevoir' : 'Fermé temporairement'}
              </span>
            </div>
            <h1 className="text-2xl font-black text-[#07431E] mt-1">
              {currentResto.name}
            </h1>
            <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-[#008235]" />
              <span>{currentResto.address}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(!isOpen)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-2 ${
              isOpen 
                ? 'border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100'
                : 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{isOpen ? 'Fermer le restaurant' : 'Ouvrir le service'}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setShowAddDishModal(true)}
            className="px-4 py-2 rounded-xl brand-gradient text-white text-xs font-bold shadow-md flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau Plat</span>
          </motion.button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div whileHover={{ y: -3 }} className="bg-white p-5 rounded-3xl border border-[#E2ECE5] shadow-xs">
          <div className="flex items-center justify-between text-[#008235]">
            <span className="text-xs font-bold uppercase tracking-wider">Chiffre du Jour</span>
            <TrendingUp className="w-5 h-5" />
          </div>
          <h3 className="text-2xl font-black text-[#07431E] mt-2">
            {formatFCFA(totalRevenue)}
          </h3>
          <p className="text-[11px] text-gray-500 mt-1">
            Revenus nets avant commission
          </p>
        </motion.div>

        <motion.div whileHover={{ y: -3 }} className="bg-white p-5 rounded-3xl border border-[#E2ECE5] shadow-xs">
          <div className="flex items-center justify-between text-[#FA8038]">
            <span className="text-xs font-bold uppercase tracking-wider">Commandes du Jour</span>
            <ShoppingBag className="w-5 h-5" />
          </div>
          <h3 className="text-2xl font-black text-[#07431E] mt-2">
            {restoOrders.length}
          </h3>
          <p className="text-[11px] text-gray-500 mt-1">
            {pendingOrders.length} à traiter immédiatement
          </p>
        </motion.div>

        <motion.div whileHover={{ y: -3 }} className="bg-white p-5 rounded-3xl border border-[#E2ECE5] shadow-xs">
          <div className="flex items-center justify-between text-[#008235]">
            <span className="text-xs font-bold uppercase tracking-wider">Temps Cuisine</span>
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="text-2xl font-black text-[#07431E] mt-2">
            18 min
          </h3>
          <p className="text-[11px] text-gray-500 mt-1">
            Moyenne de préparation à Dakar
          </p>
        </motion.div>

        <motion.div whileHover={{ y: -3 }} className="bg-white p-5 rounded-3xl border border-[#E2ECE5] shadow-xs">
          <div className="flex items-center justify-between text-[#F5B738]">
            <span className="text-xs font-bold uppercase tracking-wider">Note Clients</span>
            <span className="text-base">⭐</span>
          </div>
          <h3 className="text-2xl font-black text-[#07431E] mt-2">
            {currentResto.rating} / 5
          </h3>
          <p className="text-[11px] text-gray-500 mt-1">
            Basé sur {currentResto.reviewCount} avis dakarois
          </p>
        </motion.div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-[#E2ECE5] pb-3">
        <button
          onClick={() => setActiveTab('orders')}
          className={`relative px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 z-10 ${
            activeTab === 'orders' ? 'text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          {activeTab === 'orders' && (
            <motion.div
              layoutId="activeRestoTab"
              className="absolute inset-0 brand-gradient rounded-xl shadow-xs -z-10"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
          <Bell className="w-4 h-4" />
          <span>Gestion des Commandes en Direct</span>
          {pendingOrders.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-[#FA8038] text-white text-[10px] font-bold flex items-center justify-center">
              {pendingOrders.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('menu')}
          className={`relative px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 z-10 ${
            activeTab === 'menu' ? 'text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          {activeTab === 'menu' && (
            <motion.div
              layoutId="activeRestoTab"
              className="absolute inset-0 brand-gradient rounded-xl shadow-xs -z-10"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
          <Utensils className="w-4 h-4" />
          <span>Éditeur de Menu ({restoDishes.length} plats)</span>
        </button>
      </div>

      {/* TAB 1: KANBAN DES COMMANDES WITH ANIMATED LAYOUTS */}
      {activeTab === 'orders' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Col 1 : Nouvelles Commandes (Pending) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-50 border border-amber-200">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
                <h4 className="font-extrabold text-xs text-amber-900 uppercase tracking-wider">
                  1. À Accepter ({pendingOrders.length})
                </h4>
              </div>
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {pendingOrders.map((order) => (
                  <motion.div 
                    key={order.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="bg-white p-4 rounded-3xl border-2 border-amber-300 shadow-md space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-[#07431E]">
                        {order.orderNumber}
                      </span>
                      <span className="text-[11px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-md">
                        {order.createdAt}
                      </span>
                    </div>

                    <div className="text-xs text-gray-700 bg-[#F7FAF7] p-2.5 rounded-xl border border-[#E2ECE5] space-y-1">
                      <p className="font-bold text-[#0D1C12]">{order.clientName}</p>
                      <p className="text-[11px] text-gray-500">{order.clientPhone}</p>
                      <p className="text-[11px] text-[#008235] font-semibold">
                        📍 {order.deliveryAddress.neighborhood} ({order.deliveryAddress.street})
                      </p>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between font-medium">
                          <span>{item.quantity}x {item.name}</span>
                          <span className="font-bold text-[#07431E]">{formatFCFA(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-[#E2ECE5] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-gray-400 block">Total net</span>
                        <span className="text-sm font-black text-[#FA8038]">{formatFCFA(order.subtotal)}</span>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => updateOrderStatus(order.id, 'preparing')}
                        className="px-4 py-2 rounded-xl brand-gradient text-white text-xs font-bold shadow-md flex items-center gap-1.5"
                      >
                        <ChefHat className="w-3.5 h-3.5" />
                        <span>Accepter & Cuisiner</span>
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {pendingOrders.length === 0 && (
                <div className="p-8 text-center bg-white rounded-3xl border border-dashed border-gray-200 text-xs text-gray-400">
                  Aucune commande en attente.
                </div>
              )}
            </div>
          </div>

          {/* Col 2 : En Cuisine (Preparing) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-orange-50 border border-orange-200">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FA8038]"></span>
                <h4 className="font-extrabold text-xs text-orange-900 uppercase tracking-wider">
                  2. En Cuisine 🍳 ({preparingOrders.length})
                </h4>
              </div>
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {preparingOrders.map((order) => (
                  <motion.div 
                    key={order.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="bg-white p-4 rounded-3xl border border-orange-200 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-[#07431E]">
                        {order.orderNumber}
                      </span>
                      <span className="text-[11px] text-orange-600 font-bold bg-orange-50 px-2 py-0.5 rounded-md">
                        En préparation
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between font-medium">
                          <span>{item.quantity}x {item.name}</span>
                          <span className="font-bold text-[#07431E]">{formatFCFA(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-[#E2ECE5] flex items-center justify-between">
                      <span className="text-xs text-gray-500 truncate max-w-[120px]">
                        {order.deliveryAddress.neighborhood}
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => updateOrderStatus(order.id, 'ready_for_pickup')}
                        className="px-4 py-2 rounded-xl brand-gradient-orange text-white text-xs font-bold shadow-md flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Plat Prêt</span>
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {preparingOrders.length === 0 && (
                <div className="p-8 text-center bg-white rounded-3xl border border-dashed border-gray-200 text-xs text-gray-400">
                  Aucun plat en cours de cuisson.
                </div>
              )}
            </div>
          </div>

          {/* Col 3 : Prêtes / En Livraison */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#008235]"></span>
                <h4 className="font-extrabold text-xs text-emerald-900 uppercase tracking-wider">
                  3. Prises en charge ({readyOrders.length + completedOrders.length})
                </h4>
              </div>
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {[...readyOrders, ...completedOrders].map((order) => {
                  const badge = getStatusBadge(order.status);
                  return (
                    <motion.div 
                      key={order.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white p-4 rounded-3xl border border-[#E2ECE5] shadow-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-[#07431E]">
                          {order.orderNumber}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badge.bg} ${badge.text} ${badge.border}`}>
                          {badge.label}
                        </span>
                      </div>

                      <p className="text-xs text-gray-600">
                        Livreur : <strong className="text-[#07431E]">{order.courierName || 'Affectation en cours...'}</strong>
                      </p>
                      <p className="text-[11px] text-gray-500">
                        Client : {order.clientName} ({order.deliveryAddress.neighborhood})
                      </p>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: GESTIONNAIRE DE MENU */}
      {activeTab === 'menu' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-[#E2ECE5] p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-extrabold text-lg text-[#07431E]">
                Carte des Plats du Restaurant
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Activez ou désactivez un plat en temps réel selon vos stocks en cuisine.
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setShowAddDishModal(true)}
              className="px-4 py-2 rounded-xl brand-gradient text-white text-xs font-bold shadow-md flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter un plat</span>
            </motion.button>
          </div>

          <div className="divide-y divide-[#E2ECE5]">
            {restoDishes.map((dish) => (
              <div key={dish.id} className="py-4 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                <div className="flex items-center gap-4 min-w-0">
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="w-16 h-16 rounded-2xl object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-[#0D1C12] truncate">
                        {dish.name}
                      </h4>
                      {dish.isPopular && (
                        <span className="px-2 py-0.5 rounded-full bg-[#FA8038]/10 text-[#FA8038] text-[10px] font-bold">
                          Best Seller
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate max-w-md mt-0.5">
                      {dish.description}
                    </p>
                    <span className="text-xs font-black text-[#008235] mt-1 block">
                      {formatFCFA(dish.price)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={() => toggleMenuItemAvailability(dish.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                      dish.isAvailable
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-gray-100 text-gray-500 border-gray-200'
                    }`}
                  >
                    {dish.isAvailable ? <ToggleRight className="w-4 h-4 text-[#008235]" /> : <ToggleLeft className="w-4 h-4 text-gray-400" />}
                    <span>{dish.isAvailable ? 'Disponible' : 'Épuisé'}</span>
                  </motion.button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* MODAL AJOUT PLAT */}
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
              <h3 className="font-extrabold text-lg text-[#07431E]">
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
                    className="w-full px-3 py-2 bg-[#F7FAF7] border border-[#E2ECE5] rounded-xl text-xs focus:bg-white focus:border-[#008235] focus:outline-hidden"
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
                    className="w-full px-3 py-2 bg-[#F7FAF7] border border-[#E2ECE5] rounded-xl text-xs focus:bg-white focus:border-[#008235] focus:outline-hidden"
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
                      className="w-full px-3 py-2 bg-[#F7FAF7] border border-[#E2ECE5] rounded-xl text-xs focus:bg-white focus:border-[#008235] focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Catégorie</label>
                    <select
                      value={newDishCategory}
                      onChange={(e) => setNewDishCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F7FAF7] border border-[#E2ECE5] rounded-xl text-xs focus:bg-white focus:border-[#008235] focus:outline-hidden"
                    >
                      <option value="cat-thieb">Thiéboudienne</option>
                      <option value="cat-yassa">Yassa & Mafé</option>
                      <option value="cat-dibi">Dibi & Grillades</option>
                      <option value="cat-street">Street Food & Pastels</option>
                      <option value="cat-boissons">Jus & Desserts</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E2ECE5] flex items-center justify-end gap-2">
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
