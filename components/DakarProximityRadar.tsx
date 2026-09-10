'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/lib/store';
import { DAKAR_GEO_PRESETS, calculateDistanceKm, formatDistanceString } from '@/lib/geolocation';
import { 
  Navigation, 
  MapPin, 
  Radar, 
  Radio, 
  Sparkles, 
  ChevronRight, 
  Clock, 
  Utensils, 
  ShieldCheck,
  Zap,
  LocateFixed
} from 'lucide-react';

interface DakarProximityRadarProps {
  onOpenMap?: () => void;
}

const POPULAR_NEIGHBORHOOD_PRESETS = [
  { name: 'Almadies', tag: 'Pointe des Almadies', icon: '🌊', color: 'from-blue-600 to-cyan-500' },
  { name: 'Ngor', tag: 'Ngor Virage / Plage', icon: '🏄‍♂️', color: 'from-cyan-600 to-teal-500' },
  { name: 'Ouakam', tag: 'Monument Renaissance', icon: '🗿', color: 'from-emerald-600 to-green-500' },
  { name: 'Mermoz', tag: 'VDN & Pyrotechnie', icon: '🏙️', color: 'from-orange-500 to-amber-500' },
  { name: 'Sacré-Cœur', tag: 'Sacré-Cœur 3 / VDN', icon: '🏡', color: 'from-amber-600 to-yellow-500' },
  { name: 'Point E', tag: 'Piscine Olympique', icon: '🏊', color: 'from-indigo-600 to-blue-500' },
  { name: 'Plateau', tag: 'Centre-Ville & Affaires', icon: '🏛️', color: 'from-purple-600 to-violet-500' },
  { name: 'Médina', tag: 'Rue 6 & Tilène', icon: '🥁', color: 'from-rose-600 to-orange-500' },
  { name: 'Yoff', tag: 'Tonghor & BCEAO', icon: '🕌', color: 'from-teal-600 to-emerald-500' },
  { name: 'Parcelles Assainies', tag: 'Unité 1 à 26', icon: '⚽', color: 'from-green-600 to-emerald-500' },
  { name: 'Pikine', tag: 'Icotaf & Tally Boubess', icon: '🚆', color: 'from-fuchsia-600 to-pink-500' },
  { name: 'Guédiawaye', tag: 'Hamo & Littoral Nord', icon: '🏖️', color: 'from-sky-600 to-blue-500' },
];

export default function DakarProximityRadar({ onOpenMap }: DakarProximityRadarProps) {
  const {
    clientCoords,
    clientAccuracy,
    clientNeighborhood,
    isClientGpsActive,
    requestClientGps,
    setClientLocation,
    restaurants,
    triggerProximityNotification,
    setRadiusFilterKm,
    radiusFilterKm,
  } = useApp();

  const [isSimulatingZone, setIsSimulatingZone] = useState(false);
  const [selectedSimulatedZone, setSelectedSimulatedZone] = useState<string | null>(null);

  const activeZoneName = clientNeighborhood || 'Almadies';

  // Calculate nearest restaurants in real-time
  const nearbyRestos = restaurants
    .map((r) => {
      const coords = r.coordinates || (r.latitude && r.longitude ? { lat: r.latitude, lng: r.longitude } : DAKAR_GEO_PRESETS[r.neighborhood]);
      const dist = clientCoords && coords ? calculateDistanceKm(clientCoords, coords) : 1.2;
      return { ...r, distanceKm: dist };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);

  const closestResto = nearbyRestos[0];
  const totalInZone = restaurants.filter(
    (r) => r.neighborhood.toLowerCase().includes(activeZoneName.toLowerCase())
  ).length;

  const handleSimulateMove = (zoneName: string) => {
    const preset = DAKAR_GEO_PRESETS[zoneName];
    if (!preset) return;

    setIsSimulatingZone(true);
    setSelectedSimulatedZone(zoneName);

    setClientLocation(
      { lat: preset.lat, lng: preset.lng },
      `${preset.name}, Dakar`,
      zoneName,
      4.5
    );

    // Déclenche l'alerte de proximité enrichie avec push natif
    triggerProximityNotification(zoneName);

    setTimeout(() => {
      setIsSimulatingZone(false);
    }, 1000);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#081A10] border border-[#0A6E3B]/30 text-white p-5 sm:p-6 shadow-xl mb-6">
      {/* Radar Background Visual Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#0A6E3B_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />
      
      {/* Glow Effects */}
      <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[#0A6E3B]/30 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-[#FF7824]/20 blur-3xl pointer-events-none" />

      {/* Header Info */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          {/* Pulsing Sonar Icon */}
          <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0A6E3B] to-[#04331A] border border-[#16A34A]/40 text-emerald-400 shadow-lg shrink-0">
            <Radio className="w-6 h-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF7824] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#FF7824]"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                <LocateFixed className="w-3 h-3 text-emerald-400 animate-spin" style={{ animationDuration: '4s' }} />
                Radar Thiob Dakar Actif
              </span>
              <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Précision GPS ±{Math.round(clientAccuracy || 5)} m
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-black text-white mt-1 flex items-center gap-2">
              <span>📍 Zone :</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF7824] to-amber-300">
                {activeZoneName}
              </span>
            </h2>
            <p className="text-xs text-gray-300 mt-0.5">
              Notifications de proximité & suggestions gastronomiques en direct sur votre appareil.
            </p>
          </div>
        </div>

        {/* Quick GPS Action Buttons */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => requestClientGps()}
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Recalibrer ma position GPS"
          >
            <Navigation className="w-3.5 h-3.5 text-emerald-400" />
            <span>Recalibrer GPS</span>
          </button>

          {onOpenMap && (
            <button
              onClick={onOpenMap}
              className="px-3.5 py-2 rounded-xl bg-[#0A6E3B] hover:bg-[#0c8246] border border-emerald-400/40 text-white text-xs font-black transition-all flex items-center gap-1.5 shadow-md hover:shadow-emerald-900/40 cursor-pointer active:scale-95"
            >
              <span>Voir la Carte</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Quick Live Stats & Nearest Restaurant Bar */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/10">
        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-base font-bold shrink-0">
            🍽️
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Restaurants à proximité</p>
            <p className="text-sm font-black text-white">
              {totalInZone > 0 ? `${totalInZone} dans ${activeZoneName}` : `${restaurants.length} disponibles à Dakar`}
            </p>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-300 flex items-center justify-center text-base font-bold shrink-0">
            ⚡
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Plus proche de vous</p>
            <p className="text-sm font-black text-white truncate">
              {closestResto ? `${closestResto.name} (${formatDistanceString(closestResto.distanceKm)})` : 'Thiob Express'}
            </p>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center text-base font-bold shrink-0">
            ⏱️
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Délai estimé de livraison</p>
            <p className="text-sm font-black text-amber-300">
              {closestResto?.deliveryTimeEstimate || '15 - 25 min'}
            </p>
          </div>
        </div>
      </div>

      {/* Neighborhood Simulator Bar (Test de déplacement à travers Dakar) */}
      <div className="relative z-10 mt-4 pt-3.5 border-t border-white/10">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <p className="text-xs font-black text-gray-200 flex items-center gap-1.5">
            <span>🇸🇳</span>
            <span>Simuler un déplacement dans Dakar & déclencher les alertes :</span>
          </p>
          <span className="text-[10px] text-emerald-400 font-bold hidden sm:inline-block">
            {isSimulatingZone ? '⚡ Notification envoyée...' : 'Cliquez sur un quartier'}
          </span>
        </div>

        {/* Horizontal Scrolling Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {POPULAR_NEIGHBORHOOD_PRESETS.map((item) => {
            const isCurrent = activeZoneName.toLowerCase() === item.name.toLowerCase();
            return (
              <button
                key={item.name}
                onClick={() => handleSimulateMove(item.name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer shrink-0 border active:scale-95 ${
                  isCurrent
                    ? 'bg-gradient-to-r from-[#FF7824] to-amber-500 text-white border-amber-300 shadow-md scale-105'
                    : 'bg-white/10 hover:bg-white/20 text-gray-200 border-white/10'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
                {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
