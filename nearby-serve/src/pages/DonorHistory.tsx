import React from 'react';
import { DeliveryRequest } from '../types';
import { LiveTracking } from '../components/LiveTracking';
import { Calendar, PackageOpen, Lock } from 'lucide-react';

interface DonorHistoryProps {
  requests: DeliveryRequest[];
}

export const DonorHistory: React.FC<DonorHistoryProps> = ({ requests }) => {
  const activeRequests = requests.filter(r => r.status !== 'delivered');
  const pastRequests = requests.filter(r => r.status === 'delivered');

  return (
    <div className="pt-24 pb-12 px-4 max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-slate-900">My Donations</h1>

      {/* Active Tracking */}
      <section>
        <h2 className="text-lg font-bold text-orange-600 mb-4 flex items-center">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse mr-2"></div>
          Live Tracking
        </h2>
        {activeRequests.length === 0 ? (
          <div className="bg-white p-6 rounded-2xl border border-dashed border-slate-200 text-center text-slate-400">
            No active donations right now.
          </div>
        ) : (
          <div className="space-y-6">
            {activeRequests.map(req => (
              <div key={req.id} className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
                <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                  <div>
                     <h3 className="font-bold text-xl text-slate-900">Pickup #{req.id.slice(-4)}</h3>
                     <p className="text-slate-500 text-sm">To: {req.recipientName}</p>
                  </div>
                  {req.pickupOtp && req.status !== 'picked_up' && (
                    <div className="bg-blue-50 border border-blue-200 px-6 py-3 rounded-xl flex items-center gap-3">
                       <div className="bg-blue-100 p-2 rounded-full">
                         <Lock className="w-4 h-4 text-blue-600" />
                       </div>
                       <div>
                         <span className="block text-[10px] uppercase font-bold text-blue-500 tracking-wider">Share OTP with Volunteer</span>
                         <span className="block text-2xl font-mono font-black text-blue-700 tracking-[0.2em]">{req.pickupOtp}</span>
                       </div>
                    </div>
                  )}
                </div>
                <LiveTracking request={req} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* History */}
      <section>
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
          <HistoryIcon className="w-5 h-5 mr-2" />
          Past Donations
        </h2>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {pastRequests.length === 0 ? (
             <div className="p-8 text-center text-slate-500">You haven't made any donations yet.</div>
          ) : (
             <div className="divide-y divide-slate-100">
               {pastRequests.map(req => (
                 <div key={req.id} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center hover:bg-slate-50 transition-colors">
                    <div className="mb-2 sm:mb-0">
                      <h4 className="font-bold text-slate-800 text-lg">{req.items}</h4>
                      <div className="text-sm text-slate-500 flex items-center mt-1">
                        <Calendar className="w-3.5 h-3.5 mr-1" />
                        {new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        <span className="mx-2">•</span>
                        To: {req.recipientName}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full flex items-center">
                        Delivered
                      </span>
                      <span className="ml-4 font-bold text-slate-300">₹{req.serviceFee} Fee</span>
                    </div>
                 </div>
               ))}
             </div>
          )}
        </div>
      </section>
    </div>
  );
};

const HistoryIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 12"/></svg>
);