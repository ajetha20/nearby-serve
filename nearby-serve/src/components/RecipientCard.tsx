import React from 'react';
import { Recipient } from '../types';
import { MapPin, Clock, Utensils, Users, ArrowRight } from 'lucide-react';

interface RecipientCardProps {
  recipient: Recipient;
  onDonate: (r: Recipient) => void;
}

export const RecipientCard: React.FC<RecipientCardProps> = ({ recipient, onDonate }) => {
  const getTimeString = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return '1d+ ago';
  };

  const isStale = (Date.now() - recipient.lastSeen) > 86400000; // 24 hours

  return (
    <div className={`bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden group flex flex-col h-full hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 relative ${isStale ? 'opacity-75 grayscale-[0.5]' : ''}`}>
      
      {/* Image Header */}
      <div className="relative h-56 w-full overflow-hidden">
        <div className="absolute inset-0 bg-slate-200 animate-pulse"></div>
        <img 
          src={recipient.imageUrl} 
          alt={recipient.name} 
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-90" />
        
        {/* Count Badge */}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm text-slate-900 text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center shadow-lg border border-white/50">
           <Users className="w-3 h-3 mr-1.5 text-orange-600" />
           {recipient.count} People
        </div>

        <div className="absolute bottom-4 left-5 right-5 text-white">
          <h3 className="font-extrabold text-xl leading-tight mb-1 drop-shadow-md">{recipient.name}</h3>
          <div className="flex items-center text-slate-200 text-xs font-semibold tracking-wide">
            <MapPin className="w-3.5 h-3.5 mr-1.5 text-orange-400" />
            <span className="truncate opacity-90">{recipient.location.addressLabel}</span>
          </div>
        </div>
      </div>
      
      {/* Body */}
      <div className="p-6 flex flex-col flex-grow">
        
        {/* Needs Tags */}
        <div className="flex flex-wrap gap-2 mb-5">
            {recipient.needs.slice(0, 3).map((need, idx) => (
              <span key={idx} className="bg-slate-50 border border-slate-200/60 text-slate-600 text-[10px] font-bold px-2.5 py-1.5 rounded-lg uppercase tracking-wider flex items-center">
                <Utensils className="w-3 h-3 mr-1.5 opacity-50" />
                {need}
              </span>
            ))}
        </div>

        <p className="text-slate-500 text-sm mb-6 leading-relaxed flex-grow line-clamp-3 font-medium">
          {recipient.description}
        </p>
        
        {/* Footer / Action */}
        <div className="mt-auto pt-5 border-t border-slate-50 flex items-center justify-between gap-4">
           <div className="flex flex-col">
             <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Verified</span>
             <span className={`text-xs font-bold flex items-center ${isStale ? 'text-red-500' : 'text-emerald-600'}`}>
               <Clock className="w-3.5 h-3.5 mr-1.5" /> {getTimeString(recipient.lastSeen)}
             </span>
           </div>

           <button 
             onClick={(e) => {
                 e.stopPropagation();
                 onDonate(recipient);
             }}
             disabled={isStale}
             className={`px-6 py-3 rounded-xl font-bold text-sm shadow-xl transition-all active:scale-95 flex items-center gap-2 group/btn ${isStale ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' : 'bg-slate-900 text-white hover:bg-orange-600 hover:shadow-orange-600/25'}`}
           >
             {isStale ? 'Expired' : 'Donate'} 
             {!isStale && <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />}
           </button>
        </div>
      </div>
    </div>
  );
};