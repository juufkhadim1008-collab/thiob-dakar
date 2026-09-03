'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/lib/store';
import { 
  X, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Plus, 
  Trash2, 
  Check, 
  LogOut, 
  Sparkles, 
  Award, 
  ShoppingBag, 
  Calendar, 
  CreditCard, 
  ChevronRight, 
  Edit3, 
  Save, 
  ShieldCheck,
  Bike,
  ChefHat
} from 'lucide-react';
import { DAKAR_NEIGHBORHOODS } from '@/lib/mock-data';
import { formatFCFA } from '@/lib/utils';

export default function UserProfileDrawer() {
  const { 
    currentUser, 
    isAuthenticated, 
    isProfileDrawerOpen, 
    closeProfileDrawer, 
    openAuthModal, 
    logout, 
    updateUserProfile, 
    addUserAddress, 
    removeUserAddress, 
    setDefaultAddress,
    orders,
    reservations,
    currentRole,
    setCurrentRole
  } = useApp();

  const [activeSection, setActiveSection] = useState<'profile' | 'addresses' | 'orders'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');

  // New Address form states
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newLabel, setNewLabel] = useState('Maison');
  const [newNeighborhood, setNewNeighborhood] = useState('Almadies');
  const [newStreet, setNewStreet] = useState('');
  const [newLandmark, setNewLandmark] = useState('');

  if (!isProfileDrawerOpen) return null;

  const handleStartEdit = () => {
    if (!currentUser) return;
    setEditName(currentUser.name);
    setEditPhone(currentUser.phone);
    setEditEmail(currentUser.email || '');
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    await updateUserProfile({
      name: editName,
      phone: editPhone,
      email: editEmail
    });
    setIsEditing(false);
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreet) return;
    addUserAddress({
      label: newLabel,
      neighborhood: newNeighborhood,
      street: newStreet,
      landmark: newLandmark,
      isDefault: (currentUser?.addresses.length || 0) === 0
    });
    setIsAddingAddress(false);
    setNewStreet('');
    setNewLandmark('');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
        {/* Backdrop click to close */}
        <div className="absolute inset-0" onClick={closeProfileDrawer} />

        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-md bg-[#12141c] border-l border-amber-500/20 text-white h-full flex flex-col shadow-2xl z-10 overflow-hidden"
        >
          {/* Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#161924]">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Mon Compte</h3>
                <p className="text-xs text-white/50">Profil Thiéb & Co Dakar</p>
              </div>
            </div>
            <button
              onClick={closeProfileDrawer}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* If NOT Authenticated */}
          {!isAuthenticated || !currentUser ? (
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
                <User className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Vous n'êtes pas connecté</h4>
              <p className="text-xs text-white/60 max-w-xs mb-6">
                Connectez-vous pour retrouver vos adresses, cumuler des points Teranga et suivre vos commandes à Dakar.
              </p>
              <button
                onClick={() => { closeProfileDrawer(); openAuthModal('client'); }}
                className="w-full max-w-xs py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold text-sm rounded-2xl shadow-lg shadow-amber-500/20 hover:opacity-90 transition-opacity"
              >
                Se connecter / S'inscrire
              </button>
            </div>
          ) : (
            <>
              {/* Profile Card & Teranga Loyalty */}
              <div className="p-5 bg-gradient-to-b from-[#1c202d] to-[#12141c] border-b border-white/5">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    <img
                      src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={currentUser.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-500/40 shadow-lg"
                    />
                    <div className="absolute -bottom-1 -right-1 p-1 bg-amber-500 rounded-lg text-black">
                      {currentUser.role === 'admin' && <ShieldCheck className="w-3.5 h-3.5" />}
                      {currentUser.role === 'courier' && <Bike className="w-3.5 h-3.5" />}
                      {currentUser.role === 'restaurant' && <ChefHat className="w-3.5 h-3.5" />}
                      {currentUser.role === 'client' && <Sparkles className="w-3.5 h-3.5" />}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-base text-white truncate">{currentUser.name}</h4>
                      {currentUser.isVerified && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                          Vérifié
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/50 truncate flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-amber-400" />
                      {currentUser.phone}
                    </p>
                    {currentUser.email && (
                      <p className="text-xs text-white/40 truncate flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 text-white/30" />
                        {currentUser.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Teranga Points Badge */}
                <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-500 text-black font-bold">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[11px] text-amber-300 font-medium">Programme Teranga VIP</div>
                      <div className="text-sm font-black text-white">{currentUser.terangaPoints || 450} Points</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Niveau Thiéb d'Or
                  </span>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-white/5 bg-[#141722] px-3">
                <button
                  onClick={() => setActiveSection('profile')}
                  className={`flex-1 py-3 text-xs font-semibold text-center border-b-2 transition-all ${
                    activeSection === 'profile'
                      ? 'border-amber-500 text-amber-400'
                      : 'border-transparent text-white/50 hover:text-white'
                  }`}
                >
                  Infos & Rôle
                </button>
                <button
                  onClick={() => setActiveSection('addresses')}
                  className={`flex-1 py-3 text-xs font-semibold text-center border-b-2 transition-all ${
                    activeSection === 'addresses'
                      ? 'border-amber-500 text-amber-400'
                      : 'border-transparent text-white/50 hover:text-white'
                  }`}
                >
                  Adresses ({currentUser.addresses?.length || 0})
                </button>
                <button
                  onClick={() => setActiveSection('orders')}
                  className={`flex-1 py-3 text-xs font-semibold text-center border-b-2 transition-all ${
                    activeSection === 'orders'
                      ? 'border-amber-500 text-amber-400'
                      : 'border-transparent text-white/50 hover:text-white'
                  }`}
                >
                  Historique
                </button>
              </div>

              {/* Tab Contents */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* SECTION 1: PROFILE & ROLE */}
                {activeSection === 'profile' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-white/70 uppercase tracking-wider">
                        Informations Personnelles
                      </h5>
                      {!isEditing ? (
                        <button
                          onClick={handleStartEdit}
                          className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-semibold"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Modifier</span>
                        </button>
                      ) : (
                        <button
                          onClick={handleSaveEdit}
                          className="flex items-center gap-1 text-xs bg-amber-500 text-black px-2.5 py-1 rounded-lg font-bold hover:bg-amber-400"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Enregistrer</span>
                        </button>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/5">
                        <div>
                          <label className="block text-[11px] text-white/60 mb-1">Nom complet</label>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-white/60 mb-1">Téléphone</label>
                          <input
                            type="tel"
                            value={editPhone}
                            onChange={(e) => setEditPhone(e.target.value)}
                            className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-white/60 mb-1">Email</label>
                          <input
                            type="email"
                            value={editEmail}
                            onChange={(e) => setEditEmail(e.target.value)}
                            className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 p-4 rounded-2xl bg-white/5 border border-white/5">
                        <div className="flex justify-between text-xs py-1 border-b border-white/5">
                          <span className="text-white/50">Nom</span>
                          <span className="font-semibold text-white">{currentUser.name}</span>
                        </div>
                        <div className="flex justify-between text-xs py-1 border-b border-white/5">
                          <span className="text-white/50">Téléphone</span>
                          <span className="font-semibold text-white">{currentUser.phone}</span>
                        </div>
                        <div className="flex justify-between text-xs py-1">
                          <span className="text-white/50">Email</span>
                          <span className="font-semibold text-white">{currentUser.email || 'Non renseigné'}</span>
                        </div>
                      </div>
                    )}

                    {/* Role quick switcher */}
                    <div className="pt-2">
                      <h5 className="text-xs font-bold text-white/70 uppercase tracking-wider mb-2">
                        Basculer d'espace
                      </h5>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => { setCurrentRole('client'); closeProfileDrawer(); }}
                          className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                            currentRole === 'client'
                              ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                              : 'bg-white/5 border-white/5 text-white/70 hover:bg-white/10'
                          }`}
                        >
                          <Sparkles className="w-4 h-4 text-amber-400" />
                          <span>Espace Client</span>
                        </button>
                        <button
                          onClick={() => { setCurrentRole('courier'); closeProfileDrawer(); }}
                          className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                            currentRole === 'courier'
                              ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                              : 'bg-white/5 border-white/5 text-white/70 hover:bg-white/10'
                          }`}
                        >
                          <Bike className="w-4 h-4 text-blue-400" />
                          <span>Espace Livreur</span>
                        </button>
                        <button
                          onClick={() => { setCurrentRole('restaurant'); closeProfileDrawer(); }}
                          className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                            currentRole === 'restaurant'
                              ? 'bg-orange-500/20 border-orange-500 text-orange-300'
                              : 'bg-white/5 border-white/5 text-white/70 hover:bg-white/10'
                          }`}
                        >
                          <ChefHat className="w-4 h-4 text-orange-400" />
                          <span>Espace Restaurant</span>
                        </button>
                        <button
                          onClick={() => { setCurrentRole('admin'); closeProfileDrawer(); }}
                          className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                            currentRole === 'admin'
                              ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                              : 'bg-white/5 border-white/5 text-white/70 hover:bg-white/10'
                          }`}
                        >
                          <ShieldCheck className="w-4 h-4 text-purple-400" />
                          <span>Dashboard Admin</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* SECTION 2: ADRESSES DAKAR */}
                {activeSection === 'addresses' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="text-xs font-bold text-white/70 uppercase tracking-wider">
                        Vos Adresses à Dakar
                      </h5>
                      <button
                        onClick={() => setIsAddingAddress(!isAddingAddress)}
                        className="flex items-center gap-1 text-xs bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-1 rounded-lg font-semibold hover:bg-amber-500/20"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Ajouter</span>
                      </button>
                    </div>

                    {isAddingAddress && (
                      <form onSubmit={handleAddAddress} className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] text-white/60 mb-1">Libellé</label>
                            <input
                              type="text"
                              value={newLabel}
                              onChange={(e) => setNewLabel(e.target.value)}
                              placeholder="ex: Maison, Bureau"
                              className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-white/60 mb-1">Quartier Dakar</label>
                            <select
                              value={newNeighborhood}
                              onChange={(e) => setNewNeighborhood(e.target.value)}
                              className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white"
                            >
                              {DAKAR_NEIGHBORHOODS.filter(n => n !== 'Tous les quartiers').map(n => (
                                <option key={n} value={n} className="bg-gray-900">{n}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] text-white/60 mb-1">Rue / Numéro de villa</label>
                          <input
                            type="text"
                            value={newStreet}
                            onChange={(e) => setNewStreet(e.target.value)}
                            placeholder="ex: Route des Almadies, Villa 12"
                            className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-white/60 mb-1">Repère visuel (Landmark)</label>
                          <input
                            type="text"
                            value={newLandmark}
                            onChange={(e) => setNewLandmark(e.target.value)}
                            placeholder="ex: Portail vert, face pharmacie"
                            className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white"
                          />
                        </div>

                        <div className="flex gap-2 pt-1">
                          <button
                            type="submit"
                            className="flex-1 py-2 bg-amber-500 text-black font-bold text-xs rounded-xl hover:bg-amber-400"
                          >
                            Enregistrer l'adresse
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsAddingAddress(false)}
                            className="px-3 py-2 bg-white/5 text-white/60 font-medium text-xs rounded-xl hover:bg-white/10"
                          >
                            Annuler
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Address List */}
                    <div className="space-y-2">
                      {currentUser.addresses?.map((addr) => (
                        <div
                          key={addr.id}
                          className={`p-3.5 rounded-2xl border transition-all ${
                            addr.isDefault
                              ? 'bg-amber-500/10 border-amber-500/30'
                              : 'bg-white/5 border-white/5'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-2.5">
                              <MapPin className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-xs text-white">{addr.label}</span>
                                  {addr.isDefault && (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-500 text-black font-extrabold">
                                      Par défaut
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-white/80 font-medium mt-0.5">
                                  {addr.street}, {addr.neighborhood}
                                </p>
                                {addr.landmark && (
                                  <p className="text-[11px] text-white/50 italic mt-0.5">
                                    📍 {addr.landmark}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              {!addr.isDefault && (
                                <button
                                  onClick={() => setDefaultAddress(addr.id)}
                                  className="text-[10px] text-amber-400 hover:underline px-2 py-1"
                                >
                                  Choisir
                                </button>
                              )}
                              {currentUser.addresses.length > 1 && (
                                <button
                                  onClick={() => removeUserAddress(addr.id)}
                                  className="p-1 text-white/40 hover:text-red-400 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SECTION 3: ORDERS & RESERVATIONS */}
                {activeSection === 'orders' && (
                  <div className="space-y-3">
                    <h5 className="text-xs font-bold text-white/70 uppercase tracking-wider mb-1">
                      Vos dernières activités
                    </h5>

                    {orders.slice(0, 4).map((order) => (
                      <div key={order.id} className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-white">{order.restaurantName}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-semibold">
                            {formatFCFA(order.total)}
                          </span>
                        </div>
                        <p className="text-[11px] text-white/50 truncate">
                          {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-white/40 mt-2 pt-2 border-t border-white/5">
                          <span>N° {order.orderNumber}</span>
                          <span className="text-emerald-400 font-medium">Livrée avec succès</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer: Logout */}
              <div className="p-4 border-t border-white/10 bg-[#141620]">
                <button
                  onClick={logout}
                  className="w-full py-3 px-4 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Se déconnecter</span>
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
