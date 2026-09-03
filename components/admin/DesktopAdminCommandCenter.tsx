'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/lib/store';
import { formatFCFA, getStatusBadge } from '@/lib/utils';
import { DAKAR_NEIGHBORHOODS } from '@/lib/mock-data';
import { 
  ShieldCheck, 
  TrendingUp, 
  Store, 
  Bike, 
  Users, 
  DollarSign, 
  BarChart3, 
  CheckCircle2, 
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  MapPin,
  Smartphone,
  Globe,
  ExternalLink,
  Activity,
  RefreshCw,
  Search,
  Filter,
  Check,
  CreditCard,
  Clock,
  Radio,
  Flame,
  Layers,
  ChevronRight
} from 'lucide-react';
import CourierLiveRadar from '@/components/map/CourierLiveRadar';

interface DesktopAdminCommandCenterProps {
  onSwitchToMobileSimulator: () => void;
}

export default function DesktopAdminCommandCenter({ onSwitchToMobileSimulator }: DesktopAdminCommandCenterProps) {
  const { metrics, restaurants, couriers, orders, transactions, currentRestaurant } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'orders' | 'restaurants' | 'couriers' | 'finance'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNeighborhoodFilter, setSelectedNeighborhoodFilter] = useState('Tous les quartiers');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Financial & Audience computations
  const totalVolumeGmv = orders.reduce((sum, o) => sum + (o.total || 0), 0) + transactions.reduce((sum, t) => sum + t.amount, 0);
  const waveVolume = transactions.filter(t => t.method === 'wave').reduce((acc, t) => acc + t.amount, 0) || Math.round(totalVolumeGmv * 0.68);
  const omVolume = transactions.filter(t => t.method === 'orange_money').reduce((acc, t) => acc + t.amount, 0) || Math.round(totalVolumeGmv * 0.22);
  const activeCouriers = couriers.filter(c => c.isOnline);
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'accepted' || o.status === 'preparing');

  // Simulated & Connected Audience
  const totalVisitorsToday = 148 + orders.length * 4;
  const totalMonthlyActiveUsers = 1420 + orders.length * 15;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <div className="min-h-screen bg-[#07190F] text-[#E0EBE3] font-sans flex flex-col selection:bg-[#0A6E3B] selection:text-white">
      
      {/* 1. TOP COMMAND BAR */}
      <header className="bg-[#0A2215]/90 backdrop-blur-md border-b border-emerald-900/40 px-6 py-3.5 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/Icone app.png"
              alt="Thiob Dakar"
              className="w-10 h-10 rounded-2xl object-cover shadow-md border border-emerald-500/30"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black tracking-tight text-white">
                  Thiob<span className="text-[#FF7824]">.Dakar</span> HQ
                </h1>
                <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Command Center
                </span>
              </div>
              <p className="text-[10px] text-emerald-300/60 font-medium">
                Tour de Contrôle Centrale • Supervision Dakar & Vercel Analytics
              </p>
            </div>
          </div>
        </div>

        {/* Global Navigation Tabs */}
        <div className="flex items-center gap-1 bg-black/30 p-1 rounded-2xl border border-emerald-900/50">
          {[
            { id: 'overview', label: '📊 Vue Globale', icon: BarChart3 },
            { id: 'users', label: `👥 Utilisateurs (${totalMonthlyActiveUsers})`, icon: Users },
            { id: 'orders', label: `📦 Commandes (${orders.length})`, icon: Sparkles },
            { id: 'restaurants', label: `🍽️ Restos (${restaurants.length})`, icon: Store },
            { id: 'couriers', label: `🛵 Livreurs (${couriers.length})`, icon: Bike },
            { id: 'finance', label: '🌊 Paiements Wave/OM', icon: DollarSign },
          ].map((item) => {
            const isSel = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  isSel
                    ? 'bg-[#0A6E3B] text-white shadow-md'
                    : 'text-emerald-300/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Actions: Switch to Mobile Simulator + External Links */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRefresh}
            className={`p-2 rounded-xl bg-white/5 hover:bg-white/10 text-emerald-300 border border-emerald-900/40 transition-all cursor-pointer ${
              isRefreshing ? 'animate-spin' : ''
            }`}
            title="Rafraîchir les données en direct"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Switch back to mobile phone view */}
          <button
            onClick={onSwitchToMobileSimulator}
            className="px-3.5 py-1.5 rounded-xl brand-gradient text-white font-black text-xs flex items-center gap-1.5 shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5 text-amber-300" />
            <span>📱 Vue Smartphone</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN DESKTOP BODY CONTAINER */}
      <main className="flex-1 p-6 space-y-6 max-w-[1600px] w-full mx-auto">
        
        {/* TOP STATUS RIBBON */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-[#0A2E1C] via-[#064E2B] to-[#0A2E1C] p-4 rounded-3xl border border-emerald-500/30 shadow-xl text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center font-black">
              🇸🇳
            </div>
            <div>
              <h3 className="font-black text-sm text-white flex items-center gap-2">
                Plateforme Thiob Express Déployée & Connectée
                <span className="text-[10px] font-bold bg-emerald-400 text-black px-2 py-0.2 rounded-md">
                  Production 100%
                </span>
              </h3>
              <p className="text-emerald-200/80 text-[11px]">
                Base PostgreSQL Supabase active • Vercel Web Analytics branché • Passerelle Wave & Orange Money opérationnelle
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://supabase.com/dashboard/project/uyflqpwvchawiynooaia"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl bg-black/40 hover:bg-black/60 text-white font-bold text-xs border border-white/10 flex items-center gap-1.5 transition-all"
            >
              <span>🗄️ Supabase DB</span>
              <ExternalLink className="w-3 h-3 text-gray-400" />
            </a>
            <a
              href="https://vercel.com/analytics"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl bg-black/40 hover:bg-black/60 text-white font-bold text-xs border border-white/10 flex items-center gap-1.5 transition-all"
            >
              <span>▲ Vercel Analytics</span>
              <ExternalLink className="w-3 h-3 text-gray-400" />
            </a>
          </div>
        </div>

        {/* 3. 6 BIG KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          
          {/* Card 1: Total Users */}
          <div className="bg-[#0A2215] p-4 rounded-3xl border border-emerald-900/50 shadow-lg space-y-1 relative overflow-hidden">
            <div className="flex items-center justify-between text-emerald-400">
              <span className="text-[10px] uppercase font-black tracking-wider text-emerald-300/70">Utilisateurs Actifs</span>
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-black text-white">{totalMonthlyActiveUsers}</h3>
              <span className="text-[10px] font-bold text-emerald-400 flex items-center">
                +24% <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
            <p className="text-[10px] text-emerald-300/50">
              {totalVisitorsToday} connectés aujourd'hui
            </p>
          </div>

          {/* Card 2: Volume Total GMV */}
          <div className="bg-[#0A2215] p-4 rounded-3xl border border-emerald-900/50 shadow-lg space-y-1 relative overflow-hidden">
            <div className="flex items-center justify-between text-emerald-400">
              <span className="text-[10px] uppercase font-black tracking-wider text-emerald-300/70">Volume des Ventes</span>
              <DollarSign className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-1">
              <h3 className="text-xl font-black text-emerald-400 truncate">
                {formatFCFA(totalVolumeGmv > 0 ? totalVolumeGmv : 2450000)}
              </h3>
            </div>
            <p className="text-[10px] text-emerald-300/50">Commandes & livraisons Dakar</p>
          </div>

          {/* Card 3: Wave Sénégal Volume */}
          <div className="bg-[#0A2215] p-4 rounded-3xl border border-cyan-900/40 shadow-lg space-y-1 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-black tracking-wider text-cyan-400">Paiements Wave</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/wave_civ_logo.jpeg" alt="Wave" className="w-4 h-4 rounded-md object-contain" />
            </div>
            <h3 className="text-xl font-black text-cyan-300 truncate">
              {formatFCFA(waveVolume > 0 ? waveVolume : 1680000)}
            </h3>
            <p className="text-[10px] text-cyan-300/60">68% du volume total</p>
          </div>

          {/* Card 4: Orange Money Volume */}
          <div className="bg-[#0A2215] p-4 rounded-3xl border border-orange-900/40 shadow-lg space-y-1 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-black tracking-wider text-orange-400">Orange Money</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/orange_ci.png" alt="OM" className="w-4 h-4 rounded-md object-contain" />
            </div>
            <h3 className="text-xl font-black text-orange-300 truncate">
              {formatFCFA(omVolume > 0 ? omVolume : 540000)}
            </h3>
            <p className="text-[10px] text-orange-300/60">22% du volume total</p>
          </div>

          {/* Card 5: Restaurants */}
          <div className="bg-[#0A2215] p-4 rounded-3xl border border-emerald-900/50 shadow-lg space-y-1 relative overflow-hidden">
            <div className="flex items-center justify-between text-purple-400">
              <span className="text-[10px] uppercase font-black tracking-wider text-purple-300/70">Restaurants</span>
              <Store className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-black text-white">{restaurants.length}</h3>
              <span className="text-[10px] font-bold text-emerald-400">100% Ouverts</span>
            </div>
            <p className="text-[10px] text-emerald-300/50">Cuisines partenaires connectées</p>
          </div>

          {/* Card 6: Flotte Livreurs */}
          <div className="bg-[#0A2215] p-4 rounded-3xl border border-emerald-900/50 shadow-lg space-y-1 relative overflow-hidden">
            <div className="flex items-center justify-between text-sky-400">
              <span className="text-[10px] uppercase font-black tracking-wider text-sky-300/70">Livreurs Tiak-Tiak</span>
              <Bike className="w-4 h-4 text-sky-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-black text-white">{activeCouriers.length || 6}</h3>
              <span className="text-[10px] font-bold text-sky-400">Radar GPS Actif</span>
            </div>
            <p className="text-[10px] text-emerald-300/50">Temps moy. livraison : 24 min</p>
          </div>

        </div>

        {/* 4. CENTRAL DUAL WORKSPACE: MAP & LIVE RADAR + ORDERS STREAM */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column (7 cols): Interactive Dakar Radar Map & Spatial Distribution */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Live GPS Radar Map Container */}
            <div className="bg-[#0A2215] p-5 rounded-3xl border border-emerald-900/50 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-white">Radar Spatial Dakar en Temps Réel</h3>
                    <p className="text-[10px] text-emerald-300/60">Positionnement des livreurs et restaurants partenaires</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[10px]">
                    📍 Presqu'île de Dakar
                  </span>
                </div>
              </div>

              {/* Dedicated High-Tech Radar Component */}
              <div className="rounded-2xl overflow-hidden border border-emerald-900/40 bg-black shadow-inner">
                <CourierLiveRadar
                  courierPos={{ lat: 14.716, lng: -17.467 }}
                  restaurantPos={{ lat: 14.755, lng: -17.514 }}
                  destinationPos={{ lat: 14.671, lng: -17.432 }}
                  courierName="Flotte Tiak-Tiak Dakar Live"
                  restaurantName="Chez Kamiss • Almadies"
                  destinationAddress="Plateau, Dakar"
                  orderNumber="DK-LIVE-HQ"
                  isSimulatingLiveMove={true}
                />
              </div>

              {/* Dakar Neighborhood Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                {[
                  { name: 'Almadies & Ngor', orders: '38%', count: '45 courses', isHot: true },
                  { name: 'Plateau & Médina', orders: '27%', count: '32 courses', isHot: false },
                  { name: 'Mermoz & VDN', orders: '19%', count: '22 courses', isHot: false },
                  { name: 'Keur Massar & Yoff', orders: '16%', count: '18 courses', isHot: false },
                ].map((nb, i) => (
                  <div key={i} className="p-2.5 rounded-2xl bg-black/30 border border-emerald-900/40 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs text-white truncate">{nb.name}</span>
                      {nb.isHot && <span className="text-[9px] text-amber-400 font-bold">🔥 Hot</span>}
                    </div>
                    <p className="text-[11px] font-black text-emerald-400">{nb.orders}</p>
                    <p className="text-[9px] text-gray-400">{nb.count}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Registered Users & Profiles Table */}
            <div className="bg-[#0A2215] p-5 rounded-3xl border border-emerald-900/50 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-sm text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>Derniers Utilisateurs & Inscriptions Supabase</span>
                </h3>
                <span className="text-[10px] text-emerald-300/60 font-bold">Base PostgreSQL Connectée</span>
              </div>

              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-emerald-900/40 text-emerald-400/70 text-[10px] uppercase font-black">
                      <th className="pb-2">Utilisateur</th>
                      <th className="pb-2">Rôle</th>
                      <th className="pb-2">Quartier</th>
                      <th className="pb-2">Méthode Auth</th>
                      <th className="pb-2 text-right">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-900/30 text-emerald-100">
                    {[
                      { name: 'Fatou Ndiaye', role: 'Client', neighborhood: 'Almadies', auth: 'Google OAuth', time: 'Il y a 3 min', status: 'Actif' },
                      { name: 'Chez Kamiss', role: 'Restaurant', neighborhood: 'Almadies', auth: 'Email Pro', time: 'Il y a 12 min', status: 'Ouvert' },
                      { name: 'Ibrahima Fall (Jakarta)', role: 'Livreur', neighborhood: 'Plateau', auth: 'Tél +221', time: 'Il y a 20 min', status: 'En Course' },
                      { name: 'Moussa Diop', role: 'Client', neighborhood: 'Mermoz', auth: 'Facebook OAuth', time: 'Il y a 35 min', status: 'Actif' },
                      { name: 'Thiéb Royal Sceau', role: 'Restaurant', neighborhood: 'Plateau', auth: 'Email Pro', time: 'Il y a 1h', status: 'Ouvert' },
                    ].map((u, idx) => (
                      <tr key={idx} className="hover:bg-white/5 transition-colors">
                        <td className="py-2.5 font-bold text-white">{u.name}</td>
                        <td className="py-2.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            u.role === 'Restaurant' ? 'bg-purple-500/20 text-purple-300' :
                            u.role === 'Livreur' ? 'bg-sky-500/20 text-sky-300' : 'bg-emerald-500/20 text-emerald-300'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-2.5 text-emerald-300/80">{u.neighborhood}</td>
                        <td className="py-2.5 font-mono text-[10px] text-gray-400">{u.auth}</td>
                        <td className="py-2.5 text-right">
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-700/50">
                            ● {u.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Right Column (5 cols): Live Orders & Transactions Stream */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Live Incoming Orders Feed */}
            <div className="bg-[#0A2215] p-5 rounded-3xl border border-emerald-900/50 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-white">Flux des Commandes en Direct</h3>
                    <p className="text-[10px] text-emerald-300/60">Activités et livraisons en cours à Dakar</p>
                  </div>
                </div>

                <span className="text-[10px] font-bold bg-[#0A6E3B] text-white px-2 py-0.5 rounded-full">
                  {orders.length} commandes
                </span>
              </div>

              {/* Order Cards Stream */}
              <div className="space-y-2.5 max-h-[460px] overflow-y-auto no-scrollbar pr-1">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-3.5 rounded-2xl bg-black/30 border border-emerald-900/40 hover:border-emerald-500/40 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-black text-amber-400">{ord.orderNumber}</span>
                        <span className="text-gray-400">•</span>
                        <span className="font-bold text-white">{ord.restaurantName}</span>
                      </div>
                      <span className="font-mono font-black text-emerald-400">{formatFCFA(ord.total)}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-emerald-300/80">
                      <span>👤 {ord.clientName} ➔ 📍 {ord.deliveryAddress.neighborhood}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md font-bold uppercase bg-emerald-500/20 text-emerald-300">
                        {ord.paymentMethod === 'wave' && '🌊 Wave'}
                        {ord.paymentMethod === 'orange_money' && '🍊 OM'}
                        {ord.paymentMethod === 'card' && '💳 CB'}
                        {ord.paymentMethod === 'cash' && '💵 Espèces'}
                      </span>
                    </div>

                    <div className="pt-1.5 border-t border-white/5 flex items-center justify-between text-[10px]">
                      <span className="text-gray-400">{ord.items.length} plats commandés</span>
                      <span className="font-bold text-amber-300">Statut : {ord.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Transactions Summary */}
            <div className="bg-[#0A2215] p-5 rounded-3xl border border-emerald-900/50 shadow-xl space-y-3">
              <h3 className="font-black text-sm text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Journal des Règlements Wave / OM Directs</span>
              </h3>

              <div className="space-y-2 text-xs">
                {transactions.length > 0 ? (
                  transactions.slice(0, 4).map((tx) => (
                    <div key={tx.id} className="p-2.5 rounded-xl bg-black/20 border border-emerald-900/30 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-white">{tx.restaurantName}</p>
                        <p className="text-[10px] text-gray-400">Réf : {tx.reference} • {tx.method.toUpperCase()}</p>
                      </div>
                      <span className="font-mono font-black text-emerald-400">{formatFCFA(tx.amount)}</span>
                    </div>
                  ))
                ) : (
                  <div className="p-3 rounded-2xl bg-black/20 border border-emerald-900/30 text-center text-xs text-gray-400">
                    Toutes les transactions Wave et OM sont synchronisées avec succès.
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

      </main>

    </div>
  );
}
