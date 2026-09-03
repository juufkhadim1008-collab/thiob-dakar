'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/lib/store';
import { UserRole } from '@/lib/types';
import { 
  X, 
  Phone, 
  Mail, 
  Lock, 
  User, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Bike, 
  ChefHat, 
  KeyRound,
  RefreshCw,
  Info,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AuthModal() {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    authModalInitialRole,
    sendPhoneOtp, 
    verifyPhoneOtp, 
    loginWithEmail, 
    signUpWithEmail, 
    loginWithDemo,
    loginWithOAuth
  } = useApp();

  const [activeTab, setActiveTab] = useState<'phone' | 'email' | 'demo'>('phone');
  const [isSignUp, setIsSignUp] = useState(false);

  // Phone states
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneStep, setPhoneStep] = useState<'input' | 'otp'>('input');
  const [otpCode, setOtpCode] = useState('');
  const [sentCodeHint, setSentCodeHint] = useState<string | null>(null);

  // Email states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(authModalInitialRole || 'client');

  // Status states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {}
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setErrorMsg(null);
    const res = await loginWithOAuth('google');
    setLoading(false);
    if (res.success) {
      triggerConfetti();
    } else {
      setErrorMsg(res.error || 'Erreur lors de la connexion Google');
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!phoneNumber || phoneNumber.length < 9) {
      setErrorMsg('Veuillez entrer un numéro sénégalais valide (ex: 77 123 45 67)');
      return;
    }
    setLoading(true);
    const res = await sendPhoneOtp(phoneNumber);
    setLoading(false);
    if (res.success) {
      setSentCodeHint(res.code || '1008');
      setPhoneStep('otp');
      setSuccessMsg(res.message);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!otpCode || otpCode.length < 4) {
      setErrorMsg('Veuillez entrer le code OTP à 4 chiffres (ex: 1008)');
      return;
    }
    setLoading(true);
    const res = await verifyPhoneOtp(phoneNumber, otpCode);
    setLoading(false);
    if (res.success) {
      triggerConfetti();
    } else {
      setErrorMsg(res.error || 'Code incorrect');
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!email || !password) {
      setErrorMsg('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    if (isSignUp) {
      if (!fullName) {
        setErrorMsg('Veuillez renseigner votre nom complet');
        setLoading(false);
        return;
      }
      const res = await signUpWithEmail({
        name: fullName,
        email,
        phone: phoneNumber || '+221 77 000 00 00',
        password,
        role: selectedRole
      });
      setLoading(false);
      if (res.success) {
        triggerConfetti();
      } else {
        setErrorMsg(res.error || 'Erreur lors de l\'inscription');
      }
    } else {
      const res = await loginWithEmail(email, password);
      setLoading(false);
      if (res.success) {
        triggerConfetti();
      } else {
        setErrorMsg(res.error || 'Email ou mot de passe incorrect');
      }
    }
  };

  const handleQuickDemo = (role: UserRole) => {
    loginWithDemo(role);
    triggerConfetti();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-[#161922] border border-amber-500/20 rounded-3xl p-6 shadow-2xl text-white overflow-hidden"
        >
          {/* Background Ambient Glow */}
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Title */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Thiéb & Co Dakar
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              {activeTab === 'demo' ? 'Accès Rapide Démo' : isSignUp ? 'Créer un Compte' : 'Connexion à votre Espace'}
            </h2>
            <p className="text-xs text-white/50 mt-1">
              Accédez à vos commandes, réservations et adresses à Dakar
            </p>
          </div>

          {/* Tab Selector */}
          <div className="grid grid-cols-3 gap-1 bg-white/5 p-1 rounded-2xl mb-5 border border-white/5">
            <button
              onClick={() => { setActiveTab('phone'); setErrorMsg(null); setSuccessMsg(null); }}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'phone' 
                  ? 'bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/20' 
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Téléphone</span>
            </button>
            <button
              onClick={() => { setActiveTab('email'); setErrorMsg(null); setSuccessMsg(null); }}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'email' 
                  ? 'bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/20' 
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email</span>
            </button>
            <button
              onClick={() => { setActiveTab('demo'); setErrorMsg(null); setSuccessMsg(null); }}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'demo' 
                  ? 'bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/20' 
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Comptes Test</span>
            </button>
          </div>

          {/* Feedback messages */}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </motion.div>
          )}

          {/* TAB 1: PHONE (+221 OTP SMS) */}
          {activeTab === 'phone' && (
            <div>
              {phoneStep === 'input' ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1.5">
                      Numéro de Téléphone (Sénégal)
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 flex items-center gap-1.5 text-xs font-semibold text-amber-400 bg-white/5 px-2 py-1 rounded-lg border border-white/5">
                        <span>🇸🇳</span>
                        <span>+221</span>
                      </div>
                      <input
                        type="tel"
                        placeholder="77 123 45 67"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full pl-24 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500 transition-colors"
                        autoFocus
                      />
                    </div>
                    <p className="text-[11px] text-white/40 mt-1.5">
                      Compatible avec Orange, Wave, Free Money et Expresso.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Recevoir le code SMS</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-medium text-white/70">
                        Code secret reçu par SMS
                      </label>
                      <button
                        type="button"
                        onClick={() => setPhoneStep('input')}
                        className="text-xs text-amber-400 hover:underline"
                      >
                        Changer de numéro
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="Entrez 1008"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className="w-full text-center tracking-[0.4em] font-mono text-xl py-3 bg-white/5 border border-amber-500/40 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500 transition-colors"
                        autoFocus
                      />
                    </div>

                    {sentCodeHint && (
                      <div className="mt-2.5 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                        <span className="text-xs text-amber-300">
                          Code de test : <strong>{sentCodeHint}</strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => setOtpCode(sentCodeHint)}
                          className="text-[11px] font-bold px-2 py-1 bg-amber-500 text-black rounded-lg hover:bg-amber-400 transition-colors"
                        >
                          Remplir
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Valider & Accéder</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: EMAIL & PASSWORD */}
          {activeTab === 'email' && (
            <form onSubmit={handleEmailAuth} className="space-y-3.5">
              {isSignUp && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1">
                      Nom complet
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3.5 top-3.5 text-white/40" />
                      <input
                        type="text"
                        placeholder="Khadim Diop"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1">
                      Type de profil
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedRole('client')}
                        className={`py-2 px-1 rounded-xl text-xs flex flex-col items-center gap-1 border transition-all ${
                          selectedRole === 'client' 
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold' 
                            : 'bg-white/5 border-white/5 text-white/60'
                        }`}
                      >
                        <User className="w-4 h-4" />
                        <span>Client</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedRole('courier')}
                        className={`py-2 px-1 rounded-xl text-xs flex flex-col items-center gap-1 border transition-all ${
                          selectedRole === 'courier' 
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold' 
                            : 'bg-white/5 border-white/5 text-white/60'
                        }`}
                      >
                        <Bike className="w-4 h-4" />
                        <span>Coursier</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedRole('restaurant')}
                        className={`py-2 px-1 rounded-xl text-xs flex flex-col items-center gap-1 border transition-all ${
                          selectedRole === 'restaurant' 
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold' 
                            : 'bg-white/5 border-white/5 text-white/60'
                        }`}
                      >
                        <ChefHat className="w-4 h-4" />
                        <span>Restaurant</span>
                      </button>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">
                  Adresse Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-white/40" />
                  <input
                    type="email"
                    placeholder="exemple@thiob.sn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-white/40" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>{isSignUp ? 'Créer mon compte' : 'Se connecter'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(null); }}
                  className="text-xs text-white/60 hover:text-amber-400 transition-colors"
                >
                  {isSignUp ? 'Vous avez déjà un compte ? ' : 'Nouveau sur Thiéb & Co ? '}
                  <span className="font-bold text-amber-400 underline">
                    {isSignUp ? 'Se connecter' : 'Créer un compte'}
                  </span>
                </button>
              </div>
            </form>
          )}

          {/* Google 1-Tap & Social Divider (For Phone & Email tabs) */}
          {(activeTab === 'phone' || activeTab === 'email') && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full py-3 px-4 bg-white hover:bg-gray-100 text-gray-900 font-bold text-xs rounded-2xl flex items-center justify-center gap-2.5 shadow-lg transition-all active:scale-[0.98]"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span>Continuer avec Google</span>
              </button>
            </div>
          )}

          {/* TAB 3: QUICK DEMO PROFILES (1-CLICK) */}
          {activeTab === 'demo' && (
            <div className="space-y-2.5">
              <p className="text-xs text-white/50 mb-2">
                Choisissez un compte de démonstration pour tester instantanément :
              </p>

              {/* Client Demo */}
              <button
                onClick={() => handleQuickDemo('client')}
                className="w-full p-3 rounded-2xl bg-white/5 hover:bg-amber-500/10 border border-white/5 hover:border-amber-500/30 flex items-center justify-between group transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                    KD
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white group-hover:text-amber-300 transition-colors">
                      Khadim Diop (Client VIP)
                    </h4>
                    <p className="text-[11px] text-white/50">
                      Almadies • 450 Points Teranga • Wave
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* Courier Demo */}
              <button
                onClick={() => handleQuickDemo('courier')}
                className="w-full p-3 rounded-2xl bg-white/5 hover:bg-amber-500/10 border border-white/5 hover:border-amber-500/30 flex items-center justify-between group transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
                    <Bike className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white group-hover:text-amber-300 transition-colors">
                      Moussa Ndiaye (Coursier Pro)
                    </h4>
                    <p className="text-[11px] text-white/50">
                      Moto Jakarta • Plateau • En ligne
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* Restaurant Demo */}
              <button
                onClick={() => handleQuickDemo('restaurant')}
                className="w-full p-3 rounded-2xl bg-white/5 hover:bg-amber-500/10 border border-white/5 hover:border-amber-500/30 flex items-center justify-between group transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold">
                    <ChefHat className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white group-hover:text-amber-300 transition-colors">
                      Chez Loutcha (Restaurateur)
                    </h4>
                    <p className="text-[11px] text-white/50">
                      Plateau • Commandes en direct • KDS
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* Admin Demo */}
              <button
                onClick={() => handleQuickDemo('admin')}
                className="w-full p-3 rounded-2xl bg-white/5 hover:bg-purple-500/10 border border-white/5 hover:border-purple-500/30 flex items-center justify-between group transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">
                      Mastü (Direction Super Admin)
                    </h4>
                    <p className="text-[11px] text-white/50">
                      Contrôle global • Métriques & Revenus
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
