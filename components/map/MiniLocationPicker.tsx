'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { 
  GeoPoint, 
  getHighAccuracyLocation, 
  reverseGeocodeDakar, 
  DAKAR_GEO_PRESETS,
  getAccuracyInfo,
  openInExternalMaps
} from '@/lib/geolocation';
import { MapPin, Navigation, CheckCircle2, AlertCircle, RefreshCw, Crosshair, ExternalLink, ShieldCheck } from 'lucide-react';
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
  initialAccuracy?: number;
  onLocationSelected: (data: {
    lat: number;
    lng: number;
    address: string;
    neighborhood: string;
    accuracy: number;
  }) => void;
  title?: string;
  badgeLabel?: string;
}

export default function MiniLocationPicker({
  initialCoords,
  initialAddress,
  initialAccuracy = 5.0,
  onLocationSelected,
  title = 'Emplacement Officiel du Restaurant',
  badgeLabel = 'Position Fixe',
}: MiniLocationPickerProps) {
  const [coords, setCoords] = useState<GeoPoint>(initialCoords || DAKAR_GEO_PRESETS['Ngor']);
  const [address, setAddress] = useState<string>(initialAddress || 'Ngor Virage, Dakar');
  const [neighborhood, setNeighborhood] = useState<string>('Ngor');
  const [accuracy, setAccuracy] = useState<number>(initialAccuracy);
  const [isLoadingGps, setIsLoadingGps] = useState(false);
  const [isImprovingGps, setIsImprovingGps] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>('✓ Emplacement prêt');

  const accuracyInfo = getAccuracyInfo(accuracy);

  // Trigger reverse geocoding whenever coords change
  const handlePositionChange = async (newPos: GeoPoint, newAccuracy: number = accuracy) => {
    setCoords(newPos);
    setAccuracy(newAccuracy);
    setErrorMessage(null);

    try {
      const geoResult = await reverseGeocodeDakar(newPos.lat, newPos.lng);
      setNeighborhood(geoResult.neighborhood);
      setAddress(geoResult.fullAddress);
      setSuccessMessage(`✓ Emplacement confirmé : ${geoResult.neighborhood}, Dakar`);

      onLocationSelected({
        lat: newPos.lat,
        lng: newPos.lng,
        address: geoResult.fullAddress,
        neighborhood: geoResult.neighborhood,
        accuracy: newAccuracy,
      });
    } catch {
      onLocationSelected({
        lat: newPos.lat,
        lng: newPos.lng,
        address: address,
        neighborhood: neighborhood,
        accuracy: newAccuracy,
      });
    }
  };

  const handleUseBrowserGps = async (multiPass: boolean = false) => {
    if (multiPass) {
      setIsImprovingGps(true);
    } else {
      setIsLoadingGps(true);
    }
    setErrorMessage(null);

    try {
      // Multi-pass sampling (up to 6s, target accuracy <= 8 meters)
      const exact = await getHighAccuracyLocation(multiPass ? 8000 : 5000, 8);
      await handlePositionChange({ lat: exact.lat, lng: exact.lng }, exact.accuracy);
    } catch (err: any) {
      setErrorMessage(err.message || 'Impossible d’obtenir votre position GPS.');
    } finally {
      setIsLoadingGps(false);
      setIsImprovingGps(false);
    }
  };

  const handlePresetSelect = (presetKey: string) => {
    const preset = DAKAR_GEO_PRESETS[presetKey];
    if (preset) {
      handlePositionChange({ lat: preset.lat, lng: preset.lng }, 15.0);
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
      statusText: `± ${Math.round(accuracy)}m`,
    },
  ];

  return (
    <div className="space-y-4 bg-white p-4 sm:p-5 rounded-3xl border border-[#D0E2D6] shadow-xs">
      
      {/* Header with GPS Trigger & Mode Choice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-black uppercase tracking-wider bg-[#EBF7EE] text-[#008235] px-2.5 py-0.5 rounded-full">
              {badgeLabel}
            </span>
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${accuracyInfo.badgeClass}`}>
              Précision : {accuracyInfo.label}
            </span>
          </div>
          <h4 className="text-base font-extrabold text-[#07431E] mt-1">{title}</h4>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleUseBrowserGps(false)}
            disabled={isLoadingGps || isImprovingGps}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#008235] to-[#07431E] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm hover:opacity-95 transition-all disabled:opacity-50"
          >
            {isLoadingGps ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Navigation className="w-3.5 h-3.5 text-[#FA8038]" />
            )}
            <span>{isLoadingGps ? 'Échantillonnage GPS...' : '📍 Utiliser ma position'}</span>
          </button>
        </div>
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

      {/* Interactive Map View with Draggable Marker & Accuracy Radius */}
      <div className="relative">
        <ThiobMap
          center={coords}
          zoom={15}
          markers={markers}
          radiusCenter={coords}
          radiusMeters={Math.max(accuracy, 10)}
          onMarkerDragEnd={(_, newPos) => handlePositionChange(newPos, 5.0)}
          onMapClick={(pos) => handlePositionChange(pos, 5.0)}
          height="230px"
        />
        <div className="absolute top-2 right-2 z-10 bg-black/75 backdrop-blur-xs text-white text-[10px] px-2.5 py-1 rounded-lg font-medium shadow-md pointer-events-none">
          💡 Déplacez le marqueur pour ajuster au mètre près
        </div>
      </div>

      {/* Accuracy Warning & Improvement CTA if accuracy is poor */}
      {accuracyInfo.isApproximate && !errorMessage && (
        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <p className="font-bold">Position approximative (± {Math.round(accuracy)} m)</p>
              <p className="text-[11px] text-amber-800">Le signal GPS est faible. Déplacez le marqueur manuellement ou améliorez le signal.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleUseBrowserGps(true)}
            disabled={isImprovingGps}
            className="px-3 py-1.5 rounded-xl bg-amber-700 text-white text-[11px] font-extrabold shrink-0 hover:bg-amber-800 flex items-center gap-1 shadow-xs"
          >
            {isImprovingGps ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Crosshair className="w-3 h-3" />}
            <span>Améliorer</span>
          </button>
        </div>
      )}

      {/* Error Message if GPS blocked */}
      {errorMessage && (
        <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
          <div>
            <p className="font-bold">Information GPS :</p>
            <p className="text-[11px] mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Status & Confirmation Box */}
      {successMessage && !errorMessage && (
        <div className="p-3.5 rounded-2xl bg-[#EBF7EE] border border-[#C5E4CE] text-[#07431E] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#008235] shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-black text-[#008235]">{successMessage}</p>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-md">
                  ± {Math.round(accuracy)} m
                </span>
              </div>
              <p className="text-[11px] text-gray-600 mt-0.5 font-medium">{address}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              type="button"
              onClick={() => openInExternalMaps(coords.lat, coords.lng, title)}
              className="px-2.5 py-1 rounded-lg bg-white border border-[#008235]/30 text-[#008235] hover:bg-[#008235] hover:text-white transition-colors text-[10px] font-bold shadow-2xs flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Ouvrir dans Maps</span>
            </button>
            <span className="text-[10px] font-mono text-gray-500 block">
              {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
            </span>
          </div>
        </div>
      )}

    </div>
  );
}
