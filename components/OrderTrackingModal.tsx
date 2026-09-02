'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/lib/store';
import { formatFCFA, getStatusBadge } from '@/lib/utils';
import { OrderStatus } from '@/lib/types';
import { DAKAR_GEO_PRESETS, DAKAR_DEFAULT_COORDS } from '@/lib/geolocation';
import CourierLiveRadar from './map/CourierLiveRadar';
import { 
  X, 
  MapPin, 
  Phone, 
  Bike, 
  Clock, 
  CheckCircle2, 
  ChefHat, 
  Bell, 
  Navigation 
} from 'lucide-react';

export default function OrderTrackingModal() {
  const { activeTrackingOrder, setActiveTrackingOrder, restaurants, couriers } = useApp();

  const steps: { status: OrderStatus; label: string; icon: React.ReactNode; desc: string }[] = [
    { 
      status: 'pending', 
      label: 'Commande Reçue', 
      icon: <Bell className="w-4 h-4" />, 
      desc: 'Transmise au restaurant' 
    },
    { 
      status: 'preparing', 
      label: 'En Cuisine', 
      icon: <ChefHat className="w-4 h-4" />, 
      desc: 'Le chef prépare vos plats' 
    },
    { 
      status: 'ready_for_pickup', 
      label: 'Prête pour coursier', 
      icon: <Bike className="w-4 h-4" />, 
      desc: 'Attente du livreur à la porte' 
    },
    { 
      status: 'in_transit', 
      label: 'En Cours de Livraison', 
      icon: <Navigation className="w-4 h-4 text-[#008235]" />, 
      desc: `En route vers ${activeTrackingOrder?.deliveryAddress.neighborhood}` 
    },
    { 
      status: 'delivered', 
      label: 'Livrée', 
      icon: <CheckCircle2 className="w-4 h-4 text-[#07431E]" />, 
      desc: 'Bon appétit !' 
    },
  ];

  if (!activeTrackingOrder) return null;

  const getStepIndex = (st: OrderStatus): number => {
    switch (st) {
      case 'pending': return 0;
      case 'accepted': return 0;
      case 'preparing': return 1;
      case 'ready_for_pickup': return 2;
      case 'in_transit': return 3;
      case 'delivered': return 4;
      default: return 0;
    }
  };

  const currentStepIdx = getStepIndex(activeTrackingOrder.status);
  const badge = getStatusBadge(activeTrackingOrder.status);

  // Origin & destination coordinates with exact GPS accuracy
  const matchedResto = restaurants.find((r) => r.id === activeTrackingOrder.restaurantId);
  const matchedCourier = couriers.find((c) => c.id === activeTrackingOrder.courierId) || couriers[0];

  const restaurantPos = activeTrackingOrder.pickupCoords || matchedResto?.coordinates || DAKAR_GEO_PRESETS[matchedResto?.neighborhood || 'Ngor'] || DAKAR_DEFAULT_COORDS;
  const destinationPos = activeTrackingOrder.deliveryCoords || DAKAR_GEO_PRESETS[activeTrackingOrder.deliveryAddress.neighborhood] || DAKAR_GEO_PRESETS['Plateau'] || DAKAR_DEFAULT_COORDS;
  const courierPos = activeTrackingOrder.courierCoords || matchedCourier?.coordinates || DAKAR_GEO_PRESETS['Mermoz'] || DAKAR_DEFAULT_COORDS;


  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setActiveTrackingOrder(null)}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs"
        />

        <motion.div 
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          className="relative z-10 bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="brand-gradient p-6 text-white flex items-center justify-between relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white font-bold text-xs">
                  Commande {activeTrackingOrder.orderNumber}
                </span>
                <span className="text-xs text-white/80">
                  {activeTrackingOrder.createdAt}
                </span>
              </div>
              <h3 className="text-2xl font-black tracking-tight">
                Suivi GPS de Livraison en Direct
              </h3>
              <p className="text-xs text-white/80 mt-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#FA8038]" />
                <span>Destination : {activeTrackingOrder.deliveryAddress.street}, {activeTrackingOrder.deliveryAddress.neighborhood}</span>
              </p>
            </div>

            <motion.button
              whileHover={{ rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setActiveTrackingOrder(null)}
              className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors relative z-10"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Status Timeline & Live Radar Map */}
          <div className="p-6 overflow-y-auto space-y-6">
            
            {/* LIVE RADAR MAP DISPLAY */}
            <CourierLiveRadar
              courierPos={courierPos}
              restaurantPos={restaurantPos}
              destinationPos={destinationPos}
              courierName={activeTrackingOrder.courierName || matchedCourier?.name || 'Ibrahima Fall'}
              restaurantName={activeTrackingOrder.restaurantName}
              destinationAddress={`${activeTrackingOrder.deliveryAddress.street}, ${activeTrackingOrder.deliveryAddress.neighborhood}`}
              orderNumber={activeTrackingOrder.orderNumber}
              isSimulatingLiveMove={activeTrackingOrder.status === 'in_transit'}
            />

            {/* Estimated Time Card */}
            <div className="p-4 rounded-2xl bg-[#EBF7EE] border border-[#008235]/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#008235] text-white flex items-center justify-center shadow-md">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#576A5E] uppercase tracking-wider">
                    Temps d'arrivée estimé
                  </p>
                  <h4 className="text-lg font-black text-[#07431E]">
                    {activeTrackingOrder.status === 'delivered' ? 'Commande Livrée' : `${activeTrackingOrder.estimatedDeliveryTime || '20-30 min'}`}
                  </h4>
                </div>
              </div>

              <div className={`px-3 py-1.5 rounded-full border text-xs font-bold ${badge.bg} ${badge.text} ${badge.border}`}>
                {badge.label}
              </div>
            </div>

            {/* Stepper Progression */}
            <div className="relative pl-4 space-y-6 before:absolute before:left-7 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#E2ECE5]">
              {steps.map((s, idx) => {
                const isPassed = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;

                return (
                  <div key={s.status} className="relative flex items-start gap-4">
                    <motion.div
                      animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold z-10 transition-all ${
                        isCurrent
                          ? 'brand-gradient-orange text-white ring-4 ring-[#FA8038]/20 shadow-md'
                          : isPassed
                          ? 'bg-[#008235] text-white'
                          : 'bg-white border-2 border-gray-300 text-gray-400'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </motion.div>

                    <div className="flex-1 pt-0.5">
                      <div className="flex items-center justify-between">
                        <h5 className={`text-sm font-bold ${isCurrent ? 'text-[#FA8038]' : isPassed ? 'text-[#07431E]' : 'text-gray-400'}`}>
                          {s.label}
                        </h5>
                        {isCurrent && (
                          <span className="text-[11px] font-bold text-[#008235] bg-[#EBF7EE] px-2 py-0.5 rounded-full">
                            En cours
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Courier Card */}
            <div className="p-4 rounded-2xl bg-[#F7FAF7] border border-[#E2ECE5] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full brand-gradient text-white flex items-center justify-center font-black text-sm">
                  🛵
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase text-[#008235] tracking-wider">
                    Votre Livreur Partenaire
                  </span>
                  <h5 className="font-bold text-sm text-[#07431E]">
                    {activeTrackingOrder.courierName || matchedCourier?.name || 'Ibrahima Fall (Moto Dakar)'}
                  </h5>
                  <p className="text-xs text-gray-500">
                    {activeTrackingOrder.courierPhone || matchedCourier?.phone || '+221 70 812 34 56'}
                  </p>
                </div>
              </div>

              <a
                href={`tel:${activeTrackingOrder.courierPhone || matchedCourier?.phone || '+221708123456'}`}
                className="px-3.5 py-2 rounded-xl bg-white border border-[#008235]/30 text-[#008235] hover:bg-[#008235] hover:text-white transition-colors text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Appeler</span>
              </a>
            </div>

            {/* Ordered Items Summary */}
            <div className="space-y-2 pt-2">
              <h5 className="font-bold text-xs uppercase tracking-wider text-gray-500">
                Détail des plats commandés
              </h5>
              <div className="divide-y divide-[#E2ECE5] bg-[#F7FAF7] p-3 rounded-2xl border border-[#E2ECE5]">
                {activeTrackingOrder.items.map((it, idx) => (
                  <div key={idx} className="py-2 flex justify-between text-xs first:pt-0 last:pb-0">
                    <span className="text-[#0D1C12] font-medium">
                      {it.quantity}x {it.name}
                    </span>
                    <span className="font-bold text-[#07431E]">
                      {formatFCFA(it.price * it.quantity)}
                    </span>
                  </div>
                ))}
                <div className="pt-2 flex justify-between text-xs font-extrabold text-[#07431E]">
                  <span>Total réglé ({activeTrackingOrder.paymentMethod.toUpperCase()})</span>
                  <span className="text-[#FA8038]">{formatFCFA(activeTrackingOrder.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[#E2ECE5] bg-[#F7FAF7] flex justify-end">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveTrackingOrder(null)}
              className="px-6 py-2.5 rounded-full brand-gradient text-white text-xs font-bold shadow-md"
            >
              Fermer le suivi
            </motion.button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
