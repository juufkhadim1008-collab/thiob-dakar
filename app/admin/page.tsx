'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppProvider, useApp } from '@/lib/store';
import { formatFCFA } from '@/lib/utils';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  Mail, 
  LogOut, 
  BarChart3, 
  Smartphone, 
  Wallet, 
  Users, 
  Store, 
  Bike, 
  Sparkles, 
  Download, 
  Search, 
  Radio, 
  CheckCircle2, 
  ArrowUpRight, 
  ExternalLink,
  DollarSign,
  Receipt,
  Apple,
  Cpu,
  Globe,
  RefreshCw,
  Eye,
  EyeOff,
  Sun,
  Moon,
  LayoutGrid,
  Calendar,
  MessageSquare,
  FileText,
  Settings,
  HelpCircle,
  Bell,
  Info,
  ArrowDownLeft,
  Filter,
  Plus,
  CreditCard,
  Check,
  ChevronDown,
  ArrowRight,
  TrendingUp,
  MoreVertical,
  CheckSquare,
  Square
} from 'lucide-react';

export default function AdminRoutePage() {
  return (
    <AppProvider>
      <StandaloneAdminPortal />
    </AppProvider>
  );
}

function StandaloneAdminPortal() {
  const { restaurants, couriers, orders, transactions } = useApp();
  
  // Auth state for the separated admin portal
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState('mastu@thiob.sn');
  const [adminPassword, setAdminPassword] = useState('thiob2026');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'downloads' | 'accounting' | 'clients' | 'restaurants' | 'couriers'>('overview');
  const [selectedCurrency, setSelectedCurrency] = useState<'FCFA' | 'EUR' | 'USD'>('FCFA');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<{ [id: string]: boolean }>({});
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Financial Computations
  const totalVolumeGmv = orders.reduce((sum, o) => sum + (o.total || 0), 0) + transactions.reduce((sum, t) => sum + t.amount, 0);
  const baseVolume = totalVolumeGmv > 0 ? totalVolumeGmv : 2450000;
  const platformCommissions = Math.round(baseVolume * 0.12) + (orders.length * 500);
  const restaurantsNet = Math.round(baseVolume * 0.76);
  const couriersEarnings = Math.round(baseVolume * 0.12);

  // Downloads Metrics
  const downloads = {
    total: 3840 + orders.length * 8,
    today: 48 + orders.length * 2,
    ios: 1766 + orders.length * 4,
    android: 1612 + orders.length * 3,
    pwa: 462 + orders.length * 1,
    activeToday: 342 + orders.length * 6,
  };

  // Mocked/Real Registered Clients
  const clientsList = useMemo(() => [
    { id: 'c-1', name: 'Fatou Ndiaye', phone: '+221 77 845 12 90', email: 'fatou.ndiaye@gmail.com', neighborhood: 'Almadies', orders: 14, spent: 78500, auth: 'Google OAuth', status: 'VIP Gold' },
    { id: 'c-2', name: 'Moussa Diop', phone: '+221 78 120 44 88', email: 'moussa.diop@yahoo.fr', neighborhood: 'Plateau', orders: 9, spent: 42000, auth: 'Facebook OAuth', status: 'Actif' },
    { id: 'c-3', name: 'Aïcha Sylla', phone: '+221 76 990 11 32', email: 'aicha.sylla@hotmail.com', neighborhood: 'Ngor', orders: 22, spent: 124000, auth: 'Google OAuth', status: 'VIP Platine' },
    { id: 'c-4', name: 'Cheikh Tidiane Ba', phone: '+221 77 340 77 65', email: 'cheikh.ba@orange.sn', neighborhood: 'Mermoz', orders: 6, spent: 28500, auth: 'Numéro Tél', status: 'Actif' },
    { id: 'c-5', name: 'Khadija Kane', phone: '+221 78 610 99 21', email: 'khadija.kane@icloud.com', neighborhood: 'VDN', orders: 11, spent: 59000, auth: 'Google OAuth', status: 'Actif' },
    { id: 'c-6', name: 'Babacar Sarr', phone: '+221 70 882 14 00', email: 'babacar.sarr@gmail.com', neighborhood: 'Keur Massar', orders: 4, spent: 19500, auth: 'Email Pro', status: 'Nouveau' },
  ], []);

  // Handle Login Submission
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!adminEmail.trim() || !adminPassword.trim()) {
      setAuthError('Veuillez renseigner votre email et mot de passe.');
      return;
    }

    setIsAuthenticated(true);
    setToastMessage('Bienvenue Mastü ! Connexion réussie au Dashboard.');
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const toggleSelectOrder = (id: string) => {
    setSelectedOrders(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleExportCSV = () => {
    const csv = "data:text/csv;charset=utf-8," +
      "ID_Commande,Date,Restaurant,Client,Mode_Paiement,Montant_Total,Commission_Thiob,Part_Restaurant,Frais_Livraison\n" +
      orders.map(o => `${o.orderNumber},${new Date().toLocaleDateString('fr-FR')},"${o.restaurantName}","${o.clientName}",${o.paymentMethod.toUpperCase()},${o.total},${Math.round(o.total * 0.12)},${Math.round(o.total * 0.76)},${o.deliveryFee}`).join("\n");
    
    const uri = encodeURI(csv);
    const a = document.createElement('a');
    a.href = uri;
    a.download = `Bilan_Comptable_Thiob_Dakar_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setToastMessage('✅ Rapport comptable exporté avec succès !');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // =========================================================================
  // 1. ÉCRAN DE CONNEXION SÉPARÉ (LOGIN MODERNE FINEXY STYLE)
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] text-[#0F172A] font-sans flex flex-col items-center justify-center p-4 relative overflow-hidden">
        
        {/* Soft background aesthetics */}
        <div className="absolute top-12 left-1/3 w-[500px] h-[500px] bg-[#FF5B29]/8 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-[#0A6E3B]/8 rounded-full blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="relative z-10 w-full max-w-md bg-white p-8 sm:p-10 rounded-[36px] shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-[#E5E9F0] space-y-6"
        >
          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-16 h-16 rounded-3xl p-1 bg-white shadow-md border border-gray-100 flex items-center justify-center mb-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/Icone app.png"
                alt="Thiob Dakar"
                className="w-full h-full rounded-[20px] object-cover"
              />
            </div>
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF5B29]/10 text-[#FF5B29] text-[10px] font-black uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Portail Super Administrateur</span>
            </div>

            <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">
              Thiob<span className="text-[#FF5B29]">.Dakar</span> HQ
            </h1>
            <p className="text-xs text-gray-500">
              Veuillez vous authentifier pour accéder à la tour de contrôle
            </p>
          </div>

          {/* Error Notice */}
          {authError && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold text-center">
              ⚠️ {authError}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 block">Identifiant / E-mail</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="mastu@thiob.sn"
                  className="w-full bg-[#F8FAFC] border border-gray-200 focus:border-[#FF5B29] focus:bg-white rounded-2xl pl-10 pr-4 py-3 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none transition-all shadow-2xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 block">Mot de passe</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#F8FAFC] border border-gray-200 focus:border-[#FF5B29] focus:bg-white rounded-2xl pl-10 pr-10 py-3 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none transition-all shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-[#FF5B29] hover:bg-[#E84E1F] text-white font-black text-xs shadow-lg shadow-[#FF5B29]/25 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer mt-2"
            >
              <Lock className="w-4 h-4" />
              <span>Ouvrir Mon Tableau de Bord</span>
            </button>
          </form>

          {/* Quick return link */}
          <div className="text-center pt-2 border-t border-gray-100">
            <a
              href="/"
              className="text-xs text-gray-500 hover:text-[#FF5B29] font-bold transition-colors"
            >
              ← Retour à l'application Thiob Express
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  // =========================================================================
  // 2. DASHBOARD ULTRA-MODERNE INSPIRÉ DE LA MAQUETTE (LIGHT / FINEXY STYLE)
  // =========================================================================
  return (
    <div className={`min-h-screen font-sans flex text-[#0F172A] ${isDarkMode ? 'bg-[#0F172A] text-white' : 'bg-[#F4F5F8]'}`}>
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#0F172A] text-white px-5 py-2.5 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-2 text-xs font-bold"
          >
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------------------------------------------------------------------
          A. LEFT THIN FLOATING ICON DOCK (Identique à la maquette de gauche)
         --------------------------------------------------------------------- */}
      <aside className="w-20 bg-white border-r border-[#EAEAEA] flex flex-col items-center justify-between py-6 shrink-0 z-20 shadow-xs">
        
        {/* Top: Logo & Theme Switcher */}
        <div className="flex flex-col items-center gap-6">
          <div className="w-10 h-10 rounded-2xl bg-[#FF5B29] flex items-center justify-center text-white shadow-md shadow-[#FF5B29]/20 font-black text-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/Icone app.png" alt="Thiob" className="w-full h-full rounded-2xl object-cover" />
          </div>

          {/* Theme switcher toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-9 h-9 rounded-2xl bg-[#F4F5F8] text-gray-500 hover:text-gray-900 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
            title="Changer le thème"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {/* Middle Navigation Icons */}
        <div className="flex flex-col items-center gap-3">
          {[
            { id: 'overview', icon: LayoutGrid, label: 'Vue Globale' },
            { id: 'downloads', icon: Smartphone, label: 'Téléchargements' },
            { id: 'accounting', icon: Receipt, label: 'Comptabilité' },
            { id: 'clients', icon: Users, label: 'Clients' },
            { id: 'restaurants', icon: Store, label: 'Restaurants' },
            { id: 'couriers', icon: Bike, label: 'Livreurs' },
          ].map((item) => {
            const isSel = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                  isSel
                    ? 'bg-[#1E293B] text-white shadow-md'
                    : 'text-gray-400 hover:text-gray-800 hover:bg-[#F4F5F8]'
                }`}
                title={item.label}
              >
                <Icon className="w-5 h-5" />
              </button>
            );
          })}
        </div>

        {/* Bottom: Help & Logout */}
        <div className="flex flex-col items-center gap-3">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="w-10 h-10 rounded-2xl bg-[#F4F5F8] text-gray-500 hover:text-[#FF5B29] flex items-center justify-center transition-all shadow-2xs"
            title="Ouvrir l'application client"
          >
            <ExternalLink className="w-4 h-4" />
          </a>

          <button
            onClick={handleLogout}
            className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
            title="Déconnexion"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* ---------------------------------------------------------------------
          B. MAIN CONTENT AREA (Header + Top Tabs + Cards Grid)
         --------------------------------------------------------------------- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* 1. TOP HEADER WITH PILL TABS, SEARCH & USER PROFILE */}
        <header className="px-8 py-4 bg-white border-b border-[#EAEAEA] flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          
          {/* Brand Name & App Switcher */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-[#FF5B29] flex items-center justify-center text-white text-xs font-black">
                T
              </div>
              <h2 className="font-black text-base text-[#0F172A] tracking-tight">
                Thiob<span className="text-[#FF5B29]">.HQ</span>
              </h2>
            </div>

            {/* Pill Navigation Tabs (Exactement comme dans la maquette Finexy) */}
            <div className="hidden lg:flex items-center bg-[#F4F5F8] p-1 rounded-full border border-gray-200">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'downloads', label: 'Activity' },
                { id: 'accounting', label: 'Manage' },
                { id: 'clients', label: 'Program' },
                { id: 'restaurants', label: 'Account' },
                { id: 'couriers', label: 'Reports' },
              ].map((tab) => {
                const isSel = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      isSel
                        ? 'bg-[#1E293B] text-white shadow-xs'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Search, Notifications, Profile Card */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-gray-400">
              <button className="w-9 h-9 rounded-full bg-[#F4F5F8] hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors">
                <Search className="w-4 h-4" />
              </button>
              <button className="w-9 h-9 rounded-full bg-[#F4F5F8] hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors relative">
                <Bell className="w-4 h-4" />
                <span className="w-2 h-2 rounded-full bg-[#FF5B29] absolute top-2 right-2 ring-2 ring-white" />
              </button>
              <button 
                onClick={handleExportCSV}
                className="w-9 h-9 rounded-full bg-[#F4F5F8] hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
                title="Exporter Bilan CSV"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Chip */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-gray-200">
              <div className="w-9 h-9 rounded-full overflow-hidden bg-[#FF5B29]/10 border border-[#FF5B29]/30 flex items-center justify-center text-[#FF5B29] font-black text-xs">
                M
              </div>
              <div className="text-left hidden sm:block">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-black text-[#0F172A] leading-none">Mastü</span>
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </div>
                <span className="text-[10px] text-gray-400 leading-none">mastu@thiob.sn</span>
              </div>
            </div>
          </div>
        </header>

        {/* 2. MAIN SCROLLABLE DASHBOARD VIEW */}
        <main className="p-8 space-y-6 max-w-[1600px] w-full mx-auto">
          
          {/* Greeting Banner */}
          <div className="space-y-0.5">
            <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">
              Salam Mastü 👋
            </h1>
            <p className="text-xs text-gray-500 font-medium">
              Gardez le contrôle sur les téléchargements, les finances en temps réel et les livraisons à Dakar.
            </p>
          </div>

          {/* =================================================================
              TOP 3 COLUMNS GRID (Identique à la disposition de l'image)
             ================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* COLUMN 1 (4 cols): TOTAL BALANCE & WALLETS */}
            <div className="lg:col-span-4 bg-white p-6 rounded-[28px] border border-[#EAEAEA] shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-gray-400 text-xs">
                  <span className="font-bold">Total Balance</span>
                  <div className="flex items-center gap-1 bg-[#F4F5F8] px-2 py-0.5 rounded-lg border border-gray-200 text-gray-700 font-bold text-[11px]">
                    <span>🇸🇳 FCFA</span>
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                  </div>
                </div>

                <div className="mt-2">
                  <h2 className="text-3xl font-black text-[#0F172A] tracking-tight">
                    {formatFCFA(baseVolume)}
                  </h2>
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>↑ 14% vs mois dernier</span>
                  </span>
                </div>

                {/* Transfer & Request Buttons */}
                <div className="grid grid-cols-2 gap-2.5 mt-5">
                  <button 
                    onClick={handleExportCSV}
                    className="py-2.5 rounded-2xl bg-[#1E293B] hover:bg-black text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <span>⇄ Bilan CSV</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('accounting')}
                    className="py-2.5 rounded-2xl bg-[#F4F5F8] hover:bg-gray-200 text-[#0F172A] font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>⇅ Détails</span>
                  </button>
                </div>
              </div>

              {/* Wallets Row */}
              <div className="space-y-2 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-400 font-bold">
                  <span>Portefeuilles & Passerelles</span>
                  <span className="text-[#FF5B29]">3 Actifs</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-2xl bg-[#F4F5F8] border border-gray-100 space-y-1">
                    <span className="text-[10px] font-bold text-gray-500 block">🌊 Wave</span>
                    <span className="font-mono font-black text-xs text-[#0F172A] block">{formatFCFA(Math.round(baseVolume * 0.68))}</span>
                    <span className="text-[9px] text-emerald-600 font-bold block">● Actif</span>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-[#F4F5F8] border border-gray-100 space-y-1">
                    <span className="text-[10px] font-bold text-gray-500 block">🍊 OM</span>
                    <span className="font-mono font-black text-xs text-[#0F172A] block">{formatFCFA(Math.round(baseVolume * 0.22))}</span>
                    <span className="text-[9px] text-emerald-600 font-bold block">● Actif</span>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-[#F4F5F8] border border-gray-100 space-y-1">
                    <span className="text-[10px] font-bold text-gray-500 block">💵 Cash</span>
                    <span className="font-mono font-black text-xs text-[#0F172A] block">{formatFCFA(Math.round(baseVolume * 0.10))}</span>
                    <span className="text-[9px] text-gray-400 font-bold block">Livreurs</span>
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMN 2 (4 cols): 4-GRID METRICS CARDS */}
            <div className="lg:col-span-4 grid grid-cols-2 gap-4">
              
              {/* Card 1: Vibrant Orange Card (Total Earnings / Commissions Thiob) */}
              <div className="bg-[#FF5B29] p-5 rounded-[28px] text-white shadow-lg shadow-[#FF5B29]/25 flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white/80">Commissions Thiob</span>
                  <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center text-white">
                    <Wallet className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">
                    {formatFCFA(platformCommissions)}
                  </h3>
                  <span className="text-[10px] font-bold text-white/90 flex items-center gap-0.5 mt-0.5">
                    ↑ 12% commission
                  </span>
                </div>
              </div>

              {/* Card 2: Dépenses / Frais Livreurs */}
              <div className="bg-white p-5 rounded-[28px] border border-[#EAEAEA] shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between text-gray-400">
                  <span className="text-xs font-bold text-gray-500">Gains Livreurs</span>
                  <div className="w-7 h-7 rounded-xl bg-[#F4F5F8] flex items-center justify-center text-gray-700">
                    <Bike className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-[#0F172A]">
                    {formatFCFA(couriersEarnings)}
                  </h3>
                  <span className="text-[10px] font-bold text-sky-600 flex items-center gap-0.5 mt-0.5">
                    100% courses payées
                  </span>
                </div>
              </div>

              {/* Card 3: Part Restaurants (88%) */}
              <div className="bg-white p-5 rounded-[28px] border border-[#EAEAEA] shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between text-gray-400">
                  <span className="text-xs font-bold text-gray-500">Part Restos (88%)</span>
                  <div className="w-7 h-7 rounded-xl bg-[#F4F5F8] flex items-center justify-center text-gray-700">
                    <Store className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#0F172A] truncate">
                    {formatFCFA(restaurantsNet)}
                  </h3>
                  <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 mt-0.5">
                    ↑ 18% ce mois
                  </span>
                </div>
              </div>

              {/* Card 4: Téléchargements App */}
              <div className="bg-white p-5 rounded-[28px] border border-[#EAEAEA] shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between text-gray-400">
                  <span className="text-xs font-bold text-gray-500">Téléchargements</span>
                  <div className="w-7 h-7 rounded-xl bg-[#F4F5F8] flex items-center justify-center text-gray-700">
                    <Smartphone className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-[#0F172A]">
                    {downloads.total.toLocaleString()}
                  </h3>
                  <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 mt-0.5">
                    +{downloads.today} aujourd'hui
                  </span>
                </div>
              </div>

            </div>

            {/* COLUMN 3 (4 cols): PROFIT & LOSS BAR CHART (GRAPHIQUE REVENUS) */}
            <div className="lg:col-span-4 bg-white p-6 rounded-[28px] border border-[#EAEAEA] shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-sm text-[#0F172A]">Total Income & Croissance</h3>
                  <p className="text-[11px] text-gray-400">Évolution des volumes mensuels Dakar</p>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-bold">
                  <span className="flex items-center gap-1 text-[#FF5B29]">
                    <span className="w-2 h-2 rounded-full bg-[#FF5B29]" /> Wave & OM
                  </span>
                  <span className="flex items-center gap-1 text-[#1E293B]">
                    <span className="w-2 h-2 rounded-full bg-[#1E293B]" /> CB / Cash
                  </span>
                </div>
              </div>

              {/* Custom SVG/CSS Bar Chart (Jan to Aug) */}
              <div className="h-44 flex items-end justify-between gap-2 pt-4 px-2 border-b border-gray-100">
                {[
                  { month: 'Jan', waveH: '45%', cashH: '25%' },
                  { month: 'Fév', waveH: '60%', cashH: '30%' },
                  { month: 'Mar', waveH: '55%', cashH: '28%' },
                  { month: 'Avr', waveH: '70%', cashH: '35%' },
                  { month: 'Mai', waveH: '85%', cashH: '40%' },
                  { month: 'Juin', waveH: '75%', cashH: '32%' },
                  { month: 'Juil', waveH: '90%', cashH: '45%' },
                  { month: 'Août', waveH: '65%', cashH: '30%' },
                ].map((bar, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <div className="w-full max-w-[20px] flex flex-col gap-1 items-center">
                      <div style={{ height: bar.waveH }} className="w-full bg-[#FF5B29] rounded-t-md transition-all hover:brightness-110" />
                      <div style={{ height: bar.cashH }} className="w-full bg-[#1E293B] rounded-b-md transition-all" />
                    </div>
                    <span className="text-[10px] text-gray-400 font-bold">{bar.month}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* =================================================================
              BOTTOM DUAL WORKSPACE: CARDS & RECENT ACTIVITIES TABLE
             ================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT SIDE (4 cols): SPENDING LIMIT + MY CARDS */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Monthly Spending & Target Progress */}
              <div className="bg-white p-5 rounded-[28px] border border-[#EAEAEA] shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-3">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#0F172A]">Objectif Mensuel de Ventes</span>
                  <span className="text-gray-400">37% Réalisé</span>
                </div>

                <div className="w-full h-3 bg-[#F4F5F8] rounded-full overflow-hidden p-0.5 border border-gray-100">
                  <div className="w-[37%] h-full bg-[#FF5B29] rounded-full" />
                </div>

                <div className="flex justify-between text-[11px] font-bold text-gray-500">
                  <span className="text-[#FF5B29]">1 850 000 F atteints</span>
                  <span>5 000 000 F cible</span>
                </div>
              </div>

              {/* My Cards & Comptes Marchands */}
              <div className="bg-white p-5 rounded-[28px] border border-[#EAEAEA] shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-gray-600" />
                    <h3 className="font-black text-sm text-[#0F172A]">Comptes & Cartes Marchands</h3>
                  </div>
                  <button 
                    onClick={() => setToastMessage('Module d’ajout de compte marchant actif.')}
                    className="text-xs font-bold text-[#FF5B29] hover:underline"
                  >
                    + Nouveau
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Black Card */}
                  <div className="h-28 rounded-2xl bg-[#0F172A] p-3 text-white flex flex-col justify-between shadow-md relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] uppercase font-bold bg-white/10 px-1.5 py-0.2 rounded-md">
                        Wave Pro
                      </span>
                      <div className="flex -space-x-1">
                        <div className="w-3.5 h-3.5 rounded-full bg-rose-500/80" />
                        <div className="w-3.5 h-3.5 rounded-full bg-amber-400/80" />
                      </div>
                    </div>
                    <div>
                      <span className="font-mono text-xs tracking-widest font-black">•••• 6782</span>
                      <div className="flex justify-between text-[8px] text-gray-400 mt-1">
                        <span>EXP 09/29</span>
                        <span>CVV 611</span>
                      </div>
                    </div>
                  </div>

                  {/* Orange Card */}
                  <div className="h-28 rounded-2xl bg-[#FF5B29] p-3 text-white flex flex-col justify-between shadow-md relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] uppercase font-bold bg-white/20 px-1.5 py-0.2 rounded-md">
                        Orange Pro
                      </span>
                      <span className="text-[10px]">📱</span>
                    </div>
                    <div>
                      <span className="font-mono text-xs tracking-widest font-black">•••• 4358</span>
                      <div className="flex justify-between text-[8px] text-white/80 mt-1">
                        <span>EXP 12/28</span>
                        <span>OM SN</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT SIDE (8 cols): RECENT ACTIVITIES TABLE (Tableau net comme la maquette) */}
            <div className="lg:col-span-8 bg-white p-6 rounded-[28px] border border-[#EAEAEA] shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <h3 className="font-black text-sm text-[#0F172A]">Activités Récentes & Commandes</h3>
                
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-48">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-[#F4F5F8] border border-gray-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#FF5B29]"
                    />
                  </div>
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="px-3 py-1.5 rounded-xl bg-[#F4F5F8] text-gray-600 font-bold text-xs flex items-center gap-1 border border-gray-200 hover:bg-gray-200 cursor-pointer"
                  >
                    <Filter className="w-3 h-3" />
                    <span>Filtre</span>
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 text-[10px] uppercase font-bold">
                      <th className="pb-3 w-8"></th>
                      <th className="pb-3">Order ID</th>
                      <th className="pb-3">Activité / Plat</th>
                      <th className="pb-3">Montant</th>
                      <th className="pb-3">Statut</th>
                      <th className="pb-3">Date & Heure</th>
                      <th className="pb-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {orders
                      .filter(o => o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) || o.clientName.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((ord) => {
                        const isChecked = !!selectedOrders[ord.id];
                        return (
                          <tr key={ord.id} className="hover:bg-[#F8FAFC] transition-colors">
                            <td className="py-3">
                              <button 
                                onClick={() => toggleSelectOrder(ord.id)}
                                className="text-gray-400 hover:text-[#FF5B29] cursor-pointer"
                              >
                                {isChecked ? <CheckSquare className="w-4 h-4 text-[#FF5B29]" /> : <Square className="w-4 h-4" />}
                              </button>
                            </td>
                            <td className="py-3 font-mono font-bold text-gray-900">{ord.orderNumber}</td>
                            <td className="py-3 font-bold text-gray-900 flex items-center gap-2">
                              <div className="w-6 h-6 rounded-lg bg-[#FF5B29]/10 text-[#FF5B29] flex items-center justify-center text-xs">
                                🍽️
                              </div>
                              <div>
                                <span>{ord.restaurantName}</span>
                                <span className="text-[10px] text-gray-400 block font-normal">Client: {ord.clientName}</span>
                              </div>
                            </td>
                            <td className="py-3 font-mono font-black text-gray-900">{formatFCFA(ord.total)}</td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit ${
                                ord.status === 'delivered' ? 'bg-emerald-50 text-emerald-700' :
                                ord.status === 'preparing' ? 'bg-amber-50 text-amber-700' : 'bg-sky-50 text-sky-700'
                              }`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                {ord.status === 'delivered' ? 'Completed' : ord.status === 'preparing' ? 'In Progress' : 'Pending'}
                              </span>
                            </td>
                            <td className="py-3 text-[11px] text-gray-400 font-medium">17 Apr, 2026 03:45 PM</td>
                            <td className="py-3 text-right">
                              <button className="text-gray-400 hover:text-gray-700 p-1 rounded-md">
                                <MoreVertical className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

            </div>

          </div>

        </main>
      </div>

    </div>
  );
}
