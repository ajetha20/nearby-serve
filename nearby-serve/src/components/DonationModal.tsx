import React, { useState } from 'react';
import { Recipient, DeliveryRequest } from '../types';
import { X, Navigation, Truck, ShieldCheck, MapPin, AlertCircle, Utensils, Phone, Home, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';

interface DonationModalProps {
  recipient: Recipient;
  onClose: () => void;
  onSubmitRequest: (req: Omit<DeliveryRequest, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'recipientName'>) => void;
}

export const DonationModal: React.FC<DonationModalProps> = ({ recipient, onClose, onSubmitRequest }) => {
  const [mode, setMode] = useState<'self' | 'volunteer'>('self');
  const [items, setItems] = useState('');
  const [pickupAddr, setPickupAddr] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceFee] = useState(40); 
  const [confirmedFresh, setConfirmedFresh] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const handleVolunteerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmedFresh) return alert("Please confirm food freshness.");
    if (phone.length < 10) return alert("Valid phone number required.");

    setIsProcessingPayment(true);
    
    // Simulate Payment Gateway
    setTimeout(() => {
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        onSubmitRequest({
            recipientId: recipient.id,
            donorName: 'Me', 
            donorPhone: phone,
            items,
            pickupAddress: pickupAddr,
            pickupOtp: otp,
            serviceFee,
        });
        setIsProcessingPayment(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="relative h-28 bg-slate-900 flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 opacity-90" />
          <div className="absolute bottom-4 left-6 right-6 text-white">
             <h2 className="text-xl font-bold mb-1">Donate to {recipient.name}</h2>
          </div>
          <button onClick={onClose} className="absolute top-4 right-4 bg-white/20 text-white rounded-full p-2 hover:bg-white/30"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex border-b border-slate-100 p-2 gap-2 bg-slate-50/50">
          <button onClick={() => setMode('self')} className={`flex-1 py-3 text-sm font-bold rounded-xl flex justify-center items-center transition-all ${mode === 'self' ? 'bg-white shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:bg-slate-100'}`}>
            <Navigation className="w-4 h-4 mr-2" /> Go Myself
          </button>
          <button onClick={() => setMode('volunteer')} className={`flex-1 py-3 text-sm font-bold rounded-xl flex justify-center items-center transition-all ${mode === 'volunteer' ? 'bg-white shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:bg-slate-100'}`}>
            <Truck className="w-4 h-4 mr-2" /> Send Volunteer
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {mode === 'self' ? (
            <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-amber-800/80 text-xs mt-1 leading-relaxed">Visit during daylight. Avoid going alone to secluded areas.</p>
              </div>
              <button 
                  onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${recipient.location.lat},${recipient.location.lng}`, '_blank')}
                  className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 flex justify-center items-center"
              >
                  <MapPin className="w-4 h-4 mr-2" /> Open Google Maps
              </button>
            </div>
          ) : (
            <form onSubmit={handleVolunteerSubmit} className="space-y-4">
              <input type="tel" maxLength={10} required value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} placeholder="Your Mobile Number" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold" />
              <input type="text" required value={items} onChange={e => setItems(e.target.value)} placeholder="Items (e.g. 10 Rotis)" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold" />
              <input type="text" required value={pickupAddr} onChange={e => setPickupAddr(e.target.value)} placeholder="Pickup Address" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold" />
              
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
                <input type="checkbox" id="freshness" checked={confirmedFresh} onChange={e => setConfirmedFresh(e.target.checked)} className="mt-1 w-4 h-4 text-orange-600 rounded" />
                <label htmlFor="freshness" className="text-xs text-red-800 font-bold">I confirm food is freshly prepared.</label>
              </div>

              <div className="flex justify-between items-center py-2 border-t border-slate-100 mt-2">
                <span className="text-slate-500 font-medium text-sm">Volunteer Fee</span>
                <span className="text-lg font-bold text-slate-900">₹{serviceFee}</span>
              </div>

              <button 
                type="submit"
                disabled={isProcessingPayment}
                className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg flex items-center justify-center gap-2"
              >
                {isProcessingPayment ? 'Processing Payment...' : <><CreditCard className="w-4 h-4"/> Pay ₹{serviceFee} & Request</>}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};