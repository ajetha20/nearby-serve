import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React, { useEffect, useRef } from 'react';
import { Recipient } from '../types';

interface RecipientsMapProps {
  recipients: Recipient[];
  centerLat: number;
  centerLng: number;
  onSelect: (id: string) => void;
  selectedId: string | null;
}

const DEFAULT_LAT = 28.6276;
const DEFAULT_LNG = 77.2185;

export const RecipientsMap: React.FC<RecipientsMapProps> = ({
  recipients,
  centerLat,
  centerLng,
  onSelect,
  selectedId
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const userMarkerRef = useRef<any>(null);
  const prevCenterRef = useRef<{ lat: number; lng: number } | null>(null);

  const isValidCoord = (num: any) =>
    typeof num === 'number' && !isNaN(num) && isFinite(num);

  const safeLat = isValidCoord(centerLat) ? centerLat : DEFAULT_LAT;
  const safeLng = isValidCoord(centerLng) ? centerLng : DEFAULT_LNG;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Map
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
        zoomSnap: 0.5,
        zoomDelta: 0.5,
        wheelPxPerZoomLevel: 120
      }).setView([safeLat, safeLng], 15);

      L.control.zoom({ position: 'bottomright' }).addTo(
        mapInstanceRef.current
      );

      L.tileLayer(
        'https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
        {
          maxZoom: 20,
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
          attribution: '&copy; Google Maps'
        }
      ).addTo(mapInstanceRef.current);

      const userIcon = L.divIcon({
        className: 'custom-user-marker',
        html: `<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse ring-4 ring-blue-500/20"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      userMarkerRef.current = L.marker([safeLat, safeLng], {
        icon: userIcon
      })
        .addTo(mapInstanceRef.current)
        .bindPopup('You are here');

      prevCenterRef.current = { lat: safeLat, lng: safeLng };
    } else {
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([safeLat, safeLng]);
      }

      if (prevCenterRef.current) {
        const dist = Math.sqrt(
          Math.pow(safeLat - prevCenterRef.current.lat, 2) +
            Math.pow(safeLng - prevCenterRef.current.lng, 2)
        );

        if (dist > 0.01) {
          mapInstanceRef.current.flyTo([safeLat, safeLng], 15, {
            duration: 2
          });
        }
      }

      prevCenterRef.current = { lat: safeLat, lng: safeLng };
    }

    // Clear old markers
    markersRef.current.forEach(marker =>
      mapInstanceRef.current.removeLayer(marker)
    );
    markersRef.current = [];

    const getIcon = (isSelected: boolean) => {
      const color = isSelected ? 'orange' : 'red';
      return new L.Icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
        shadowUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });
    };

    recipients.forEach(r => {
      if (
        !r.location ||
        !isValidCoord(r.location.lat) ||
        !isValidCoord(r.location.lng)
      )
        return;

      const isSelected = selectedId === r.id;

      const marker = L.marker(
        [r.location.lat, r.location.lng],
        {
          icon: getIcon(isSelected),
          title: r.name,
          zIndexOffset: isSelected ? 1000 : 0
        }
      ).addTo(mapInstanceRef.current);

      const popupContent = `
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; text-align: center; min-width: 150px;">
          <h3 style="font-weight: 800; margin: 0 0 4px 0; color: #0F172A; font-size: 14px;">${r.name}</h3>
          <p style="font-size: 12px; margin: 0; color: #64748B; font-weight: 500;">${r.count} People • ${r.needs[0]}</p>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('click', () => {
        onSelect(r.id);
        marker.openPopup();
      });

      if (isSelected) {
        mapInstanceRef.current.flyTo(
          [r.location.lat, r.location.lng],
          16,
          { duration: 1.5 }
        );
        marker.openPopup();
      }

      markersRef.current.push(marker);
    });

    setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 100);
  }, [recipients, safeLat, safeLng, selectedId, onSelect]);

  return (
    <div className="w-full h-full relative z-0 isolate">
      <div
        ref={mapContainerRef}
        className="w-full h-full z-0 outline-none"
        style={{ minHeight: '100%' }}
        tabIndex={0}
        aria-label="Interactive map of recipients"
      />
    </div>
  );
};
