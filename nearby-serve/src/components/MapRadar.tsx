import React, { useMemo } from 'react';
import { Recipient } from '../types';
import { motion } from 'framer-motion';

interface MapRadarProps {
  recipients: Recipient[];
  centerLat: number;
  centerLng: number;
  onSelect: (id: string) => void;
  selectedId: string | null;
}

export const MapRadar: React.FC<MapRadarProps> = ({ recipients, centerLat, centerLng, onSelect, selectedId }) => {
  // Convert lat/long to x/y relative coordinates for visual representation
  const points = useMemo(() => {
    return recipients.map(r => {
      const dx = (r.location.lng - centerLng) * 10000; 
      const dy = (centerLat - r.location.lat) * 10000; 
      return { ...r, x: dx, y: dy };
    });
  }, [recipients, centerLat, centerLng]);

  return (
    <div className="relative w-full h-full bg-slate-900 overflow-hidden">
      {/* Grid Background */}
      <div className="absolute inset-0 opacity-20" 
           style={{ 
             backgroundImage: 'radial-gradient(circle, #334155 1px, transparent 1px)', 
             backgroundSize: '20px 20px' 
           }} 
      />

      {/* Radar Sweep Effect */}
      <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
         <div className="w-[80%] h-[80%] border border-slate-700 rounded-full absolute" />
         <div className="w-[50%] h-[50%] border border-slate-700 rounded-full absolute" />
         <div className="w-[20%] h-[20%] border border-slate-700 rounded-full absolute" />
      </div>
      
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 bg-gradient-to-t from-transparent via-accent/10 to-transparent origin-center w-full h-full pointer-events-none"
        style={{ borderRadius: '50%', scale: 1.5 }}
      />

      {/* Center (User) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
        <div className="w-5 h-5 bg-blue-500 border-2 border-white rounded-full shadow-[0_0_20px_rgba(59,130,246,0.8)] animate-pulse" />
      </div>

      {/* Recipients */}
      {points.map((p) => {
        const scale = 30; 
        const left = 50 + p.x * scale;
        const top = 50 + p.y * scale;

        if (left < 5 || left > 95 || top < 5 || top > 95) return null;

        const isSelected = selectedId === p.id;

        return (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group focus:outline-none transition-all duration-300"
            style={{ left: `${left}%`, top: `${top}%` }}
          >
            <div className={`relative flex flex-col items-center`}>
               <motion.div 
                 initial={{ scale: 0 }}
                 animate={{ scale: isSelected ? 1.2 : 1 }}
                 className={`w-10 h-10 rounded-full border-2 overflow-hidden bg-slate-800 transition-colors ${isSelected ? 'border-accent shadow-[0_0_25px_rgba(245,158,11,0.6)]' : 'border-white/50 group-hover:border-white'}`}
               >
                 <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover opacity-90 group-hover:opacity-100" />
               </motion.div>
               
               {/* Label */}
               <div className={`absolute top-11 px-3 py-1 bg-slate-900/90 text-white text-[10px] font-bold rounded-lg whitespace-nowrap backdrop-blur-md border border-slate-700 transition-all ${isSelected ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'}`}>
                 {p.name}
               </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};