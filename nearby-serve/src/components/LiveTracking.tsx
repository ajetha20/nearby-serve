import React from 'react';
import { DeliveryRequest } from '../types';
import { CheckCircle2, Circle, Clock, MapPin, Truck } from 'lucide-react';

interface LiveTrackingProps {
  request: DeliveryRequest;
}

export const LiveTracking: React.FC<LiveTrackingProps> = ({ request }) => {
  const steps = [
    { id: 'pending', label: 'Requested', icon: Clock },
    { id: 'accepted', label: 'Volunteer Assigned', icon: CheckCircle2 },
    { id: 'picked_up', label: 'Food Picked Up', icon: Truck },
    { id: 'delivered', label: 'Delivered', icon: MapPin },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === request.status);

  return (
    <div className="w-full">
      <div className="relative flex justify-between items-center mb-6">
        {/* Progress Bar Background */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 z-0"></div>
        
        {/* Active Progress */}
        <div 
          className="absolute top-1/2 left-0 h-1 bg-green-500 -translate-y-1/2 z-0 transition-all duration-500"
          style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
        ></div>

        {steps.map((step, idx) => {
          const isActive = idx <= currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          
          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${isActive ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-slate-200 text-slate-300'}`}
              >
                <step.icon className="w-4 h-4" />
              </div>
              <span className={`text-[10px] mt-2 font-bold whitespace-nowrap ${isCurrent ? 'text-green-600' : 'text-slate-400'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="bg-slate-50 rounded-lg p-3 text-sm space-y-2 border border-slate-100">
         <div className="flex justify-between">
           <span className="text-slate-500">Item:</span>
           <span className="font-medium text-slate-900">{request.items}</span>
         </div>
         {request.volunteerName && (
           <div className="flex justify-between">
             <span className="text-slate-500">Volunteer:</span>
             <span className="font-medium text-indigo-600">{request.volunteerName}</span>
           </div>
         )}
         <div className="flex justify-between">
           <span className="text-slate-500">Recipient:</span>
           <span className="font-medium text-slate-900">{request.recipientName}</span>
         </div>
      </div>
    </div>
  );
};