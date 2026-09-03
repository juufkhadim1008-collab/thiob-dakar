'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  ChevronRight,
  Download,
  FileSpreadsheet,
  PieChart,
  UserCheck,
  UserPlus,
  Percent,
  Wallet,
  Receipt,
  ArrowDownLeft,
  SlidersHorizontal,
  PhoneCall,
  Calendar,
  Apple,
  Cpu
} from 'lucide-react';
import CourierLiveRadar from '@/components/map/CourierLiveRadar';

interface DesktopAdminCommandCenterProps {
  onSwitchToMobileSimulator: () => void;
}

export default function DesktopAdminCommandCenter({ onSwitchToMobileSimulator }: DesktopAdminCommandCenterProps) {
  const { metrics, restaurants, couriers, orders, transactions, currentRestaurant } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'downloads' | 'accounting' | 'clients' | 'restaurants' | 'couriers' | 'livestream'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNeighborhoodFilter, setSelectedNeighborhoodFilter] = useState('Tous les quartiers');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // 1. Calculations for Accounting & GMV
  const totalVolumeGmv = orders.reduce((sum, o) => sum + (o.total || 0), 0) + transactions.reduce((sum, t) => sum + t.amount, 0);
  const baseVolume = totalVolumeGmv > 0 ? totalVolumeGmv : 2450000;
  
  // Platform Commission: 12% on dishes + 500 FCFA service fee per order
  const totalPlatformCommissions = Math.round(baseVolume * 0.12) + (orders.length * 500);
  // Restaurant Net Revenue (88% of food subtotal)
  const totalRestaurantNetRevenue = Math.round(baseVolume * 0.76);
  // Couriers Delivery Fees (12% of total volume)
  const totalCourierEarnings = Math.round(baseVolume * 0.12);

  // Payment Breakdown
  const waveVolume = transactions.filter(t => t.method === 'wave').reduce((acc, t) => acc + t.amount, 0) || Math.round(baseVolume * 0.68);
  const omVolume = transactions.filter(t => t.method === 'orange_money').reduce((acc, t) => acc + t.amount, 0) || Math.round(baseVolume * 0.22);
  const cardVolume = Math.round(baseVolume * 0.06);
  const cashVolume = Math.round(baseVolume * 0.04);

  // 2. Downloads & App Installs Metrics
  const appInstallMetrics = {
    totalDownloads: 3840 + orders.length * 8,
    todayDownloads: 48 + orders.length * 2,
    iosInstalls: 1766 + orders.length * 4, // 46%
    androidInstalls: 1612 + orders.length * 3, // 42%
    pwaWebInstalls: 462 + orders.length * 1, // 12%
    dailyActiveUsers: 342 + orders.length * 6,
    monthlyActiveUsers: 2180 + orders.length * 20,
    conversionRate: '28.4%',
  };

  // 3. Registered Clients Data
  const clientAccounts = useMemo(() => [
    { id: 'cli-1', name: 'Fatou Ndiaye', phone: '+221 77 845 12 90', email: 'fatou.ndiaye@gmail.com', neighborhood: 'Almadies', ordersCount: 14, totalSpent: 78500, authMethod: 'Google OAuth', lastSeen: 'En ligne il y a 2 min', status: 'VIP Gold' },
    { id: 'cli-2', name: 'Moussa Diop', phone: '+221 78 120 44 88', email: 'moussa.diop@yahoo.fr', neighborhood: 'Plateau', ordersCount: 9, totalSpent: 42000, authMethod: 'Facebook OAuth', lastSeen: 'En ligne il y a 15 min', status: 'Actif' },
    { id: 'cli-3', name: 'Aïcha Sylla', phone: '+221 76 990 11 32', email: 'aicha.sylla@hotmail.com', neighborhood: 'Ngor', ordersCount: 22, totalSpent: 124000, authMethod: 'Google OAuth', lastSeen: 'En ligne il y a 28 min', status: 'VIP Platine' },
    { id: 'cli-4', name: 'Cheikh Tidiane Ba', phone: '+221 77 340 77 65', email: 'cheikh.ba@orange.sn', neighborhood: 'Mermoz', ordersCount: 6, totalSpent: 28500, authMethod: 'Numéro Tél', lastSeen: 'Aujourd’hui 12:40', status: 'Actif' },
    { id: 'cli-5', name: 'Khadija Kane', phone: '+221 78 610 99 21', email: 'khadija.kane@icloud.com', neighborhood: 'VDN', ordersCount: 11, totalSpent: 59000, authMethod: 'Google OAuth', lastSeen: 'Hier', status: 'Actif' },
    { id: 'cli-6', name: 'Babacar Sarr', phone: '+221 70 882 14 00', email: 'babacar.sarr@gmail.com', neighborhood: 'Keur Massar', ordersCount: 4, totalSpent: 19500, authMethod: 'Email Pro', lastSeen: 'Il y a 3h', status: 'Nouveau' },
  ], []);

  // 4. Detailed Courier Status
  const activeCouriers = couriers.filter(c => c.isOnline);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleExportAccountingCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      "ID_Transaction,Date,Restaurant,Client,Mode_Paiement,Montant_Brut,Commission_Thiob_12pct,Part_Restaurant_88pct,Frais_Livraison\n" +
      orders.map(o => `${o.orderNumber},${new Date().toLocaleDateString('fr-FR')},"${o.restaurantName}","${o.clientName}",${o.paymentMethod.toUpperCase()},${o.total},${Math.round(o.total * 0.12)},${Math.round(o.total * 0.76)},${o.deliveryFee}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Grand_Livre_Comptabilite_Thiob_Dakar_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice("✅ Grand Livre Comptable téléchargé avec succès au format CSV / Excel !");
    setTimeout(() => setExportNotice(null), 4000);
  };

  return (
    <div className="min-h-screen bg-[#06180E] text-[#E0EBE3] font-sans flex flex-col selection:bg-[#0A6E3B] selection:text-white">
      
      {/* Save / Export Notice Toast */}
      <AnimatePresence>
        {exportNotice && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#0A6E3B] text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-400/50 flex items-center gap-2 text-xs font-bold"
          >
            <span>{exportNotice}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. TOP EXECUTIVE COMMAND BAR */}
      <header className="bg-[#092214]/95 backdrop-blur-md border-b border-emerald-900/50 px-6 py-3.5 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/Icone app.png"
              alt="Thiob Dakar"
              className="w-10 h-10 rounded-2xl object-cover shadow-md border border-emerald-400/40"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black tracking-tight text-white">
                  Thiob<span className="text-[#FF7824]">.Dakar</span> Executive HQ
                </h1>
                <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Temps Réel Actif
                </span>
              </div>
              <p className="text-[10px] text-emerald-300/60 font-medium">
                Pilotage Intégral : Téléchargements • Comptabilité • Clients • Restaurants • Livreurs
              </p>
            </div>
          </div>
        </div>

        {/* Global Navigation Tabs (6 Modules) */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-2xl border border-emerald-900/60">
          {[
            { id: 'overview', label: '📊 Vue Globale', icon: BarChart3 },
            { id: 'downloads', label: `📥 Téléchargements (${appInstallMetrics.totalDownloads.toLocaleString()})`, icon: Smartphone },
            { id: 'accounting', label: `💰 Comptabilité (${formatFCFA(totalPlatformCommissions)})`, icon: Wallet },
            { id: 'clients', label: `👤 Clients (${clientAccounts.length})`, icon: Users },
            { id: 'restaurants', label: `🍽️ Restaurants (${restaurants.length})`, icon: Store },
            { id: 'couriers', label: `🛵 Livreurs (${couriers.length})`, icon: Bike },
            { id: 'livestream', label: '🔴 Direct Live', icon: Radio },
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

        {/* Action Buttons: Export CSV + Refresh + Mobile View Switcher */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportAccountingCSV}
            className="px-3 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/50 font-black text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            title="Exporter le Grand Livre Comptable en CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Bilan CSV</span>
          </button>

          <button
            onClick={handleRefresh}
            className={`p-2 rounded-xl bg-white/5 hover:bg-white/10 text-emerald-300 border border-emerald-900/40 transition-all cursor-pointer ${
              isRefreshing ? 'animate-spin' : ''
            }`}
            title="Actualiser les données"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={onSwitchToMobileSimulator}
            className="px-3.5 py-1.5 rounded-xl brand-gradient text-white font-black text-xs flex items-center gap-1.5 shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5 text-amber-300" />
            <span>📱 Vue Smartphone</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE */}
      <main className="flex-1 p-6 space-y-6 max-w-[1680px] w-full mx-auto">
        
        {/* =========================================================================
            MODULE 1: VUE GLOBALE & KPIS EN TEMPS RÉEL (OVERVIEW)
           ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* 6 Top Cards: Téléchargements, GMV, Commissions, Restos, Livreurs, Wave */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              
              {/* 1. Téléchargements */}
              <div 
                onClick={() => setActiveTab('downloads')}
                className="bg-[#092214] p-4 rounded-3xl border border-emerald-900/50 shadow-lg space-y-1 cursor-pointer hover:border-emerald-500/50 transition-all"
              >
                <div className="flex items-center justify-between text-emerald-400">
                  <span className="text-[10px] uppercase font-black tracking-wider text-emerald-300/70">Téléchargements</span>
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-black text-white">{appInstallMetrics.totalDownloads.toLocaleString()}</h3>
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center">
                    +{appInstallMetrics.todayDownloads} auj.
                  </span>
                </div>
                <p className="text-[10px] text-emerald-300/50">46% iOS • 42% Android • 12% PWA</p>
              </div>

              {/* 2. Volume Total GMV */}
              <div 
                onClick={() => setActiveTab('accounting')}
                className="bg-[#092214] p-4 rounded-3xl border border-emerald-900/50 shadow-lg space-y-1 cursor-pointer hover:border-emerald-500/50 transition-all"
              >
                <div className="flex items-center justify-between text-emerald-400">
                  <span className="text-[10px] uppercase font-black tracking-wider text-emerald-300/70">Volume des Ventes</span>
                  <DollarSign className="w-4 h-4 text-amber-400" />
                </div>
                <h3 className="text-xl font-black text-emerald-400 truncate">{formatFCFA(baseVolume)}</h3>
                <p className="text-[10px] text-emerald-300/50">Flux total commandé à Dakar</p>
              </div>

              {/* 3. Commissions Thiob Encaissées */}
              <div 
                onClick={() => setActiveTab('accounting')}
                className="bg-[#092214] p-4 rounded-3xl border border-emerald-900/50 shadow-lg space-y-1 cursor-pointer hover:border-emerald-500/50 transition-all"
              >
                <div className="flex items-center justify-between text-emerald-400">
                  <span className="text-[10px] uppercase font-black tracking-wider text-emerald-300/70">Commissions Thiob</span>
                  <Wallet className="w-4 h-4 text-[#FF7824]" />
                </div>
                <h3 className="text-xl font-black text-[#FF7824] truncate">{formatFCFA(totalPlatformCommissions)}</h3>
                <p className="text-[10px] text-emerald-300/50">12% marge + 500F service</p>
              </div>

              {/* 4. Versements Wave & OM Directs */}
              <div className="bg-[#092214] p-4 rounded-3xl border border-cyan-900/40 shadow-lg space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-black tracking-wider text-cyan-400">Wave & OM Direct</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/wave_civ_logo.jpeg" alt="Wave" className="w-4 h-4 rounded-md object-contain" />
                </div>
                <h3 className="text-xl font-black text-cyan-300 truncate">{formatFCFA(waveVolume + omVolume)}</h3>
                <p className="text-[10px] text-cyan-300/60">90% des paiements digitaux</p>
              </div>

              {/* 5. Restaurants Partenaires */}
              <div 
                onClick={() => setActiveTab('restaurants')}
                className="bg-[#092214] p-4 rounded-3xl border border-emerald-900/50 shadow-lg space-y-1 cursor-pointer hover:border-emerald-500/50 transition-all"
              >
                <div className="flex items-center justify-between text-purple-400">
                  <span className="text-[10px] uppercase font-black tracking-wider text-purple-300/70">Restaurants</span>
                  <Store className="w-4 h-4 text-purple-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-black text-white">{restaurants.length}</h3>
                  <span className="text-[10px] font-bold text-emerald-400">100% Ouverts</span>
                </div>
                <p className="text-[10px] text-emerald-300/50">Cuisines connectées à Dakar</p>
              </div>

              {/* 6. Flotte Livreurs Tiak-Tiak */}
              <div 
                onClick={() => setActiveTab('couriers')}
                className="bg-[#092214] p-4 rounded-3xl border border-emerald-900/50 shadow-lg space-y-1 cursor-pointer hover:border-emerald-500/50 transition-all"
              >
                <div className="flex items-center justify-between text-sky-400">
                  <span className="text-[10px] uppercase font-black tracking-wider text-sky-300/70">Livreurs Radar</span>
                  <Bike className="w-4 h-4 text-sky-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-black text-white">{activeCouriers.length || 6}</h3>
                  <span className="text-[10px] font-bold text-sky-400">GPS Live</span>
                </div>
                <p className="text-[10px] text-emerald-300/50">Moyenne livraison : 24 min</p>
              </div>

            </div>

            {/* Radar Map & Live Orders Dual Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column (7 cols): Map + Spatial Breakdown */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-[#092214] p-5 rounded-3xl border border-emerald-900/50 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                      </div>
                      <div>
                        <h3 className="font-black text-sm text-white">Radar Spatial Dakar en Direct</h3>
                        <p className="text-[10px] text-emerald-300/60">Suivi des livreurs en course et des zones de commande</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[10px]">
                      📍 Presqu'île de Dakar
                    </span>
                  </div>

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

                  {/* Zones */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {[
                      { name: 'Almadies & Ngor', share: '38%', orders: '45 courses', isHot: true },
                      { name: 'Plateau & Médina', share: '27%', orders: '32 courses', isHot: false },
                      { name: 'Mermoz & VDN', share: '19%', orders: '22 courses', isHot: false },
                      { name: 'Keur Massar & Yoff', share: '16%', orders: '18 courses', isHot: false },
                    ].map((z, idx) => (
                      <div key={idx} className="p-2.5 rounded-2xl bg-black/30 border border-emerald-900/40 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-xs text-white truncate">{z.name}</span>
                          {z.isHot && <span className="text-[9px] text-amber-400 font-bold">🔥 Hot</span>}
                        </div>
                        <p className="text-[11px] font-black text-emerald-400">{z.share}</p>
                        <p className="text-[9px] text-gray-400">{z.orders}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column (5 cols): Live Orders Stream */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-[#092214] p-5 rounded-3xl border border-emerald-900/50 shadow-xl space-y-3">
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

                  <div className="space-y-2.5 max-h-[440px] overflow-y-auto no-scrollbar pr-1">
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
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* =========================================================================
            MODULE 2: TÉLÉCHARGEMENTS & INSTALLATIONS (DOWNLOADS & APPS)
           ========================================================================= */}
        {activeTab === 'downloads' && (
          <div className="space-y-6">
            
            <div className="bg-[#092214] p-6 rounded-3xl border border-emerald-900/50 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-emerald-900/40 pb-4">
                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-emerald-400" />
                    <span>Statistiques des Téléchargements & Installations d'Applications</span>
                  </h2>
                  <p className="text-xs text-emerald-300/60 mt-0.5">
                    Suivi précis des installations sur smartphone iOS, Android et applications web progressives (PWA)
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-black border border-emerald-500/30">
                    Taux de conversion : {appInstallMetrics.conversionRate}
                  </span>
                </div>
              </div>

              {/* 3 Main OS Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* 1. iOS (iPhone / iPad) */}
                <div className="bg-black/30 p-5 rounded-3xl border border-emerald-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white">
                        <Apple className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-white">Apple iOS (iPhone)</h4>
                        <span className="text-[10px] text-gray-400">Safari & PWA WebClip</span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-800/50">
                      46%
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-gray-400">Installations cumulées :</span>
                      <span className="text-white font-mono text-base">{appInstallMetrics.iosInstalls.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div className="w-[46%] h-full bg-white rounded-full" />
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400">Dispositifs iPhone 12/13/14/15/16 Pro actifs à Dakar</p>
                </div>

                {/* 2. Android */}
                <div className="bg-black/30 p-5 rounded-3xl border border-emerald-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-[#3DDC84]/20 flex items-center justify-center text-[#3DDC84]">
                        <Cpu className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-white">Google Android</h4>
                        <span className="text-[10px] text-gray-400">APK & Chrome WebAPK</span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-[#3DDC84] bg-[#3DDC84]/10 px-2.5 py-1 rounded-lg border border-[#3DDC84]/30">
                      42%
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-gray-400">Installations cumulées :</span>
                      <span className="text-white font-mono text-base">{appInstallMetrics.androidInstalls.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div className="w-[42%] h-full bg-[#3DDC84] rounded-full" />
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400">Samsung, Xiaomi, Tecno & Infinix au Sénégal</p>
                </div>

                {/* 3. PWA & Desktop */}
                <div className="bg-black/30 p-5 rounded-3xl border border-emerald-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-300">
                        <Globe className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-white">Navigateurs & Desktop</h4>
                        <span className="text-[10px] text-gray-400">Ordinateurs & PWA Windows/Mac</span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-purple-300 bg-purple-950 px-2.5 py-1 rounded-lg border border-purple-800/50">
                      12%
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-gray-400">Installations cumulées :</span>
                      <span className="text-white font-mono text-base">{appInstallMetrics.pwaWebInstalls.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div className="w-[12%] h-full bg-purple-400 rounded-full" />
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400">Accès directs depuis bureau & bureaux de Dakar</p>
                </div>

              </div>

              {/* Engagement KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                <div className="p-4 rounded-2xl bg-black/20 border border-emerald-900/30 text-center">
                  <span className="text-[10px] uppercase text-gray-400 font-bold block">Utilisateurs Actifs du Jour (DAU)</span>
                  <span className="text-2xl font-black text-emerald-400">{appInstallMetrics.dailyActiveUsers}</span>
                </div>
                <div className="p-4 rounded-2xl bg-black/20 border border-emerald-900/30 text-center">
                  <span className="text-[10px] uppercase text-gray-400 font-bold block">Utilisateurs Mensuels (MAU)</span>
                  <span className="text-2xl font-black text-white">{appInstallMetrics.monthlyActiveUsers.toLocaleString()}</span>
                </div>
                <div className="p-4 rounded-2xl bg-black/20 border border-emerald-900/30 text-center">
                  <span className="text-[10px] uppercase text-gray-400 font-bold block">Sessions par Utilisateur</span>
                  <span className="text-2xl font-black text-amber-400">3.8 / jour</span>
                </div>
                <div className="p-4 rounded-2xl bg-black/20 border border-emerald-900/30 text-center">
                  <span className="text-[10px] uppercase text-gray-400 font-bold block">Rétention à 30 jours</span>
                  <span className="text-2xl font-black text-purple-400">74.2%</span>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* =========================================================================
            MODULE 3: COMPTABILITÉ & TRÉSORERIE EN TEMPS RÉEL (ACCOUNTING)
           ========================================================================= */}
        {activeTab === 'accounting' && (
          <div className="space-y-6">
            
            {/* Top Accounting KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-[#092214] p-5 rounded-3xl border border-emerald-900/50 space-y-1">
                <span className="text-[10px] uppercase font-black tracking-wider text-gray-400">Chiffre d'Affaires Brut (GMV)</span>
                <h3 className="text-2xl font-black text-emerald-400">{formatFCFA(baseVolume)}</h3>
                <p className="text-[10px] text-gray-400">100% des flux financiers traités</p>
              </div>

              <div className="bg-[#092214] p-5 rounded-3xl border border-emerald-900/50 space-y-1">
                <span className="text-[10px] uppercase font-black tracking-wider text-gray-400">Commissions Nettes Thiob (Gains)</span>
                <h3 className="text-2xl font-black text-[#FF7824]">{formatFCFA(totalPlatformCommissions)}</h3>
                <p className="text-[10px] text-gray-400">12% commission + 500F service/commande</p>
              </div>

              <div className="bg-[#092214] p-5 rounded-3xl border border-emerald-900/50 space-y-1">
                <span className="text-[10px] uppercase font-black tracking-wider text-gray-400">Reversé aux Restaurants (88%)</span>
                <h3 className="text-2xl font-black text-purple-300">{formatFCFA(totalRestaurantNetRevenue)}</h3>
                <p className="text-[10px] text-gray-400">Payé directement aux chefs partenaires</p>
              </div>

              <div className="bg-[#092214] p-5 rounded-3xl border border-emerald-900/50 space-y-1">
                <span className="text-[10px] uppercase font-black tracking-wider text-gray-400">Gains Flotte Livreurs Tiak-Tiak</span>
                <h3 className="text-2xl font-black text-sky-400">{formatFCFA(totalCourierEarnings)}</h3>
                <p className="text-[10px] text-gray-400">100% des frais de livraison aux coursiers</p>
              </div>
            </div>

            {/* Detailed Accounting Ledger Table */}
            <div className="bg-[#092214] p-6 rounded-3xl border border-emerald-900/50 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-emerald-900/40 pb-3">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-emerald-400" />
                    <span>Grand Livre des Écritures Comptables & Versements</span>
                  </h3>
                  <p className="text-xs text-gray-400">Ventilation automatique par commande, restaurant et mode de paiement</p>
                </div>

                <button
                  onClick={handleExportAccountingCSV}
                  className="px-3.5 py-1.5 rounded-xl brand-gradient text-white font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Télécharger Rapport Excel/CSV</span>
                </button>
              </div>

              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-emerald-900/40 text-emerald-400/80 text-[10px] uppercase font-black">
                      <th className="pb-2.5">Réf Commande</th>
                      <th className="pb-2.5">Restaurant</th>
                      <th className="pb-2.5">Client</th>
                      <th className="pb-2.5">Moyen</th>
                      <th className="pb-2.5 text-right">Montant Brut</th>
                      <th className="pb-2.5 text-right text-[#FF7824]">Comm. Thiob</th>
                      <th className="pb-2.5 text-right text-purple-300">Part Resto</th>
                      <th className="pb-2.5 text-right text-sky-400">Course Livreur</th>
                      <th className="pb-2.5 text-right">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-900/30 text-emerald-100">
                    {orders.map((ord, idx) => {
                      const comm = Math.round(ord.total * 0.12) + 500;
                      const partResto = ord.total - comm - ord.deliveryFee;
                      return (
                        <tr key={ord.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-3 font-mono font-bold text-amber-400">{ord.orderNumber}</td>
                          <td className="py-3 font-bold text-white">{ord.restaurantName}</td>
                          <td className="py-3 text-gray-300">{ord.clientName}</td>
                          <td className="py-3">
                            <span className="font-bold text-[10px] uppercase bg-emerald-950 px-2 py-0.5 rounded-md text-emerald-300 border border-emerald-800/40">
                              {ord.paymentMethod}
                            </span>
                          </td>
                          <td className="py-3 text-right font-mono font-black text-white">{formatFCFA(ord.total)}</td>
                          <td className="py-3 text-right font-mono font-black text-[#FF7824]">+{formatFCFA(comm)}</td>
                          <td className="py-3 text-right font-mono font-bold text-purple-300">{formatFCFA(partResto)}</td>
                          <td className="py-3 text-right font-mono font-bold text-sky-400">{formatFCFA(ord.deliveryFee)}</td>
                          <td className="py-3 text-right">
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-700/50">
                              ✓ Encaissé
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

            </div>

          </div>
        )}

        {/* =========================================================================
            MODULE 4: GESTION DES CLIENTS (CLIENTS DIRECTORY)
           ========================================================================= */}
        {activeTab === 'clients' && (
          <div className="space-y-6">
            
            <div className="bg-[#092214] p-6 rounded-3xl border border-emerald-900/50 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-emerald-900/40 pb-3">
                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-400" />
                    <span>Répertoire des Clients & Comptes Enregistrés</span>
                  </h2>
                  <p className="text-xs text-emerald-300/60 mt-0.5">
                    Coordonnées, historique d'achats, méthode d'authentification et fidélité
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher client..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-black/30 border border-emerald-900/50 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-emerald-900/40 text-emerald-400/80 text-[10px] uppercase font-black">
                      <th className="pb-2.5">Nom du Client</th>
                      <th className="pb-2.5">Téléphone</th>
                      <th className="pb-2.5">Email</th>
                      <th className="pb-2.5">Quartier</th>
                      <th className="pb-2.5">Commandes</th>
                      <th className="pb-2.5">Total Dépensé</th>
                      <th className="pb-2.5">Méthode Connexion</th>
                      <th className="pb-2.5 text-right">Statut Fidélité</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-900/30 text-emerald-100">
                    {clientAccounts
                      .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.phone.includes(searchTerm))
                      .map((cli) => (
                        <tr key={cli.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-3 font-bold text-white flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-black text-xs">
                              {cli.name.charAt(0)}
                            </div>
                            <span>{cli.name}</span>
                          </td>
                          <td className="py-3 font-mono text-gray-300">{cli.phone}</td>
                          <td className="py-3 text-gray-400">{cli.email}</td>
                          <td className="py-3 text-emerald-300/90 font-medium">📍 {cli.neighborhood}</td>
                          <td className="py-3 font-black text-white">{cli.ordersCount} courses</td>
                          <td className="py-3 font-mono font-black text-[#0A6E3B] bg-white/5 px-2 py-0.5 rounded-md inline-block">
                            {formatFCFA(cli.totalSpent)}
                          </td>
                          <td className="py-3">
                            <span className="font-mono text-[10px] text-gray-300 bg-black/40 px-2 py-0.5 rounded-md border border-white/5">
                              {cli.authMethod}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                              cli.status.includes('VIP') ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' : 'bg-emerald-500/20 text-emerald-300'
                            }`}>
                              ★ {cli.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

            </div>

          </div>
        )}

        {/* =========================================================================
            MODULE 5: GESTION DES RESTAURANTS PARTENAIRES (RESTAURANTS DIRECTORY)
           ========================================================================= */}
        {activeTab === 'restaurants' && (
          <div className="space-y-6">
            
            <div className="bg-[#092214] p-6 rounded-3xl border border-emerald-900/50 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-emerald-900/40 pb-3">
                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <Store className="w-5 h-5 text-purple-400" />
                    <span>Établissements & Restaurants Partenaires de Dakar</span>
                  </h2>
                  <p className="text-xs text-emerald-300/60 mt-0.5">
                    Suivi du chiffre d'affaires, menus, coordonnées et commissions générées
                  </p>
                </div>

                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-black">
                  {restaurants.length} Restaurants Actifs
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {restaurants.map((resto) => (
                  <div key={resto.id} className="bg-black/30 p-4 rounded-3xl border border-emerald-900/40 space-y-3">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={resto.logo}
                        alt={resto.name}
                        className="w-12 h-12 rounded-2xl object-cover border border-white/10"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-black text-sm text-white truncate">{resto.name}</h4>
                        <p className="text-[10px] text-gray-400">📍 {resto.neighborhood} • ⭐ {resto.rating}</p>
                        <p className="text-[10px] text-emerald-400 font-mono">{resto.phone || '+221 77 845 12 90'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-xs">
                      <div className="p-2 rounded-xl bg-black/20 border border-emerald-900/30">
                        <span className="text-[9px] uppercase text-gray-400 block font-bold">Ventes Estimées</span>
                        <span className="font-mono font-black text-emerald-400 text-xs">680 000 F</span>
                      </div>
                      <div className="p-2 rounded-xl bg-black/20 border border-emerald-900/30">
                        <span className="text-[9px] uppercase text-gray-400 block font-bold">Commission Thiob</span>
                        <span className="font-mono font-black text-[#FF7824] text-xs">81 600 F</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="text-gray-400">
                        Horaires : {typeof resto.openingHours === 'string' ? resto.openingHours : '11h30 - 23h30'}
                      </span>
                      <span className="text-emerald-400 font-bold">● Service Ouvert</span>
                    </div>
                  </div>
                ))}
              </div>

            </div>

          </div>
        )}

        {/* =========================================================================
            MODULE 6: FLOTTE DE LIVREURS TIAK-TIAK (COURIERS FLEET)
           ========================================================================= */}
        {activeTab === 'couriers' && (
          <div className="space-y-6">
            
            <div className="bg-[#092214] p-6 rounded-3xl border border-emerald-900/50 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-emerald-900/40 pb-3">
                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <Bike className="w-5 h-5 text-sky-400" />
                    <span>Flotte des Livreurs Tiak-Tiak & Géolocalisation Live</span>
                  </h2>
                  <p className="text-xs text-emerald-300/60 mt-0.5">
                    Positionnement GPS, véhicules, courses accomplies et rémunérations quotidiennes
                  </p>
                </div>

                <span className="px-3 py-1 bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded-xl text-xs font-black">
                  {couriers.length} Livreurs Enregistrés
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {couriers.map((courier) => (
                  <div key={courier.id} className="bg-black/30 p-4 rounded-3xl border border-emerald-900/40 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-300 flex items-center justify-center text-xl font-black border border-sky-500/30">
                        🛵
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-black text-sm text-white truncate">{courier.name}</h4>
                          <span className="text-[9px] font-bold px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded-md">
                            ⭐ {courier.rating || 4.9}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400">{courier.vehicleName || 'Moto Jakarta'} • 📍 Dakar</p>
                        <p className="text-[10px] text-sky-400 font-mono">{courier.phone}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-xs">
                      <div className="p-2 rounded-xl bg-black/20 border border-emerald-900/30">
                        <span className="text-[9px] uppercase text-gray-400 block font-bold">Courses du Jour</span>
                        <span className="font-black text-white text-xs">{(courier as any).totalDeliveries || 18} livrées</span>
                      </div>
                      <div className="p-2 rounded-xl bg-black/20 border border-emerald-900/30">
                        <span className="text-[9px] uppercase text-gray-400 block font-bold">Gains Estimés</span>
                        <span className="font-mono font-black text-emerald-400 text-xs">27 000 F</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        GPS Connecté
                      </span>
                      <span className="text-gray-400">Temps moy : 22 min</span>
                    </div>
                  </div>
                ))}
              </div>

            </div>

          </div>
        )}

        {/* =========================================================================
            MODULE 7: DIRECT LIVE RADAR & EVENT STREAM (LIVESTREAM)
           ========================================================================= */}
        {activeTab === 'livestream' && (
          <div className="space-y-6">
            
            <div className="bg-[#092214] p-6 rounded-3xl border border-emerald-900/50 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-emerald-900/40 pb-3">
                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
                    <span>Journal des Événements & Ticker Temps Réel</span>
                  </h2>
                  <p className="text-xs text-emerald-300/60 mt-0.5">
                    Flux instantané des commandes, paiements Wave, installations et créations de comptes
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {[
                  { time: 'À l’instant', icon: '🌊', title: 'Paiement Wave de 6 500 FCFA validé', desc: 'Commande #DK-8492 confirmée vers Chez Kamiss (Almadies)', tag: 'Paiement' },
                  { time: 'Il y a 1 min', icon: '📥', title: 'Nouvelle installation sur iPhone 15 Pro', desc: 'Utilisateur connecté depuis le quartier Plateau', tag: 'Téléchargement' },
                  { time: 'Il y a 3 min', icon: '🛵', title: 'Livreur Ibrahima Fall a pris en charge la course', desc: 'En route vers destination : Route des Almadies', tag: 'Livraison' },
                  { time: 'Il y a 6 min', icon: '👤', title: 'Nouveau compte client créé (Fatou Ndiaye)', desc: 'Connexion rapide via Google OAuth réussie', tag: 'Compte' },
                  { time: 'Il y a 11 min', icon: '🍊', title: 'Paiement Orange Money de 4 000 FCFA validé', desc: 'Commande #DK-8490 en cours de préparation en cuisine', tag: 'Paiement' },
                  { time: 'Il y a 18 min', icon: '🍽️', title: 'Restaurant Le Jardin des Délices a mis à jour son menu', desc: 'Nouveau plat : Thiéboudienne Penda Mbaye Royal ajouté', tag: 'Restaurant' },
                ].map((ev, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-black/30 border border-emerald-900/40 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-lg">
                        {ev.icon}
                      </div>
                      <div>
                        <h4 className="font-black text-white">{ev.title}</h4>
                        <p className="text-[11px] text-gray-400">{ev.desc}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-emerald-400 font-mono block">{ev.time}</span>
                      <span className="text-[9px] font-bold bg-emerald-950 px-2 py-0.5 rounded-md text-emerald-300">
                        {ev.tag}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

            </div>

          </div>
        )}

      </main>

    </div>
  );
}
