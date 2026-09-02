'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GeoPoint } from '@/lib/geolocation';

export interface MapMarkerItem {
  id: string;
  lat: number;
  lng: number;
  type: 'restaurant' | 'courier' | 'client' | 'destination' | 'picker';
  title: string;
  subtitle?: string;
  image?: string;
  isOnline?: boolean;
  statusText?: string;
  draggable?: boolean;
}

interface ThiobMapProps {
  center?: GeoPoint;
  zoom?: number;
  markers?: MapMarkerItem[];
  radiusMeters?: number;
  radiusCenter?: GeoPoint;
  showRouteLine?: {
    from: GeoPoint;
    to: GeoPoint;
    courierPos?: GeoPoint;
  };
  onMarkerDragEnd?: (markerId: string, newPos: GeoPoint) => void;
  onMapClick?: (pos: GeoPoint) => void;
  className?: string;
  height?: string | number;
  interactive?: boolean;
}

export default function ThiobMap({
  center = { lat: 14.7167, lng: -17.4677 },
  zoom = 13,
  markers = [],
  radiusMeters,
  radiusCenter,
  showRouteLine,
  onMarkerDragEnd,
  onMapClick,
  className = '',
  height = '360px',
  interactive = true,
}: ThiobMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const overlayGroupRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [center.lat, center.lng],
      zoom: zoom,
      zoomControl: interactive,
      dragging: interactive,
      touchZoom: interactive,
      doubleClickZoom: interactive,
      scrollWheelZoom: false,
      attributionControl: false,
    });

    // OpenStreetMap Standard Tiles (No API key required, 100% reliable street-level mapping for Dakar)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      subdomains: ['a', 'b', 'c'],
    }).addTo(map);


    markersGroupRef.current = L.layerGroup().addTo(map);
    overlayGroupRef.current = L.layerGroup().addTo(map);

    if (onMapClick) {
      map.on('click', (e) => {
        onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
      });
    }

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Center & Zoom
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView([center.lat, center.lng], zoom, {
      animate: true,
    });
  }, [center.lat, center.lng, zoom]);

  // Render Markers and Overlays
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !markersGroupRef.current || !overlayGroupRef.current) return;

    markersGroupRef.current.clearLayers();
    overlayGroupRef.current.clearLayers();

    // 1. Radius Circle
    if (radiusMeters && radiusCenter) {
      const circle = L.circle([radiusCenter.lat, radiusCenter.lng], {
        radius: radiusMeters,
        color: '#008235',
        fillColor: '#008235',
        fillOpacity: 0.1,
        weight: 2,
        dashArray: '6, 6',
      });
      overlayGroupRef.current.addLayer(circle);
    }

    // 2. Route Line
    if (showRouteLine) {
      const points: [number, number][] = [
        [showRouteLine.from.lat, showRouteLine.from.lng],
        ...(showRouteLine.courierPos ? [[showRouteLine.courierPos.lat, showRouteLine.courierPos.lng] as [number, number]] : []),
        [showRouteLine.to.lat, showRouteLine.to.lng],
      ];

      const polyline = L.polyline(points, {
        color: '#FA8038',
        weight: 4,
        opacity: 0.85,
        dashArray: '8, 8',
      });
      overlayGroupRef.current.addLayer(polyline);
    }

    // 3. Markers
    markers.forEach((item) => {
      const customIcon = createCustomHtmlIcon(item);

      const marker = L.marker([item.lat, item.lng], {
        icon: customIcon,
        draggable: item.draggable ?? false,
      });

      if (item.draggable && onMarkerDragEnd) {
        marker.on('dragend', (e) => {
          const newPos = (e.target as L.Marker).getLatLng();
          onMarkerDragEnd(item.id, { lat: newPos.lat, lng: newPos.lng });
        });
      }

      // Popup Content
      const popupHtml = `
        <div style="font-family: system-ui, -apple-system, sans-serif; padding: 4px 6px; min-width: 140px;">
          <div style="font-weight: 800; font-size: 13px; color: #07431E; margin-bottom: 2px;">
            ${escapeHtml(item.title)}
          </div>
          ${item.subtitle ? `<div style="font-size: 11px; color: #555;">${escapeHtml(item.subtitle)}</div>` : ''}
          ${item.statusText ? `<div style="margin-top: 4px; display: inline-block; font-size: 10px; font-weight: 700; color: #008235; background: #EBF7EE; padding: 2px 6px; border-radius: 99px;">${escapeHtml(item.statusText)}</div>` : ''}
        </div>
      `;
      marker.bindPopup(popupHtml);

      markersGroupRef.current?.addLayer(marker);
    });
  }, [markers, radiusMeters, radiusCenter, showRouteLine, onMarkerDragEnd]);

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-[#D0E2D6] shadow-sm ${className}`}
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
    >
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      
      {/* Brand Watermark Badge */}
      <div className="absolute bottom-2 left-2 z-10 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md text-[10px] font-bold text-[#07431E] border border-gray-200 pointer-events-none shadow-xs flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-[#008235] animate-ping" />
        <span>Thiob Express GPS</span>
      </div>
    </div>
  );
}

function createCustomHtmlIcon(item: MapMarkerItem): L.DivIcon {
  let iconHtml = '';

  if (item.type === 'restaurant') {
    iconHtml = `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
        <div style="background: linear-gradient(135deg, #07431E, #008235); color: white; padding: 6px; border-radius: 12px; box-shadow: 0 4px 14px rgba(0,0,0,0.3); border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; font-size: 16px;">
          👨‍🍳
        </div>
        <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 6px solid #07431E; margin-top: -1px;"></div>
      </div>
    `;
  } else if (item.type === 'courier') {
    const isOnline = item.isOnline ?? true;
    iconHtml = `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
        <div style="background: ${isOnline ? 'linear-gradient(135deg, #FA8038, #E06015)' : '#666'}; color: white; padding: 6px; border-radius: 14px; box-shadow: 0 4px 14px rgba(250, 128, 56, 0.4); border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; font-size: 18px; animation: ${isOnline ? 'pulse 2s infinite' : 'none'};">
          🛵
        </div>
        <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 6px solid ${isOnline ? '#FA8038' : '#666'}; margin-top: -1px;"></div>
      </div>
    `;
  } else if (item.type === 'client') {
    iconHtml = `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -50%);">
        <div style="width: 22px; height: 22px; background: #008235; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 2px 10px rgba(0,130,53,0.5); display: flex; align-items: center; justify-content: center;">
          <div style="width: 6px; height: 6px; background: white; border-radius: 50%;"></div>
        </div>
        <div style="position: absolute; top: -6px; left: -6px; width: 34px; height: 34px; border-radius: 50%; background: rgba(0,130,53,0.25); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      </div>
    `;
  } else if (item.type === 'destination') {
    iconHtml = `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
        <div style="background: #E11D48; color: white; padding: 6px; border-radius: 12px; box-shadow: 0 4px 14px rgba(225,29,72,0.4); border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; font-size: 14px;">
          📍
        </div>
        <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 6px solid #E11D48; margin-top: -1px;"></div>
      </div>
    `;
  } else {
    // Picker / Default pin
    iconHtml = `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); cursor: grab;">
        <div style="background: #008235; color: white; padding: 6px; border-radius: 12px; box-shadow: 0 4px 14px rgba(0,130,53,0.5); border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; font-size: 18px;">
          📍
        </div>
        <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 6px solid #008235; margin-top: -1px;"></div>
      </div>
    `;
  }

  return L.divIcon({
    html: iconHtml,
    className: 'thiob-custom-map-icon',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
