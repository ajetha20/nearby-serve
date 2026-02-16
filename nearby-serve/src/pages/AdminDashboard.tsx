import React, { useState } from 'react';
import { DeliveryRequest, Recipient, Volunteer, UserRole } from '../types';
import { generateRecipientBio } from '../services/geminiService';
import { storageService } from '../services/storage';
import { Plus, Sparkles, Users, Loader2, UserCheck, Phone, Trash2, HeartHandshake, PlayCircle, CheckCircle } from 'lucide-react';
import { CENTER_LAT, CENTER_LNG } from '../constants';

interface AdminDashboardProps {
  recipients: Recipient[];
  onAddRecipient: (r: Recipient) => void;
  volunteers: Volunteer[];
  onAddVolunteer: (v: Volunteer) => void;
  onDeleteVolunteer: (id: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  recipients, 
  onAddRecipient,
  volunteers,
  onAddVolunteer,
  onDeleteVolunteer
}) => {
  const [activeTab, setActiveTab] = useState<'recipients' | 'volunteers' | 'payouts'>('recipients');
  
  // Recipient Form State
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: '', rawNotes: '', needs: '', addressLabel: '', count: 1 });
  const [isGenerating, setIsGenerating] = useState(false);

  // Volunteer Form State
  const [isAddingVol, setIsAddingVol] = useState(false);
  const [volForm, setVolForm] = useState({ name: '', email: '', password: '', phone: '' });

  // Payout Data (Requests marked as delivered but not paid)
  const deliveredRequests = storageService.getRequests().filter(r => r.status === 'delivered');

  const handleGenerateBio = async () => {
    if (!formData.rawNotes) return;
    setIsGenerating(true);
    const bio = await generateRecipientBio(formData.rawNotes);
    setFormData(prev => ({ ...prev, rawNotes: bio }));
    setIsGenerating(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecipient: Recipient = {
      id: `admin_rec_${Date.now()}`,
      name: formData.name,
      count: formData.count,
      description: formData.rawNotes,
      needs: formData.needs.split(',').map(s => s.trim()),
      location: { lat: CENTER_LAT, lng: CENTER_LNG, addressLabel: formData.addressLabel },
      imageUrl: `https://picsum.photos/200/200?random=${Date.now()}`,
      status: 'active',
      lastSeen: Date.now()
    };
    onAddRecipient(newRecipient);
    setIsAdding(false);
    setFormData({ name: '', rawNotes: '', needs: '', addressLabel: '', count: 1 });
  };

  const handleVolSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
        // Register in Storage (Auth)
        const newUser = storageService.registerUser({
            id: `vol_${Date.now()}`,
            name: volForm.name,
            email: volForm.email,
            password: volForm.password,
            role: UserRole.VOLUNTEER
        });

        const newVol: Volunteer = {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            phone: volForm.phone,
            verified: true,
            totalDeliveries: 0,
            isOnline: false,
            location: { lat: CENTER_LAT, lng: CENTER_LNG }
        };
        onAddVolunteer(newVol);
        setIsAddingVol(false);
        setVolForm({ name: '', email: '', password: '', phone: '' });
        alert(`Volunteer ${newVol.name} added! They can login with ${newVol.email}.`);
    } catch (err: any) {
        alert(err.message);
    }
  };

  const handleApprovePayout = (reqId: string) => {
    storageService.updateRequestStatus(reqId, 'paid');
    alert("Payment Approved! ₹60 transferred to volunteer.");
    // Force re-render of list
    setActiveTab('payouts'); 
  };

  return (
    <div className="max-w-6xl mx-auto p-6 pt-24 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-900">Admin Console</h1>
            <p className="text-slate-500 mt-1">Manage network, verified recipients, and volunteer workforce.</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
            <button onClick={() => setActiveTab('recipients')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap ${activeTab === 'recipients' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>Beneficiaries</button>
            <button onClick={() => setActiveTab('volunteers')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap ${activeTab === 'volunteers' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>Volunteers</button>
            <button onClick={() => setActiveTab('payouts')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap flex items-center gap-2 ${activeTab === 'payouts' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>
                Payouts {deliveredRequests.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full">{deliveredRequests.length}</span>}
            </button>
        </div>
      </div>

      {activeTab === 'recipients' && (
        <div className="animate-in slide-in-from-left-4 fade-in">
          <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2"><Users className="w-6 h-6" /> Beneficiary Registry</h2>
              <button onClick={() => setIsAdding(!isAdding)} className="bg-slate-900 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center shadow-lg hover:bg-slate-800">{isAdding ? 'Cancel' : <><Plus className="w-4 h-4 mr-2" /> Add New</>}</button>
          </div>
          {isAdding && (
             <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200 mb-8">
                 <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input required placeholder="Name/Alias" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-slate-50 p-3 rounded-xl border border-slate-200" />
                        <input required type="number" placeholder="Count" value={formData.count} onChange={e => setFormData({...formData, count: parseInt(e.target.value)})} className="bg-slate-50 p-3 rounded-xl border border-slate-200" />
                    </div>
                    <input required placeholder="Location Label" value={formData.addressLabel} onChange={e => setFormData({...formData, addressLabel: e.target.value})} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200" />
                    <input required placeholder="Needs (comma separated)" value={formData.needs} onChange={e => setFormData({...formData, needs: e.target.value})} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200" />
                    <div className="flex gap-2">
                        <textarea required placeholder="Notes" value={formData.rawNotes} onChange={e => setFormData({...formData, rawNotes: e.target.value})} className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-200 h-24" />
                        <button type="button" onClick={handleGenerateBio} disabled={isGenerating} className="px-4 bg-purple-50 text-purple-700 rounded-xl font-bold text-xs">{isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles />}</button>
                    </div>
                    <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold">Save</button>
                 </form>
             </div>
          )}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
             <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs"><tr><th className="p-4">Name</th><th className="p-4">Location</th><th className="p-4">Needs</th></tr></thead>
                <tbody className="divide-y divide-slate-100">{recipients.map(r => (<tr key={r.id}><td className="p-4 font-bold">{r.name}</td><td className="p-4 text-slate-600">{r.location.addressLabel}</td><td className="p-4">{r.needs.join(', ')}</td></tr>))}</tbody>
             </table>
          </div>
        </div>
      )}

      {activeTab === 'volunteers' && (
        <div className="animate-in slide-in-from-right-4 fade-in">
           <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2"><HeartHandshake className="w-6 h-6 text-emerald-600" /> Volunteer Force</h2>
              <button onClick={() => setIsAddingVol(!isAddingVol)} className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center shadow-lg hover:bg-emerald-700">{isAddingVol ? 'Cancel' : <><Plus className="w-4 h-4 mr-2" /> Add Volunteer</>}</button>
           </div>
           {isAddingVol && (
               <div className="bg-white rounded-2xl p-6 shadow-xl border border-emerald-100 mb-8">
                   <h3 className="font-bold text-lg mb-4">Create Volunteer Account</h3>
                   <form onSubmit={handleVolSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <input required placeholder="Full Name" value={volForm.name} onChange={e => setVolForm({...volForm, name: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-xl p-3" />
                       <input required placeholder="Phone" value={volForm.phone} onChange={e => setVolForm({...volForm, phone: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-xl p-3" />
                       <input required type="email" placeholder="Email (Login ID)" value={volForm.email} onChange={e => setVolForm({...volForm, email: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-xl p-3" />
                       <input required type="password" placeholder="Password" value={volForm.password} onChange={e => setVolForm({...volForm, password: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-xl p-3" />
                       <button type="submit" className="md:col-span-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700">Create Account</button>
                   </form>
               </div>
           )}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {volunteers.map(vol => (
                   <div key={vol.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                       <div className="flex justify-between items-start mb-4">
                           <div><h4 className="font-bold text-slate-900">{vol.name}</h4><div className="text-xs text-slate-500">{vol.email}</div></div>
                           <button onClick={() => { if(window.confirm('Delete?')) onDeleteVolunteer(vol.id); }} className="text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                       </div>
                       <div className="flex gap-2 text-sm text-slate-500"><Phone className="w-3.5 h-3.5" /> {vol.phone}</div>
                   </div>
               ))}
           </div>
        </div>
      )}

      {activeTab === 'payouts' && (
         <div className="animate-in slide-in-from-bottom-4 fade-in">
             <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2"><CheckCircle className="w-6 h-6 text-orange-500" /> Pending Payout Approvals</h2>
             {deliveredRequests.length === 0 ? (
                 <div className="bg-slate-50 p-10 rounded-2xl text-center text-slate-400">No deliveries waiting for approval.</div>
             ) : (
                 <div className="grid gap-6">
                     {deliveredRequests.map(req => (
                         <div key={req.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg flex flex-col md:flex-row gap-6">
                             {/* Video Preview (Simulated) */}
                             <div className="w-full md:w-1/3 bg-black rounded-xl overflow-hidden relative aspect-video flex items-center justify-center group cursor-pointer">
                                 {req.proofUrl ? (
                                     req.proofType === 'video' ? (
                                        <video src={req.proofUrl} controls className="w-full h-full object-cover" />
                                     ) : (
                                        <img src={req.proofUrl} className="w-full h-full object-cover" />
                                     )
                                 ) : (
                                     <div className="text-white text-xs">No Proof Uploaded</div>
                                 )}
                             </div>
                             
                             <div className="flex-1 flex flex-col justify-between">
                                 <div>
                                     <div className="flex justify-between items-start mb-2">
                                         <h3 className="font-bold text-lg">{req.items}</h3>
                                         <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">Delivered</span>
                                     </div>
                                     <div className="text-sm text-slate-600 mb-4 space-y-1">
                                         <p><span className="font-bold">Volunteer:</span> {req.volunteerName}</p>
                                         <p><span className="font-bold">Recipient:</span> {req.recipientName}</p>
                                         <p><span className="font-bold">Time:</span> {new Date(req.updatedAt).toLocaleString()}</p>
                                     </div>
                                 </div>
                                 <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                                     <div className="text-2xl font-black text-slate-900">₹{req.serviceFee}</div>
                                     <button 
                                        onClick={() => handleApprovePayout(req.id)}
                                        className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-lg"
                                     >
                                         Approve & Pay
                                     </button>
                                 </div>
                             </div>
                         </div>
                     ))}
                 </div>
             )}
         </div>
      )}
    </div>
  );
};