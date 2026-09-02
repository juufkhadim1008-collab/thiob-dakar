'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { 
  GeoPoint, 
  getCurrentBrowserLocation, 
  reverseGeocodeDakar, 
  DAKAR_GEO_PRESETS,
  DAKAR_DEFAULT_COORDS 
} from '@/lib/geolocation';
import { MapPin, Navigation, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { MapMarkerItem } from './ThiobMap';

// Dynamically import ThiobMap for Next.js SSR safety
const ThiobMap = dynamic(() => import('./ThiobMap'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-48 bg-[#F0F5F2] rounded-2xl flex items-center justify-center text-xs text-gray-500 animate-pulse border border-[#D0E2D6]">
      Chargement de la carte interactive Thiob...
    </div>
  )
});

interface MiniLocationPickerProps {
  initialCoords?: GeoPoint;
  initialAddress?: string;
  onLocationSelected: (data: {
    lat: number;
    lng: number;
    address: string;
    neighborhood: string;
  }) => void;
  title?: string;
  badgeLabel?: string;
}

export default function MiniLocationPicker({
  initialCoords,
  initialAddress,
  onLocationSelected,
  title = 'Localisation du Restaurant',
  badgeLabel = 'Position Fixe',
}: MiniLocationPickerProps) {
  const [coords, setCoords] = useState<GeoPoint>(initialCoords || DAKAR_GEO_PRESETS['Ngor']);
  const [address, setAddress] = useState<string>(initialAddress || 'Ngor Virage, Dakar');
  const [neighborhood, setNeighborhood] = useState<string>('Ngor');
  const [isLoadingGps, setIsLoadingGps] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>('✓ Localisation active');

  // Trigger reverse geocoding whenever coords change
  const handlePositionChange = async (newPos: GeoPoint) => {
    setCoords(newPos);
    setErrorMessage(null);

    try {
      const geoResult = await reverseGeocodeDakar(newPos.lat, newPos.lng);
      setNeighborhood(geoResult.neighborhood);
      setAddress(geoResult.fullAddress);
      setSuccessMessage(`✓ Localisation enregistrée : ${geoResult.neighborhood}, Dakar`);

      onLocationSelected({
        lat: newPos.lat,
        lng: newPos.lng,
        address: geoResult.fullAddress,
        neighborhood: geoResult.neighborhood,
      });
    } catch {
      onLocationSelected({
        lat: newPos.lat,
        lng: newPos.lng,
        address: address,
        neighborhood: neighborhood,
      });
    }
  };

  const handleUseBrowserGps = async () => {
    setIsLoadingGps(true);
    setErrorMessage(null);

    try {
      const { coords: gpsCoords } = await getCurrentBrowserLocation();
      await handlePositionChange(gpsCoords);
    } catch (err: any) {
      setErrorMessage(err.message || 'Impossible d’obtenir votre position GPS.');
    } finally {
      setIsLoadingGps(false);
    }
  };

  const handlePresetSelect = (presetKey: string) => {
    const preset = DAKAR_GEO_PRESETS[presetKey];
    if (preset) {
      handlePositionChange({ lat: preset.lat, lng: preset.lng });
    }
  };

  const markers: MapMarkerItem[] = [
    {
      id: 'picker-marker',
      lat: coords.lat,
      lng: coords.lng,
      type: 'picker',
      title: title,
      subtitle: address,
      draggable: true,
      statusText: 'Déplaçable sur la carte',
    },
  ];

  return (
    <div className="space-y-4 bg-white p-4 sm:p-5 rounded-3xl border border-[#D0E2D6] shadow-xs">
      
      {/* Header with GPS Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-[#EBF7EE] text-[#008235] px-2.5 py-0.5 rounded-full">
              {badgeLabel}
            </span>
            <span className="text-xs text-gray-500 font-semibold">Dakar, Sénégal</span>
          </div>
          <h4 className="text-base font-extrabold text-[#07431E] mt-0.5">{title}</h4>
        </div>

        <button
          type="button"
          onClick={handleUseBrowserGps}
          disabled={isLoadingGps}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#008235] to-[#07431E] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm hover:opacity-95 transition-all disabled:opacity-50"
        >
          {isLoadingGps ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Navigation className="w-3.5 h-3.5 text-[#FA8038]" />
          )}
          <span>{isLoadingGps ? 'Détection GPS...' : '📍 Partager ma localisation GPS'}</span>
        </button>
      </div>

      {/* Quick Dakar Neighborhood Pills */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
          Ou choisissez un quartier de Dakar :
        </label>
        <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto py-1">
          {Object.keys(DAKAR_GEO_PRESETS).map((key) => {
            const isSelected = neighborhood.toLowerCase().includes(key.toLowerCase());
            return (
              <button
                key={key}
                type="button"
                onClick={() => handlePresetSelect(key)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-[#008235] text-white shadow-xs'
                    : 'bg-[#F0F5F2] text-[#07431E] hover:bg-[#E2ECE5]'
                }`}
              >
                {key}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Map View with Draggable Marker */}
      <div className="relative">
        <ThiobMap
          center={coords}
          zoom={14}
          markers={markers}
          onMarkerDragEnd={(_, newPos) => handlePositionChange(newPos)}
          onMapClick={(pos) => handlePositionChange(pos)}
          height="220px"
        />
        <div className="absolute top-2 right-2 z-10 bg-black/75 backdrop-blur-xs text-white text-[10px] px-2.5 py-1 rounded-lg font-medium shadow-md pointer-events-none">
          💡 Glissez le marqueur pour ajuster
        </div>
      </div>

      {/* Status & Confirmation Box */}
      {errorMessage && (
        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
          <div>
            <p className="font-bold">Information GPS :</p>
            <p className="text-[11px] mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {successMessage && !errorMessage && (
        <div className="p-3.5 rounded-2xl bg-[#EBF7EE] border border-[#C5E4CE] text-[#07431E] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#008235] shrink-0" />
            <div>
              <p className="text-xs font-black text-[#008235]">{successMessage}</p>
              <p className="text-[11px] text-gray-600 mt-0.5">{address}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              type="button"
              onClick={() => {
                import('@/lib/geolocation').then(m => m.openInExternalMaps(coords.lat, coords.lng, title));
              }}
              className="px-2.5 py-1 rounded-lg bg-white border border-[#008235]/30 text-[#008235] hover:bg-[#008235] hover:text-white transition-colors text-[10px] font-bold shadow-2xs"
            >
              🗺️ Ouvrir dans Maps
            </button>
            <span className="text-[10px] font-mono text-gray-500 block">
              {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
            </span>
          </div>
        </div>
      )}


    </div>
  );
}
