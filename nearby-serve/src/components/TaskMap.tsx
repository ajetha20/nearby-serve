import React, { useEffect, useRef } from 'react';
import { DeliveryRequest, Recipient } from '../types';

interface TaskMapProps {
  requests: DeliveryRequest[];
  recipients: Recipient[];
  centerLat: number;
  centerLng: number;
}

declare global {
  interface Window {
    L: any;
  }
}

const DEFAULT_LAT = 28.6276;
const DEFAULT_LNG = 77.2185;

export const TaskMap: React.FC<TaskMapProps> = ({ requests, recipients, centerLat, centerLng }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const userMarkerRef = useRef<any>(null);

  // Validate coordinates helper
  const isValidCoord = (num: any) => typeof num === 'number' && !isNaN(num) && isFinite(num);

  const safeCenterLat = isValidCoord(centerLat) ? centerLat : DEFAULT_LAT;
  const safeCenterLng = isValidCoord(centerLng) ? centerLng : DEFAULT_LNG;

  useEffect(() => {
    if (!mapContainerRef.current || !window.L) return;

    // Initialize Map if not already done
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = window.L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
        zoomSnap: 0.5,
        zoomDelta: 0.5,
        wheelPxPerZoomLevel: 120
      }).setView([safeCenterLat, safeCenterLng], 14);

      window.L.control.zoom({ position: 'bottomright' }).addTo(mapInstanceRef.current);

      // Google Maps Tile Layer
      window.L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: '&copy; Google Maps'
      }).addTo(mapInstanceRef.current);

      // Create Volunteer Marker
      const userIcon = window.L.divIcon({
        className: 'custom-user-marker',
        html: `<div class="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg animate-pulse ring-4 ring-blue-500/30"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      userMarkerRef.current = window.L.marker([safeCenterLat, safeCenterLng], { 
        icon: userIcon,
        zIndexOffset: 1000
      })
        .addTo(mapInstanceRef.current)
        .bindPopup("You (Volunteer)");
    } else {
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([safeCenterLat, safeCenterLng]);
      }
    }

    // Clear existing task markers
    markersRef.current.forEach(marker => mapInstanceRef.current.removeLayer(marker));
    markersRef.current = [];

    // Helper for icons
    const getIcon = (color: 'green' | 'red' | 'orange' | 'blue') => {
      return new window.L.Icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });
    };

    // Filter active requests
    const activeRequests = requests.filter(r => r.status !== 'delivered');

    activeRequests.forEach(req => {
      const isPending = req.status === 'pending';
      const isMyTask = !isPending; // Since we filter for pending + myDeliveries in parent

      // 1. Pickup Marker
      if (req.pickupLocation && req.status !== 'picked_up') {
        const { lat, lng } = req.pickupLocation;
        if (isValidCoord(lat) && isValidCoord(lng)) {
            const pickupColor = isPending ? 'orange' : 'green';
            const label = isPending ? 'New Request' : 'Your Pickup';
            
            const pickupMarker = window.L.marker([lat, lng], {
              icon: getIcon(pickupColor)
            }).addTo(mapInstanceRef.current);

            pickupMarker.bindPopup(`
              <div class="text-center font-sans min-w-[150px]">
                <div class="text-[10px] font-bold uppercase tracking-wider mb-1 px-2 py-0.5 rounded-full inline-block ${isPending ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}">
                  ${label}
                </div>
                <h4 class="font-bold text-slate-900 text-sm mt-1 mb-0.5">${req.items}</h4>
                <p class="text-xs text-slate-500 mb-1">${req.pickupAddress}</p>
                ${isPending ? '<div class="text-xs text-orange-600 font-bold mt-1">Accept in List View</div>' : ''}
              </div>
            `);
            markersRef.current.push(pickupMarker);
        }
      }

      // 2. Dropoff Marker (Red) - Linked to Recipient
      const recipient = recipients.find(r => r.id === req.recipientId);
      if (recipient && recipient.location) {
        const { lat: rLat, lng: rLng } = recipient.location;
        if (isValidCoord(rLat) && isValidCoord(rLng)) {
            const dropoffMarker = window.L.marker([rLat, rLng], {
              icon: getIcon('red')
            }).addTo(mapInstanceRef.current);

            dropoffMarker.bindPopup(`
              <div class="text-center font-sans min-w-[150px]">
                 <div class="text-[10px] font-bold uppercase tracking-wider mb-1 px-2 py-0.5 rounded-full inline-block bg-red-100 text-red-700">
                  Delivery Target
                </div>
                <h4 class="font-bold text-slate-900 text-sm mt-1 mb-0.5">${recipient.name}</h4>
                <p class="text-xs text-slate-500">${recipient.location.addressLabel}</p>
              </div>
            `);
            markersRef.current.push(dropoffMarker);

            // Draw line if pickup exists and hasn't been picked up yet
            if (req.pickupLocation && req.status !== 'picked_up') {
                const { lat: pLat, lng: pLng } = req.pickupLocation;
                if(isValidCoord(pLat) && isValidCoord(pLng)) {
                    const line = window.L.polyline([
                        [pLat, pLng],
                        [rLat, rLng]
                    ], {
                        color: isPending ? '#F97316' : '#22C55E', // Orange for pending, Green for active
                        weight: 3,
                        opacity: 0.6,
                        dashArray: isPending ? '5, 10' : '0'
                    }).addTo(mapInstanceRef.current);
                    markersRef.current.push(line);
                }
            } else if (isMyTask && req.status === 'picked_up') {
                // If picked up, draw line from Volunteer (current) to Recipient
                 const line = window.L.polyline([
                    [safeCenterLat, safeCenterLng],
                    [rLat, rLng]
                ], {
                    color: '#22C55E', 
                    weight: 4,
                    opacity: 0.8
                }).addTo(mapInstanceRef.current);
                markersRef.current.push(line);
            }
        }
      }
    });

  }, [requests, recipients, safeCenterLat, safeCenterLng]);

  return (
    <div className="w-full h-[600px] rounded-3xl overflow-hidden shadow-xl border border-slate-200 relative z-0 group isolate">
       {/* Map Container */}
       <div ref={mapContainerRef} className="w-full h-full z-0 outline-none" tabIndex={0} />
       
       <div className="absolute top-4 right-4 bg-white/95 backdrop-blur p-4 rounded-2xl shadow-lg z-[1000] text-xs space-y-3 border border-slate-100 transition-opacity opacity-90 hover:opacity-100 pointer-events-none sm:pointer-events-auto">
          <div className="font-bold text-slate-900 mb-1">Map Legend</div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-600 border border-white shadow ring-2 ring-blue-100"></div>
            <span className="font-medium text-slate-600">You (Volunteer)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500 border border-white shadow"></div>
            <span className="font-medium text-slate-600">New Request Pickup</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500 border border-white shadow"></div>
            <span className="font-medium text-slate-600">Your Task Pickup</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 border border-white shadow"></div>
            <span className="font-medium text-slate-600">Delivery Location</span>
          </div>
       </div>
    </div>
  );
};