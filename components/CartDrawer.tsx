'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { formatFCFA } from '@/lib/utils';
import { PaymentMethod } from '@/lib/types';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  MapPin, 
  Phone, 
  User, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { 
    cart, 
    removeFromCart, 
    updateCartQuantity, 
    clearCart, 
    cartRestaurant, 
    cartTotal, 
    cartCount,
    placeOrder 
  } = useApp();

  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [clientName, setClientName] = useState('Moussa Diop');
  const [clientPhone, setClientPhone] = useState('+221 77 654 32 10');
  const [neighborhood, setNeighborhood] = useState('Almadies');
  const [street, setStreet] = useState('Route des Almadies, près de la pointe');
  const [details, setDetails] = useState('Villa N° 12, portail vert');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('wave');
  const [placedOrderNumber, setPlacedOrderNumber] = useState('');

  if (!isOpen) return null;

  const deliveryFee = cartRestaurant?.deliveryFee || 1500;
  const platformFee = 500;
  const grandTotal = cartTotal + deliveryFee + platformFee;

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const order = placeOrder({
      clientName,
      clientPhone,
      neighborhood,
      street,
      details,
      paymentMethod,
    });
    setPlacedOrderNumber(order.orderNumber);
    setStep('success');

    // Trigger confetti celebration
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#07431E', '#008235', '#FA8038', '#F5B738'],
      });
    } catch (err) {
      console.log('Confetti error:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-5 border-b border-[#E2ECE5] flex items-center justify-between bg-[#F7FAF7]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#EBF7EE] text-[#008235] flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-[#07431E] text-base">
                  {step === 'cart' && `Mon Panier (${cartCount})`}
                  {step === 'checkout' && 'Livraison & Paiement'}
                  {step === 'success' && 'Commande Confirmée !'}
                </h3>
                {cartRestaurant && step === 'cart' && (
                  <p className="text-xs text-[#576A5E] truncate max-w-[220px]">
                    {cartRestaurant.name}
                  </p>
                )}
              </div>
            </div>

            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center text-gray-500 border border-gray-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto p-5">
            {step === 'cart' && (
              <>
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6">
                    <div className="w-20 h-20 rounded-full bg-[#EBF7EE] flex items-center justify-center text-[#008235] mb-4">
                      <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
                    </div>
                    <h4 className="font-bold text-[#07431E] text-lg">Votre panier est vide</h4>
                    <p className="text-sm text-[#576A5E] mt-2 mb-6">
                      Découvrez les meilleurs plats de Dakar et commencez votre régal dès maintenant !
                    </p>
                    <button
                      onClick={onClose}
                      className="px-6 py-2.5 rounded-full brand-gradient text-white text-sm font-bold shadow-md hover:opacity-95"
                    >
                      Explorer les restaurants
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((cartItem) => (
                      <div 
                        key={cartItem.item.id}
                        className="p-3.5 rounded-2xl bg-[#F7FAF7] border border-[#E2ECE5] flex items-center justify-between gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <h5 className="font-bold text-sm text-[#0D1C12] truncate">
                            {cartItem.item.name}
                          </h5>
                          <p className="text-xs font-semibold text-[#FA8038] mt-0.5">
                            {formatFCFA(cartItem.item.price)}
                          </p>
                          {cartItem.notes && (
                            <p className="text-[11px] text-gray-500 italic mt-0.5 truncate">
                              Note : {cartItem.notes}
                            </p>
                          )}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-xl border border-[#E2ECE5]">
                          <button
                            onClick={() => updateCartQuantity(cartItem.item.id, -1)}
                            className="w-6 h-6 rounded-md hover:bg-gray-100 flex items-center justify-center text-gray-600"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold text-[#07431E] w-4 text-center">
                            {cartItem.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(cartItem.item.id, 1)}
                            className="w-6 h-6 rounded-md hover:bg-gray-100 flex items-center justify-center text-gray-600"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(cartItem.item.id)}
                          className="text-gray-400 hover:text-rose-500 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                    <div className="pt-4 border-t border-[#E2ECE5] space-y-2 text-xs">
                      <div className="flex justify-between text-gray-600">
                        <span>Sous-total plats</span>
                        <span>{formatFCFA(cartTotal)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Frais de livraison ({cartRestaurant?.neighborhood})</span>
                        <span>{formatFCFA(deliveryFee)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Frais de service plateforme</span>
                        <span>{formatFCFA(platformFee)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-extrabold text-[#07431E] pt-2 border-t border-[#E2ECE5]">
                        <span>Total à payer</span>
                        <span className="text-[#FA8038]">{formatFCFA(grandTotal)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {step === 'checkout' && (
              <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                {/* Contact Info */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#07431E]">
                    1. Vos Coordonnées
                  </h4>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Nom complet</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-[#F7FAF7] border border-[#E2ECE5] rounded-xl text-xs focus:bg-white focus:border-[#008235] focus:outline-hidden"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Téléphone (Sénégal)</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        required
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-[#F7FAF7] border border-[#E2ECE5] rounded-xl text-xs focus:bg-white focus:border-[#008235] focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#07431E]">
                    2. Adresse de Livraison à Dakar
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Quartier</label>
                      <input
                        type="text"
                        required
                        value={neighborhood}
                        onChange={(e) => setNeighborhood(e.target.value)}
                        className="w-full px-3 py-2 bg-[#F7FAF7] border border-[#E2ECE5] rounded-xl text-xs focus:bg-white focus:border-[#008235] focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Rue / Repère</label>
                      <input
                        type="text"
                        required
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        className="w-full px-3 py-2 bg-[#F7FAF7] border border-[#E2ECE5] rounded-xl text-xs focus:bg-white focus:border-[#008235] focus:outline-hidden"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Détails (Villa, Étage, Porte)</label>
                    <input
                      type="text"
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      placeholder="Ex: 2ème étage à gauche, porte bleue"
                      className="w-full px-3 py-2 bg-[#F7FAF7] border border-[#E2ECE5] rounded-xl text-xs focus:bg-white focus:border-[#008235] focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#07431E]">
                    3. Mode de Paiement
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div
                      onClick={() => setPaymentMethod('wave')}
                      className={`cursor-pointer p-3 rounded-xl border flex flex-col items-center text-center transition-all ${
                        paymentMethod === 'wave'
                          ? 'border-[#3FB9F7] bg-[#3FB9F7]/10 ring-2 ring-[#3FB9F7]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-lg">🌊</span>
                      <span className="font-bold text-xs text-[#0D1C12] mt-1">Wave</span>
                      <span className="text-[10px] text-gray-500">Sans frais</span>
                    </div>

                    <div
                      onClick={() => setPaymentMethod('orange_money')}
                      className={`cursor-pointer p-3 rounded-xl border flex flex-col items-center text-center transition-all ${
                        paymentMethod === 'orange_money'
                          ? 'border-[#FF7900] bg-[#FF7900]/10 ring-2 ring-[#FF7900]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-lg">🟠</span>
                      <span className="font-bold text-xs text-[#0D1C12] mt-1">Orange Money</span>
                      <span className="text-[10px] text-gray-500">Code secret OM</span>
                    </div>

                    <div
                      onClick={() => setPaymentMethod('card')}
                      className={`cursor-pointer p-3 rounded-xl border flex flex-col items-center text-center transition-all ${
                        paymentMethod === 'card'
                          ? 'border-[#008235] bg-[#008235]/10 ring-2 ring-[#008235]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-lg">💳</span>
                      <span className="font-bold text-xs text-[#0D1C12] mt-1">Carte Bancaire</span>
                      <span className="text-[10px] text-gray-500">Visa / Mastercard</span>
                    </div>

                    <div
                      onClick={() => setPaymentMethod('cash')}
                      className={`cursor-pointer p-3 rounded-xl border flex flex-col items-center text-center transition-all ${
                        paymentMethod === 'cash'
                          ? 'border-[#07431E] bg-[#07431E]/10 ring-2 ring-[#07431E]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-lg">💵</span>
                      <span className="font-bold text-xs text-[#0D1C12] mt-1">À la livraison</span>
                      <span className="text-[10px] text-gray-500">Espèces au coursier</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E2ECE5]">
                  <div className="flex justify-between text-sm font-extrabold text-[#07431E] mb-3">
                    <span>Total à régler</span>
                    <span className="text-[#FA8038]">{formatFCFA(grandTotal)}</span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl brand-gradient text-white text-sm font-bold shadow-lg hover:opacity-95 flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Payer & Valider la commande</span>
                  </button>
                </div>
              </form>
            )}

            {step === 'success' && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#EBF7EE] text-[#008235] flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h4 className="text-xl font-extrabold text-[#07431E]">
                    Commande Reçue !
                  </h4>
                  <p className="text-xs font-bold text-[#FA8038] mt-1">
                    N° {placedOrderNumber}
                  </p>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Le restaurant <strong>{cartRestaurant?.name}</strong> prépare vos délices. Le livreur sera notifié dès que votre commande est prête.
                </p>
                <div className="w-full pt-4 space-y-2">
                  <button
                    onClick={() => {
                      onClose();
                      setStep('cart');
                    }}
                    className="w-full py-3 rounded-xl brand-gradient text-white text-xs font-bold shadow-md hover:opacity-95"
                  >
                    Suivre ma commande en direct
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      setStep('cart');
                    }}
                    className="w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold"
                  >
                    Retour à l'accueil
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions (Only on cart step) */}
          {step === 'cart' && cart.length > 0 && (
            <div className="p-5 border-t border-[#E2ECE5] bg-[#F7FAF7]">
              <button
                onClick={() => setStep('checkout')}
                className="w-full py-3.5 rounded-2xl brand-gradient-orange text-white text-sm font-extrabold shadow-lg hover:opacity-95 flex items-center justify-center gap-2 active:scale-98 transition-all"
              >
                <span>Commander ({formatFCFA(grandTotal)})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
