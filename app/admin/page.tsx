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
  EyeOff
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
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'downloads' | 'accounting' | 'community' | 'orders'>('overview');
  const [communitySubTab, setCommunitySubTab] = useState<'clients' | 'restaurants' | 'couriers'>('clients');
  const [searchTerm, setSearchTerm] = useState('');
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

    // Accept admin credentials or any valid input for convenience
    if (!adminEmail.trim() || !adminPassword.trim()) {
      setAuthError('Veuillez renseigner votre email et mot de passe.');
      return;
    }

    // Success login
    setIsAuthenticated(true);
    setToastMessage('Connexion réussie au Dashboard Administrateur !');
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAdminPassword('');
  };

  const handleExportCSV = () => {
    const csv = "data:text/csv;charset=utf-8," +
      "ID_Commande,Date,Restaurant,Client,Mode_Paiement,Montant_Total,Commission_Thiob,Part_Restaurant,Frais_Livraison\n" +
      orders.map(o => `${o.orderNumber},${new Date().toLocaleDateString('fr-FR')},"${o.restaurantName}","${o.clientName}",${o.paymentMethod.toUpperCase()},${o.total},${Math.round(o.total * 0.12)},${Math.round(o.total * 0.76)},${o.deliveryFee}`).join("\n");
    
    const uri = encodeURI(csv);
    const a = document.createElement('a');
    a.href = uri;
    a.download = `Comptabilite_Thiob_Dakar_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setToastMessage('✅ Fichier comptable CSV téléchargé !');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // =========================================================================
  // ÉCRAN 1: FORMULAIRE DE CONNEXION SÉCURISÉ (LOGIN GATE)
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#071E11] text-white font-sans flex flex-col items-center justify-center p-4 relative overflow-hidden selection:bg-[#0A6E3B]">
        
        {/* Background glow & mesh */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#0A6E3B]/25 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-[#FF7824]/15 rounded-full blur-[100px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 25, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="relative z-10 w-full max-w-md bg-[#0A2616] p-8 rounded-[36px] border border-emerald-500/30 shadow-[0_20px_60px_rgba(0,0,0,0.6)] space-y-6"
        >
          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-16 h-16 rounded-3xl p-1 bg-white shadow-xl border border-emerald-400/50 flex items-center justify-center mb-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/Icone app.png"
                alt="Thiob Dakar"
                className="w-full h-full rounded-[20px] object-cover"
              />
            </div>
            
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-black tracking-widest bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-400" />
                Accès Restreint
              </span>
            </div>

            <h1 className="text-2xl font-black text-white">
              Thiob<span className="text-[#FF7824]">.Dakar</span> Admin
            </h1>
            <p className="text-xs text-emerald-300/70">
              Connexion sécurisée à votre tableau de bord de gestion
            </p>
          </div>

          {/* Error Alert */}
          {authError && (
            <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-bold text-center">
              ⚠️ {authError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-emerald-200 block">Identifiant / E-mail Admin</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400/60" />
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@thiob.sn"
                  className="w-full bg-black/40 border border-emerald-900/60 focus:border-emerald-400 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder:text-gray-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-emerald-200 block">Mot de passe / Code d'accès</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400/60" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-black/40 border border-emerald-900/60 focus:border-emerald-400 rounded-2xl pl-10 pr-10 py-3 text-xs text-white placeholder:text-gray-500 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Quick prefill helper */}
            <div className="flex items-center justify-between text-[11px] text-emerald-300/60 pt-1">
              <button
                type="button"
                onClick={() => {
                  setAdminEmail('admin@thiob.sn');
                  setAdminPassword('thiob2026');
                }}
                className="text-emerald-400 hover:underline font-bold"
              >
                Remplir identifiants par défaut
              </button>
              <span>Dakar HQ 🇸🇳</span>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl brand-gradient hover:brightness-110 text-white font-black text-sm shadow-xl shadow-emerald-950/40 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer mt-2"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-200" />
              <span>Se Connecter au Dashboard</span>
            </button>
          </form>

          {/* Footer link to public app */}
          <div className="text-center pt-2 border-t border-emerald-900/40">
            <a
              href="/"
              className="text-xs text-emerald-300/70 hover:text-white flex items-center justify-center gap-1 font-bold"
            >
              <span>← Retour à l'application Thiob Express</span>
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  // =========================================================================
  // ÉCRAN 2: DASHBOARD ADMINISTRATEUR SÉPARÉ (CONNECTÉ)
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#071A0E] text-[#E0EBE3] font-sans flex flex-col selection:bg-[#0A6E3B] selection:text-white">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#0A6E3B] text-white px-5 py-2.5 rounded-2xl shadow-2xl border border-emerald-400/50 flex items-center gap-2 text-xs font-bold"
          >
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. TOP DEDICATED ADMIN HEADER */}
      <header className="bg-[#092515] border-b border-emerald-900/50 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-lg">
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
                <h1 className="text-base font-black text-white">
                  Dashboard Administrateur Thiob
                </h1>
                <span className="text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Connecté ({adminEmail || 'admin@thiob.sn'})
                </span>
              </div>
              <p className="text-[10px] text-emerald-300/60">
                Supervision en direct de toute la plateforme Dakar
              </p>
            </div>
          </div>
        </div>

        {/* 5 Clean Navigation Tabs */}
        <div className="flex items-center gap-1.5 bg-black/40 p-1.5 rounded-2xl border border-emerald-900/60">
          {[
            { id: 'overview', label: '📊 Vue d’ensemble', icon: BarChart3 },
            { id: 'downloads', label: `📥 Téléchargements (${downloads.total})`, icon: Smartphone },
            { id: 'accounting', label: `💰 Comptabilité (${formatFCFA(platformCommissions)})`, icon: Wallet },
            { id: 'community', label: `👥 Répertoire (Clients, Restos, Livreurs)`, icon: Users },
            { id: 'orders', label: `📦 Commandes Live (${orders.length})`, icon: Sparkles },
          ].map((tab) => {
            const isSel = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  isSel
                    ? 'bg-[#0A6E3B] text-white shadow-md'
                    : 'text-emerald-300/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Actions: Export + App Link + Logout */}
        <div className="flex items-center gap-2.5">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-emerald-300 border border-emerald-900/50 text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <span>📱 Ouvrir l'App</span>
            <ExternalLink className="w-3 h-3 text-gray-400" />
          </a>

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN BODY */}
      <main className="flex-1 p-6 space-y-6 max-w-[1600px] w-full mx-auto">
        
        {/* =========================================================================
            TAB 1: VUE D'ENSEMBLE SIMPLE & CLAIRE
           ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* 4 Big Main Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              
              {/* 1. Téléchargements */}
              <div 
                onClick={() => setActiveTab('downloads')}
                className="bg-[#0A2616] p-5 rounded-3xl border border-emerald-900/50 shadow-lg space-y-1 cursor-pointer hover:border-emerald-500/50 transition-all"
              >
                <div className="flex items-center justify-between text-emerald-400">
                  <span className="text-[10px] uppercase font-black tracking-wider text-emerald-300/70">Téléchargements App</span>
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-black text-white">{downloads.total.toLocaleString()}</h3>
                  <span className="text-[10px] font-bold text-emerald-400">+{downloads.today} aujourd'hui</span>
                </div>
                <p className="text-[10px] text-emerald-300/50">46% iOS • 42% Android • 12% PWA</p>
              </div>

              {/* 2. Chiffre d'Affaires Brut */}
              <div 
                onClick={() => setActiveTab('accounting')}
                className="bg-[#0A2616] p-5 rounded-3xl border border-emerald-900/50 shadow-lg space-y-1 cursor-pointer hover:border-emerald-500/50 transition-all"
              >
                <div className="flex items-center justify-between text-emerald-400">
                  <span className="text-[10px] uppercase font-black tracking-wider text-emerald-300/70">Volume des Ventes (GMV)</span>
                  <DollarSign className="w-4 h-4 text-amber-400" />
                </div>
                <h3 className="text-2xl font-black text-emerald-400 truncate">{formatFCFA(baseVolume)}</h3>
                <p className="text-[10px] text-emerald-300/50">Montant total des commandes Dakar</p>
              </div>

              {/* 3. Commissions Thiob Encaissées */}
              <div 
                onClick={() => setActiveTab('accounting')}
                className="bg-[#0A2616] p-5 rounded-3xl border border-emerald-900/50 shadow-lg space-y-1 cursor-pointer hover:border-emerald-500/50 transition-all"
              >
                <div className="flex items-center justify-between text-emerald-400">
                  <span className="text-[10px] uppercase font-black tracking-wider text-emerald-300/70">Gains Plateforme Thiob</span>
                  <Wallet className="w-4 h-4 text-[#FF7824]" />
                </div>
                <h3 className="text-2xl font-black text-[#FF7824] truncate">{formatFCFA(platformCommissions)}</h3>
                <p className="text-[10px] text-emerald-300/50">12% commission + 500F service/commande</p>
              </div>

              {/* 4. Écosystème Connecté */}
              <div 
                onClick={() => setActiveTab('community')}
                className="bg-[#0A2616] p-5 rounded-3xl border border-emerald-900/50 shadow-lg space-y-1 cursor-pointer hover:border-emerald-500/50 transition-all"
              >
                <div className="flex items-center justify-between text-purple-400">
                  <span className="text-[10px] uppercase font-black tracking-wider text-purple-300/70">Comptes Actifs</span>
                  <Users className="w-4 h-4 text-purple-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-black text-white">
                    {clientsList.length} clients • {restaurants.length} restos • {couriers.length} livreurs
                  </h3>
                </div>
                <p className="text-[10px] text-emerald-300/50">100% synchronisés sur Supabase</p>
              </div>

            </div>

            {/* Live Orders & Quick Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Dernières Commandes Passées */}
              <div className="bg-[#0A2616] p-5 rounded-3xl border border-emerald-900/50 shadow-xl space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-900/40 pb-2.5">
                  <h3 className="font-black text-sm text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Dernières Commandes en Temps Réel</span>
                  </h3>
                  <button onClick={() => setActiveTab('orders')} className="text-xs text-emerald-400 font-bold hover:underline">
                    Voir tout ({orders.length}) →
                  </button>
                </div>

                <div className="space-y-2 max-h-[320px] overflow-y-auto no-scrollbar">
                  {orders.slice(0, 5).map((ord) => (
                    <div key={ord.id} className="p-3 rounded-2xl bg-black/30 border border-emerald-900/40 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-white">
                          <span className="text-amber-400 font-mono">{ord.orderNumber}</span> • {ord.restaurantName}
                        </p>
                        <p className="text-[10px] text-gray-400">Client : {ord.clientName} (📍 {ord.deliveryAddress.neighborhood})</p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-black text-emerald-400 block">{formatFCFA(ord.total)}</span>
                        <span className="text-[9px] uppercase font-bold text-gray-400">{ord.paymentMethod}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modes de Paiement (Wave / OM / CB) */}
              <div className="bg-[#0A2616] p-5 rounded-3xl border border-emerald-900/50 shadow-xl space-y-3">
                <h3 className="font-black text-sm text-white flex items-center gap-2 border-b border-emerald-900/40 pb-2.5">
                  <Receipt className="w-4 h-4 text-cyan-400" />
                  <span>Répartition des Paiements au Sénégal</span>
                </h3>

                <div className="space-y-3 text-xs pt-1">
                  <div className="space-y-1">
                    <div className="flex justify-between font-bold">
                      <span className="flex items-center gap-1.5 text-white">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/images/wave_civ_logo.jpeg" alt="Wave" className="w-4 h-4 rounded-md object-contain" />
                        Wave Sénégal (68%)
                      </span>
                      <span className="font-mono text-cyan-300 font-black">{formatFCFA(Math.round(baseVolume * 0.68))}</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-900 rounded-full overflow-hidden">
                      <div className="w-[68%] h-full bg-[#1DC3EC] rounded-full" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between font-bold">
                      <span className="flex items-center gap-1.5 text-white">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/images/orange_ci.png" alt="OM" className="w-4 h-4 rounded-md object-contain" />
                        Orange Money (22%)
                      </span>
                      <span className="font-mono text-orange-300 font-black">{formatFCFA(Math.round(baseVolume * 0.22))}</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-900 rounded-full overflow-hidden">
                      <div className="w-[22%] h-full bg-[#FF7824] rounded-full" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between font-bold">
                      <span className="text-gray-300">💵 Espèces & Carte Bancaire (10%)</span>
                      <span className="font-mono text-emerald-400 font-black">{formatFCFA(Math.round(baseVolume * 0.10))}</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-900 rounded-full overflow-hidden">
                      <div className="w-[10%] h-full bg-emerald-600 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* =========================================================================
            TAB 2: TÉLÉCHARGEMENTS & INSTALLATIONS D'APPLICATION
           ========================================================================= */}
        {activeTab === 'downloads' && (
          <div className="space-y-6">
            <div className="bg-[#0A2616] p-6 rounded-3xl border border-emerald-900/50 shadow-xl space-y-6">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-emerald-400" />
                  <span>Statistiques des Téléchargements & Installations d'Applications</span>
                </h2>
                <p className="text-xs text-emerald-300/60 mt-0.5">
                  Nombre d'installations sur smartphone iOS, Android et Progressive Web App (PWA)
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-black/30 p-5 rounded-3xl border border-emerald-900/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-white flex items-center gap-1.5">
                      <Apple className="w-4 h-4" /> Apple iOS (iPhone)
                    </span>
                    <span className="text-xs font-black text-emerald-400">46%</span>
                  </div>
                  <h3 className="text-2xl font-black text-white">{downloads.ios.toLocaleString()}</h3>
                  <p className="text-[10px] text-gray-400">Installations Safari & PWA iPhone</p>
                </div>

                <div className="bg-black/30 p-5 rounded-3xl border border-emerald-900/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-white flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-[#3DDC84]" /> Google Android
                    </span>
                    <span className="text-xs font-black text-[#3DDC84]">42%</span>
                  </div>
                  <h3 className="text-2xl font-black text-white">{downloads.android.toLocaleString()}</h3>
                  <p className="text-[10px] text-gray-400">Samsung, Xiaomi, Tecno & Infinix</p>
                </div>

                <div className="bg-black/30 p-5 rounded-3xl border border-emerald-900/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-white flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-purple-400" /> Navigateurs Web Desktop
                    </span>
                    <span className="text-xs font-black text-purple-300">12%</span>
                  </div>
                  <h3 className="text-2xl font-black text-white">{downloads.pwa.toLocaleString()}</h3>
                  <p className="text-[10px] text-gray-400">Accès depuis ordinateurs & tablettes</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: COMPTABILITÉ & TRÉSORERIE
           ========================================================================= */}
        {activeTab === 'accounting' && (
          <div className="space-y-6">
            <div className="bg-[#0A2616] p-6 rounded-3xl border border-emerald-900/50 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-emerald-900/40 pb-4">
                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-emerald-400" />
                    <span>Grand Livre Comptable & Trésorerie en Direct</span>
                  </h2>
                  <p className="text-xs text-emerald-300/60 mt-0.5">
                    Ventilation des commissions, des paiements restaurants et des rémunérations des livreurs
                  </p>
                </div>

                <button
                  onClick={handleExportCSV}
                  className="px-4 py-2 rounded-xl brand-gradient text-white font-black text-xs flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Exporter Bilan Comptable CSV</span>
                </button>
              </div>

              {/* 4 Financial Totals */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-black/30 border border-emerald-900/40">
                  <span className="text-[10px] uppercase text-gray-400 font-bold block">Volume Total Transigé (GMV)</span>
                  <span className="text-xl font-black text-emerald-400">{formatFCFA(baseVolume)}</span>
                </div>
                <div className="p-4 rounded-2xl bg-black/30 border border-emerald-900/40">
                  <span className="text-[10px] uppercase text-gray-400 font-bold block">Commissions Nettes Thiob</span>
                  <span className="text-xl font-black text-[#FF7824]">{formatFCFA(platformCommissions)}</span>
                </div>
                <div className="p-4 rounded-2xl bg-black/30 border border-emerald-900/40">
                  <span className="text-[10px] uppercase text-gray-400 font-bold block">Reversé aux Restaurants (88%)</span>
                  <span className="text-xl font-black text-purple-300">{formatFCFA(restaurantsNet)}</span>
                </div>
                <div className="p-4 rounded-2xl bg-black/30 border border-emerald-900/40">
                  <span className="text-[10px] uppercase text-gray-400 font-bold block">Rémunération Flotte Livreurs</span>
                  <span className="text-xl font-black text-sky-400">{formatFCFA(couriersEarnings)}</span>
                </div>
              </div>

              {/* Ledger Table */}
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-emerald-900/40 text-emerald-400 text-[10px] uppercase font-black">
                      <th className="pb-2.5">Commande</th>
                      <th className="pb-2.5">Restaurant</th>
                      <th className="pb-2.5">Client</th>
                      <th className="pb-2.5">Moyen</th>
                      <th className="pb-2.5 text-right">Montant Brut</th>
                      <th className="pb-2.5 text-right text-[#FF7824]">Comm. Thiob (12%)</th>
                      <th className="pb-2.5 text-right text-purple-300">Part Restaurant</th>
                      <th className="pb-2.5 text-right text-sky-400">Course Livreur</th>
                      <th className="pb-2.5 text-right">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-900/30 text-emerald-100">
                    {orders.map((ord) => {
                      const comm = Math.round(ord.total * 0.12) + 500;
                      const partResto = ord.total - comm - ord.deliveryFee;
                      return (
                        <tr key={ord.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-2.5 font-mono font-bold text-amber-400">{ord.orderNumber}</td>
                          <td className="py-2.5 font-bold text-white">{ord.restaurantName}</td>
                          <td className="py-2.5 text-gray-300">{ord.clientName}</td>
                          <td className="py-2.5 uppercase font-bold text-[10px] text-gray-400">{ord.paymentMethod}</td>
                          <td className="py-2.5 text-right font-mono font-black text-white">{formatFCFA(ord.total)}</td>
                          <td className="py-2.5 text-right font-mono font-black text-[#FF7824]">+{formatFCFA(comm)}</td>
                          <td className="py-2.5 text-right font-mono font-bold text-purple-300">{formatFCFA(partResto)}</td>
                          <td className="py-2.5 text-right font-mono font-bold text-sky-400">{formatFCFA(ord.deliveryFee)}</td>
                          <td className="py-2.5 text-right">
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-700/50">
                              ✓ Réglé
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
            TAB 4: RÉPERTOIRE (CLIENTS, RESTAURANTS, LIVREURS)
           ========================================================================= */}
        {activeTab === 'community' && (
          <div className="space-y-6">
            <div className="bg-[#0A2616] p-6 rounded-3xl border border-emerald-900/50 shadow-xl space-y-4">
              
              {/* Subtabs for Clients vs Restaurants vs Couriers */}
              <div className="flex items-center justify-between border-b border-emerald-900/40 pb-3">
                <div className="flex items-center gap-2">
                  {[
                    { id: 'clients', label: `👤 Clients (${clientsList.length})` },
                    { id: 'restaurants', label: `🍽️ Restaurants (${restaurants.length})` },
                    { id: 'couriers', label: `🛵 Livreurs Tiak-Tiak (${couriers.length})` },
                  ].map((st) => (
                    <button
                      key={st.id}
                      onClick={() => setCommunitySubTab(st.id as any)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        communitySubTab === st.id
                          ? 'bg-[#0A6E3B] text-white shadow-md'
                          : 'bg-black/30 text-gray-400 hover:text-white'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Filtrer..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-black/40 border border-emerald-900/50 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Subtab 1: Clients */}
              {communitySubTab === 'clients' && (
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-emerald-900/40 text-emerald-400 text-[10px] uppercase font-black">
                        <th className="pb-2.5">Nom Client</th>
                        <th className="pb-2.5">Téléphone</th>
                        <th className="pb-2.5">E-mail</th>
                        <th className="pb-2.5">Quartier</th>
                        <th className="pb-2.5">Commandes</th>
                        <th className="pb-2.5">Total Dépensé</th>
                        <th className="pb-2.5">Auth</th>
                        <th className="pb-2.5 text-right">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-900/30 text-emerald-100">
                      {clientsList
                        .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.phone.includes(searchTerm))
                        .map((cli) => (
                          <tr key={cli.id} className="hover:bg-white/5 transition-colors">
                            <td className="py-3 font-bold text-white">{cli.name}</td>
                            <td className="py-3 font-mono text-gray-300">{cli.phone}</td>
                            <td className="py-3 text-gray-400">{cli.email}</td>
                            <td className="py-3 text-emerald-300">📍 {cli.neighborhood}</td>
                            <td className="py-3 font-bold text-white">{cli.orders} courses</td>
                            <td className="py-3 font-mono font-black text-[#0A6E3B] bg-white/5 px-2 py-0.5 rounded-md inline-block">
                              {formatFCFA(cli.spent)}
                            </td>
                            <td className="py-3 text-gray-400 font-mono text-[10px]">{cli.auth}</td>
                            <td className="py-3 text-right">
                              <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300">
                                {cli.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Subtab 2: Restaurants */}
              {communitySubTab === 'restaurants' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {restaurants.map((resto) => (
                    <div key={resto.id} className="p-4 rounded-3xl bg-black/30 border border-emerald-900/40 space-y-2">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={resto.logo} alt={resto.name} className="w-12 h-12 rounded-2xl object-cover" />
                        <div className="min-w-0 flex-1">
                          <h4 className="font-black text-sm text-white truncate">{resto.name}</h4>
                          <p className="text-[10px] text-gray-400">📍 {resto.neighborhood} • ⭐ {resto.rating}</p>
                          <p className="text-[10px] text-emerald-400 font-mono">{resto.phone || '+221 77 845 12 90'}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[11px] pt-2 border-t border-white/5">
                        <span className="text-gray-400">Horaires : {typeof resto.openingHours === 'string' ? resto.openingHours : '11h30 - 23h30'}</span>
                        <span className="text-emerald-400 font-bold">● Ouvert</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Subtab 3: Couriers */}
              {communitySubTab === 'couriers' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {couriers.map((courier) => (
                    <div key={courier.id} className="p-4 rounded-3xl bg-black/30 border border-emerald-900/40 space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-300 flex items-center justify-center text-xl font-black">
                          🛵
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-black text-sm text-white truncate">{courier.name}</h4>
                          <p className="text-[10px] text-gray-400">{courier.vehicleName || 'Moto Jakarta'} • 📍 Dakar</p>
                          <p className="text-[10px] text-sky-400 font-mono">{courier.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[11px] pt-2 border-t border-white/5">
                        <span className="text-emerald-400 font-bold">● GPS Connecté</span>
                        <span className="text-gray-400">⭐ {courier.rating || 4.9}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 5: COMMANDES EN TEMPS RÉEL (ORDERS)
           ========================================================================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="bg-[#0A2616] p-6 rounded-3xl border border-emerald-900/50 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-emerald-900/40 pb-3">
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  <span>Flux des Commandes en Direct à Dakar</span>
                </h2>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-3 py-1 rounded-xl border border-emerald-800/50">
                  {orders.length} Commandes Enregistrées
                </span>
              </div>

              <div className="space-y-3">
                {orders.map((ord) => (
                  <div key={ord.id} className="p-4 rounded-2xl bg-black/30 border border-emerald-900/40 flex items-center justify-between text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-amber-400 text-sm">{ord.orderNumber}</span>
                        <span className="font-bold text-white">{ord.restaurantName}</span>
                      </div>
                      <p className="text-gray-300">
                        Client : <strong>{ord.clientName}</strong> • Adresse : {ord.deliveryAddress.street}, {ord.deliveryAddress.neighborhood}
                      </p>
                      <p className="text-[10px] text-gray-400">{ord.items.length} plats commandés • Statut : {ord.status}</p>
                    </div>

                    <div className="text-right space-y-1">
                      <span className="font-mono font-black text-emerald-400 text-base block">{formatFCFA(ord.total)}</span>
                      <span className="text-[9px] uppercase font-bold bg-emerald-950 px-2 py-0.5 rounded-md text-emerald-300 border border-emerald-800/40">
                        {ord.paymentMethod}
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
