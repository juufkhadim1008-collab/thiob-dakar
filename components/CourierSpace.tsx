'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/lib/store';
import { formatFCFA } from '@/lib/utils';
import { DAKAR_GEO_PRESETS, DAKAR_DEFAULT_COORDS } from '@/lib/geolocation';
import CourierLiveRadar from './map/CourierLiveRadar';
import { 
  Bike, 
  MapPin, 
  Navigation, 
  Phone, 
  CheckCircle2, 
  Compass,
  Power,
  ShieldCheck,
  Radio,
  Clock
} from 'lucide-react';

export default function CourierSpace() {
  const { 
    couriers, 
    orders, 
    toggleCourierOnline, 
    setCourierStatus,
    updateCourierLocation,
    acceptDeliveryMission, 
    completeDeliveryMission 
  } = useApp();

  const currentCourier = couriers[0]; // Ibrahima Fall
  const isOnline = currentCourier.isOnline;
  const courierStatus = currentCourier.status || (isOnline ? 'AVAILABLE' : 'OFFLINE');

  const activeOrder = orders.find((o) => o.id === currentCourier.activeOrderId);

  const availableOrders = orders.filter(
    (o) => (o.status === 'ready_for_pickup' || o.status === 'preparing') && !o.courierId
  );

  // Active courier coordinates
  const courierCoords = currentCourier.coordinates || DAKAR_GEO_PRESETS[currentCourier.currentNeighborhood] || DAKAR_DEFAULT_COORDS;

  // Background GPS updater when online (throttled)
  useEffect(() => {
    if (!isOnline) return;

    // Emulate or track GPS position updates
    const intervalTime = activeOrder ? 6000 : 18000; // 6s in delivery, 18s if available
    const interval = setInterval(() => {
      // Micro jitter for live movement simulation if real GPS is not moving
      const jitterLat = (Math.random() - 0.5) * 0.0008;
      const jitterLng = (Math.random() - 0.5) * 0.0008;
      updateCourierLocation(
        currentCourier.id, 
        { lat: courierCoords.lat + jitterLat, lng: courierCoords.lng + jitterLng },
        activeOrder ? 'BUSY' : 'AVAILABLE'
      );
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isOnline, activeOrder, courierCoords.lat, courierCoords.lng, currentCourier.id]);

  const handleZoneChange = (zoneKey: string) => {
    const preset = DAKAR_GEO_PRESETS[zoneKey];
    if (preset) {
      updateCourierLocation(currentCourier.id, { lat: preset.lat, lng: preset.lng }, courierStatus);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Courier Profile Header */}
      <motion.div 
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-6 border border-[#E2ECE5] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl brand-gradient text-white flex items-center justify-center text-3xl shadow-md">
            🛵
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                courierStatus === 'BUSY'
                  ? 'bg-rose-100 text-rose-800'
                  : isOnline
                  ? 'bg-[#EBF7EE] text-[#008235]'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {courierStatus === 'BUSY' ? '🚨 En Livraison Active' : isOnline ? '🟢 En Ligne (Disponible)' : '⚫ Hors Service'}
              </span>
              <span className="text-xs font-bold text-gray-500">
                Moto Jakarta ({currentCourier.plateNumber})
              </span>
            </div>
            <h1 className="text-2xl font-black text-[#07431E] mt-1">
              {currentCourier.name}
            </h1>
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-[#FA8038]" />
              <span>Zone GPS active : {currentCourier.currentNeighborhood} & Presqu'île de Dakar</span>
            </p>
          </div>
        </div>

        {/* Online/Offline Toggle Button */}
        <div className="flex flex-col items-end gap-1.5">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => toggleCourierOnline(currentCourier.id)}
            className={`px-5 py-3 rounded-2xl font-extrabold text-xs flex items-center gap-2 shadow-md transition-all ${
              isOnline
                ? 'bg-[#008235] text-white ring-4 ring-[#008235]/20'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-white animate-ping' : 'bg-gray-400'}`}></span>
            <span>{isOnline ? '🟢 EN LIGNE (Prêt à livrer)' : '⚫ HORS SERVICE'}</span>
          </motion.button>
          
          <span className="text-[10px] text-gray-400 font-semibold">
            {isOnline ? 'Fréquence GPS optimisée (15s/5s)' : 'Suivi GPS désactivé'}
          </span>
        </div>
      </motion.div>

      {/* Quick Zone Switcher */}
      <div className="bg-white p-4 rounded-3xl border border-[#E2ECE5] shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-[#008235]" />
            <span>Position de départ & Zone de patrouille Dakar :</span>
          </span>
          <span className="text-[11px] font-mono text-[#008235] font-bold">
            {courierCoords.lat.toFixed(4)}, {courierCoords.lng.toFixed(4)}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {['Almadies', 'Ngor', 'Plateau', 'Mermoz', 'Point E', 'Yoff', 'Ouakam', 'Pikine'].map((zone) => (
            <button
              key={zone}
              onClick={() => handleZoneChange(zone)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                currentCourier.currentNeighborhood === zone
                  ? 'bg-[#008235] text-white shadow-xs'
                  : 'bg-[#F0F5F2] text-[#07431E] hover:bg-[#E2ECE5]'
              }`}
            >
              📍 {zone}
            </button>
          ))}
        </div>
      </div>

      {/* Courier Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div whileHover={{ y: -3 }} className="bg-white p-4 rounded-3xl border border-[#E2ECE5] shadow-xs text-center">
          <span className="text-[11px] font-bold uppercase text-gray-500">Gains du Jour</span>
          <h3 className="text-xl sm:text-2xl font-black text-[#008235] mt-1">
            {formatFCFA(currentCourier.todayEarnings)}
          </h3>
          <span className="text-[10px] text-gray-400">Paiement Wave direct</span>
        </motion.div>

        <motion.div whileHover={{ y: -3 }} className="bg-white p-4 rounded-3xl border border-[#E2ECE5] shadow-xs text-center">
          <span className="text-[11px] font-bold uppercase text-gray-500">Courses Réussies</span>
          <h3 className="text-xl sm:text-2xl font-black text-[#07431E] mt-1">
            {currentCourier.completedDeliveries}
          </h3>
          <span className="text-[10px] text-gray-400">Total historique</span>
        </motion.div>

        <motion.div whileHover={{ y: -3 }} className="bg-white p-4 rounded-3xl border border-[#E2ECE5] shadow-xs text-center">
          <span className="text-[11px] font-bold uppercase text-gray-500">Note Qualité</span>
          <h3 className="text-xl sm:text-2xl font-black text-[#FA8038] mt-1">
            ⭐ {currentCourier.rating}
          </h3>
          <span className="text-[10px] text-gray-400">Top Livreur Dakar</span>
        </motion.div>
      </div>

      {/* ACTIVE MISSION CARD WITH LIVE RADAR */}
      <AnimatePresence>
        {activeOrder && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl border-2 border-[#008235] p-6 shadow-xl space-y-5 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 px-4 py-1 bg-[#008235] text-white text-[11px] font-black rounded-bl-2xl uppercase tracking-wider">
              🚨 Course en cours
            </div>

            <div>
              <span className="text-xs font-bold text-[#008235] bg-[#EBF7EE] px-2.5 py-0.5 rounded-full">
                Mission {activeOrder.orderNumber}
              </span>
              <h2 className="text-xl font-black text-[#07431E] mt-2">
                Livraison : {activeOrder.restaurantName} ➔ {activeOrder.deliveryAddress.neighborhood}
              </h2>
            </div>

            {/* LIVE RADAR MAP DISPLAY */}
            <CourierLiveRadar
              courierPos={courierCoords}
              restaurantPos={DAKAR_GEO_PRESETS['Ngor']}
              destinationPos={DAKAR_GEO_PRESETS[activeOrder.deliveryAddress.neighborhood] || DAKAR_GEO_PRESETS['Plateau']}
              courierName={currentCourier.name}
              restaurantName={activeOrder.restaurantName}
              destinationAddress={`${activeOrder.deliveryAddress.street}, ${activeOrder.deliveryAddress.neighborhood}`}
              orderNumber={activeOrder.orderNumber}
            />

            {/* Route details */}
            <div className="bg-[#F7FAF7] p-4 rounded-2xl border border-[#E2ECE5] space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[#07431E] text-white flex items-center justify-center text-xs font-bold shrink-0">
                  A
                </div>
                <div className="text-xs">
                  <span className="font-bold text-gray-500 uppercase text-[10px] block">1. Récupération Restaurant</span>
                  <p className="font-extrabold text-[#07431E] text-sm">{activeOrder.restaurantName}</p>
                  <p className="text-gray-500">Corniche des Almadies / Ngor, Dakar</p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2 border-t border-[#E2ECE5]">
                <div className="w-7 h-7 rounded-full bg-[#FA8038] text-white flex items-center justify-center text-xs font-bold shrink-0">
                  B
                </div>
                <div className="text-xs">
                  <span className="font-bold text-gray-500 uppercase text-[10px] block">2. Livraison Client</span>
                  <p className="font-extrabold text-[#07431E] text-sm">{activeOrder.clientName} ({activeOrder.clientPhone})</p>
                  <p className="text-gray-500">{activeOrder.deliveryAddress.street}, {activeOrder.deliveryAddress.neighborhood}</p>
                  {activeOrder.deliveryAddress.details && (
                    <p className="text-[11px] text-[#008235] font-semibold mt-0.5">
                      Indication : {activeOrder.deliveryAddress.details}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div>
                <span className="text-[10px] text-gray-400 block font-semibold">Votre gain pour cette course</span>
                <span className="text-lg font-black text-[#008235]">+{formatFCFA(activeOrder.deliveryFee)}</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <a
                  href={`tel:${activeOrder.clientPhone}`}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold flex items-center gap-1.5"
                >
                  <Phone className="w-4 h-4" />
                  <span>Appeler</span>
                </a>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => completeDeliveryMission(currentCourier.id, activeOrder.id)}
                  className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl brand-gradient text-white text-xs font-bold shadow-lg flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmer la Livraison</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AVAILABLE MISSIONS RADAR */}
      <div className="bg-white rounded-3xl border border-[#E2ECE5] p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-lg text-[#07431E] flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#FA8038] animate-spin" />
              <span>Missions Disponibles à Dakar ({availableOrders.length})</span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Acceptez une course pour vous diriger vers le restaurant partenaire.
            </p>
          </div>
        </div>

        {!isOnline ? (
          <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-300 text-xs text-gray-500 space-y-2">
            <p className="font-bold text-gray-700">Vous êtes actuellement Hors Service.</p>
            <p>Activez votre statut "En service" en haut pour recevoir les missions à proximité.</p>
          </div>
        ) : availableOrders.length === 0 && !activeOrder ? (
          <div className="p-8 text-center bg-[#F7FAF7] rounded-2xl border border-[#E2ECE5] text-xs text-gray-500 space-y-1">
            <p className="font-bold text-[#07431E]">Radar en écoute active sur Dakar...</p>
            <p>Dès qu'un restaurant prépare un plat, la mission s'affichera ici instantanément.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {availableOrders.map((mission) => (
                <motion.div 
                  key={mission.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="p-4 rounded-2xl bg-[#F7FAF7] border border-[#E2ECE5] flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#008235] transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-[#07431E]">{mission.orderNumber}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FA8038]/10 text-[#FA8038]">
                        Prêt en ~10 min
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-[#0D1C12]">
                      {mission.restaurantName} ➔ {mission.deliveryAddress.neighborhood}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {mission.items.length} plats à récupérer • Course à proximité
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 block">Gain net</span>
                      <span className="text-sm font-black text-[#008235]">+{formatFCFA(mission.deliveryFee)}</span>
                    </div>

                    <motion.button
                      disabled={Boolean(activeOrder)}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => acceptDeliveryMission(currentCourier.id, mission.id)}
                      className="px-5 py-2.5 rounded-xl brand-gradient-orange text-white text-xs font-bold shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Accepter la mission</span>
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

    </div>
  );
}
