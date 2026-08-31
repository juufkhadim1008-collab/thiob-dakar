'use client';

import React, { useState } from 'react';
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
  User, 
  Compass, 
  Sparkles,
  PhoneCall
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
      {/* Top Banner : Role Switcher Bar */}
      <div className="bg-[#07431E] text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#008235] text-white font-medium text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
              Plateforme Dakar en Direct
            </span>
            <span className="hidden sm:inline text-white/80">
              Changer d’espace pour tester les fonctionnalités :
            </span>
          </div>

          {/* Quick Role Switcher Pills */}
          <div className="flex items-center gap-1 bg-black/30 p-0.5 rounded-lg">
            {roleConfigs.map((item) => {
              const isActive = currentRole === item.role;
              return (
                <button
                  key={item.role}
                  onClick={() => setCurrentRole(item.role)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all ${
                    isActive
                      ? 'bg-[#FA8038] text-white shadow-xs font-semibold'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`text-[10px] px-1 rounded ${isActive ? 'bg-black/20 text-white' : 'bg-white/20 text-white/90'}`}>
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
            <div 
              onClick={() => setCurrentRole('client')} 
              className="cursor-pointer flex items-center gap-2.5 group"
            >
              <div className="w-11 h-11 rounded-2xl brand-gradient flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                <span className="text-2xl font-black tracking-tighter">TD</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-2xl font-extrabold tracking-tight text-[#07431E]">
                    Thiob<span className="text-[#FA8038]">.</span>Dakar
                  </span>
                </div>
                <p className="text-[11px] font-medium text-[#576A5E] tracking-wider uppercase">
                  Gastronomie & Livraison
                </p>
              </div>
            </div>

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
              <button
                onClick={() => setActiveTrackingOrder(activeTrackingOrder)}
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-[#EBF7EE] text-[#07431E] border border-[#008235]/30 text-xs font-bold hover:bg-[#008235] hover:text-white transition-all shadow-xs"
              >
                <span className="w-2 h-2 rounded-full bg-[#FA8038] animate-ping"></span>
                <span>Suivre {activeTrackingOrder.orderNumber}</span>
              </button>
            )}

            {/* Cart Button (Client mode) */}
            {currentRole === 'client' && (
              <button
                onClick={onOpenCart}
                className="relative flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#07431E] hover:bg-[#063517] text-white font-medium text-sm transition-all shadow-md active:scale-95"
              >
                <div className="relative">
                  <ShoppingBag className="w-4 h-4" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#FA8038] text-white text-[11px] font-bold flex items-center justify-center shadow-xs">
                      {cartCount}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline font-semibold">
                  {cartCount > 0 ? formatFCFA(cartTotal) : 'Panier'}
                </span>
              </button>
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
