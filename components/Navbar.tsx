'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/lib/store';
import { UserRole } from '@/lib/types';
import { DAKAR_NEIGHBORHOODS } from '@/lib/mock-data';
import { 
  ShoppingBag, 
  MapPin, 
  Search, 
  ChefHat, 
  Bike, 
  ShieldCheck, 
  Compass, 
  Sparkles 
} from 'lucide-react';
import { formatFCFA } from '@/lib/utils';

interface NavbarProps {
  onOpenCart: () => void;
  selectedNeighborhood: string;
  onSelectNeighborhood: (n: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export default function Navbar({
  onOpenCart,
  selectedNeighborhood,
  onSelectNeighborhood,
  searchQuery,
  onSearchChange,
}: NavbarProps) {
  const { currentRole, setCurrentRole, cartCount, cartTotal, activeTrackingOrder, setActiveTrackingOrder } = useApp();

  const roleConfigs: { role: UserRole; label: string; icon: React.ReactNode; badge?: string }[] = [
    { role: 'client', label: 'Espace Client', icon: <Compass className="w-4 h-4" /> },
    { role: 'restaurant', label: 'Dashboard Resto', icon: <ChefHat className="w-4 h-4" />, badge: 'Pro' },
    { role: 'courier', label: 'Espace Livreur', icon: <Bike className="w-4 h-4" />, badge: 'GPS' },
    { role: 'admin', label: 'Super Admin', icon: <ShieldCheck className="w-4 h-4" />, badge: '360°' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-nav shadow-xs">
      {/* Top Banner : Animated Role Switcher Bar */}
      <div className="bg-[#07431E] text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#008235] text-white font-medium text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
              Plateforme Dakar en Direct
            </span>
            <span className="hidden sm:inline text-white/80">
              Changer d’espace pour tester :
            </span>
          </div>

          {/* Quick Role Switcher Pills with Framer Motion layoutId */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl">
            {roleConfigs.map((item) => {
              const isActive = currentRole === item.role;
              return (
                <button
                  key={item.role}
                  onClick={() => setCurrentRole(item.role)}
                  className="relative flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium text-xs transition-colors z-10"
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeRoleIndicator"
                      className="absolute inset-0 bg-[#FA8038] rounded-lg shadow-md -z-10"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}
                  <span className={isActive ? 'text-white' : 'text-white/70 hover:text-white'}>
                    {item.icon}
                  </span>
                  <span className={isActive ? 'text-white font-bold' : 'text-white/70 hover:text-white'}>
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className={`text-[10px] px-1 rounded ${isActive ? 'bg-black/20 text-white' : 'bg-white/10 text-white/80'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo Thiob-Dakar */}
          <div className="flex items-center gap-3">
            <motion.div 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setCurrentRole('client')} 
              className="cursor-pointer flex items-center gap-2 group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/images/Icone app.png" 
                alt="Thiob Express" 
                className="h-11 w-11 rounded-2xl object-cover drop-shadow-md border border-emerald-400/30" 
              />
              <div className="hidden sm:block">
                <span className="font-black text-lg text-[#081A10] leading-none block">
                  Thiob<span className="text-[#FF7824]">.Dakar</span>
                </span>
                <p className="text-[9px] font-extrabold text-[#0A6E3B] tracking-wider uppercase mt-0.5">
                  Gastronomie & Découverte
                </p>
              </div>
            </motion.div>

            {/* Dakar Neighborhood Selector (Client mode) */}
            {currentRole === 'client' && (
              <div className="hidden lg:flex items-center gap-2 ml-4 pl-4 border-l border-[#E2ECE5]">
                <MapPin className="w-4 h-4 text-[#008235]" />
                <select
                  value={selectedNeighborhood}
                  onChange={(e) => onSelectNeighborhood(e.target.value)}
                  className="bg-transparent text-sm font-semibold text-[#07431E] focus:outline-hidden cursor-pointer hover:text-[#008235]"
                >
                  {DAKAR_NEIGHBORHOODS.map((nh) => (
                    <option key={nh} value={nh} className="text-[#0D1C12]">
                      {nh}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Search Bar (Client mode) */}
          {currentRole === 'client' && (
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8CA094]" />
                <input
                  type="text"
                  placeholder="Rechercher un plat (Thiéboudienne, Dibi, Yassa...) ou restaurant..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F0F5F1] border border-transparent rounded-full text-sm placeholder-[#8CA094] focus:bg-white focus:border-[#008235] focus:ring-2 focus:ring-[#008235]/20 focus:outline-hidden transition-all"
                />
              </div>
            </div>
          )}

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Live Order Tracking Quick Button */}
            {activeTrackingOrder && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTrackingOrder(activeTrackingOrder)}
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-[#EBF7EE] text-[#07431E] border border-[#008235]/30 text-xs font-bold shadow-xs"
              >
                <span className="w-2 h-2 rounded-full bg-[#FA8038] animate-ping"></span>
                <span>Suivre {activeTrackingOrder.orderNumber}</span>
              </motion.button>
            )}

            {/* Cart Button (Client mode) with animated badge */}
            {currentRole === 'client' && (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={onOpenCart}
                className="relative flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#07431E] hover:bg-[#063517] text-white font-medium text-sm shadow-md"
              >
                <div className="relative">
                  <ShoppingBag className="w-4 h-4" />
                  {cartCount > 0 && (
                    <motion.span 
                      key={cartCount}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                      className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#FA8038] text-white text-[11px] font-bold flex items-center justify-center shadow-xs"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </div>
                <span className="hidden sm:inline font-semibold">
                  {cartCount > 0 ? formatFCFA(cartTotal) : 'Panier'}
                </span>
              </motion.button>
            )}

            {/* Current Active Role Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#E2ECE5] text-xs font-semibold text-[#07431E]">
              <span className="w-2 h-2 rounded-full bg-[#008235]"></span>
              <span>
                {currentRole === 'client' && 'Mode Client'}
                {currentRole === 'restaurant' && 'Restaurant (Le Thiéb Royal)'}
                {currentRole === 'courier' && 'Livreur (Ibrahima)'}
                {currentRole === 'admin' && 'Admin Dakar 360°'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
