import React, { useEffect, useRef, useState } from 'react';
import { Search, MapPin, Loader2, Navigation2 } from 'lucide-react';

interface LocationPickerMapProps {
  initialLat: number;
  initialLng: number;
  currentLat?: number;
  currentLng?: number;
  onLocationSelect: (lat: number, lng: number, address: string) => void;
}

declare global {
  interface Window {
    L: any;
  }
}

const DEFAULT_LAT = 28.6276;
const DEFAULT_LNG = 77.2185;

export const LocationPickerMap: React.FC<LocationPickerMapProps> = ({ 
  initialLat, 
  initialLng, 
  currentLat,
  currentLng,
  onLocationSelect 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerInstance = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Validate coordinates helper
  const isValidCoord = (num: any) => typeof num === 'number' && !isNaN(num) && isFinite(num);

  const safeInitialLat = isValidCoord(initialLat) ? initialLat : DEFAULT_LAT;
  const safeInitialLng = isValidCoord(initialLng) ? initialLng : DEFAULT_LNG;

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current || !window.L || mapInstance.current) return;

    // Default view
    mapInstance.current = window.L.map(mapRef.current, {
        zoomControl: false,
        zoomSnap: 0.5,
        zoomDelta: 0.5,
        wheelPxPerZoomLevel: 120
    }).setView([safeInitialLat, safeInitialLng], 15);

    window.L.control.zoom({ position: 'bottomright' }).addTo(mapInstance.current);

    // Google Maps Tile Layer
    window.L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution: '&copy; Google Maps'
    }).addTo(mapInstance.current);

    // Draggable Marker Icon (Red)
    const icon = new window.L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    // Create Target Marker
    markerInstance.current = window.L.marker([safeInitialLat, safeInitialLng], {
      draggable: true,
      icon: icon
    }).addTo(mapInstance.current);

    // Function to update parent and fetch address
    const updateLocation = async (lat: number, lng: number) => {
      try {
        // Reverse Geocoding via Nominatim
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
          headers: {
            'User-Agent': 'NearbyServe-App'
          }
        });
        const data = await res.json();
        
        // Construct a readable label
        const addr = data.address || {};
        const label = addr.road || addr.suburb || addr.neighbourhood || addr.city || data.display_name?.split(',')[0] || "Pinned Location";
        
        onLocationSelect(lat, lng, label);
      } catch (err) {
        console.error("Geocoding failed", err);
        onLocationSelect(lat, lng, "Pinned Location");
      }
    };

    // Event: Drag End
    markerInstance.current.on('dragend', (e: any) => {
      const { lat, lng } = e.target.getLatLng();
      updateLocation(lat, lng);
    });

    // Event: Map Click
    mapInstance.current.on('click', (e: any) => {
      const { lat, lng } = e.latlng;
      markerInstance.current.setLatLng([lat, lng]);
      updateLocation(lat, lng);
    });

  }, []); // Run once on mount

  // Effect to handle Live User Location (Blue Dot)
  useEffect(() => {
    if (!mapInstance.current || !window.L || !isValidCoord(currentLat) || !isValidCoord(currentLng)) return;

    // We can safely cast here because of the check above
    const lat = currentLat as number;
    const lng = currentLng as number;

    if (!userMarkerRef.current) {
      // Create User Marker
      const userIcon = window.L.divIcon({
        className: 'custom-user-marker',
        html: `<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse ring-4 ring-blue-500/20"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      userMarkerRef.current = window.L.marker([lat, lng], { 
        icon: userIcon,
        zIndexOffset: -100 // Keep below the red pin
      }).addTo(mapInstance.current);
    } else {
      // Update User Marker
      userMarkerRef.current.setLatLng([lat, lng]);
    }
  }, [currentLat, currentLng]);

  const handleSearch = async () => {
    if (!searchQuery) return;
    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`, {
        headers: {
          'User-Agent': 'NearbyServe-App'
        }
      });
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const newLat = parseFloat(lat);
        const newLng = parseFloat(lon);
        
        if (isValidCoord(newLat) && isValidCoord(newLng)) {
            mapInstance.current.flyTo([newLat, newLng], 16, { duration: 1.5 });
            markerInstance.current.setLatLng([newLat, newLng]);
            
            const shortAddr = display_name.split(',')[0];
            onLocationSelect(newLat, newLng, shortAddr);
        }
      } else {
        alert("Location not found. Try a different landmark.");
      }
    } catch (err) {
      console.error(err);
      alert("Search failed. Please check internet.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleRecenter = () => {
    if (isValidCoord(currentLat) && isValidCoord(currentLng) && mapInstance.current && markerInstance.current) {
      const lat = currentLat as number;
      const lng = currentLng as number;

      mapInstance.current.flyTo([lat, lng], 16, { duration: 1.5 });
      markerInstance.current.setLatLng([lat, lng]);
      // Trigger address update
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
          headers: { 'User-Agent': 'NearbyServe-App' }
      })
      .then(res => res.json())
      .then(data => {
         const addr = data.address || {};
         const label = addr.road || addr.suburb || addr.neighbourhood || addr.city || data.display_name?.split(',')[0] || "Pinned Location";
         onLocationSelect(lat, lng, label);
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="relative w-full h-[350px] rounded-xl overflow-hidden border border-slate-200 shadow-inner z-0 isolate">
      <div ref={mapRef} className="w-full h-full z-0 outline-none" tabIndex={0} />
      
      {/* Search Overlay */}
      <div className="absolute top-3 left-3 right-3 z-[1000]">
        <div className="bg-white p-2 rounded-xl shadow-lg flex gap-2 border border-slate-100">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search area, landmark, or street..."
            className="flex-1 outline-none text-sm px-2 font-medium text-slate-700"
          />
          <button 
            type="button" 
            onClick={handleSearch}
            disabled={isSearching}
            className="bg-slate-900 text-white p-2.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Locate Me Button */}
      {isValidCoord(currentLat) && (
        <button
          type="button"
          onClick={handleRecenter}
          className="absolute bottom-16 right-3 bg-white p-3 rounded-full shadow-lg z-[1000] text-slate-700 hover:text-blue-600 transition-colors"
          title="Use My Location"
        >
          <Navigation2 className="w-5 h-5 fill-current" />
        </button>
      )}

      {/* Instruction Overlay */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur px-4 py-2 rounded-full text-xs font-bold text-white shadow-lg z-[1000] flex items-center whitespace-nowrap pointer-events-none">
        <MapPin className="w-3.5 h-3.5 mr-2 text-red-400" />
        Drag pin to exact location
      </div>
    </div>
  );
};