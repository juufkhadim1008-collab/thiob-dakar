'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  Banknote, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft, 
  Smartphone, 
  Download, 
  Share2, 
  QrCode, 
  Clock, 
  Receipt,
  Sparkles,
  Lock,
  Check,
  AlertCircle,
  ExternalLink,
  PhoneCall,
  Store,
  Bike
} from 'lucide-react';
import { PaymentMethod, PaymentTransaction, Order } from '@/lib/types';
import { formatFCFA } from '@/lib/utils';
import confetti from 'canvas-confetti';

interface PaymentCheckoutSheetProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: { name: string; price: number; quantity: number }[];
  subtotal: number;
  deliveryFee: number;
  platformFee?: number;
  restaurantName: string;
  restaurantPhone?: string;
  courierName?: string;
  courierPhone?: string;
  clientName: string;
  clientPhone: string;
  deliveryAddress: string;
  onPaymentSuccess: (transaction: PaymentTransaction) => Order | null;
  onOpenTracking?: (order: Order) => void;
}

type PaymentStep = 'method_select' | 'details' | 'waiting_wave_app' | 'processing' | 'receipt';

export default function PaymentCheckoutSheet({
  isOpen,
  onClose,
  cartItems,
  subtotal,
  deliveryFee,
  platformFee = 500,
  restaurantName,
  restaurantPhone = '+221 77 845 12 90',
  courierName = 'Ibrahima Fall (Livreur Tiak-Tiak)',
  courierPhone = '+221 77 654 32 10',
  clientName,
  clientPhone,
  deliveryAddress,
  onPaymentSuccess,
  onOpenTracking,
}: PaymentCheckoutSheetProps) {
  const totalAmount = subtotal + deliveryFee + platformFee;

  const [step, setStep] = useState<PaymentStep>('method_select');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('wave');
  
  // Wave state
  const [waveClientPhone, setWaveClientPhone] = useState(clientPhone || '+221 77 123 45 67');
  
  // Orange Money state
  const [omPhone, setOmPhone] = useState(clientPhone || '+221 77 123 45 67');

  // Free Money state
  const [freePhone, setFreePhone] = useState(clientPhone || '+221 76 123 45 67');

  // Card state
  const [cardNumber, setCardNumber] = useState('4234 5678 9012 3456');
  const [cardHolder, setCardHolder] = useState(clientName || 'MOUSSA DIOP');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('892');

  // Cash state
  const [cashType, setCashType] = useState<'exact' | '5000' | '10000' | '20000' | 'custom'>('exact');
  const [customCashAmount, setCustomCashAmount] = useState<number>(totalAmount + 2000);

  // Processing & Transaction Result
  const [processingStepText, setProcessingStepText] = useState('Initialisation de la transaction...');
  const [completedTransaction, setCompletedTransaction] = useState<PaymentTransaction | null>(null);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  // The recipient number registered by the restaurant (or courier for delivery)
  const recipientMerchantPhone = restaurantPhone || '+221 77 845 12 90';
  const cleanRecipientPhone = recipientMerchantPhone.replace(/\D/g, '');

  // Format Card Number (XXXX XXXX XXXX XXXX)
  const handleCardNumberChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})/g, '$1 ').trim();
    setCardNumber(formatted);
  };

  // Format Expiry (MM/YY)
  const handleExpiryChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 2) {
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setCardExpiry(raw);
    }
  };

  // Cash change calculation
  const getCashGivenValue = () => {
    if (cashType === 'exact') return totalAmount;
    if (cashType === '5000') return Math.max(5000, totalAmount);
    if (cashType === '10000') return Math.max(10000, totalAmount);
    if (cashType === '20000') return Math.max(20000, totalAmount);
    return Math.max(customCashAmount, totalAmount);
  };

  const cashGiven = getCashGivenValue();
  const cashChange = Math.max(0, cashGiven - totalAmount);

  // Trigger celebration
  const triggerSuccessConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#064E2B', '#0A6E3B', '#10B981', '#FF7824', '#F5B738'],
      });
    } catch {}
  };

  // 🌊 Redirect directly to Wave App
  const handleDirectWaveRedirect = () => {
    // Wave Deep Link URL schema
    const waveWebUrl = `https://pay.wave.com/m/thiob-dakar?phone=${cleanRecipientPhone}&amount=${totalAmount}&memo=${encodeURIComponent(`Commande Thiob Dakar - ${restaurantName}`)}`;
    
    // Open Wave link in new tab or trigger deep link
    window.open(waveWebUrl, '_blank');

    // Switch to active waiting confirmation state
    setStep('waiting_wave_app');
  };

  // 🍊 Redirect to Orange Money Dial / USSD
  const handleDirectOrangeMoneyDial = () => {
    const ussdCode = `tel:*144*391*${cleanRecipientPhone}*${totalAmount}#`;
    window.location.href = ussdCode;
    setStep('waiting_wave_app');
  };

  // Complete Payment after Wave app confirmation or other methods
  const handleFinalizeConfirmedPayment = () => {
    setStep('processing');
    setProcessingStepText('Vérification de la réception du paiement...');

    setTimeout(() => {
      setProcessingStepText(`Crédit confirmé sur le compte de ${restaurantName}...`);

      setTimeout(() => {
        const transRef = selectedMethod === 'wave' 
          ? `WAV-DK-${Date.now().toString().slice(-6)}`
          : selectedMethod === 'orange_money'
          ? `OM-DK-${Date.now().toString().slice(-6)}`
          : selectedMethod === 'card'
          ? `CB-DK-${Date.now().toString().slice(-6)}`
          : `CASH-DK-${Date.now().toString().slice(-6)}`;

        const transaction: PaymentTransaction = {
          id: `tx-${Date.now()}`,
          orderId: `ord-${Date.now()}`,
          orderNumber: `#DK-${Math.floor(1000 + Math.random() * 9000)}`,
          amount: totalAmount,
          method: selectedMethod,
          status: 'completed',
          reference: transRef,
          phoneNumber: selectedMethod === 'wave' ? recipientMerchantPhone : selectedMethod === 'orange_money' ? recipientMerchantPhone : waveClientPhone,
          cardLast4: selectedMethod === 'card' ? cardNumber.slice(-4) : undefined,
          cashGiven: selectedMethod === 'cash' ? cashGiven : undefined,
          cashChangeAmount: selectedMethod === 'cash' ? cashChange : undefined,
          clientName: clientName || 'Client Thiob',
          restaurantName: restaurantName || 'Restaurant Dakar',
          createdAt: Date.now(),
        };

        setCompletedTransaction(transaction);
        const order = onPaymentSuccess(transaction);
        if (order) setCreatedOrder(order);

        triggerSuccessConfetti();
        setStep('receipt');
      }, 900);
    }, 1000);
  };

  // WhatsApp receipt sharing
  const handleShareWhatsApp = () => {
    if (!completedTransaction) return;
    const text = `🧾 *REÇU DE PAIEMENT THIOB EXPRESS DAKAR*\n` +
      `*Commande :* ${completedTransaction.orderNumber}\n` +
      `*Restaurant bénéficiaire :* ${completedTransaction.restaurantName} (${recipientMerchantPhone})\n` +
      `*Montant réglé :* ${formatFCFA(completedTransaction.amount)}\n` +
      `*Moyen de Paiement :* ${completedTransaction.method.toUpperCase()}\n` +
      `*Réf Transaction :* ${completedTransaction.reference}\n` +
      `*Adresse de livraison :* ${deliveryAddress}\n` +
      `\n_Paiement sécurisé par Thiob Express Sénégal 🇸🇳_`;
    
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 font-sans select-none">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={step === 'receipt' ? onClose : undefined}
        className="absolute inset-0 bg-black/70 backdrop-blur-xs"
      />

      {/* Sheet Modal Container */}
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 26, stiffness: 280 }}
        className="relative z-10 w-full max-w-md bg-white rounded-t-[36px] sm:rounded-3xl p-5 shadow-2xl max-h-[92vh] flex flex-col overflow-hidden text-[#081A10]"
      >
        
        {/* =========================================================================
            HEADER DU CHECKOUT
           ========================================================================= */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            {(step === 'details' || step === 'waiting_wave_app') && (
              <button
                onClick={() => setStep('method_select')}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xs transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-gray-700" />
              </button>
            )}
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0A6E3B] to-[#10B981] text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#081A10]">
                {step === 'receipt' ? 'Reçu Officiel Thiob' : 'Paiement Direct Dakar'}
              </h3>
              <p className="text-[10px] text-gray-400 font-medium">
                {step === 'receipt' ? 'Transaction confirmée ✓' : `${restaurantName} • ${formatFCFA(totalAmount)}`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xs text-gray-500 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* =========================================================================
            BODY CONTENT (5 STEPS)
           ========================================================================= */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-3 space-y-4">
          
          {/* STEP 1: SÉLECTION DU MOYEN DE PAIEMENT */}
          {step === 'method_select' && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-3"
            >
              {/* Recipient Restaurant Notice */}
              <div className="p-2.5 rounded-2xl bg-[#F4F7F4] border border-[#D8EADB] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#0A6E3B]/10 flex items-center justify-center text-[#0A6E3B]">
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-gray-400 block">
                      Bénéficiaire du paiement
                    </span>
                    <h5 className="font-bold text-xs text-[#081A10]">{restaurantName}</h5>
                  </div>
                </div>
                <span className="font-mono text-[11px] font-bold text-[#0A6E3B] bg-white px-2 py-1 rounded-lg border border-[#D8EADB]">
                  {recipientMerchantPhone}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="font-black text-[#081A10]">Choisissez votre mode de transfert :</span>
                <span className="text-[10px] font-bold text-[#0A6E3B] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  🔒 Paiement Direct
                </span>
              </div>

              {/* 1. Wave Sénégal (Redirection directe) */}
              <div
                onClick={() => setSelectedMethod('wave')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                  selectedMethod === 'wave'
                    ? 'border-[#1DC3EC] bg-cyan-50/70 ring-2 ring-[#1DC3EC]/30 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white border border-[#1DC3EC]/40 flex items-center justify-center p-1 shadow-xs shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/images/wave_civ_logo.jpeg" alt="Wave Sénégal" className="w-full h-full object-contain rounded-xl" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-black text-xs text-[#081A10]">Wave Sénégal</h4>
                        <span className="text-[8px] font-black uppercase bg-[#1DC3EC] text-white px-1.5 py-0.2 rounded-md">
                          Redirection Directe
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        Ouvre directement votre app Wave pour confirmer le virement vers <strong className="text-[#081A10]">{restaurantName}</strong>
                      </p>
                    </div>
                  </div>
                  {selectedMethod === 'wave' && (
                    <div className="w-6 h-6 rounded-full bg-[#1DC3EC] text-white flex items-center justify-center text-xs shrink-0 shadow-xs">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Orange Money Sénégal */}
              <div
                onClick={() => setSelectedMethod('orange_money')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                  selectedMethod === 'orange_money'
                    ? 'border-[#FF7824] bg-orange-50/70 ring-2 ring-[#FF7824]/30 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white border border-[#FF7824]/40 flex items-center justify-center p-1 shadow-xs shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/images/orange_ci.png" alt="Orange Money Sénégal" className="w-full h-full object-contain rounded-xl" />
                    </div>
                    <div>
                      <h4 className="font-black text-xs text-[#081A10]">Orange Money</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">Transfert immédiat au numéro Orange du restaurant</p>
                    </div>
                  </div>
                  {selectedMethod === 'orange_money' && (
                    <div className="w-6 h-6 rounded-full bg-[#FF7824] text-white flex items-center justify-center text-xs shrink-0 shadow-xs">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Carte Bancaire Visa / Mastercard */}
              <div
                onClick={() => setSelectedMethod('card')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                  selectedMethod === 'card'
                    ? 'border-[#0A6E3B] bg-emerald-50/70 ring-2 ring-[#0A6E3B]/30 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl brand-gradient flex items-center justify-center text-white shadow-xs shrink-0">
                      <CreditCard className="w-6 h-6 text-emerald-200" />
                    </div>
                    <div>
                      <h4 className="font-black text-xs text-[#081A10]">Carte Bancaire</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">Visa / Mastercard locales et internationales</p>
                    </div>
                  </div>
                  {selectedMethod === 'card' && (
                    <div className="w-6 h-6 rounded-full bg-[#0A6E3B] text-white flex items-center justify-center text-xs shrink-0 shadow-xs">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              </div>

              {/* 4. Espèces au livreur */}
              <div
                onClick={() => setSelectedMethod('cash')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                  selectedMethod === 'cash'
                    ? 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-500/30 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-xs shrink-0 font-black text-xl">
                      💵
                    </div>
                    <div>
                      <h4 className="font-black text-xs text-[#081A10]">Espèces au Livreur Tiak-Tiak</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">Réglez directement le livreur à son arrivée</p>
                    </div>
                  </div>
                  {selectedMethod === 'cash' && (
                    <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs shrink-0 shadow-xs">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              </div>

              {/* Recup total price bar */}
              <div className="p-3 bg-[#F4F7F4] rounded-2xl border border-[#D8EADB] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold block">Montant total à régler</span>
                  <span className="font-black text-sm text-[#0A6E3B]">{formatFCFA(totalAmount)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="py-2.5 px-4 rounded-xl brand-gradient text-white font-black text-xs flex items-center gap-1.5 shadow-md hover:brightness-105 active:scale-95 transition-all cursor-pointer"
                >
                  <span>Continuer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: DÉTAILS & REDIRECTION DIRECTE VERS L'APPLICATION DU COMPTE */}
          {step === 'details' && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              
              {/* --- CAS WAVE SÉNÉGAL (REDIRECTION DIRECTE VERS APP WAVE) --- */}
              {selectedMethod === 'wave' && (
                <div className="space-y-3.5">
                  <div className="p-4 rounded-3xl bg-[#E8F8FC] border border-[#1DC3EC]/40 text-center space-y-2">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white border border-[#1DC3EC]/40 flex items-center justify-center p-1.5 mx-auto shadow-md">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/images/wave_civ_logo.jpeg" alt="Wave" className="w-full h-full object-contain rounded-xl" />
                    </div>
                    <h4 className="font-black text-sm text-[#081A10]">Paiement Direct Wave</h4>
                    <p className="text-[11px] text-gray-600">
                      Vous allez être dirigé directement vers votre application <strong>Wave</strong> pour confirmer le transfert de <strong className="text-[#0A6E3B]">{formatFCFA(totalAmount)}</strong> sur le compte du restaurant.
                    </p>
                  </div>

                  {/* Merchant Details Box */}
                  <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-2xs space-y-2 text-xs">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                      <span className="text-gray-500 font-bold">Restaurant destinataire :</span>
                      <span className="font-black text-[#081A10]">{restaurantName}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                      <span className="text-gray-500 font-bold">Numéro Wave du restaurant :</span>
                      <span className="font-mono font-black text-[#1DC3EC] text-xs">{recipientMerchantPhone}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 font-bold">Montant exact :</span>
                      <span className="font-black text-sm text-[#0A6E3B]">{formatFCFA(totalAmount)}</span>
                    </div>
                  </div>

                  {/* Big Wave Redirection Action Button */}
                  <button
                    type="button"
                    onClick={handleDirectWaveRedirect}
                    className="w-full py-4 rounded-2xl bg-[#1DC3EC] hover:bg-[#18b0d6] text-white font-black text-xs shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
                  >
                    <span>🌊 Ouvrir mon application Wave</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* --- CAS ORANGE MONEY --- */}
              {selectedMethod === 'orange_money' && (
                <div className="space-y-3.5">
                  <div className="p-4 rounded-3xl bg-[#FFF4ED] border border-[#FF7824]/40 text-center space-y-2">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white border border-[#FF7824]/40 flex items-center justify-center p-1.5 mx-auto shadow-md">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/images/orange_ci.png" alt="Orange Money" className="w-full h-full object-contain rounded-xl" />
                    </div>
                    <h4 className="font-black text-sm text-[#081A10]">Paiement Orange Money</h4>
                    <p className="text-[11px] text-gray-600">
                      Transfert direct de <strong className="text-[#0A6E3B]">{formatFCFA(totalAmount)}</strong> vers le numéro Orange Money du restaurant.
                    </p>
                  </div>

                  <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-2xs space-y-2 text-xs">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                      <span className="text-gray-500 font-bold">Restaurant destinataire :</span>
                      <span className="font-black text-[#081A10]">{restaurantName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 font-bold">Numéro OM du restaurant :</span>
                      <span className="font-mono font-black text-[#FF7824]">{recipientMerchantPhone}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleDirectOrangeMoneyDial}
                    className="w-full py-4 rounded-2xl bg-[#FF7824] hover:bg-[#eb6d1c] text-white font-black text-xs shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
                  >
                    <span>📱 Composer le code Orange Money (#144#)</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* --- CAS CARTE BANCAIRE --- */}
              {selectedMethod === 'card' && (
                <div className="space-y-3">
                  {/* Visual 3D Styled Credit Card */}
                  <div className="h-44 w-full rounded-2xl brand-gradient p-4 text-white flex flex-col justify-between shadow-xl border border-emerald-400/30 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
                    
                    <div className="flex items-center justify-between relative z-10">
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-200">
                        Thiob Express Card
                      </span>
                      <div className="flex items-center gap-1">
                        <div className="w-5 h-5 rounded-full bg-rose-500/80" />
                        <div className="w-5 h-5 rounded-full bg-amber-400/80 -ml-2.5" />
                      </div>
                    </div>

                    <div className="font-mono text-sm tracking-widest font-black text-center text-white/95 my-auto">
                      {cardNumber || '•••• •••• •••• ••••'}
                    </div>

                    <div className="flex items-center justify-between text-[10px] relative z-10">
                      <div>
                        <span className="text-white/60 block text-[8px] font-bold uppercase">Titulaire</span>
                        <span className="font-black uppercase tracking-wider">{cardHolder || 'NOM ET PRENOM'}</span>
                      </div>
                      <div>
                        <span className="text-white/60 block text-[8px] font-bold uppercase">Expire</span>
                        <span className="font-black tracking-wider">{cardExpiry || 'MM/AA'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Form fields for card */}
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-600">Numéro de carte *</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => handleCardNumberChange(e.target.value)}
                        placeholder="4234 5678 9012 3456"
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold text-[#081A10] shadow-inner"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-600">Date d'expiration *</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => handleExpiryChange(e.target.value)}
                          placeholder="MM/AA"
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold text-[#081A10] shadow-inner text-center"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-600">CVV / CVC *</label>
                        <input
                          type="password"
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                          placeholder="892"
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold text-[#081A10] shadow-inner text-center"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleFinalizeConfirmedPayment}
                      className="w-full py-3.5 rounded-2xl brand-gradient text-white font-black text-xs shadow-xl shadow-emerald-950/20 flex items-center justify-between px-5 hover:brightness-105 active:scale-95 transition-all cursor-pointer mt-2"
                    >
                      <span>Payer {formatFCFA(totalAmount)}</span>
                      <span>🔒 3D Secure ➔</span>
                    </button>
                  </div>
                </div>
              )}

              {/* --- CAS ESPÈCES AU LIVREUR --- */}
              {selectedMethod === 'cash' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-3xl bg-amber-50 border border-amber-200 text-center space-y-1">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center mx-auto text-2xl shadow-md mb-1">
                      💵
                    </div>
                    <h4 className="font-black text-sm text-[#081A10]">Paiement en Espèces</h4>
                    <p className="text-[11px] text-gray-600">
                      Montant à remettre au livreur : <strong className="text-[#0A6E3B]">{formatFCFA(totalAmount)}</strong>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-[#081A10] block">
                      Avez-vous l'appoint ou quel billet allez-vous donner au livreur ?
                    </label>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setCashType('exact')}
                        className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                          cashType === 'exact'
                            ? 'bg-[#0A6E3B] text-white border-[#0A6E3B] shadow-xs'
                            : 'bg-gray-50 border-gray-200 text-gray-700'
                        }`}
                      >
                        ✓ Appoint ({formatFCFA(totalAmount)})
                      </button>

                      <button
                        type="button"
                        onClick={() => setCashType('5000')}
                        className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                          cashType === '5000'
                            ? 'bg-[#0A6E3B] text-white border-[#0A6E3B] shadow-xs'
                            : 'bg-gray-50 border-gray-200 text-gray-700'
                        }`}
                      >
                        Billet de 5 000 F
                      </button>

                      <button
                        type="button"
                        onClick={() => setCashType('10000')}
                        className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                          cashType === '10000'
                            ? 'bg-[#0A6E3B] text-white border-[#0A6E3B] shadow-xs'
                            : 'bg-gray-50 border-gray-200 text-gray-700'
                        }`}
                      >
                        Billet de 10 000 F
                      </button>

                      <button
                        type="button"
                        onClick={() => setCashType('20000')}
                        className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                          cashType === '20000'
                            ? 'bg-[#0A6E3B] text-white border-[#0A6E3B] shadow-xs'
                            : 'bg-gray-50 border-gray-200 text-gray-700'
                        }`}
                      >
                        Billet de 20 000 F
                      </button>
                    </div>

                    <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-gray-500 font-bold block">Rendu de monnaie à préparer :</span>
                        <span className="font-black text-sm text-[#0A6E3B]">
                          {cashChange > 0 ? formatFCFA(cashChange) : 'Aucun (Appoint exact)'}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-gray-500 bg-white px-2 py-1 rounded-lg border border-emerald-100">
                        Transmis au livreur
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleFinalizeConfirmedPayment}
                      className="w-full py-3.5 rounded-2xl brand-gradient text-white font-black text-xs shadow-xl shadow-emerald-950/20 flex items-center justify-between px-5 hover:brightness-105 active:scale-95 transition-all cursor-pointer mt-2"
                    >
                      <span>Confirmer la commande en Espèces</span>
                      <span>Commander ➔</span>
                    </button>
                  </div>
                </div>
              )}

            </motion.div>
          )}

          {/* STEP 3: EN ATTENTE DE CONFIRMATION DU PAIEMENT SUR WAVE / OM */}
          {step === 'waiting_wave_app' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-4 space-y-4 text-center"
            >
              <div className="p-4 rounded-3xl bg-[#E8F8FC] border border-[#1DC3EC]/40 space-y-2">
                <div className="w-16 h-16 rounded-3xl overflow-hidden bg-white border-2 border-[#1DC3EC] flex items-center justify-center p-2 mx-auto shadow-lg animate-bounce">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/wave_civ_logo.jpeg" alt="Wave" className="w-full h-full object-contain rounded-2xl" />
                </div>
                <h4 className="font-black text-sm text-[#081A10]">Paiement en cours sur Wave</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Confirmez le transfert de <strong className="text-[#0A6E3B]">{formatFCFA(totalAmount)}</strong> sur votre application Wave vers le numéro du restaurant :
                </p>
                <div className="inline-block bg-white px-3 py-1.5 rounded-xl border border-[#1DC3EC]/30 font-mono font-black text-xs text-[#1DC3EC]">
                  {recipientMerchantPhone} ({restaurantName})
                </div>
              </div>

              {/* Status and Action Confirmation */}
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={handleFinalizeConfirmedPayment}
                  className="w-full py-3.5 rounded-2xl brand-gradient text-white font-black text-xs shadow-xl shadow-emerald-950/20 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4 text-emerald-200" />
                  <span>✓ J'ai validé le paiement sur Wave</span>
                </button>

                <button
                  type="button"
                  onClick={handleDirectWaveRedirect}
                  className="w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Réouvrir l'application Wave</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: ANIMATION DE TRAITEMENT SÉCURISÉ */}
          {step === 'processing' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 flex flex-col items-center justify-center text-center space-y-4"
            >
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-emerald-200 border-t-[#0A6E3B] animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-[#0A6E3B]" />
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-black text-[#081A10]">Traitement du Paiement</h4>
                <p className="text-xs text-gray-500 font-medium">{processingStepText}</p>
              </div>

              <div className="w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: '10%' }}
                  animate={{ width: '95%' }}
                  transition={{ duration: 2.2, ease: 'easeInOut' }}
                  className="h-full brand-gradient"
                />
              </div>
            </motion.div>
          )}

          {/* STEP 5: REÇU NUMÉRIQUE OFFICIEL THIOB EXPRESS */}
          {step === 'receipt' && completedTransaction && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3.5"
            >
              {/* Receipt Header Badge */}
              <div className="text-center py-2 space-y-1">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#0A6E3B] flex items-center justify-center mx-auto text-xl shadow-xs">
                  ✓
                </div>
                <h4 className="text-base font-black text-[#081A10]">Paiement Confirmé !</h4>
                <p className="text-xs text-gray-500">
                  Votre commande est transmise en cuisine chez <strong className="text-[#081A10]">{completedTransaction.restaurantName}</strong>.
                </p>
              </div>

              {/* Official Receipt Card */}
              <div className="p-4 rounded-3xl bg-gray-50 border border-gray-200 space-y-3 shadow-2xs relative overflow-hidden">
                
                {/* Top Strip */}
                <div className="flex items-center justify-between border-b border-gray-200 pb-2.5 text-xs">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-[#0A6E3B] block">
                      Quittance Officielle
                    </span>
                    <span className="font-mono font-black text-sm text-[#081A10]">
                      {completedTransaction.orderNumber}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-bold text-gray-400 block">Réf Transaction</span>
                    <span className="font-mono text-[10px] font-bold text-[#FF7824]">
                      {completedTransaction.reference}
                    </span>
                  </div>
                </div>

                {/* Items Summary */}
                <div className="space-y-1.5 text-xs">
                  <span className="text-[10px] font-black uppercase text-gray-400 block">Détail des plats :</span>
                  {cartItems.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-gray-700 font-medium">
                        {it.quantity}x {it.name}
                      </span>
                      <span className="font-bold text-[#081A10]">{formatFCFA(it.price * it.quantity)}</span>
                    </div>
                  ))}
                </div>

                {/* Totals & Taxes */}
                <div className="pt-2 border-t border-gray-200 space-y-1 text-xs">
                  <div className="flex justify-between text-gray-500 text-[11px]">
                    <span>Frais de livraison Tiak-Tiak</span>
                    <span>{formatFCFA(deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500 text-[11px]">
                    <span>Frais de service & plateforme</span>
                    <span>{formatFCFA(platformFee)}</span>
                  </div>
                  <div className="flex justify-between text-[#081A10] font-black text-sm pt-1 border-t border-gray-200">
                    <span>Total Réglé</span>
                    <span className="text-[#0A6E3B]">{formatFCFA(completedTransaction.amount)}</span>
                  </div>
                </div>

                {/* Payment recipient summary info */}
                <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-[11px]">
                  <span className="text-gray-500 font-bold">Bénéficiaire crédité :</span>
                  <span className="font-black text-[#0A6E3B]">
                    {restaurantName} ({recipientMerchantPhone})
                  </span>
                </div>
              </div>

              {/* Action Buttons: WhatsApp Share, Tracking & Close */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="w-full py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Envoyer la confirmation sur WhatsApp</span>
                </button>

                {onOpenTracking && createdOrder && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenTracking(createdOrder);
                    }}
                    className="w-full py-3 rounded-2xl brand-gradient text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20 active:scale-95 transition-all cursor-pointer"
                  >
                    <span>🛵 Suivre ma livraison en direct</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

            </motion.div>
          )}

        </div>

      </motion.div>
    </div>
  );
}
