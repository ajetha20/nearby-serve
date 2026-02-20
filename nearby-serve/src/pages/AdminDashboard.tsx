import React, { useState, useEffect } from 'react';
import { DeliveryRequest, Recipient, Volunteer } from '../types';
import { generateRecipientBio } from '../services/geminiService';
import * as firebaseService from '../services/firebaseService';
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
  volunteers
}) => {

  const [activeTab, setActiveTab] =
    useState<'recipients' | 'volunteers' | 'payouts'>('recipients');

  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    rawNotes: '',
    needs: '',
    addressLabel: '',
    count: 1
  });

  const [isAddingVol, setIsAddingVol] = useState(false);
  const [volForm, setVolForm] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const [deliveredRequests, setDeliveredRequests] = useState<DeliveryRequest[]>([]);

  // 🔥 realtime payout listener
  useEffect(() => {
    const unsub = firebaseService.listenDeliveredRequests(setDeliveredRequests);
    return () => unsub();
  }, []);

  // ================= ADD RECIPIENT =================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newRecipient: Omit<Recipient, "id"> = {
  name: formData.name,
  count: formData.count,
  description: formData.rawNotes,
  needs: formData.needs.split(',').map((s) => s.trim()),
  location: {
    lat: CENTER_LAT,
    lng: CENTER_LNG,
    addressLabel: formData.addressLabel
  },
  imageUrl: `https://picsum.photos/200/200?random=${Date.now()}`,
  status: 'active',
  lastSeen: Date.now()
};

await firebaseService.addRecipient(newRecipient as Recipient);

    setIsAdding(false);
    setFormData({
      name: '',
      rawNotes: '',
      needs: '',
      addressLabel: '',
      count: 1
    });
  };

  // ================= ADD VOLUNTEER =================
  const handleVolSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newVol = {
      name: volForm.name,
      email: volForm.email,
      phone: volForm.phone,
      verified: true,
      totalDeliveries: 0,
      isOnline: false,
      location: { lat: CENTER_LAT, lng: CENTER_LNG }
    };

    await firebaseService.addVolunteer(newVol);

    setIsAddingVol(false);
    setVolForm({ name: '', email: '', phone: '' });

    alert(`Volunteer ${newVol.name} added successfully!`);
  };

  // ================= PAYOUT =================
  const handleApprovePayout = async (reqId: string) => {
    await firebaseService.markRequestPaid(reqId);
    alert('Payment Approved!');
  };

  return (
    <div className="max-w-6xl mx-auto p-6 pt-24 min-h-screen">

      {/* TABS */}
      <div className="flex gap-2 mb-8">
        <button onClick={() => setActiveTab('recipients')} className="px-4 py-2 bg-black text-white rounded">Recipients</button>
        <button onClick={() => setActiveTab('volunteers')} className="px-4 py-2 bg-black text-white rounded">Volunteers</button>
        <button onClick={() => setActiveTab('payouts')} className="px-4 py-2 bg-black text-white rounded">
          Payouts ({deliveredRequests.length})
        </button>
      </div>

      {/* ================= RECIPIENTS ================= */}
      {activeTab === 'recipients' && (
        <div>
          <button onClick={() => setIsAdding(!isAdding)} className="bg-black text-white px-4 py-2 rounded mb-4">
            {isAdding ? 'Cancel' : 'Add Recipient'}
          </button>

          {isAdding && (
            <form onSubmit={handleSubmit} className="bg-white p-4 rounded border mb-6 space-y-3">
              <input required placeholder="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border p-2 rounded"
              />

              <input required placeholder="Address"
                value={formData.addressLabel}
                onChange={(e) => setFormData({ ...formData, addressLabel: e.target.value })}
                className="w-full border p-2 rounded"
              />

              <textarea required placeholder="Notes"
                value={formData.rawNotes}
                onChange={(e) => setFormData({ ...formData, rawNotes: e.target.value })}
                className="w-full border p-2 rounded"
              />

              <button type="submit" className="bg-black text-white px-6 py-2 rounded">Save</button>
            </form>
          )}

          {recipients.map(r => (
            <div key={r.id} className="border p-3 rounded mb-3">
              <div className="font-bold">{r.name}</div>
              <div className="text-sm text-gray-500">{r.location.addressLabel}</div>
            </div>
          ))}
        </div>
      )}

      {/* ================= VOLUNTEERS ================= */}
      {activeTab === 'volunteers' && (
        <div>
          <button onClick={() => setIsAddingVol(!isAddingVol)} className="bg-green-600 text-white px-4 py-2 rounded mb-4">
            {isAddingVol ? 'Cancel' : 'Add Volunteer'}
          </button>

          {isAddingVol && (
            <form onSubmit={handleVolSubmit} className="bg-white p-4 rounded border mb-6 space-y-3">
              <input required placeholder="Name"
                value={volForm.name}
                onChange={(e) => setVolForm({ ...volForm, name: e.target.value })}
                className="w-full border p-2 rounded"
              />
              <input required placeholder="Email"
                value={volForm.email}
                onChange={(e) => setVolForm({ ...volForm, email: e.target.value })}
                className="w-full border p-2 rounded"
              />
              <input required placeholder="Phone"
                value={volForm.phone}
                onChange={(e) => setVolForm({ ...volForm, phone: e.target.value })}
                className="w-full border p-2 rounded"
              />

              <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded">Create</button>
            </form>
          )}

          {volunteers.map(v => (
            <div key={v.id} className="border p-3 rounded mb-3">
              <div className="font-bold">{v.name}</div>
              <div className="text-sm">{v.email}</div>
              <div className="text-sm">{v.phone}</div>
            </div>
          ))}
        </div>
      )}

      {/* ================= PAYOUT ================= */}
      {activeTab === 'payouts' && (
        <div className="space-y-4">
          {deliveredRequests.map(req => (
            <div key={req.id} className="border p-4 rounded">
              <div className="font-bold">{req.items}</div>
              <div>₹{req.serviceFee}</div>
              <button
                onClick={() => handleApprovePayout(req.id)}
                className="bg-black text-white px-5 py-2 rounded mt-2"
              >
                Approve & Pay
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
