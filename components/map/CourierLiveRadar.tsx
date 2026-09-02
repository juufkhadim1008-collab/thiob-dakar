'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { GeoPoint, calculateDistanceKm, formatDistanceString, DAKAR_GEO_PRESETS } from '@/lib/geolocation';
import { MapMarkerItem } from './ThiobMap';
import { Bike, MapPin, Navigation, Clock, ShieldCheck } from 'lucide-react';

const ThiobMap = dynamic(() => import('./ThiobMap'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-56 bg-[#F0F5F2] rounded-3xl flex items-center justify-center text-xs text-gray-500 animate-pulse">
      Initialisation du Radar GPS Dakar...
    </div>
  )
});

interface CourierLiveRadarProps {
  courierPos?: GeoPoint;
  restaurantPos?: GeoPoint;
  destinationPos?: GeoPoint;
  courierName?: string;
  restaurantName?: string;
  destinationAddress?: string;
  orderNumber?: string;
  isSimulatingLiveMove?: boolean;
}

export default function CourierLiveRadar({
  courierPos = DAKAR_GEO_PRESETS['Mermoz'],
  restaurantPos = DAKAR_GEO_PRESETS['Ngor'],
  destinationPos = DAKAR_GEO_PRESETS['Plateau'],
  courierName = 'Ibrahima Fall',
  restaurantName = 'Chez Kamiss',
  destinationAddress = 'Dakar Plateau',
  orderNumber = 'DKR-8942',
  isSimulatingLiveMove = true,
}: CourierLiveRadarProps) {
  const [currentCourierPos, setCurrentCourierPos] = useState<GeoPoint>(courierPos);

  // Live micro-movement simulation if requested
  useEffect(() => {
    if (!isSimulatingLiveMove) return;

    const interval = setInterval(() => {
      setCurrentCourierPos((prev) => {
        // Move 10% closer towards destination
        const dLat = (destinationPos.lat - prev.lat) * 0.05;
        const dLng = (destinationPos.lng - prev.lng) * 0.05;
        return {
          lat: prev.lat + dLat,
          lng: prev.lng + dLng,
        };
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isSimulatingLiveMove, destinationPos.lat, destinationPos.lng]);

  const distanceToDelivery = calculateDistanceKm(currentCourierPos, destinationPos);
  const estimatedMins = Math.max(3, Math.round(distanceToDelivery * 3.2));

  const markers: MapMarkerItem[] = [
    {
      id: 'resto-origin',
      lat: restaurantPos.lat,
      lng: restaurantPos.lng,
      type: 'restaurant',
      title: restaurantName,
      subtitle: 'Point de collecte',
    },
    {
      id: 'courier-live',
      lat: currentCourierPos.lat,
      lng: currentCourierPos.lng,
      type: 'courier',
      title: `${courierName} (Livreur)`,
      subtitle: `En route vers ${destinationAddress}`,
      isOnline: true,
      statusText: `Vitesse: 35 km/h • À ${formatDistanceString(distanceToDelivery)}`,
    },
    {
      id: 'client-dest',
      lat: destinationPos.lat,
      lng: destinationPos.lng,
      type: 'destination',
      title: 'Adresse de livraison',
      subtitle: destinationAddress,
    },
  ];

  return (
    <div className="space-y-3">
      {/* Live Map with Route Line */}
      <div className="relative rounded-3xl overflow-hidden border border-[#D0E2D6] shadow-md">
        <ThiobMap
          center={currentCourierPos}
          zoom={13}
          markers={markers}
          showRouteLine={{
            from: restaurantPos,
            courierPos: currentCourierPos,
            to: destinationPos,
          }}
          height="240px"
        />

        {/* Floating ETA Live Badge */}
        <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg border border-[#D0E2D6] flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#008235] text-white flex items-center justify-center text-sm shadow-sm">
            <Bike className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#008235] animate-ping" />
              <span className="text-[10px] font-black uppercase text-[#008235] tracking-wider">
                GPS En Direct
              </span>
            </div>
            <p className="text-xs font-black text-[#07431E]">
              Arrivée estimée : ~{estimatedMins} min ({formatDistanceString(distanceToDelivery)})
            </p>
          </div>
        </div>
      </div>

      {/* Trajectory Steps Summary */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-3 rounded-2xl bg-[#F0F5F2] border border-[#D0E2D6] flex items-center gap-2">
          <span className="text-base">👨‍🍳</span>
          <div>
            <span className="text-[10px] uppercase text-gray-500 font-bold block">Collecte</span>
            <span className="font-extrabold text-[#07431E] line-clamp-1">{restaurantName}</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-[#EBF7EE] border border-[#C5E4CE] flex items-center gap-2">
          <span className="text-base">📍</span>
          <div>
            <span className="text-[10px] uppercase text-[#008235] font-bold block">Livraison</span>
            <span className="font-extrabold text-[#07431E] line-clamp-1">{destinationAddress}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
