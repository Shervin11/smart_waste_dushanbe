'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapPickerComponentProps {
  onSelectLocation: (lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
}

export default function MapPickerComponent({
  onSelectLocation,
  initialLat = 38.56,
  initialLng = 68.78,
}: MapPickerComponentProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map centered on Dushanbe
    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 13,
      zoomControl: false,
    });
    mapRef.current = map;

    // Add Dark Mode Tile Layer
    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20,
      }
    ).addTo(map);

    // Zoom buttons in bottom right
    L.control
      .zoom({
        position: 'bottomright',
      })
      .addTo(map);

    // Create a custom red/emerald pointer marker
    const marker = L.marker([initialLat, initialLng], {
      icon: L.divIcon({
        className: 'custom-picker-icon',
        html: `<div class="relative w-8 h-8 flex items-center justify-center">
                 <span class="absolute inline-flex h-full w-full rounded-full bg-emerald-400/35 animate-ping opacity-75"></span>
                 <div class="relative w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-lg flex items-center justify-center">
                   <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
                 </div>
               </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      }),
    }).addTo(map);
    markerRef.current = marker;

    // Listen to click events on map
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      
      // Move marker
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      }
      
      // Propagate state
      onSelectLocation(lat, lng);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [onSelectLocation, initialLat, initialLng]);

  return (
    <div className="relative w-full h-full min-h-[320px] rounded-2xl overflow-hidden border border-slate-800">
      <div ref={mapContainerRef} className="w-full h-full min-h-[320px] absolute inset-0 z-0" />
      <div className="absolute top-3 left-3 bg-slate-900/95 border border-slate-800/80 text-[10px] text-slate-300 font-bold px-3 py-1.5 rounded-lg z-10 pointer-events-none shadow-md">
        📍 Кликните на карту, чтобы отметить свалку
      </div>
    </div>
  );
}
