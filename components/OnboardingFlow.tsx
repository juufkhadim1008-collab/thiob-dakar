'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/lib/store';
import { UserRole } from '@/lib/types';
import { 
  Store, 
  Bike, 
  User, 
  ArrowLeft, 
  ArrowRight, 
  MapPin, 
  CheckCircle2, 
  Camera, 
  Upload, 
  Sparkles, 
  ShieldCheck,
  Navigation,
  Car,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import MiniLocationPicker from '@/components/map/MiniLocationPicker';

interface OnboardingFlowProps {
  onComplete: (role: UserRole) => void;
}

type OnboardingStep = 
  | 'splash'
  | 'choose_role'
  | 'resto_step1'
  | 'resto_step2'
  | 'resto_step3'
  | 'courier_step1'
  | 'courier_step2'
  | 'courier_step3'
  | 'courier_step4'
  | 'client_step';

const RESTO_TYPES = [
  { id: 'traditionnel', label: '🍲 Traditionnel (Thiéb, Mafé, Yassa)' },
  { id: 'fast_food', label: '🍔 Fast-Food & Burgers' },
  { id: 'pizzeria', label: '🍕 Pizzeria & Pâtes' },
  { id: 'grill', label: '🥩 Grill & Dibiterie' },
  { id: 'patisserie', label: '🥐 Pâtisserie & Boulangerie' },
  { id: 'cafe', label: '☕ Café & Brunch' },
  { id: 'glacier', label: '🍦 Glacier & Desserts' },
  { id: 'africaine', label: '🌍 Cuisine Africaine Moderne' },
  { id: 'internationale', label: '🌐 Cuisine Internationale' },
  { id: 'autre', label: '✨ Autre Spécialité' },
];

const PRESET_LOGOS = [
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=300&q=80',
];

const VEHICLE_OPTIONS = [
  { id: 'moto', label: '🛵 Moto', name: 'Moto standard' },
  { id: 'scooter', label: '🛴 Scooter', name: 'Scooter 125cc' },
  { id: 'voiture', label: '🚗 Voiture', name: 'Véhicule urbain' },
  { id: 'velo', label: '🚲 Vélo', name: 'Vélo de coursier' },
];

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const { setCurrentRole, registerNewRestaurant } = useApp();
  const [step, setStep] = useState<OnboardingStep>('splash');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  // --- Restaurant Registration State ---
  const [restoName, setRestoName] = useState('');
  const [restoType, setRestoType] = useState('traditionnel');
  const [restoLogo, setRestoLogo] = useState(PRESET_LOGOS[0]);
  const [restoCustomLogo, setRestoCustomLogo] = useState<string | null>(null);
  const [restoLocation, setRestoLocation] = useState('Almadies, Dakar');
  const [restoGpsCoords, setRestoGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocatingResto, setIsLocatingResto] = useState(false);
  const [restoLocSuccess, setRestoLocSuccess] = useState(false);

  // --- Courier Registration State ---
  const [courierName, setCourierName] = useState('');
  const [courierPhone, setCourierPhone] = useState('+221 ');
  const [courierPhoto, setCourierPhoto] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80');
  const [courierVehicle, setCourierVehicle] = useState('moto');
  const [courierPlate, setCourierPlate] = useState('DK-7842-AB');
  const [courierLocation, setCourierLocation] = useState('Plateau, Dakar');
  const [isLocatingCourier, setIsLocatingCourier] = useState(false);
  const [courierLocSuccess, setCourierLocSuccess] = useState(false);

  // --- Client Registration State ---
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('+221 ');
  const [clientLocation, setClientLocation] = useState('Dakar, Sénégal');
  const [isLocatingClient, setIsLocatingClient] = useState(false);
  const [clientLocSuccess, setClientLocSuccess] = useState(false);

  // Auto transition from splash to choose role after 1.8s
  useEffect(() => {
    if (step === 'splash') {
      const timer = setTimeout(() => {
        setStep('choose_role');
      }, 1900);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Handle Logo Upload from Device
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setRestoCustomLogo(event.target.result as string);
          setRestoLogo(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // GPS Geolocation trigger
  const handleGeoLocate = (target: 'resto' | 'courier' | 'client') => {
    if (target === 'resto') setIsLocatingResto(true);
    if (target === 'courier') setIsLocatingCourier(true);
    if (target === 'client') setIsLocatingClient(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setTimeout(() => {
            if (target === 'resto') {
              setRestoGpsCoords({ lat, lng });
              setRestoLocation('Almadies Virage, Dakar (GPS Détecté)');
              setIsLocatingResto(false);
              setRestoLocSuccess(true);
            } else if (target === 'courier') {
              setCourierLocation('Plateau / Médina, Dakar (GPS Détecté)');
              setIsLocatingCourier(false);
              setCourierLocSuccess(true);
            } else {
              setClientLocation('Pikine Tally Boumack, Dakar (GPS Détecté)');
              setIsLocatingClient(false);
              setClientLocSuccess(true);
            }
          }, 800);
        },
        () => {
          // Fallback simulation for Dakar
          setTimeout(() => {
            if (target === 'resto') {
              setRestoGpsCoords({ lat: 14.745, lng: -17.518 });
              setRestoLocation('Almadies Corniche, Dakar');
              setIsLocatingResto(false);
              setRestoLocSuccess(true);
            } else if (target === 'courier') {
              setCourierLocation('Plateau Centre-Ville, Dakar');
              setIsLocatingCourier(false);
              setCourierLocSuccess(true);
            } else {
              setClientLocation('Ngor Virage, Dakar');
              setIsLocatingClient(false);
              setClientLocSuccess(true);
            }
          }, 700);
        }
      );
    } else {
      setTimeout(() => {
        if (target === 'resto') { setRestoLocation('Almadies, Dakar'); setIsLocatingResto(false); setRestoLocSuccess(true); }
        if (target === 'courier') { setCourierLocation('Plateau, Dakar'); setIsLocatingCourier(false); setCourierLocSuccess(true); }
        if (target === 'client') { setClientLocation('Dakar'); setIsLocatingClient(false); setClientLocSuccess(true); }
      }, 600);
    }
  };

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#064E2B', '#0A6E3B', '#FF7824', '#F5B738'],
      });
    } catch {}
  };

  const finishOnboarding = (role: UserRole) => {
    triggerCelebration();
    if (role === 'restaurant') {
      registerNewRestaurant({
        name: restoName.trim() || 'Mon Restaurant Dakar',
        logo: restoLogo,
        type: RESTO_TYPES.find(t => t.id === restoType)?.label.split(' ')[1] || 'Cuisine Dakaroise',
        address: restoLocation,
        neighborhood: restoLocation.includes('Almadies') ? 'Almadies' : restoLocation.includes('Plateau') ? 'Plateau' : restoLocation.includes('Ngor') ? 'Ngor' : restoLocation.includes('Pikine') ? 'Pikine' : restoLocation.includes('Mermoz') ? 'Mermoz' : 'Almadies',
        phone: '+221 77 123 45 67',
        coverImage: restoCustomLogo || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
      });
      setCurrentRole('restaurant');
    } else {
      setCurrentRole(role);
    }
    onComplete(role);
  };

  return (
    <div className="h-full flex flex-col bg-[#F0F5F2] relative overflow-hidden font-sans select-none text-[#081A10]">
      
      {/* Ambient background glow layers */}
      <div className="absolute -top-10 -right-10 w-64 h-64 bg-gradient-to-br from-emerald-400/20 to-teal-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-subtle" />
      <div className="absolute top-1/2 -left-10 w-56 h-56 bg-gradient-to-tr from-amber-400/15 to-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-60 h-60 bg-gradient-to-tl from-emerald-500/20 to-green-300/15 rounded-full blur-3xl pointer-events-none animate-pulse-subtle" />

      <AnimatePresence mode="wait">
        
        {/* =========================================================================
            1. ÉCRAN DE LANCEMENT (SPLASH SCREEN AVEC LOGO OFFICIEL & ANIMATION DOUCE)
           ========================================================================= */}
        {step === 'splash' && (
          <motion.div
            key="splash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.03 }}
            transition={{ duration: 0.5 }}
            className="h-full flex flex-col items-center justify-center p-6 text-center z-20"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              {/* Glowing halo behind logo */}
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-[#064E2B] via-[#0A6E3B] to-[#FF7824] opacity-30 blur-xl animate-pulse" />
              
              <div className="w-24 h-24 rounded-3xl p-1 bg-white/80 backdrop-blur-xl border border-white/90 shadow-2xl relative z-10 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/Icone app.png"
                  alt="Thiob Express"
                  className="w-full h-full rounded-[22px] object-cover"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mt-6 space-y-1"
            >
              <h1 className="text-2xl font-black tracking-tight text-[#081A10]">
                Thiob<span className="text-[#FF7824]">.Dakar</span>
              </h1>
              <p className="text-xs font-bold text-[#0A6E3B] uppercase tracking-widest">
                L'Excellence de la Teranga
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8 flex items-center gap-1.5 text-xs text-gray-400 font-medium"
            >
              <span className="w-2 h-2 rounded-full bg-[#0A6E3B] animate-ping" />
              <span>Chargement de l'expérience...</span>
            </motion.div>
          </motion.div>
        )}

        {/* =========================================================================
            2. CHOIX DU TYPE DE COMPTE (3 GRANDES CARTES GLASSMORPHISM PREMIUM)
           ========================================================================= */}
        {step === 'choose_role' && (
          <motion.div
            key="choose_role"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35 }}
            className="h-full flex flex-col justify-between p-5 overflow-y-auto no-scrollbar z-20 space-y-4"
          >
            {/* Header */}
            <div className="pt-2 text-center space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#0A6E3B] bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-300/30 inline-block">
                Onboarding Thiob Express
              </span>
              <h2 className="text-xl font-black text-[#081A10] leading-tight">
                Bienvenue sur Thiob Express 👋
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                Comment souhaitez-vous utiliser Thiob Express ?
              </p>
            </div>

            {/* The 3 Selection Cards */}
            <div className="space-y-3 flex-1 flex flex-col justify-center">
              
              {/* Card 1: RESTAURANT */}
              <motion.div
                whileHover={{ y: -4, scale: 1.015 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  setSelectedRole('restaurant');
                  setStep('resto_step1');
                }}
                className="ice-glass-card rounded-[26px] p-4 cursor-pointer relative overflow-hidden sheen-effect group border border-white/90 shadow-[0_10px_30px_rgba(6,78,43,0.06)] hover:border-emerald-500/30 transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-13 h-13 rounded-2xl brand-gradient flex items-center justify-center text-white shadow-md shadow-emerald-950/20 shrink-0 border border-emerald-400/30">
                    <Store className="w-6 h-6 text-emerald-200" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#0A6E3B]">
                        🏪 RESTAURANT
                      </span>
                      <span className="text-[10px] font-bold text-gray-400 group-hover:text-[#0A6E3B] transition-colors">
                        Commencer ➔
                      </span>
                    </div>
                    <h3 className="font-black text-sm text-[#081A10] mt-0.5">
                      Je suis un restaurant
                    </h3>
                    <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5">
                      Présentez votre restaurant et gérez votre activité.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Card 2: LIVREUR */}
              <motion.div
                whileHover={{ y: -4, scale: 1.015 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  setSelectedRole('courier');
                  setStep('courier_step1');
                }}
                className="ice-glass-card rounded-[26px] p-4 cursor-pointer relative overflow-hidden sheen-effect group border border-white/90 shadow-[0_10px_30px_rgba(6,78,43,0.06)] hover:border-orange-400/30 transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-[#E86315] to-[#FF7824] flex items-center justify-center text-white shadow-md shadow-orange-950/20 shrink-0 border border-orange-300/30">
                    <Bike className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#FF7824]">
                        🛵 LIVREUR
                      </span>
                      <span className="text-[10px] font-bold text-gray-400 group-hover:text-[#FF7824] transition-colors">
                        Rejoindre ➔
                      </span>
                    </div>
                    <h3 className="font-black text-sm text-[#081A10] mt-0.5">
                      Je suis un livreur
                    </h3>
                    <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5">
                      Recevez des missions et gérez vos livraisons.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Card 3: CLIENT */}
              <motion.div
                whileHover={{ y: -4, scale: 1.015 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  setSelectedRole('client');
                  setStep('client_step');
                }}
                className="ice-glass-card rounded-[26px] p-4 cursor-pointer relative overflow-hidden sheen-effect group border border-white/90 shadow-[0_10px_30px_rgba(6,78,43,0.06)] hover:border-emerald-400/30 transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-[#0A6E3B] to-[#10B981] flex items-center justify-center text-white shadow-md shadow-emerald-950/20 shrink-0 border border-white/20">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#0A6E3B]">
                        👤 CLIENT
                      </span>
                      <span className="text-[10px] font-bold text-gray-400 group-hover:text-[#0A6E3B] transition-colors">
                        Découvrir ➔
                      </span>
                    </div>
                    <h3 className="font-black text-sm text-[#081A10] mt-0.5">
                      Je suis un client
                    </h3>
                    <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5">
                      Découvrez des restaurants, commandez et profitez de votre expérience.
                    </p>
                  </div>
                </div>
              </motion.div>

            </div>

            {/* Subtle bottom note */}
            <div className="text-center text-[10px] text-gray-400 font-medium">
              Plateforme 100% sécurisée • Dakar & Teranga Connectée
            </div>
          </motion.div>
        )}

        {/* =========================================================================
            5. INSCRIPTION RESTAURANT (3 ÉTAPES CLAIRES & ÉLÉGANTES)
           ========================================================================= */}
        {step === 'resto_step1' && (
          <motion.div
            key="resto_step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full flex flex-col justify-between p-4 overflow-y-auto no-scrollbar z-20 space-y-3"
          >
            <div className="space-y-3">
              {/* Stepper Header */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setStep('choose_role')}
                  className="p-2 rounded-xl bg-white/80 border border-white/90 text-gray-600 text-xs font-bold flex items-center gap-1 shadow-2xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Retour</span>
                </button>
                <div className="text-[10px] font-black text-[#0A6E3B] bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-300/30">
                  Étape 1 sur 3 — Informations
                </div>
              </div>

              <div>
                <h3 className="text-base font-black text-[#081A10]">Parlons de votre restaurant</h3>
                <p className="text-[11px] text-gray-500">Ces éléments apparaîtront sur votre vitrine publique.</p>
              </div>

              {/* Logo Selection / Upload */}
              <div className="ice-glass-card p-3 rounded-2xl border border-white/90 space-y-2">
                <label className="text-[11px] font-black text-[#081A10] block">Logo officiel du restaurant</label>
                
                <div className="flex items-center gap-3">
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-white border-2 border-[#0A6E3B]/30 shadow-md shrink-0 group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={restoLogo} alt="Logo preview" className="w-full h-full object-cover" />
                    <label className="absolute inset-0 bg-black/50 text-white text-[9px] font-bold flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Camera className="w-4 h-4" />
                      <span>Changer</span>
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    </label>
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <label className="px-3 py-1.5 rounded-xl brand-gradient text-white text-[11px] font-black shadow-xs inline-flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all">
                      <Upload className="w-3 h-3" />
                      <span>Importer une image</span>
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    </label>
                    <p className="text-[9px] text-gray-400">PNG ou JPG recommandé (max 5 Mo)</p>
                  </div>
                </div>

                {/* Preset quick picker */}
                <div className="pt-1">
                  <span className="text-[9px] text-gray-400 font-bold block mb-1">Ou choisir parmi nos logos modèles :</span>
                  <div className="flex gap-2">
                    {PRESET_LOGOS.map((logoUrl, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setRestoLogo(logoUrl)}
                        className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition-all ${
                          restoLogo === logoUrl ? 'border-[#0A6E3B] scale-105 shadow-md' : 'border-gray-200 opacity-60'
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={logoUrl} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Restaurant Name Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-black text-[#081A10]">Nom du restaurant *</label>
                <input
                  type="text"
                  placeholder="Ex: Le Jardin d'Almadies, Chez Fatou..."
                  value={restoName}
                  onChange={(e) => setRestoName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/85 backdrop-blur-md border border-white/90 rounded-2xl text-xs font-bold text-[#081A10] placeholder-gray-400 focus:bg-white focus:border-[#0A6E3B] focus:ring-2 focus:ring-[#0A6E3B]/20 focus:outline-hidden transition-all shadow-inner"
                />
              </div>

              {/* Restaurant Type Grid */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-[#081A10]">Type / Spécialité culinaire *</label>
                <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto no-scrollbar pr-1">
                  {RESTO_TYPES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setRestoType(t.id)}
                      className={`p-2 rounded-xl text-[10px] font-bold text-left transition-all border ${
                        restoType === t.id
                          ? 'brand-gradient text-white border-emerald-400/40 shadow-xs'
                          : 'bg-white/70 border-white/90 text-gray-700 hover:bg-white'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Next Button */}
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                if (!restoName.trim()) {
                  alert('Veuillez renseigner le nom de votre restaurant');
                  return;
                }
                setStep('resto_step2');
              }}
              className="w-full py-3 rounded-2xl brand-gradient text-white font-black text-xs shadow-lg shadow-emerald-950/20 border border-emerald-400/30 flex items-center justify-center gap-1.5"
            >
              <span>Continuer vers la Localisation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          </motion.div>
        )}

        {/* RESTO STEP 2: LOCALISATION AVEC CARTE POSTGIS */}
        {step === 'resto_step2' && (
          <motion.div
            key="resto_step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full flex flex-col justify-between p-4 overflow-y-auto no-scrollbar z-20 space-y-3"
          >
            <div className="space-y-3">
              {/* Stepper Header */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setStep('resto_step1')}
                  className="p-2 rounded-xl bg-white/80 border border-white/90 text-gray-600 text-xs font-bold flex items-center gap-1 shadow-2xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Retour</span>
                </button>
                <div className="text-[10px] font-black text-[#0A6E3B] bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-300/30">
                  Étape 2 sur 3 — Localisation PostGIS
                </div>
              </div>

              <div>
                <h3 className="text-base font-black text-[#081A10]">Où se trouve votre restaurant ?</h3>
                <p className="text-[11px] text-gray-500">Position géographique fixe enregistrée dans Thiob Express.</p>
              </div>

              {/* MiniLocationPicker Interactive Component */}
              <div className="space-y-2">
                <MiniLocationPicker
                  initialCoords={restoGpsCoords || undefined}
                  initialAddress={restoLocation}
                  title={restoName || 'Mon Restaurant Dakar'}
                  badgeLabel="Position Fixe Restaurant"
                  onLocationSelected={(geo) => {
                    setRestoGpsCoords({ lat: geo.lat, lng: geo.lng });
                    setRestoLocation(geo.address);
                    setRestoLocSuccess(true);
                  }}
                />
              </div>

            </div>

            {/* Next Button */}
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => setStep('resto_step3')}
              className="w-full py-3 rounded-2xl brand-gradient text-white font-black text-xs shadow-lg shadow-emerald-950/20 border border-emerald-400/30 flex items-center justify-center gap-1.5"
            >
              <span>Vérifier & Finaliser</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          </motion.div>
        )}


        {/* RESTO STEP 3: FINALISATION */}
        {step === 'resto_step3' && (
          <motion.div
            key="resto_step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full flex flex-col justify-between p-4 overflow-y-auto no-scrollbar z-20 space-y-3"
          >
            <div className="space-y-3">
              {/* Stepper Header */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setStep('resto_step2')}
                  className="p-2 rounded-xl bg-white/80 border border-white/90 text-gray-600 text-xs font-bold flex items-center gap-1 shadow-2xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Retour</span>
                </button>
                <div className="text-[10px] font-black text-[#0A6E3B] bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-300/30">
                  Étape 3 sur 3 — Confirmation
                </div>
              </div>

              <div>
                <h3 className="text-base font-black text-[#081A10]">Votre Profil Restaurant</h3>
                <p className="text-[11px] text-gray-500">Vérifiez vos informations avant d'accéder à votre espace.</p>
              </div>

              {/* Summary Card */}
              <div className="ice-glass-card p-4 rounded-3xl border border-white/90 space-y-3 shadow-md">
                <div className="flex items-center gap-3.5 border-b border-gray-100 pb-3">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-[#0A6E3B] shadow-md shrink-0 bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={restoLogo} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-[#081A10]">{restoName || 'Mon Restaurant Dakar'}</h4>
                    <span className="text-[10px] font-black text-[#0A6E3B] bg-emerald-100/80 px-2 py-0.5 rounded-md mt-0.5 inline-block">
                      {RESTO_TYPES.find(t => t.id === restoType)?.label.split(' ')[1] || 'Gastronomie'}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-gray-600">
                    <span className="text-[10px] text-gray-400 font-bold">Localisation</span>
                    <span className="font-black text-[#081A10] text-[11px]">{restoLocation}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-600">
                    <span className="text-[10px] text-gray-400 font-bold">Outils Inclus</span>
                    <span className="font-black text-[#0A6E3B] text-[11px]">Vitrine Publique + KDS</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#E6F5EC] border border-[#0A6E3B]/20 text-[10px] text-[#064E2B] font-semibold space-y-1">
                <div className="flex items-center gap-1 font-black">
                  <Sparkles className="w-3.5 h-3.5 text-[#FF7824]" />
                  <span>Votre Vitrine Web est prête !</span>
                </div>
                <p>Vous pourrez immédiatement modifier vos photos de couverture, vos plats et vos tables depuis le dashboard.</p>
              </div>

            </div>

            {/* Final Action Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => finishOnboarding('restaurant')}
              className="w-full py-3.5 rounded-2xl brand-gradient text-white font-black text-xs shadow-xl shadow-emerald-950/30 border border-emerald-400/40 sheen-effect flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Créer mon compte restaurant</span>
            </motion.button>
          </motion.div>
        )}

        {/* =========================================================================
            6. INSCRIPTION LIVREUR (4 ÉTAPES FLUIDES & PROFESSIONNELLES)
           ========================================================================= */}
        {step === 'courier_step1' && (
          <motion.div
            key="courier_step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full flex flex-col justify-between p-4 overflow-y-auto no-scrollbar z-20 space-y-3"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setStep('choose_role')}
                  className="p-2 rounded-xl bg-white/80 border border-white/90 text-gray-600 text-xs font-bold flex items-center gap-1 shadow-2xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Retour</span>
                </button>
                <div className="text-[10px] font-black text-[#FF7824] bg-orange-100/80 px-2.5 py-0.5 rounded-full border border-orange-300/30">
                  Étape 1 sur 4 — Identité
                </div>
              </div>

              <div>
                <h3 className="text-base font-black text-[#081A10]">Votre Identité</h3>
                <p className="text-[11px] text-gray-500">Renseignez vos coordonnées pour recevoir des courses à Dakar.</p>
              </div>

              {/* Photo */}
              <div className="ice-glass-card p-3 rounded-2xl border border-white/90 flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white border border-gray-200 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={courierPhoto} alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <span className="text-[11px] font-black text-[#081A10] block">Photo de profil</span>
                  <p className="text-[9px] text-gray-400">Visage net pour la sécurité des clients</p>
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-[11px] font-black text-[#081A10]">Nom complet *</label>
                <input
                  type="text"
                  placeholder="Ex: Amadou Diallo"
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/85 border border-white/90 rounded-2xl text-xs font-bold text-[#081A10] placeholder-gray-400 focus:outline-hidden focus:border-[#FF7824] shadow-inner"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-[11px] font-black text-[#081A10]">Numéro de téléphone (Orange / Wave) *</label>
                <input
                  type="tel"
                  placeholder="+221 77 000 00 00"
                  value={courierPhone}
                  onChange={(e) => setCourierPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/85 border border-white/90 rounded-2xl text-xs font-bold text-[#081A10] placeholder-gray-400 focus:outline-hidden focus:border-[#FF7824] shadow-inner"
                />
              </div>

            </div>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                if (!courierName.trim()) {
                  alert('Veuillez renseigner votre nom complet');
                  return;
                }
                setStep('courier_step2');
              }}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#E86315] to-[#FF7824] text-white font-black text-xs shadow-lg shadow-orange-950/20 border border-orange-300/30 flex items-center justify-center gap-1.5"
            >
              <span>Continuer vers le Véhicule</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          </motion.div>
        )}

        {/* COURIER STEP 2: VÉHICULE */}
        {step === 'courier_step2' && (
          <motion.div
            key="courier_step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full flex flex-col justify-between p-4 overflow-y-auto no-scrollbar z-20 space-y-3"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setStep('courier_step1')}
                  className="p-2 rounded-xl bg-white/80 border border-white/90 text-gray-600 text-xs font-bold flex items-center gap-1 shadow-2xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Retour</span>
                </button>
                <div className="text-[10px] font-black text-[#FF7824] bg-orange-100/80 px-2.5 py-0.5 rounded-full border border-orange-300/30">
                  Étape 2 sur 4 — Véhicule
                </div>
              </div>

              <div>
                <h3 className="text-base font-black text-[#081A10]">Votre moyen de livraison</h3>
                <p className="text-[11px] text-gray-500">Avec quel véhicule effectuez-vous vos livraisons ?</p>
              </div>

              {/* Vehicle selector */}
              <div className="grid grid-cols-2 gap-2">
                {VEHICLE_OPTIONS.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setCourierVehicle(v.id)}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      courierVehicle === v.id
                        ? 'bg-gradient-to-r from-[#E86315] to-[#FF7824] text-white border-orange-400 shadow-md scale-102'
                        : 'bg-white/80 border-white/90 text-gray-700 hover:bg-white'
                    }`}
                  >
                    <span className="text-xl block mb-1">{v.label.split(' ')[0]}</span>
                    <span className="text-xs font-black block">{v.name}</span>
                  </button>
                ))}
              </div>

              {/* Plate / License Input */}
              <div className="space-y-1 pt-1">
                <label className="text-[11px] font-black text-[#081A10]">
                  {courierVehicle === 'velo' ? 'Numéro de cadre ou identifiant vélo' : "Numéro d'immatriculation / Numéro de moto *"}
                </label>
                <input
                  type="text"
                  placeholder="Ex: DK-9241-BA"
                  value={courierPlate}
                  onChange={(e) => setCourierPlate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/85 border border-white/90 rounded-2xl text-xs font-bold text-[#081A10] uppercase placeholder-gray-400 focus:outline-hidden focus:border-[#FF7824] shadow-inner"
                />
              </div>

            </div>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => setStep('courier_step3')}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#E86315] to-[#FF7824] text-white font-black text-xs shadow-lg shadow-orange-950/20 border border-orange-300/30 flex items-center justify-center gap-1.5"
            >
              <span>Continuer vers la Localisation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          </motion.div>
        )}

        {/* COURIER STEP 3: LOCALISATION */}
        {step === 'courier_step3' && (
          <motion.div
            key="courier_step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full flex flex-col justify-between p-4 overflow-y-auto no-scrollbar z-20 space-y-3"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setStep('courier_step2')}
                  className="p-2 rounded-xl bg-white/80 border border-white/90 text-gray-600 text-xs font-bold flex items-center gap-1 shadow-2xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Retour</span>
                </button>
                <div className="text-[10px] font-black text-[#FF7824] bg-orange-100/80 px-2.5 py-0.5 rounded-full border border-orange-300/30">
                  Étape 3 sur 4 — Localisation
                </div>
              </div>

              <div>
                <h3 className="text-base font-black text-[#081A10]">Où êtes-vous actuellement ?</h3>
                <p className="text-[11px] text-gray-500">Pour recevoir les commandes disponibles les plus proches.</p>
              </div>

              {/* GPS Geolocation Main Action Button */}
              <div className="ice-glass-card p-4 rounded-3xl border border-white/90 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#E86315] to-[#FF7824] text-white flex items-center justify-center mx-auto shadow-md">
                  <Navigation className="w-6 h-6 animate-pulse" />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleGeoLocate('courier')}
                  disabled={isLocatingCourier}
                  className={`w-full py-2.5 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
                    courierLocSuccess 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-gradient-to-r from-[#E86315] to-[#FF7824] text-white'
                  }`}
                >
                  {isLocatingCourier ? (
                    <>
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Détection GPS...</span>
                    </>
                  ) : courierLocSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <span>✓ Position Livreur Confirmée</span>
                    </>
                  ) : (
                    <>
                      <Navigation className="w-3.5 h-3.5" />
                      <span>📍 Partager ma localisation</span>
                    </>
                  )}
                </motion.button>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-black text-[#081A10]">Quartier de départ</label>
                <input
                  type="text"
                  value={courierLocation}
                  onChange={(e) => setCourierLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/85 border border-white/90 rounded-2xl text-xs font-bold text-[#081A10] shadow-inner"
                />
              </div>

            </div>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => setStep('courier_step4')}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#E86315] to-[#FF7824] text-white font-black text-xs shadow-lg shadow-orange-950/20 border border-orange-300/30 flex items-center justify-center gap-1.5"
            >
              <span>Vérifier & Finaliser</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          </motion.div>
        )}

        {/* COURIER STEP 4: FINALISATION */}
        {step === 'courier_step4' && (
          <motion.div
            key="courier_step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full flex flex-col justify-between p-4 overflow-y-auto no-scrollbar z-20 space-y-3"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setStep('courier_step3')}
                  className="p-2 rounded-xl bg-white/80 border border-white/90 text-gray-600 text-xs font-bold flex items-center gap-1 shadow-2xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Retour</span>
                </button>
                <div className="text-[10px] font-black text-[#FF7824] bg-orange-100/80 px-2.5 py-0.5 rounded-full border border-orange-300/30">
                  Étape 4 sur 4 — Validation
                </div>
              </div>

              <div>
                <h3 className="text-base font-black text-[#081A10]">Profil Livreur Tiak-Tiak</h3>
                <p className="text-[11px] text-gray-500">Prêt à livrer les délices de Dakar !</p>
              </div>

              {/* Summary */}
              <div className="ice-glass-card p-4 rounded-3xl border border-white/90 space-y-3 shadow-md">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden border border-gray-200 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={courierPhoto} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-[#081A10]">{courierName || 'Livreur Thiob'}</h4>
                    <p className="text-[10px] text-gray-400">{courierPhone} • {courierLocation}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-[#F4F7F4] p-2 rounded-xl">
                    <span className="text-[9px] text-gray-400 block font-bold">Véhicule</span>
                    <span className="font-black text-[#081A10]">{VEHICLE_OPTIONS.find(v => v.id === courierVehicle)?.label}</span>
                  </div>
                  <div className="bg-[#F4F7F4] p-2 rounded-xl">
                    <span className="text-[9px] text-gray-400 block font-bold">Immatriculation</span>
                    <span className="font-black text-[#FF7824]">{courierPlate}</span>
                  </div>
                </div>
              </div>

            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => finishOnboarding('courier')}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#E86315] to-[#FF7824] text-white font-black text-xs shadow-xl shadow-orange-950/30 border border-orange-300/40 sheen-effect flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>Devenir livreur</span>
            </motion.button>
          </motion.div>
        )}

        {/* =========================================================================
            7. INSCRIPTION CLIENT (ULTRA SIMPLE, RAPIDE & ÉLÉGANTE)
           ========================================================================= */}
        {step === 'client_step' && (
          <motion.div
            key="client_step"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full flex flex-col justify-between p-4 overflow-y-auto no-scrollbar z-20 space-y-3"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setStep('choose_role')}
                  className="p-2 rounded-xl bg-white/80 border border-white/90 text-gray-600 text-xs font-bold flex items-center gap-1 shadow-2xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Retour</span>
                </button>
                <div className="text-[10px] font-black text-[#0A6E3B] bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-300/30">
                  Inscription Client Rapide
                </div>
              </div>

              <div>
                <h3 className="text-lg font-black text-[#081A10]">Bienvenue 👋</h3>
                <p className="text-xs text-gray-500">Créons votre profil en 20 secondes.</p>
              </div>

              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-black text-[#081A10]">Comment devons-nous vous appeler ? *</label>
                <input
                  type="text"
                  placeholder="Votre prénom et nom"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/85 border border-white/90 rounded-2xl text-xs font-bold text-[#081A10] placeholder-gray-400 focus:bg-white focus:border-[#0A6E3B] focus:outline-hidden shadow-inner"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-xs font-black text-[#081A10]">Votre numéro de téléphone (Wave / OM) *</label>
                <input
                  type="tel"
                  placeholder="+221 77 123 45 67"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/85 border border-white/90 rounded-2xl text-xs font-bold text-[#081A10] placeholder-gray-400 focus:bg-white focus:border-[#0A6E3B] focus:outline-hidden shadow-inner"
                />
              </div>

              {/* Geolocation */}
              <div className="ice-glass-card p-3 rounded-2xl border border-white/90 space-y-2 text-center">
                <div className="flex items-center justify-between text-left">
                  <div>
                    <span className="text-xs font-black text-[#081A10] block">Votre position de livraison</span>
                    <p className="text-[10px] text-gray-400">{clientLocation}</p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleGeoLocate('client')}
                  disabled={isLocatingClient}
                  className={`w-full py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all ${
                    clientLocSuccess
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-[#E6F5EC] text-[#0A6E3B] border border-[#0A6E3B]/20 hover:bg-[#d8eedf]'
                  }`}
                >
                  {isLocatingClient ? (
                    <>
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-[#0A6E3B] border-t-transparent animate-spin" />
                      <span>GPS en cours...</span>
                    </>
                  ) : clientLocSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>✓ Localisation Confirmée</span>
                    </>
                  ) : (
                    <>
                      <Navigation className="w-3.5 h-3.5" />
                      <span>📍 Partager ma localisation</span>
                    </>
                  )}
                </motion.button>
              </div>

            </div>

            {/* Final Action Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (!clientName.trim()) {
                  alert('Veuillez renseigner votre prénom et nom');
                  return;
                }
                finishOnboarding('client');
              }}
              className="w-full py-3.5 rounded-2xl brand-gradient text-white font-black text-xs shadow-xl shadow-emerald-950/30 border border-emerald-400/40 sheen-effect flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span>Commencer l'aventure</span>
            </motion.button>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
