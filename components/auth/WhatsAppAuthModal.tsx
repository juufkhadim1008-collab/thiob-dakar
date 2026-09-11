'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  ShieldCheck, 
  Smartphone, 
  ArrowRight, 
  CheckCircle2, 
  RefreshCw, 
  X, 
  Lock,
  Sparkles,
  ExternalLink,
  ChevronLeft
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

  // Envoi du code WhatsApp
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
        throw new Error(data.error || 'Impossible d’envoyer le code sur WhatsApp.');
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
        throw new Error(data.error || 'Code de sécurité incorrect.');
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
      setErrorMsg(err?.message || 'Code de sécurité invalide.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
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
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#D8EADB] z-10"
          >
            {/* Header Vert Thiob avec Dégradé */}
            <div className="bg-gradient-to-r from-[#004b1b] via-[#024213] to-[#008625] text-white p-5 relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="w-9 h-9 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shadow-md">
                  <MessageCircle className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h3 className="text-base font-black leading-tight text-white flex items-center gap-1.5">
                    Connexion WhatsApp
                    <Sparkles className="w-3.5 h-3.5 text-[#FF7824]" />
                  </h3>
                  <p className="text-[11px] text-white/80">
                    Sécurisé & instantané à Dakar
                  </p>
                </div>
              </div>
            </div>

            {/* Corps du Modal */}
            <div className="p-5">
              {/* =============================================================
                  ÉTAPE 1 : SAISIE DU NUMÉRO SÉNÉGALAIS
                 ============================================================= */}
              {step === 'phone' && (
                <form onSubmit={handleSendCode} className="space-y-4">
                  <div className="text-center space-y-1">
                    <p className="text-xs text-gray-600">
                      Entrez votre numéro pour recevoir votre code de sécurité directement sur votre <strong>WhatsApp</strong>.
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
                        Numéro WhatsApp 🇸🇳
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
                        Compatible Orange, Wave, Free, Expresso, Promobile.
                      </p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !phoneNumber.trim()}
                    className="w-full py-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] active:scale-[0.98] text-white font-black text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <MessageCircle className="w-4 h-4 fill-current" />
                        <span>Recevoir mon code sur WhatsApp</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* =============================================================
                  ÉTAPE 2 : SAISIE DU CODE OTP À 6 CHIFFRES
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
                    <span className="text-[10px] bg-emerald-100 text-[#0A6E3B] px-2 py-0.5 rounded-full font-bold">
                      WhatsApp 💬
                    </span>
                  </div>

                  <div className="text-center space-y-1">
                    <h4 className="text-xs font-black text-[#081A10]">
                      Entrez le code de sécurité reçu sur WhatsApp
                    </h4>
                    <p className="text-[11px] text-gray-500">
                      Envoyé au <strong>+221 {phoneNumber}</strong>
                    </p>
                  </div>

                  {/* Bandeau d'aide / Code de démo en dev local */}
                  {debugOtp && (
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[11px] flex items-center justify-between">
                      <span>💡 Code de test : <strong>{debugOtp}</strong></span>
                      <button
                        onClick={() => {
                          const digits = debugOtp.split('').slice(0, 6);
                          setOtpCode(digits);
                          verifyOtp(debugOtp);
                        }}
                        className="text-[10px] font-black underline hover:text-amber-900 cursor-pointer"
                      >
                        Auto-remplir
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
                        className="w-11 h-12 text-center text-lg font-black bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-[#0A6E3B] focus:ring-2 focus:ring-[#0A6E3B]/20 outline-none transition-all"
                      />
                    ))}
                  </div>

                  {/* Bouton de vérification manuel si besoin */}
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
                        <span>Valider le code de sécurité</span>
                      </>
                    )}
                  </button>

                  {/* Bouton de renvoi & Lien direct */}
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-gray-100">
                    <button
                      onClick={() => canResend && handleSendCode()}
                      disabled={!canResend || isLoading}
                      className={`font-bold transition-colors cursor-pointer ${
                        canResend ? 'text-[#0A6E3B] hover:underline' : 'text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {canResend ? '🔄 Renvoyer le code' : `Renvoyer dans ${countdown}s`}
                    </button>

                    {directWaLink && (
                      <a
                        href={directWaLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#25D366] font-bold inline-flex items-center gap-1 hover:underline"
                      >
                        <span>Ouvrir WhatsApp</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
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
                    className="w-16 h-16 rounded-full bg-[#E6F5EC] text-[#0A6E3B] flex items-center justify-center mx-auto shadow-sm"
                  >
                    <CheckCircle2 className="w-10 h-10" />
                  </motion.div>
                  <div>
                    <h4 className="text-base font-black text-[#081A10]">
                      Connexion réussie !
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Bienvenue sur Thiob Dakar, <strong>{fullName || 'Cher Client'}</strong> 🇸🇳
                    </p>
                  </div>
                  <span className="inline-block px-3 py-1 rounded-full bg-[#25D366]/10 text-[#004b1b] text-[10px] font-black">
                    Compte vérifié sur WhatsApp ✅
                  </span>
                </div>
              )}
            </div>

            {/* Pied de page sécurisé */}
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400">
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-600" />
                Chiffrement de bout en bout
              </span>
              <span className="font-bold text-[#0A6E3B]">Thiob Téranga Auth</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
