import React, { useState } from 'react';
import { DeliveryRequest, Volunteer, Recipient } from '../types';
import { CheckCircle, Clock, MapPin, Package, Truck, Navigation, Save, Users, RefreshCw, ArrowRight, Box, Map as MapIcon, Grid, Power, Trash2, Edit2, PlusCircle, X, Phone, Lock, UploadCloud, PlayCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LocationPickerMap } from '../components/LocationPickerMap';
import { TaskMap } from '../components/TaskMap';

interface VolunteerDashboardProps {
  volunteer: Volunteer;
  requests: DeliveryRequest[];
  recipients: Recipient[];
  onRequestUpdate: (id: string, status: DeliveryRequest['status'], extraData?: any) => void;
  onAddRecipient: (r: Recipient) => void;
  onUpdateRecipient: (r: Recipient) => void;
  onDeleteRecipient: (id: string) => void;
  userLocation: { lat: number; lng: number };
  isOnline: boolean;
  onToggleOnline: (status: boolean) => void;
}

export const VolunteerDashboard: React.FC<VolunteerDashboardProps> = ({ 
  volunteer, 
  requests, 
  recipients, 
  onRequestUpdate, 
  onAddRecipient, 
  onUpdateRecipient,
  onDeleteRecipient,
  userLocation,
  isOnline,
  onToggleOnline
}) => {
  const [activeTab, setActiveTab] = useState<'deliveries' | 'spot'>('deliveries');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [otpInput, setOtpInput] = useState('');
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [spotForm, setSpotForm] = useState({
    description: '',
    locationName: '',
    lat: userLocation.lat,
    lng: userLocation.lng,
    needs: '',
    count: 1
  });

  const pendingRequests = requests.filter(r => r.status === 'pending');
  // Show active tasks AND those waiting for payout (marked delivered but not paid)
  const myDeliveries = requests.filter(r => r.volunteerId === volunteer.id && (r.status !== 'delivered' && r.status !== 'paid'));
  
  // Completed count (Delivered or Paid)
  const completedCount = requests.filter(r => r.volunteerId === volunteer.id && (r.status === 'delivered' || r.status === 'paid')).length;
  
  const myReportedSpots = recipients.filter(r => r.reportedBy === volunteer.name);

  const handleSpotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      const existing = recipients.find(r => r.id === editingId);
      if (existing) {
        onUpdateRecipient({
          ...existing,
          name: `Group at ${spotForm.locationName}`,
          count: Number(spotForm.count),
          description: spotForm.description,
          needs: spotForm.needs.split(',').map(s => s.trim()),
          location: { lat: spotForm.lat, lng: spotForm.lng, addressLabel: spotForm.locationName },
          lastSeen: Date.now()
        });
        alert('Location updated successfully!');
      }
    } else {
      onAddRecipient({
        id: `vol_spot_${Date.now()}`,
        name: `Group at ${spotForm.locationName}`,
        count: Number(spotForm.count),
        description: spotForm.description,
        needs: spotForm.needs.split(',').map(s => s.trim()),
        location: { lat: spotForm.lat, lng: spotForm.lng, addressLabel: spotForm.locationName },
        imageUrl: `https://picsum.photos/400/300?random=${Date.now()}`,
        status: 'active',
        lastSeen: Date.now(),
        reportedBy: volunteer.name
      });
      alert('Location pinned successfully!');
    }
    resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setSpotForm({ description: '', locationName: '', lat: userLocation.lat, lng: userLocation.lng, needs: '', count: 1 });
  };

  const handleEdit = (r: Recipient) => {
    setSpotForm({ description: r.description, locationName: r.location.addressLabel, lat: r.location.lat, lng: r.location.lng, needs: r.needs.join(', '), count: r.count });
    setEditingId(r.id);
    document.getElementById('report-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const verifyOtpAndPickup = (req: DeliveryRequest) => {
      if (otpInput === req.pickupOtp) {
          onRequestUpdate(req.id, 'picked_up');
          setVerifyingId(null);
          setOtpInput('');
      } else {
          alert("Incorrect OTP.");
      }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>, reqId: string) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        // Simulate an upload URL
        const fakeUrl = URL.createObjectURL(file);
        
        onRequestUpdate(reqId, 'delivered', { 
            proofUrl: fakeUrl, 
            proofType: 'video' 
        });
        setUploadingId(null);
        alert("Video proof uploaded! Admin will verify for payout.");
    }
  };

  return (
    <div className="pt-28 pb-12 max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
      
      {/* Volunteer Header */}
      <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-white/60 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-slate-50 to-transparent z-0"></div>
        
        <div className="z-10 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-20 h-20 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-900/20 text-white">
            <span className="text-3xl font-black">{volunteer.name.charAt(0)}</span>
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-bold text-slate-900">Welcome back, {volunteer.name.split(' ')[0]}</h1>
            <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
              <p className="text-slate-500 text-sm font-medium flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full">
                <CheckCircle className="w-4 h-4 text-emerald-500" /> Verified Agent
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-4 z-10 w-full md:w-auto justify-center md:justify-end">
           <div className="flex-1 md:flex-none bg-white p-5 rounded-2xl border border-slate-100 shadow-lg shadow-slate-100 text-center min-w-[120px]">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Impact</div>
              <div className="text-2xl font-black text-slate-900">{completedCount}</div>
              <div className="text-xs text-slate-500 font-medium">Deliveries</div>
           </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1.5 bg-white/70 rounded-2xl border border-white/50 shadow-lg shadow-slate-200/50 backdrop-blur-md max-w-md mx-auto">
        <button onClick={() => setActiveTab('deliveries')} className={`flex-1 py-3 px-6 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'deliveries' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}>
          <Truck className="w-4 h-4" /> Tasks
          {pendingRequests.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingRequests.length}</span>}
        </button>
        <button onClick={() => setActiveTab('spot')} className={`flex-1 py-3 px-6 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'spot' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}>
          <MapPin className="w-4 h-4" /> Update Map
        </button>
      </div>

      {activeTab === 'deliveries' ? (
        <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
           <div className="flex justify-end mb-4">
              <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                 <button onClick={() => setViewMode('list')} className={`px-4 py-2 rounded-lg text-sm font-bold ${viewMode === 'list' ? 'bg-slate-100 text-slate-900' : 'text-slate-400'}`}><Grid className="w-4 h-4" /></button>
                 <button onClick={() => setViewMode('map')} className={`px-4 py-2 rounded-lg text-sm font-bold ${viewMode === 'map' ? 'bg-slate-100 text-slate-900' : 'text-slate-400'}`}><MapIcon className="w-4 h-4" /></button>
              </div>
           </div>

           {viewMode === 'list' ? (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Available Requests */}
                <div className="space-y-4">
                   <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Package className="w-5 h-5 text-orange-500" /> Available Requests ({pendingRequests.length})</h2>
                   {pendingRequests.length === 0 ? (
                      <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-slate-200 text-slate-400">No pending requests.</div>
                   ) : (
                      pendingRequests.map(req => (
                        <div key={req.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-lg transition-all relative">
                           <div className="flex justify-between items-start mb-4">
                              <span className="bg-orange-100 text-orange-800 text-[10px] font-black px-2 py-1 rounded uppercase">NEW</span>
                              <span className="block text-xl font-black text-emerald-600">₹{req.serviceFee}</span>
                           </div>
                           <h3 className="font-bold text-slate-800 text-lg mb-1">{req.items}</h3>
                           <p className="text-xs text-slate-400 font-bold mb-4">From: {req.donorName}</p>
                           <div className="space-y-2 mb-4 border-l-2 border-slate-100 pl-3">
                              <p className="text-xs text-slate-600"><span className="font-bold">Pickup:</span> {req.pickupAddress}</p>
                              <p className="text-xs text-slate-600"><span className="font-bold">Drop:</span> {req.recipientName}</p>
                           </div>
                           <button onClick={() => onRequestUpdate(req.id, 'accepted')} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-orange-600 transition-colors">Accept Task</button>
                        </div>
                      ))
                   )}
                </div>

                {/* My Active Tasks */}
                <div className="space-y-4">
                   <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Truck className="w-5 h-5 text-blue-500" /> My Active Tasks ({myDeliveries.length})</h2>
                   {myDeliveries.length === 0 ? (
                      <div className="bg-slate-50 rounded-3xl p-10 text-center border border-slate-200 text-slate-400">No active tasks.</div>
                   ) : (
                      myDeliveries.map(req => (
                        <div key={req.id} className="bg-white rounded-3xl p-6 border-l-[6px] border-blue-500 shadow-lg relative">
                           <div className="flex justify-between mb-2">
                             <span className="text-[10px] font-black text-blue-700 uppercase bg-blue-50 px-2 py-1 rounded">{req.status.replace('_', ' ')}</span>
                             <span className="font-bold text-emerald-600">₹{req.serviceFee}</span>
                           </div>
                           <h3 className="font-bold text-lg mb-4">{req.items}</h3>
                           
                           <div className="bg-slate-50 p-4 rounded-xl mb-4 space-y-2 text-sm border border-slate-100">
                              <div className="flex justify-between"><span>Pickup:</span> <span className="font-bold">{req.pickupAddress}</span></div>
                              {req.donorPhone && (
                                <div className="flex justify-end"><a href={`tel:${req.donorPhone}`} className="text-xs font-bold text-blue-600 flex items-center gap-1"><Phone className="w-3 h-3"/> Call Donor</a></div>
                              )}
                              <div className="border-t border-slate-200 my-2"></div>
                              <div className="flex justify-between"><span>Drop:</span> <span className="font-bold">{req.recipientName}</span></div>
                           </div>

                           {req.status === 'accepted' ? (
                             verifyingId === req.id ? (
                               <div className="bg-blue-50 p-4 rounded-xl">
                                  <input type="number" value={otpInput} onChange={(e) => setOtpInput(e.target.value)} placeholder="Enter 4-digit OTP" className="w-full p-2 rounded border border-blue-200 mb-2 text-center tracking-widest font-bold" />
                                  <button onClick={() => verifyOtpAndPickup(req)} className="w-full bg-blue-600 text-white py-2 rounded font-bold text-sm">Verify</button>
                               </div>
                             ) : (
                               <button onClick={() => { setVerifyingId(req.id); setOtpInput(''); }} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2"><Lock className="w-4 h-4" /> Verify Pickup</button>
                             )
                           ) : (
                             uploadingId === req.id ? (
                               <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 animate-in fade-in">
                                  <label className="block text-center cursor-pointer border-2 border-dashed border-emerald-300 rounded-xl p-6 hover:bg-emerald-100 transition-colors">
                                    <input type="file" accept="video/*,image/*" className="hidden" onChange={(e) => handleVideoUpload(e, req.id)} />
                                    <UploadCloud className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                                    <span className="text-sm font-bold text-emerald-700">Upload Delivery Video</span>
                                    <span className="text-xs text-emerald-500 block mt-1">Required for Payout</span>
                                  </label>
                                  <button onClick={() => setUploadingId(null)} className="w-full mt-2 py-2 text-xs font-bold text-slate-500 hover:text-slate-800">Cancel</button>
                               </div>
                             ) : (
                               <button onClick={() => setUploadingId(req.id)} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-colors">
                                 <CheckCircle className="w-5 h-5" /> Mark Delivered
                               </button>
                             )
                           )}
                        </div>
                      ))
                   )}
                </div>
             </div>
           ) : (
             <TaskMap requests={[...pendingRequests, ...myDeliveries]} recipients={recipients} centerLat={userLocation.lat} centerLng={userLocation.lng} />
           )}
        </div>
      ) : (
        <div className="animate-in slide-in-from-bottom-4 fade-in max-w-4xl mx-auto space-y-8">
           {/* Reporting Form */}
           <div id="report-form" className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
              <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
                 <h2 className="text-lg font-bold flex items-center gap-2">{editingId ? 'Edit Report' : 'Pin New Location'}</h2>
                 {editingId && <button onClick={resetForm}><X className="w-5 h-5" /></button>}
              </div>
              <div className="p-8">
                 <form onSubmit={handleSpotSubmit} className="space-y-6">
                    <div>
                       <label className="text-sm font-bold text-slate-700 mb-2 block">Pin Location</label>
                       <div className="rounded-xl overflow-hidden border border-slate-200 h-[300px]">
                          <LocationPickerMap 
                             key={editingId || 'new'} 
                             initialLat={spotForm.lat} 
                             initialLng={spotForm.lng} 
                             currentLat={userLocation.lat}
                             currentLng={userLocation.lng}
                             onLocationSelect={(lat, lng, addr) => setSpotForm(prev => ({ ...prev, lat, lng, locationName: addr }))}
                          />
                       </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div><label className="text-xs font-bold text-slate-500 uppercase">Location Name</label><input required value={spotForm.locationName} onChange={e => setSpotForm({...spotForm, locationName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold" /></div>
                       <div><label className="text-xs font-bold text-slate-500 uppercase">Count</label><input type="number" min="1" required value={spotForm.count} onChange={e => setSpotForm({...spotForm, count: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold" /></div>
                    </div>
                    <div><label className="text-xs font-bold text-slate-500 uppercase">Needs</label><input required value={spotForm.needs} onChange={e => setSpotForm({...spotForm, needs: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold" placeholder="e.g. Food, Water" /></div>
                    <div><label className="text-xs font-bold text-slate-500 uppercase">Details</label><textarea required value={spotForm.description} onChange={e => setSpotForm({...spotForm, description: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold h-24" /></div>
                    <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 shadow-lg">{editingId ? 'Update' : 'Pin Location'}</button>
                 </form>
              </div>
           </div>
           
           {/* My Reports */}
           <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Your Reports</h2>
              {myReportedSpots.length === 0 ? <p className="text-slate-400">No reports yet.</p> : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myReportedSpots.map(spot => (
                    <div key={spot.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex justify-between items-start">
                       <div>
                         <h4 className="font-bold text-slate-900">{spot.name}</h4>
                         <p className="text-xs text-slate-500">{spot.location.addressLabel}</p>
                       </div>
                       <div className="flex gap-2">
                         <button onClick={() => handleEdit(spot)} className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200"><Edit2 className="w-3 h-3 text-slate-600"/></button>
                         <button onClick={() => onDeleteRecipient(spot.id)} className="p-2 bg-red-50 rounded-lg hover:bg-red-100"><Trash2 className="w-3 h-3 text-red-600"/></button>
                       </div>
                    </div>
                  ))}
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
};