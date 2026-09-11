'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  RefreshCw, 
  X, 
  Lock,
  ChevronLeft,
  Smartphone
} from 'lucide-react';
import { useApp } from '@/lib/store';

interface WhatsAppAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: { phone: string; fullName?: string }) => void;
}

export default function WhatsAppAuthModal({
  isOpen,
  onClose,
  onSuccess,
}: WhatsAppAuthModalProps) {
  const { setClientProfile, clientPhone, clientName } = useApp();

  const [step, setStep] = useState<'phone' | 'otp' | 'success'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [debugOtp, setDebugOtp] = useState<string | null>(null);
  const [directWaLink, setDirectWaLink] = useState<string | null>(null);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (clientPhone) {
        setPhoneNumber(clientPhone.replace('+221', '').trim());
      }
      if (clientName) {
        setFullName(clientName);
      }
      setStep('phone');
      setErrorMsg(null);
      setOtpCode(['', '', '', '', '', '']);
    }
  }, [isOpen, clientPhone, clientName]);

  // Compte à rebours pour le renvoi de code
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  // Envoi du code
  const handleSendCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    const clean = phoneNumber.replace(/\s+/g, '');
    if (clean.length < 8) {
      setErrorMsg('Veuillez entrer un numéro de téléphone valide à Dakar (ex: 77 123 45 67).');
      return;
    }

    setIsLoading(true);
    try {
      const fullPhone = clean.startsWith('+221') ? clean : `+221${clean}`;
      const res = await fetch('/api/auth/whatsapp-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          phone: fullPhone,
          fullName: fullName.trim() || 'Client Thiob',
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Impossible d’envoyer le code de validation.');
      }

      setDirectWaLink(data.directWhatsAppLink || null);
      if (data.debugCode) {
        setDebugOtp(data.debugCode);
      }

      setStep('otp');
      setCountdown(45);
      setCanResend(false);
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 300);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Une erreur est survenue lors de l’envoi.');
    } finally {
      setIsLoading(false);
    }
  };

  // Gestion de la saisie des 6 chiffres OTP
  const handleOtpChange = (index: number, val: string) => {
    const digit = val.slice(-1);
    if (digit && !/^\d+$/.test(digit)) return;

    const newCode = [...otpCode];
    newCode[index] = digit;
    setOtpCode(newCode);

    // Auto-focus next input
    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Si tous les chiffres sont remplis, vérifier automatiquement
    if (newCode.every((c) => c !== '') && digit) {
      verifyOtp(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Vérification du code OTP
  const verifyOtp = async (codeToVerify: string) => {
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const clean = phoneNumber.replace(/\s+/g, '');
      const fullPhone = clean.startsWith('+221') ? clean : `+221${clean}`;

      const res = await fetch('/api/auth/whatsapp-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify',
          phone: fullPhone,
          code: codeToVerify,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Code de validation incorrect.');
      }

      // Succès : Enregistrement du profil dans le store
      const finalName = fullName.trim() || data.fullName || 'Client Thiob';
      setClientProfile(finalName, fullPhone);

      setStep('success');
      if (onSuccess) {
        onSuccess({ phone: fullPhone, fullName: finalName });
      }

      // Fermeture automatique après 1.8s
      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Code de validation invalide.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm">
          {/* Overlay click to close */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-sm bg-white rounded-[28px] shadow-2xl overflow-hidden border border-[#D8EADB] z-10"
          >
            {/* Header Thiob Dakar */}
            <div className="bg-gradient-to-r from-[#004b1b] via-[#024213] to-[#008625] text-white p-5 relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                aria-label="Fermer"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-white/15 border border-white/20 text-white flex items-center justify-center font-black text-sm shadow-xs">
                  🍲
                </div>
                <div>
                  <h3 className="text-sm font-black leading-tight text-white">
                    Connexion Thiob Dakar
                  </h3>
                  <p className="text-[11px] text-white/80">
                    Livraison & Gastronomie à Dakar 🇸🇳
                  </p>
                </div>
              </div>
            </div>

            {/* Corps du Modal */}
            <div className="p-5">
              {/* =============================================================
                  ÉTAPE 1 : SAISIE DU NUMÉRO DE TÉLÉPHONE
                 ============================================================= */}
              {step === 'phone' && (
                <form onSubmit={handleSendCode} className="space-y-4">
                  <div className="text-center space-y-1">
                    <p className="text-xs text-gray-600">
                      Entrez votre numéro pour vous connecter à votre compte.
                    </p>
                  </div>

                  {errorMsg && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-medium flex items-center gap-2">
                      <span>⚠️</span>
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Votre Nom ou Prénom <span className="text-gray-400 font-normal">(Optionnel)</span>
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Ex: Moussa Diop"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs focus:bg-white focus:border-[#0A6E3B] focus:ring-2 focus:ring-[#0A6E3B]/20 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Numéro de téléphone 🇸🇳
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="px-3 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 flex items-center gap-1.5 shrink-0 select-none">
                          <span>🇸🇳</span>
                          <span>+221</span>
                        </div>
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="77 123 45 67"
                          autoFocus
                          required
                          className="flex-1 px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold focus:bg-white focus:border-[#0A6E3B] focus:ring-2 focus:ring-[#0A6E3B]/20 outline-none transition-all"
                        />
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">
                        Orange, Wave, Free, Expresso, Promobile.
                      </p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !phoneNumber.trim()}
                    className="w-full py-3 rounded-xl brand-gradient hover:brightness-110 active:scale-[0.98] text-white font-black text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Continuer</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* =============================================================
                  ÉTAPE 2 : CODE DE VALIDATION ENVOYÉ SUR WHATSAPP
                 ============================================================= */}
              {step === 'otp' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setStep('phone')}
                      className="text-[11px] font-bold text-[#0A6E3B] flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      Modifier le numéro
                    </button>
                    <span className="text-[10px] bg-emerald-100 text-[#0A6E3B] px-2.5 py-0.5 rounded-full font-bold">
                      +221 {phoneNumber}
                    </span>
                  </div>

                  {/* Message clé demandé par l'utilisateur */}
                  <div className="p-3.5 bg-[#E6F5EC] border border-[#0A6E3B]/20 rounded-2xl text-center space-y-1 shadow-2xs">
                    <div className="w-8 h-8 mx-auto rounded-full bg-[#25D366] text-white flex items-center justify-center text-sm shadow-xs">
                      💬
                    </div>
                    <h4 className="text-xs font-black text-[#081A10] leading-snug pt-0.5">
                      Votre code de validation a été envoyé sur WhatsApp
                    </h4>
                    <p className="text-[11px] text-gray-600">
                      Consultez vos messages WhatsApp pour obtenir le code à 6 chiffres envoyé par <strong>Thiob Dakar</strong>.
                    </p>
                  </div>

                  {/* Bandeau de test local */}
                  {debugOtp && (
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[11px] flex items-center justify-between">
                      <span>💡 Code reçu : <strong>{debugOtp}</strong></span>
                      <button
                        onClick={() => {
                          const digits = debugOtp.split('').slice(0, 6);
                          setOtpCode(digits);
                          verifyOtp(debugOtp);
                        }}
                        className="text-[10px] font-black underline hover:text-amber-900 cursor-pointer"
                      >
                        Remplir
                      </button>
                    </div>
                  )}

                  {errorMsg && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-medium flex items-center gap-2">
                      <span>⚠️</span>
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Grille des 6 chiffres */}
                  <div className="flex justify-between gap-1.5 py-1">
                    {otpCode.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => { otpInputRefs.current[idx] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        className="w-10 h-11 text-center text-lg font-black bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-[#0A6E3B] focus:ring-2 focus:ring-[#0A6E3B]/20 outline-none transition-all"
                      />
                    ))}
                  </div>

                  {/* Bouton de validation */}
                  <button
                    onClick={() => verifyOtp(otpCode.join(''))}
                    disabled={isLoading || otpCode.some((c) => c === '')}
                    className="w-full py-2.5 rounded-xl brand-gradient text-white font-black text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Valider mon code</span>
                      </>
                    )}
                  </button>

                  {/* Renvoi de code */}
                  <div className="text-center pt-1 border-t border-gray-100">
                    <button
                      onClick={() => canResend && handleSendCode()}
                      disabled={!canResend || isLoading}
                      className={`text-[11px] font-bold transition-colors cursor-pointer ${
                        canResend ? 'text-[#0A6E3B] hover:underline' : 'text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {canResend ? '🔄 Renvoyer le code sur WhatsApp' : `Renvoyer un nouveau code dans ${countdown}s`}
                    </button>
                  </div>
                </div>
              )}

              {/* =============================================================
                  ÉTAPE 3 : SUCCÈS CONFIRMÉ
                 ============================================================= */}
              {step === 'success' && (
                <div className="py-6 text-center space-y-3">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                    className="w-14 h-14 rounded-full bg-[#E6F5EC] text-[#0A6E3B] flex items-center justify-center mx-auto shadow-sm"
                  >
                    <CheckCircle2 className="w-9 h-9" />
                  </motion.div>
                  <div>
                    <h4 className="text-base font-black text-[#081A10]">
                      Connexion réussie !
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Bienvenue sur Thiob Dakar, <strong>{fullName || 'Cher Client'}</strong> 🇸🇳
                    </p>
                  </div>
                  <span className="inline-block px-3 py-1 rounded-full bg-[#0A6E3B]/10 text-[#004b1b] text-[10px] font-black">
                    Compte vérifié avec succès ✅
                  </span>
                </div>
              )}
            </div>

            {/* Pied de page sécurisé */}
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400">
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-600" />
                Sécurité Thiob Téranga
              </span>
              <span className="font-bold text-[#0A6E3B]">Dakar, Sénégal</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
