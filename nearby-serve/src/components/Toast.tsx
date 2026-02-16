import React, { useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ToastProps {
  message: string;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-24 right-4 z-[3000] flex items-start max-w-sm pointer-events-none">
      <motion.div 
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 100, opacity: 0 }}
        className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-slate-700 backdrop-blur-md pointer-events-auto"
      >
        <div className="bg-orange-500 p-2.5 rounded-full shadow-lg shadow-orange-500/20 flex-shrink-0">
          <Bell className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm text-white">New Request</h4>
          <p className="text-xs text-slate-300 mt-0.5 font-medium truncate">{message}</p>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors flex-shrink-0">
          <X className="w-4 h-4 text-slate-400" />
        </button>
      </motion.div>
    </div>
  );
};