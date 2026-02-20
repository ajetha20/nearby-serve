import React, { useState } from 'react';
import { DeliveryRequest, Volunteer, Recipient } from '../types';
import * as firebaseService from '../services/firebaseService';
import { CENTER_LAT } from '../constants';

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
  userLocation,
}) => {

  const [activeTab, setActiveTab] =
    useState<'deliveries' | 'spot'>('deliveries');

  const [spotForm, setSpotForm] = useState({
    description: '',
    locationName: '',
    needs: '',
    count: 1
  });

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const myDeliveries = requests.filter(
    r => r.volunteerId === volunteer.id && r.status !== 'paid'
  );

  // ================= ACCEPT REQUEST =================
  const acceptTask = async (req: DeliveryRequest) => {
    await firebaseService.updateRequest(req.id!, {
      status: 'accepted',
      volunteerId: volunteer.id,
      volunteerName: volunteer.name
    });
  };

  // ================= MARK DELIVERED =================
  const markDelivered = async (req: DeliveryRequest) => {
    await firebaseService.updateRequest(req.id!, {
      status: 'delivered'
    });
  };

  // ================= PIN NEW LOCATION =================
  const handleSpotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newSpot: Omit<Recipient, "id"> = {
  name: `Group at ${spotForm.locationName}`,
  count: Number(spotForm.count),
  description: spotForm.description,
  needs: spotForm.needs.split(',').map(s => s.trim()),
  location: {
    lat: userLocation.lat,
    lng: userLocation.lng,
    addressLabel: spotForm.locationName
  },
  imageUrl: `https://picsum.photos/400/300?random=${Date.now()}`,
  status: 'active',
  lastSeen: Date.now(),
  reportedBy: volunteer.name
};

await firebaseService.addRecipient(newSpot as Recipient);

    setSpotForm({
      description: '',
      locationName: '',
      needs: '',
      count: 1
    });

    alert("Location pinned successfully!");
  };

  return (
    <div className="max-w-6xl mx-auto p-6 pt-24 min-h-screen">

      {/* TABS */}
      <div className="flex gap-3 mb-8">
        <button
          onClick={() => setActiveTab('deliveries')}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Deliveries
        </button>

        <button
          onClick={() => setActiveTab('spot')}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Update Map
        </button>
      </div>

      {/* ================= DELIVERIES ================= */}
      {activeTab === 'deliveries' && (
        <div className="grid md:grid-cols-2 gap-6">

          {/* Pending */}
          <div>
            <h2 className="font-bold text-lg mb-4">
              Available Requests ({pendingRequests.length})
            </h2>

            {pendingRequests.map(req => (
              <div key={req.id} className="border p-4 rounded mb-4">
                <div className="font-bold">{req.items}</div>
                <div className="text-sm text-gray-500">
                  From: {req.donorName}
                </div>
                <button
                  onClick={() => acceptTask(req)}
                  className="bg-black text-white px-4 py-2 rounded mt-3"
                >
                  Accept Task
                </button>
              </div>
            ))}
          </div>

          {/* My Tasks */}
          <div>
            <h2 className="font-bold text-lg mb-4">
              My Active Tasks ({myDeliveries.length})
            </h2>

            {myDeliveries.map(req => (
              <div key={req.id} className="border p-4 rounded mb-4">
                <div className="font-bold">{req.items}</div>
                <div className="text-sm">
                  Status: {req.status}
                </div>

                {req.status === 'accepted' && (
                  <button
                    onClick={() => markDelivered(req)}
                    className="bg-green-600 text-white px-4 py-2 rounded mt-3"
                  >
                    Mark Delivered
                  </button>
                )}
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ================= PIN LOCATION ================= */}
      {activeTab === 'spot' && (
        <div className="max-w-xl">
          <h2 className="font-bold text-lg mb-4">
            Pin New Location
          </h2>

          <form
            onSubmit={handleSpotSubmit}
            className="space-y-4 border p-4 rounded"
          >
            <input
              required
              placeholder="Location Name"
              value={spotForm.locationName}
              onChange={(e) =>
                setSpotForm({ ...spotForm, locationName: e.target.value })
              }
              className="w-full border p-2 rounded"
            />

            <input
              required
              type="number"
              min="1"
              placeholder="Count"
              value={spotForm.count}
              onChange={(e) =>
                setSpotForm({ ...spotForm, count: Number(e.target.value) })
              }
              className="w-full border p-2 rounded"
            />

            <input
              required
              placeholder="Needs (comma separated)"
              value={spotForm.needs}
              onChange={(e) =>
                setSpotForm({ ...spotForm, needs: e.target.value })
              }
              className="w-full border p-2 rounded"
            />

            <textarea
              required
              placeholder="Details"
              value={spotForm.description}
              onChange={(e) =>
                setSpotForm({ ...spotForm, description: e.target.value })
              }
              className="w-full border p-2 rounded"
            />

            <button
              type="submit"
              className="bg-black text-white px-6 py-2 rounded"
            >
              Pin Location
            </button>
          </form>
        </div>
      )}

    </div>
  );
};
