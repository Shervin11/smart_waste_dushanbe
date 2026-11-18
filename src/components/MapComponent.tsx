'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { addThemedBaseLayers } from '@/lib/mapTiles';

interface Container {
  id: string;
  address: string;
  latitude: number;
  longitude: number;
  fillLevel: number;
  overflow: boolean;
  district: string;
}

interface MapComponentProps {
  containers: Container[];
  onSelectContainer?: (containerId: string) => void;
  selectedContainerId?: string | null;
}

export default function MapComponent({
  containers,
  onSelectContainer,
  selectedContainerId,
}: MapComponentProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const containersRef = useRef(containers);
  const userMovedRef = useRef(false);

  // Show every container until the user drags the map or picks one
  const fitAll = () => {
    const map = mapRef.current;
    const list = containersRef.current;
    if (!map || userMovedRef.current || list.length === 0) return;
    const bounds = L.latLngBounds(list.map((c) => [c.latitude, c.longitude]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15, animate: false });
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Leaflet map
    const map = L.map(mapContainerRef.current, {
      center: [38.56, 68.78], // Center of Dushanbe
      zoom: 13,
      zoomControl: false,
    });

    mapRef.current = map;

    // Theme-aware basemap (no API key needed)
    const stopThemeWatch = addThemedBaseLayers(map);

    map.on('dragstart', () => {
      userMovedRef.current = true;
    });

    // Leaflet measures the container once; re-measure when the layout settles
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
      fitAll();
    });
    resizeObserver.observe(mapContainerRef.current);

    // Zoom buttons styling to bottom right
    L.control
      .zoom({
        position: 'bottomright',
      })
      .addTo(map);

    return () => {
      stopThemeWatch();
      resizeObserver.disconnect();
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update markers on containers change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    containersRef.current = containers;

    // Clear old markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    containers.forEach((container) => {
      // Determine marker color and emoji
      let colorClass = 'bg-emerald-500'; // Green
      let borderClass = 'border-white';
      let textContent = `${container.fillLevel}%`;
      let animationClass = '';

      if (container.overflow) {
        colorClass = 'bg-red-700';
        borderClass = 'border-red-500';
        textContent = '⚠️';
        animationClass = 'animate-pulse';
      } else if (container.fillLevel >= 95) {
        colorClass = 'bg-red-500'; // Dark orange / red
      } else if (container.fillLevel >= 80) {
        colorClass = 'bg-orange-500'; // Orange
      } else if (container.fillLevel >= 50) {
        colorClass = 'bg-yellow-500 text-gray-900'; // Yellow
      }

      const isSelected = selectedContainerId === container.id;

      const customIcon = L.divIcon({
        html: `
          <div class="relative flex items-center justify-center ${isSelected ? 'scale-125 z-[1000]' : ''} transition-all duration-300">
            <div class="flex items-center justify-center w-9 h-9 rounded-full border-2 ${borderClass} shadow-xl text-[10px] font-black text-white ${colorClass} ${animationClass}">
              ${textContent}
            </div>
            ${isSelected ? '<div class="absolute -inset-1.5 rounded-full border-2 border-dashed border-sky-400 animate-spin" style="animation-duration: 3s"></div>' : ''}
          </div>
        `,
        className: 'custom-div-icon',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker([container.latitude, container.longitude], {
        icon: customIcon,
      }).addTo(map);

      // Popup
      const popupContent = `
        <div class="p-2 text-slate-800 font-sans min-w-[200px]">
          <div class="flex items-center justify-between gap-2 border-b pb-1 mb-2">
            <span class="font-bold text-sm text-slate-900">${container.id}</span>
            <span class="px-2 py-0.5 rounded text-[10px] font-semibold text-white ${
              container.district === 'Sino'
                ? 'bg-blue-600'
                : container.district === 'Firdavsi'
                  ? 'bg-purple-600'
                  : container.district === 'Shohmansur'
                    ? 'bg-pink-600'
                    : 'bg-indigo-600'
            }">${container.district}</span>
          </div>
          <p class="text-xs text-slate-600 mb-2"><b>Адрес:</b> ${container.address}</p>
          <div class="grid grid-cols-2 gap-1 text-[11px] bg-slate-50 p-1.5 rounded border border-slate-100">
            <div>Заполнение:</div>
            <div class="font-bold text-right text-slate-900">${container.fillLevel}%</div>
            <div>Статус:</div>
            <div class="font-bold text-right ${
              container.overflow
                ? 'text-red-500 font-bold'
                : 'text-emerald-600 font-bold'
            }">
              ${
                container.overflow
                  ? 'Переполнен'
                  : 'Норма'
              }
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('click', () => {
        if (onSelectContainer) {
          onSelectContainer(container.id);
        }
      });

      markersRef.current[container.id] = marker;
    });

    fitAll();
  }, [containers, selectedContainerId, onSelectContainer]);

  // Center map on selected container
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedContainerId) return;
    userMovedRef.current = true;

    const selectedContainer = containers.find((c) => c.id === selectedContainerId);
    if (selectedContainer) {
      map.setView([selectedContainer.latitude, selectedContainer.longitude], 15, {
        animate: true,
        duration: 1,
      });

      const marker = markersRef.current[selectedContainerId];
      if (marker) {
        marker.openPopup();
      }
    }
  }, [selectedContainerId, containers]);

  return <div ref={mapContainerRef} className="w-full h-full rounded-2xl shadow-inner border border-slate-200 dark:border-slate-800" />;
}
