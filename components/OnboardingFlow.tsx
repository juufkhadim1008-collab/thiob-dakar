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
  Clock,
  Star,
  Flame,
  ShoppingBag,
  Utensils,
  ChevronRight,
  Heart,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import MiniLocationPicker from '@/components/map/MiniLocationPicker';

interface OnboardingFlowProps {
  onComplete: (role: UserRole) => void;
}

type OnboardingStep = 
  | 'splash'
  | 'welcome'
  | 'login'
  | 'register'
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

const PRESET_COVERS = [
  'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=80',
];

const VEHICLE_OPTIONS = [
  { id: 'moto', label: '🛵 Moto', name: 'Moto standard' },
  { id: 'scooter', label: '🛴 Scooter', name: 'Scooter 125cc' },
  { id: 'voiture', label: '🚗 Voiture', name: 'Véhicule urbain' },
  { id: 'velo', label: '🚲 Vélo', name: 'Vélo de coursier' },
];

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const {
    setCurrentRole,
    registerNewRestaurant,
    registerCourier,
    setClientProfile,
    loginWithOAuth,
    signUpWithEmail,
    signInWithEmail,
    setCurrentRestaurantId,
  } = useApp();

  const [step, setStep] = useState<OnboardingStep>('splash');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>('client');
  const [isOAuthLoading, setIsOAuthLoading] = useState<'google' | 'facebook' | null>(null);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // --- Auth Form State (Matching Foodie Mockup) ---
  const [authEmailOrPhone, setAuthEmailOrPhone] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authFullName, setAuthFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authSelectedRole, setAuthSelectedRole] = useState<UserRole>('client');

  // --- Restaurant Registration State ---
  const [restoName, setRestoName] = useState('');
  const [restoPhone, setRestoPhone] = useState('+221 77 123 45 67');
  const [restoEmail, setRestoEmail] = useState('');
  const [restoType, setRestoType] = useState('traditionnel');
  const [restoLogo, setRestoLogo] = useState(PRESET_LOGOS[0]);
  const [restoCustomLogo, setRestoCustomLogo] = useState<string | null>(null);
  const [restoCoverImage, setRestoCoverImage] = useState(PRESET_COVERS[0]);
  const [restoLocation, setRestoLocation] = useState('Almadies, Dakar');
  const [restoNeighborhood, setRestoNeighborhood] = useState('Almadies');
  const [restoGpsCoords, setRestoGpsCoords] = useState<{ lat: number; lng: number } | null>(null);

  const [isLocatingResto, setIsLocatingResto] = useState(false);
  const [restoLocSuccess, setRestoLocSuccess] = useState(false);

  // --- Courier Registration State ---
  const [courierFirstName, setCourierFirstName] = useState('');
  const [courierLastName, setCourierLastName] = useState('');
  const [courierEmail, setCourierEmail] = useState('');
  const [courierPhone, setCourierPhone] = useState('+221 77 ');
  const [courierPhoto, setCourierPhoto] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80');
  const [courierVehicle, setCourierVehicle] = useState('moto');
  const [courierPlate, setCourierPlate] = useState('DK-7842-AB');
  const [courierLocation, setCourierLocation] = useState('Plateau, Dakar');
  const [courierGpsCoords, setCourierGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocatingCourier, setIsLocatingCourier] = useState(false);
  const [courierLocSuccess, setCourierLocSuccess] = useState(false);

  // --- Client Registration State ---
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('+221 77 ');
  const [clientLocation, setClientLocation] = useState('Dakar, Sénégal');
  const [clientNeighborhood, setClientNeighborhood] = useState('Plateau');
  const [clientGpsCoords, setClientGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocatingClient, setIsLocatingClient] = useState(false);
  const [clientLocSuccess, setClientLocSuccess] = useState(false);

  // Auto transition from splash to welcome screen after 1.8s
  useEffect(() => {
    if (step === 'splash') {
      const timer = setTimeout(() => {
        setStep('welcome');
      }, 1800);
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

  // Handle Cover Upload from Device
  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setRestoCoverImage(event.target.result as string);
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
              setCourierGpsCoords({ lat, lng });
              setCourierLocation('Plateau / Médina, Dakar (GPS Détecté)');
              setIsLocatingCourier(false);
              setCourierLocSuccess(true);
            } else {
              setClientGpsCoords({ lat, lng });
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
              setCourierGpsCoords({ lat: 14.693, lng: -17.444 });
              setCourierLocation('Plateau Centre-Ville, Dakar');
              setIsLocatingCourier(false);
              setCourierLocSuccess(true);
            } else {
              setClientGpsCoords({ lat: 14.752, lng: -17.515 });
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

  const finishOnboarding = async (role: UserRole) => {
    if (role === 'restaurant') {
      if (!restoEmail.trim() || !authPassword || authPassword.length < 6) {
        alert('Veuillez renseigner un email et un mot de passe (6 caractères minimum) pour créer votre compte.');
        return;
      }
      setIsSubmittingAuth(true);
      const auth = await signUpWithEmail(restoEmail.trim(), authPassword, restoName.trim() || 'Mon Restaurant Dakar');
      setIsSubmittingAuth(false);
      if (!auth.success) {
        alert(`Impossible de créer votre compte : ${auth.error || 'veuillez réessayer.'}`);
        return;
      }
      triggerCelebration();
      registerNewRestaurant({
        name: restoName.trim() || 'Mon Restaurant Dakar',
        logo: restoLogo,
        type: RESTO_TYPES.find(t => t.id === restoType)?.label.split(' ')[1] || 'Cuisine Dakaroise',
        address: restoLocation,
        neighborhood: restoNeighborhood || 'Almadies',
        phone: restoPhone || '+221 77 123 45 67',
        coordinates: restoGpsCoords || undefined,
        coverImage: restoCoverImage || restoCustomLogo || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
        userId: auth.userId,
      });
      setCurrentRole('restaurant');
    } else if (role === 'courier') {
      if (!courierEmail.trim() || !authPassword || authPassword.length < 6) {
        alert('Veuillez renseigner un email et un mot de passe (6 caractères minimum) pour créer votre compte.');
        return;
      }
      setIsSubmittingAuth(true);
      const auth = await signUpWithEmail(courierEmail.trim(), authPassword, `${courierFirstName.trim()} ${courierLastName.trim()}`.trim());
      setIsSubmittingAuth(false);
      if (!auth.success) {
        alert(`Impossible de créer votre compte : ${auth.error || 'veuillez réessayer.'}`);
        return;
      }
      triggerCelebration();
      registerCourier({
        firstName: courierFirstName.trim() || 'Amadou',
        lastName: courierLastName.trim() || 'Diallo',
        phone: courierPhone || '+221 77 000 00 00',
        photo: courierPhoto,
        vehicle: courierVehicle,
        plateNumber: courierPlate,
        coordinates: courierGpsCoords || undefined,
        userId: auth.userId,
      });
      setCurrentRole('courier');
    } else {
      // Client : compte optionnel — email fourni = vrai compte Supabase, sinon mode invité local
      if (clientEmail.trim() && authPassword) {
        if (authPassword.length < 6) {
          alert('Le mot de passe doit contenir au moins 6 caractères.');
          return;
        }
        setIsSubmittingAuth(true);
        const auth = await signUpWithEmail(clientEmail.trim(), authPassword, clientName.trim() || 'Client Thiob');
        setIsSubmittingAuth(false);
        if (!auth.success) {
          alert(`Impossible de créer votre compte : ${auth.error || 'veuillez réessayer.'}`);
          return;
        }
      }
      triggerCelebration();
      setClientProfile(
        clientName.trim() || 'Client Thiob',
        clientPhone || '+221 77 123 45 67',
        clientLocation,
        clientNeighborhood,
        clientGpsCoords || undefined
      );
      setCurrentRole('client');
    }
    onComplete(role);
  };

  // Connexion réelle : vérifie les identifiants et retrouve le restaurant / livreur du compte
  const handleLoginSubmit = async () => {
    setLoginError(null);
    if (!authEmailOrPhone.trim() || !authPassword) {
      setLoginError('Veuillez renseigner votre email et votre mot de passe.');
      return;
    }
    setIsSubmittingAuth(true);
    const res = await signInWithEmail(authEmailOrPhone.trim(), authPassword);
    setIsSubmittingAuth(false);

    if (!res.success) {
      setLoginError(res.error || 'Connexion impossible.');
      return;
    }

    triggerCelebration();

    if (selectedRole === 'restaurant') {
      if (!res.restaurant) {
        setLoginError('Aucun restaurant n’est associé à ce compte. Créez-en un si c’est votre première connexion.');
        return;
      }
      setCurrentRestaurantId(res.restaurant.id);
      setCurrentRole('restaurant');
      onComplete('restaurant');
    } else if (selectedRole === 'courier') {
      if (!res.courier) {
        setLoginError('Aucun profil livreur n’est associé à ce compte. Créez-en un si c’est votre première connexion.');
        return;
      }
      setCurrentRole('courier');
      onComplete('courier');
    } else {
      setCurrentRole('client');
      onComplete('client');
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'facebook') => {
    setIsOAuthLoading(provider);
    try {
      localStorage.setItem('thiob_oauth_intended_role', selectedRole || 'client');
    } catch {}
    const res = await loginWithOAuth(provider);
    if (!res.success) {
      alert(`Erreur connexion ${provider}: ${res.error || 'Veuillez réessayer'}`);
      setIsOAuthLoading(null);
    }
  };


  return (
    <div className="h-full flex flex-col bg-white relative overflow-hidden font-sans select-none text-[#081A10]">
      <AnimatePresence mode="wait">
        
        {/* =========================================================================
            1. ÉCRAN DE LANCEMENT / SPLASH SCREEN (FOND BLANC PUR & LOGO CENTRÉ)
           ========================================================================= */}
        {step === 'splash' && (
          <motion.div
            key="splash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.45 }}
            className="h-full w-full flex flex-col items-center justify-center p-6 text-center z-20 bg-white"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center"
            >
              {/* App Logo Icon with subtle soft shadow */}
              <div className="w-28 h-28 rounded-3xl p-1.5 bg-white border border-gray-100 shadow-[0_15px_35px_rgba(255,120,36,0.15)] flex items-center justify-center mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/Icone app.png"
                  alt="Thiob Dakar"
                  className="w-full h-full rounded-[22px] object-cover"
                />
              </div>

              {/* Brand Typography */}
              <h1 className="text-2xl font-black tracking-tight text-[#081A10]">
                Thiob<span className="text-[#FF7824]">.Dakar</span>
              </h1>
              <div className="w-12 h-1 bg-[#FF7824] rounded-full mt-1.5 opacity-80" />
            </motion.div>
          </motion.div>
        )}

        {/* =========================================================================
            2. ÉCRAN D'ACCUEIL / WELCOME (FOND BLANC, 3 TYPES DE COMPTES BIEN VISIBLES)
           ========================================================================= */}
        {step === 'welcome' && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35 }}
            className="h-full w-full flex flex-col justify-between p-5 overflow-y-auto no-scrollbar z-20 bg-white space-y-4"
          >
            {/* Top Branding */}
            <div className="flex flex-col items-center text-center pt-1">
              <div className="w-16 h-16 rounded-2xl p-1 bg-white border border-gray-100 shadow-[0_8px_20px_rgba(255,120,36,0.12)] flex items-center justify-center mb-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/Icone app.png"
                  alt="Thiob Dakar"
                  className="w-full h-full rounded-[14px] object-cover"
                />
              </div>

              <h2 className="text-lg font-black text-[#081A10] leading-tight">
                Bienvenue sur Thiob<span className="text-[#FF7824]"> Express</span> ! 👋
              </h2>
              <p className="text-[11px] text-gray-500 font-medium max-w-[280px] mt-0.5">
                Choisissez votre type de compte pour commencer l'expérience.
              </p>
            </div>

            {/* LES 3 TYPES DE COMPTES BIEN VISIBLES */}
            <div className="space-y-2.5 flex-1 flex flex-col justify-center">
              
              {/* 1. Compte Restaurant */}
              <motion.div
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedRole('restaurant')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                  selectedRole === 'restaurant'
                    ? 'border-[#0A6E3B] bg-emerald-50/60 ring-2 ring-[#0A6E3B]/20 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl brand-gradient flex items-center justify-center text-white shrink-0 shadow-sm border border-emerald-400/30">
                    <Store className="w-6 h-6 text-emerald-200" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-wider text-[#0A6E3B]">
                        🍽️ Compte Restaurant
                      </span>
                      {selectedRole === 'restaurant' && (
                        <CheckCircle2 className="w-4 h-4 text-[#0A6E3B]" />
                      )}
                    </div>
                    <h3 className="font-black text-xs text-[#081A10]">Je suis un Restaurant / Dibiterie</h3>
                    <p className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">
                      Vitrine digitale, gestion des menus, commandes & tables.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* 2. Compte Livreur */}
              <motion.div
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedRole('courier')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                  selectedRole === 'courier'
                    ? 'border-[#FF7824] bg-orange-50/60 ring-2 ring-[#FF7824]/20 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#E86315] to-[#FF7824] flex items-center justify-center text-white shrink-0 shadow-sm border border-orange-300/30">
                    <Bike className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-wider text-[#FF7824]">
                        🛵 Compte Livreur
                      </span>
                      {selectedRole === 'courier' && (
                        <CheckCircle2 className="w-4 h-4 text-[#FF7824]" />
                      )}
                    </div>
                    <h3 className="font-black text-xs text-[#081A10]">Je suis un Livreur Partenaire</h3>
                    <p className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">
                      Recevez des courses Tiak-Tiak et livrez partout à Dakar.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* 3. Compte Client */}
              <motion.div
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedRole('client')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                  selectedRole === 'client'
                    ? 'border-[#0A6E3B] bg-emerald-50/60 ring-2 ring-[#0A6E3B]/20 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#0A6E3B] to-[#10B981] flex items-center justify-center text-white shrink-0 shadow-sm">
                    <User className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-wider text-[#0A6E3B]">
                        👤 Compte Client
                      </span>
                      {selectedRole === 'client' && (
                        <CheckCircle2 className="w-4 h-4 text-[#0A6E3B]" />
                      )}
                    </div>
                    <h3 className="font-black text-xs text-[#081A10]">Je suis un Gourmand / Client</h3>
                    <p className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">
                      Commandez des repas, découvrez les meilleurs restos de Dakar.
                    </p>
                  </div>
                </div>
              </motion.div>

            </div>

            {/* Bottom Actions & Buttons */}
            <div className="w-full space-y-3 pt-1">
              
              {/* Create Account & Login Buttons */}
              <div className="space-y-2">
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    if (selectedRole === 'restaurant') {
                      setStep('resto_step1');
                    } else if (selectedRole === 'courier') {
                      setStep('courier_step1');
                    } else {
                      setStep('client_step');
                    }
                  }}
                  className="w-full py-3.5 rounded-2xl bg-[#FF7824] hover:bg-[#E86315] text-white font-black text-xs shadow-lg shadow-orange-500/20 active:scale-95 transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Créer mon compte ({selectedRole === 'restaurant' ? 'Restaurant' : selectedRole === 'courier' ? 'Livreur' : 'Client'})</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setStep('login')}
                  className="w-full py-3 rounded-2xl bg-[#FFF4ED] hover:bg-[#FFE8DA] text-[#FF7824] border border-[#FF7824]/20 font-bold text-xs active:scale-95 transition-all text-center cursor-pointer"
                >
                  Déjà un compte ? Se connecter
                </motion.button>
              </div>

              {/* OR Sign Up With Separator */}
              <div className="flex items-center">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="px-3 text-[9px] font-bold text-gray-400 tracking-wider">
                  OU CONTINUER AVEC
                </span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              {/* Social Login Buttons (Google, Facebook) */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* Google */}
                <button
                  onClick={() => handleOAuthLogin('google')}
                  disabled={isOAuthLoading !== null}
                  className="py-2.5 px-3 rounded-2xl border border-gray-200 bg-[#FAFAFA] hover:bg-gray-100 flex items-center justify-center gap-2 text-xs font-bold text-gray-700 shadow-2xs active:scale-95 transition-all cursor-pointer disabled:opacity-60"
                >
                  {isOAuthLoading === 'google' ? (
                    <span className="w-4 h-4 rounded-full border-2 border-gray-400 border-t-transparent animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                  )}
                  <span>Google</span>
                </button>

                {/* Facebook */}
                <button
                  onClick={() => handleOAuthLogin('facebook')}
                  disabled={isOAuthLoading !== null}
                  className="py-2.5 px-3 rounded-2xl bg-[#1877F2] hover:bg-[#166fe5] text-white flex items-center justify-center gap-2 text-xs font-bold shadow-2xs active:scale-95 transition-all cursor-pointer disabled:opacity-60"
                >
                  {isOAuthLoading === 'facebook' ? (
                    <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  ) : (
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  )}
                  <span>Facebook</span>
                </button>
              </div>

              {/* Guest / Direct Explorer Link */}
              <div className="pt-1 text-center">
                <button
                  onClick={() => finishOnboarding('client')}
                  className="text-[10px] font-bold text-[#0A6E3B] hover:underline"
                >
                  Explorer sans compte (Accès Invité) ➔
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* =========================================================================
            3. ÉCRAN DE CONNEXION / LOGIN (SCREEN 3 DU MOCKUP)
           ========================================================================= */}
        {step === 'login' && (
          <motion.div
            key="login"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full w-full flex flex-col justify-between p-6 overflow-y-auto no-scrollbar z-20 bg-white"
          >
            <div>
              {/* Back Arrow Header */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setStep('welcome')}
                  className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors shadow-2xs active:scale-95"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <span className="text-[10px] font-black uppercase text-[#FF7824] bg-orange-50 px-2.5 py-0.5 rounded-full">
                  Connexion
                </span>
              </div>

              {/* Centered Top Mascot Logo */}
              <div className="flex flex-col items-center text-center my-3">
                <div className="w-16 h-16 rounded-2xl p-1 bg-white border border-gray-100 shadow-sm flex items-center justify-center mb-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/Icone app.png"
                    alt="Thiob Dakar"
                    className="w-full h-full rounded-[14px] object-cover"
                  />
                </div>
                <h3 className="text-base font-black text-[#FF7824]">
                  Thiob<span className="text-[#0A6E3B]"> App</span>
                </h3>
              </div>

              {/* Login Form Fields */}
              <div className="space-y-3 mt-4">
                <div>
                  <input
                    type="text"
                    placeholder="Email ou numéro de téléphone (+221...)"
                    value={authEmailOrPhone}
                    onChange={(e) => setAuthEmailOrPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-[#FAFAFA] border border-gray-200 rounded-2xl text-xs font-semibold text-gray-800 placeholder-gray-400 focus:outline-hidden focus:border-[#FF7824] focus:bg-white transition-all shadow-inner"
                  />
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mot de passe"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-[#FAFAFA] border border-gray-200 rounded-2xl text-xs font-semibold text-gray-800 placeholder-gray-400 focus:outline-hidden focus:border-[#FF7824] focus:bg-white transition-all shadow-inner pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-[10px] font-bold"
                  >
                    {showPassword ? 'Cacher' : 'Voir'}
                  </button>
                </div>

                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => alert('Veuillez contacter le support Thiob pour réinitialiser votre mot de passe.')}
                    className="text-[10px] font-bold text-gray-400 hover:text-[#FF7824] transition-colors"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>

                {loginError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-[11px] font-bold text-rose-600">
                    {loginError}
                  </div>
                )}
              </div>

              {/* Login Button */}
              <div className="mt-4">
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={handleLoginSubmit}
                  disabled={isSubmittingAuth}
                  className="w-full py-3.5 rounded-2xl bg-[#FF7824] hover:bg-[#E86315] text-white font-bold text-xs shadow-lg shadow-orange-500/20 active:scale-95 transition-all text-center cursor-pointer disabled:opacity-60"
                >
                  {isSubmittingAuth ? 'Connexion...' : 'Se connecter'}
                </motion.button>
              </div>

              {/* Social Login Options */}
              <div className="grid grid-cols-2 gap-2 mt-5">
                <button
                  onClick={() => handleOAuthLogin('google')}
                  disabled={isOAuthLoading !== null}
                  className="py-2.5 px-3 rounded-2xl border border-gray-200 bg-[#FAFAFA] hover:bg-gray-100 flex items-center justify-center gap-2 text-xs font-bold text-gray-700 shadow-2xs active:scale-95 transition-all cursor-pointer disabled:opacity-60"
                >
                  {isOAuthLoading === 'google' ? (
                    <span className="w-4 h-4 rounded-full border-2 border-gray-400 border-t-transparent animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                  )}
                  <span>Google</span>
                </button>

                <button
                  onClick={() => handleOAuthLogin('facebook')}
                  disabled={isOAuthLoading !== null}
                  className="py-2.5 px-3 rounded-2xl bg-[#1877F2] hover:bg-[#166fe5] text-white flex items-center justify-center gap-2 text-xs font-bold shadow-2xs active:scale-95 transition-all cursor-pointer disabled:opacity-60"
                >
                  {isOAuthLoading === 'facebook' ? (
                    <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  ) : (
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  )}
                  <span>Facebook</span>
                </button>
              </div>
            </div>

            {/* Bottom Register Switch */}
            <div className="text-center pt-4 border-t border-gray-50">
              <p className="text-xs text-gray-500 font-medium">
                Vous n'avez pas encore de compte ?{' '}
                <button
                  type="button"
                  onClick={() => {
                    if (selectedRole === 'restaurant') setStep('resto_step1');
                    else if (selectedRole === 'courier') setStep('courier_step1');
                    else setStep('client_step');
                  }}
                  className="font-bold text-[#0A6E3B] hover:text-[#064E2B] transition-colors"
                >
                  Créer un compte
                </button>
              </p>
            </div>
          </motion.div>
        )}

        {/* =========================================================================
            4. INSCRIPTION RESTAURANT (INFORMATIONS DÉTAILLÉES, LOGO, COUVERTURE, GPS)
           ========================================================================= */}
        {step === 'resto_step1' && (
          <motion.div
            key="resto_step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full flex flex-col justify-between p-4 overflow-y-auto no-scrollbar z-20 space-y-3 bg-white"
          >
            <div className="space-y-3">
              {/* Stepper Header */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setStep('welcome')}
                  className="p-2 rounded-xl bg-gray-50 border border-gray-100 text-gray-600 text-xs font-bold flex items-center gap-1 shadow-2xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Retour</span>
                </button>
                <div className="text-[10px] font-black text-[#0A6E3B] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Étape 1 sur 3 — Profil Restaurant
                </div>
              </div>

              <div>
                <h3 className="text-base font-black text-[#081A10]">Informations du Restaurant</h3>
                <p className="text-[11px] text-gray-500">Renseignez les détails officiels de votre établissement.</p>
              </div>

              {/* Logo & Cover Pickers */}
              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                {/* Logo */}
                <div>
                  <label className="text-[11px] font-black text-[#081A10] block mb-1">Logo officiel du restaurant</label>
                  <div className="flex items-center gap-3">
                    <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-white border border-[#0A6E3B]/30 shadow-xs shrink-0 group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={restoLogo} alt="Logo" className="w-full h-full object-cover" />
                      <label className="absolute inset-0 bg-black/50 text-white text-[9px] font-bold flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <Camera className="w-4 h-4" />
                        <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                      </label>
                    </div>
                    <div className="flex-1 space-y-1">
                      <label className="px-3 py-1.5 rounded-xl brand-gradient text-white text-[10px] font-black shadow-xs inline-flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all">
                        <Upload className="w-3 h-3" />
                        <span>Importer logo</span>
                        <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                      </label>
                      <p className="text-[9px] text-gray-400">PNG ou JPG (carré recommandé)</p>
                    </div>
                  </div>
                </div>

                {/* Cover Image */}
                <div>
                  <label className="text-[11px] font-black text-[#081A10] block mb-1">Photo de couverture de la vitrine</label>
                  <div className="relative h-20 rounded-xl overflow-hidden border border-gray-200 group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={restoCoverImage} alt="Cover" className="w-full h-full object-cover" />
                    <label className="absolute inset-0 bg-black/40 hover:bg-black/60 text-white text-[10px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all">
                      <Camera className="w-4 h-4" />
                      <span>Changer la photo de couverture</span>
                      <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                    </label>
                  </div>
                  {/* Preset covers */}
                  <div className="flex gap-1.5 pt-1.5">
                    {PRESET_COVERS.map((cov, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setRestoCoverImage(cov)}
                        className={`h-8 flex-1 rounded-lg overflow-hidden border-2 transition-all ${
                          restoCoverImage === cov ? 'border-[#0A6E3B] scale-105 shadow-xs' : 'border-transparent opacity-60'
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={cov} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Restaurant Name */}
              <div className="space-y-1">
                <label className="text-[11px] font-black text-[#081A10]">Nom du restaurant *</label>
                <input
                  type="text"
                  placeholder="Ex: Le Jardin d'Almadies, Chez Fatou..."
                  value={restoName}
                  onChange={(e) => setRestoName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-[#081A10] placeholder-gray-400 focus:bg-white focus:border-[#0A6E3B] focus:outline-hidden transition-all shadow-inner"
                />
              </div>

              {/* Phone & Email Inputs */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-[#081A10]">Téléphone du restau *</label>
                  <input
                    type="tel"
                    placeholder="+221 77 123 45 67"
                    value={restoPhone}
                    onChange={(e) => setRestoPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-[#081A10] shadow-inner"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-[#081A10]">Email de connexion *</label>
                  <input
                    type="email"
                    placeholder="contact@resto.sn"
                    value={restoEmail}
                    onChange={(e) => setRestoEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-[#081A10] shadow-inner"
                  />
                </div>
              </div>

              {/* Mot de passe du compte (sert à se reconnecter plus tard) */}
              <div className="space-y-1">
                <label className="text-[11px] font-black text-[#081A10]">Mot de passe *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Au moins 6 caractères"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-[#081A10] shadow-inner pr-14"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-[10px] font-bold"
                  >
                    {showPassword ? 'Cacher' : 'Voir'}
                  </button>
                </div>
                <p className="text-[9px] text-gray-400">Ce mot de passe vous servira à vous reconnecter depuis n'importe quel appareil.</p>
              </div>

              {/* Restaurant Type Grid */}
              <div className="space-y-1">
                <label className="text-[11px] font-black text-[#081A10]">Type / Spécialité culinaire *</label>
                <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto no-scrollbar pr-1">
                  {RESTO_TYPES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setRestoType(t.id)}
                      className={`p-2 rounded-xl text-[10px] font-bold text-left transition-all border ${
                        restoType === t.id
                          ? 'brand-gradient text-white border-emerald-400/40 shadow-xs'
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-white'
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
                if (!restoEmail.trim() || !authPassword || authPassword.length < 6) {
                  alert('Veuillez renseigner un email et un mot de passe (6 caractères minimum) pour créer votre compte.');
                  return;
                }
                setStep('resto_step2');
              }}
              className="w-full py-3 rounded-2xl brand-gradient text-white font-black text-xs shadow-lg shadow-emerald-950/20 border border-emerald-400/30 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Continuer vers la Localisation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          </motion.div>
        )}

        {/* RESTO STEP 2: LOCALISATION AVEC CARTE POSTGIS EXISTANTE */}
        {step === 'resto_step2' && (
          <motion.div
            key="resto_step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full flex flex-col justify-between p-4 overflow-y-auto no-scrollbar z-20 space-y-3 bg-white"
          >
            <div className="space-y-3">
              {/* Stepper Header */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setStep('resto_step1')}
                  className="p-2 rounded-xl bg-gray-50 border border-gray-100 text-gray-600 text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Retour</span>
                </button>
                <div className="text-[10px] font-black text-[#0A6E3B] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Étape 2 sur 3 — Localisation PostGIS
                </div>
              </div>

              <div>
                <h3 className="text-base font-black text-[#081A10]">Où se trouve votre restaurant ?</h3>
                <p className="text-[11px] text-gray-500">Position géographique fixe enregistrée dans Thiob Express.</p>
              </div>

              {/* MiniLocationPicker Interactive Component (Exact existing geolocation system) */}
              <div className="space-y-2">
                <MiniLocationPicker
                  initialCoords={restoGpsCoords || undefined}
                  initialAddress={restoLocation}
                  title={restoName || 'Mon Restaurant Dakar'}
                  badgeLabel="Position Fixe Restaurant"
                  onLocationSelected={(geo) => {
                    setRestoGpsCoords({ lat: geo.lat, lng: geo.lng });
                    setRestoLocation(geo.address);
                    setRestoNeighborhood(geo.neighborhood);
                    setRestoLocSuccess(true);
                  }}
                />
              </div>

            </div>

            {/* Next Button */}
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => setStep('resto_step3')}
              className="w-full py-3 rounded-2xl brand-gradient text-white font-black text-xs shadow-lg shadow-emerald-950/20 border border-emerald-400/30 flex items-center justify-center gap-1.5 cursor-pointer"
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
            className="h-full flex flex-col justify-between p-4 overflow-y-auto no-scrollbar z-20 space-y-3 bg-white"
          >
            <div className="space-y-3">
              {/* Stepper Header */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setStep('resto_step2')}
                  className="p-2 rounded-xl bg-gray-50 border border-gray-100 text-gray-600 text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Retour</span>
                </button>
                <div className="text-[10px] font-black text-[#0A6E3B] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Étape 3 sur 3 — Confirmation
                </div>
              </div>

              <div>
                <h3 className="text-base font-black text-[#081A10]">Votre Profil Restaurant</h3>
                <p className="text-[11px] text-gray-500">Vérifiez vos informations avant d'accéder à votre espace.</p>
              </div>

              {/* Summary Card */}
              <div className="p-4 rounded-3xl bg-gray-50 border border-gray-200 space-y-3 shadow-xs">
                <div className="flex items-center gap-3.5 border-b border-gray-200 pb-3">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-[#0A6E3B] shadow-md shrink-0 bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={restoLogo} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-[#081A10]">{restoName || 'Mon Restaurant Dakar'}</h4>
                    <span className="text-[10px] font-black text-[#0A6E3B] bg-emerald-100 px-2 py-0.5 rounded-md mt-0.5 inline-block">
                      {RESTO_TYPES.find(t => t.id === restoType)?.label.split(' ')[1] || 'Gastronomie'}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-gray-600">
                    <span className="text-[10px] text-gray-400 font-bold">Contact</span>
                    <span className="font-bold text-[#081A10] text-[11px]">{restoPhone}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-600">
                    <span className="text-[10px] text-gray-400 font-bold">Localisation</span>
                    <span className="font-black text-[#081A10] text-[11px]">{restoLocation}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-600">
                    <span className="text-[10px] text-gray-400 font-bold">Outils Inclus</span>
                    <span className="font-black text-[#0A6E3B] text-[11px]">Dashboard KDS + Vitrine Publique</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#E6F5EC] border border-[#0A6E3B]/20 text-[10px] text-[#064E2B] font-semibold space-y-1">
                <div className="flex items-center gap-1 font-black">
                  <Sparkles className="w-3.5 h-3.5 text-[#FF7824]" />
                  <span>Votre Vitrine & Dashboard sont prêts !</span>
                </div>
                <p>Toutes les informations saisies sont automatiquement synchronisées sur votre vitrine.</p>
              </div>

            </div>

            {/* Final Action Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => finishOnboarding('restaurant')}
              className="w-full py-3.5 rounded-2xl brand-gradient text-white font-black text-xs shadow-xl shadow-emerald-950/30 border border-emerald-400/40 sheen-effect flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Créer mon compte restaurant</span>
            </motion.button>
          </motion.div>
        )}

        {/* =========================================================================
            5. INSCRIPTION LIVREUR (4 ÉTAPES FLUIDES & PROFESSIONNELLES)
           ========================================================================= */}
        {step === 'courier_step1' && (
          <motion.div
            key="courier_step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full flex flex-col justify-between p-4 overflow-y-auto no-scrollbar z-20 space-y-3 bg-white"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setStep('welcome')}
                  className="p-2 rounded-xl bg-gray-50 border border-gray-100 text-gray-600 text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Retour</span>
                </button>
                <div className="text-[10px] font-black text-[#FF7824] bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
                  Étape 1 sur 4 — Identité
                </div>
              </div>

              <div>
                <h3 className="text-base font-black text-[#081A10]">Votre Identité</h3>
                <p className="text-[11px] text-gray-500">Renseignez vos coordonnées pour recevoir des courses à Dakar.</p>
              </div>

              {/* Photo */}
              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200 flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white border border-gray-200 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={courierPhoto} alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <span className="text-[11px] font-black text-[#081A10] block">Photo de profil</span>
                  <p className="text-[9px] text-gray-400">Visage net pour la sécurité des clients</p>
                </div>
              </div>

              {/* First & Last Name separated */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-[#081A10]">Prénom *</label>
                  <input
                    type="text"
                    placeholder="Ex: Amadou"
                    value={courierFirstName}
                    onChange={(e) => setCourierFirstName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-[#081A10] placeholder-gray-400 focus:outline-hidden focus:border-[#FF7824] shadow-inner"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-[#081A10]">Nom *</label>
                  <input
                    type="text"
                    placeholder="Ex: Diallo"
                    value={courierLastName}
                    onChange={(e) => setCourierLastName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-[#081A10] placeholder-gray-400 focus:outline-hidden focus:border-[#FF7824] shadow-inner"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-[11px] font-black text-[#081A10]">Numéro de téléphone (Orange / Wave) *</label>
                <input
                  type="tel"
                  placeholder="+221 77 000 00 00"
                  value={courierPhone}
                  onChange={(e) => setCourierPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-[#081A10] placeholder-gray-400 focus:outline-hidden focus:border-[#FF7824] shadow-inner"
                />
              </div>

              {/* Email de connexion */}
              <div className="space-y-1">
                <label className="text-[11px] font-black text-[#081A10]">Email de connexion *</label>
                <input
                  type="email"
                  placeholder="votre@email.com"
                  value={courierEmail}
                  onChange={(e) => setCourierEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-[#081A10] placeholder-gray-400 focus:outline-hidden focus:border-[#FF7824] shadow-inner"
                />
              </div>

              {/* Mot de passe */}
              <div className="space-y-1">
                <label className="text-[11px] font-black text-[#081A10]">Mot de passe *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Au moins 6 caractères"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-[#081A10] placeholder-gray-400 focus:outline-hidden focus:border-[#FF7824] shadow-inner pr-14"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-[10px] font-bold"
                  >
                    {showPassword ? 'Cacher' : 'Voir'}
                  </button>
                </div>
                <p className="text-[9px] text-gray-400">Vous servira à vous reconnecter depuis n'importe quel appareil.</p>
              </div>

            </div>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                if (!courierFirstName.trim() || !courierLastName.trim()) {
                  alert('Veuillez renseigner votre prénom et nom');
                  return;
                }
                if (!courierEmail.trim() || !authPassword || authPassword.length < 6) {
                  alert('Veuillez renseigner un email et un mot de passe (6 caractères minimum) pour créer votre compte.');
                  return;
                }
                setStep('courier_step2');
              }}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#E86315] to-[#FF7824] text-white font-black text-xs shadow-lg shadow-orange-950/20 border border-orange-300/30 flex items-center justify-center gap-1.5 cursor-pointer"
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
            className="h-full flex flex-col justify-between p-4 overflow-y-auto no-scrollbar z-20 space-y-3 bg-white"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setStep('courier_step1')}
                  className="p-2 rounded-xl bg-gray-50 border border-gray-100 text-gray-600 text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Retour</span>
                </button>
                <div className="text-[10px] font-black text-[#FF7824] bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
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
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      courierVehicle === v.id
                        ? 'bg-gradient-to-r from-[#E86315] to-[#FF7824] text-white border-orange-400 shadow-md scale-102'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-white'
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
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-[#081A10] uppercase placeholder-gray-400 focus:outline-hidden focus:border-[#FF7824] shadow-inner"
                />
              </div>

            </div>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => setStep('courier_step3')}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#E86315] to-[#FF7824] text-white font-black text-xs shadow-lg shadow-orange-950/20 border border-orange-300/30 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Continuer vers la Localisation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          </motion.div>
        )}

        {/* COURIER STEP 3: LOCALISATION EN DIRECT (SYSTÈME GPS EXISTANT) */}
        {step === 'courier_step3' && (
          <motion.div
            key="courier_step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full flex flex-col justify-between p-4 overflow-y-auto no-scrollbar z-20 space-y-3 bg-white"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setStep('courier_step2')}
                  className="p-2 rounded-xl bg-gray-50 border border-gray-100 text-gray-600 text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Retour</span>
                </button>
                <div className="text-[10px] font-black text-[#FF7824] bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
                  Étape 3 sur 4 — Localisation Live
                </div>
              </div>

              <div>
                <h3 className="text-base font-black text-[#081A10]">Où êtes-vous actuellement ?</h3>
                <p className="text-[11px] text-gray-500">Pour recevoir les commandes disponibles les plus proches.</p>
              </div>

              {/* GPS Geolocation Main Action Button */}
              <div className="p-4 rounded-3xl bg-gray-50 border border-gray-200 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#E86315] to-[#FF7824] text-white flex items-center justify-center mx-auto shadow-md">
                  <Navigation className="w-6 h-6 animate-pulse" />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleGeoLocate('courier')}
                  disabled={isLocatingCourier}
                  className={`w-full py-2.5 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
                    courierLocSuccess 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-gradient-to-r from-[#E86315] to-[#FF7824] text-white'
                  }`}
                >
                  {isLocatingCourier ? (
                    <>
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Détection GPS en direct...</span>
                    </>
                  ) : courierLocSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <span>✓ Position Livreur Confirmée</span>
                    </>
                  ) : (
                    <>
                      <Navigation className="w-3.5 h-3.5" />
                      <span>📍 Partager ma localisation en direct</span>
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
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-[#081A10] shadow-inner"
                />
              </div>

            </div>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => setStep('courier_step4')}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#E86315] to-[#FF7824] text-white font-black text-xs shadow-lg shadow-orange-950/20 border border-orange-300/30 flex items-center justify-center gap-1.5 cursor-pointer"
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
            className="h-full flex flex-col justify-between p-4 overflow-y-auto no-scrollbar z-20 space-y-3 bg-white"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setStep('courier_step3')}
                  className="p-2 rounded-xl bg-gray-50 border border-gray-100 text-gray-600 text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Retour</span>
                </button>
                <div className="text-[10px] font-black text-[#FF7824] bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
                  Étape 4 sur 4 — Validation
                </div>
              </div>

              <div>
                <h3 className="text-base font-black text-[#081A10]">Profil Livreur Tiak-Tiak</h3>
                <p className="text-[11px] text-gray-500">Prêt à livrer les délices de Dakar !</p>
              </div>

              {/* Summary */}
              <div className="p-4 rounded-3xl bg-gray-50 border border-gray-200 space-y-3 shadow-xs">
                <div className="flex items-center gap-3 border-b border-gray-200 pb-3">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden border border-gray-200 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={courierPhoto} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-[#081A10]">{`${courierFirstName} ${courierLastName}`.trim() || 'Livreur Thiob'}</h4>
                    <p className="text-[10px] text-gray-500">{courierPhone} • {courierLocation}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white p-2 rounded-xl border border-gray-200">
                    <span className="text-[9px] text-gray-400 block font-bold">Véhicule</span>
                    <span className="font-black text-[#081A10]">{VEHICLE_OPTIONS.find(v => v.id === courierVehicle)?.label}</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-gray-200">
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
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#E86315] to-[#FF7824] text-white font-black text-xs shadow-xl shadow-orange-950/30 border border-orange-300/40 sheen-effect flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>Devenir livreur</span>
            </motion.button>
          </motion.div>
        )}

        {/* =========================================================================
            6. INSCRIPTION CLIENT (GOOGLE, FACEBOOK OU FORMULAIRE CLASSIQUE)
           ========================================================================= */}
        {step === 'client_step' && (
          <motion.div
            key="client_step"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full flex flex-col justify-between p-4 overflow-y-auto no-scrollbar z-20 space-y-3 bg-white"
          >
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setStep('welcome')}
                  className="p-2 rounded-xl bg-gray-50 border border-gray-100 text-gray-600 text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Retour</span>
                </button>
                <div className="text-[10px] font-black text-[#0A6E3B] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Compte Client Gourmand
                </div>
              </div>

              <div>
                <h3 className="text-base font-black text-[#081A10]">Bienvenue sur Thiob 👋</h3>
                <p className="text-[11px] text-gray-500">Connectez-vous en 1 clic ou renseignez vos coordonnées.</p>
              </div>

              {/* 1-Click Social Connect (Google & Facebook) */}
              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                <span className="text-[10px] font-black text-gray-500 block text-center">Connexion rapide en 1 clic :</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleOAuthLogin('google')}
                    disabled={isOAuthLoading !== null}
                    className="py-2.5 px-3 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-2xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-60"
                  >
                    {isOAuthLoading === 'google' ? (
                      <span className="w-4 h-4 rounded-full border-2 border-gray-400 border-t-transparent animate-spin" />
                    ) : (
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                      </svg>
                    )}
                    <span>Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOAuthLogin('facebook')}
                    disabled={isOAuthLoading !== null}
                    className="py-2.5 px-3 rounded-xl bg-[#1877F2] text-white text-xs font-bold hover:bg-[#166fe5] shadow-2xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-60"
                  >
                    {isOAuthLoading === 'facebook' ? (
                      <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    ) : (
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    )}
                    <span>Facebook</span>
                  </button>
                </div>
              </div>

              {/* Separator */}
              <div className="flex items-center">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="px-2.5 text-[9px] font-bold text-gray-400">OU PAR FORMULAIRE</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Name */}
              <div className="space-y-1">
                <label className="text-[11px] font-black text-[#081A10]">Votre prénom et nom *</label>
                <input
                  type="text"
                  placeholder="Ex: Moussa Diop"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-[#081A10] placeholder-gray-400 focus:bg-white focus:border-[#0A6E3B] focus:outline-hidden shadow-inner"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-[11px] font-black text-[#081A10]">Numéro de téléphone (Orange / Wave) *</label>
                <input
                  type="tel"
                  placeholder="+221 77 123 45 67"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-[#081A10] placeholder-gray-400 focus:bg-white focus:border-[#0A6E3B] focus:outline-hidden shadow-inner"
                />
              </div>

              {/* Email + mot de passe (optionnel — pour se reconnecter depuis un autre appareil) */}
              <div className="space-y-1">
                <label className="text-[11px] font-black text-[#081A10]">Email (optionnel, pour se reconnecter ailleurs)</label>
                <input
                  type="email"
                  placeholder="votre@email.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-[#081A10] placeholder-gray-400 focus:bg-white focus:border-[#0A6E3B] focus:outline-hidden shadow-inner"
                />
              </div>
              {clientEmail.trim() && (
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-[#081A10]">Mot de passe *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Au moins 6 caractères"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-[#081A10] placeholder-gray-400 focus:bg-white focus:border-[#0A6E3B] focus:outline-hidden shadow-inner pr-14"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-[10px] font-bold"
                    >
                      {showPassword ? 'Cacher' : 'Voir'}
                    </button>
                  </div>
                </div>
              )}

              {/* Geolocation */}
              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200 space-y-2 text-center">
                <div className="flex items-center justify-between text-left">
                  <div>
                    <span className="text-xs font-black text-[#081A10] block">Votre position de livraison</span>
                    <p className="text-[10px] text-gray-500">{clientLocation}</p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleGeoLocate('client')}
                  disabled={isLocatingClient}
                  className={`w-full py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    clientLocSuccess
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-[#0A6E3B] border border-[#0A6E3B]/30 hover:bg-emerald-50'
                  }`}
                >
                  {isLocatingClient ? (
                    <>
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-[#0A6E3B] border-t-transparent animate-spin" />
                      <span>Localisation GPS en cours...</span>
                    </>
                  ) : clientLocSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>✓ Position Client Confirmée</span>
                    </>
                  ) : (
                    <>
                      <Navigation className="w-3.5 h-3.5" />
                      <span>📍 Détecter ma position GPS</span>
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
              className="w-full py-3.5 rounded-2xl brand-gradient text-white font-black text-xs shadow-xl shadow-emerald-950/30 border border-emerald-400/40 sheen-effect flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span>Commencer à commander</span>
            </motion.button>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
