import React from 'react';
import { CheckCircle2, Clock, QrCode, Check } from 'lucide-react';

const STEPS = [
  { id: 'pending', label: 'Requested' },
  { id: 'confirmed', label: 'Approved' },
  { id: 'active', label: 'Picked Up' },
  { id: 'completed', label: 'Returned' }
];

export const BookingTimeline = ({ status }) => {
  if (['declined', 'cancelled'].includes(status)) {
    return (
      <div className="p-4 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm font-medium text-center capitalize">
        Booking {status}
      </div>
    );
  }

  const getStepIndex = (st) => {
    switch (st) {
      case 'pending': return 0;
      case 'confirmed': return 1;
      case 'active': return 2;
      case 'completed': return 3;
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(status);

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        {/* Background Connector Bar */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2 z-0" />
        <div
          className="absolute top-1/2 left-0 h-0.5 bg-accent -translate-y-1/2 z-0 transition-all duration-500"
          style={{ width: `${(currentIndex / (STEPS.length - 1)) * 100}%` }}
        />

        {STEPS.map((step, idx) => {
          const isDone = idx <= currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  isDone
                    ? 'bg-accent text-white shadow-sm ring-4 ring-bg'
                    : 'bg-surface border border-border text-text-secondary'
                } ${isCurrent ? 'ring-2 ring-accent ring-offset-2' : ''}`}
              >
                {isDone ? <Check className="w-4 h-4" /> : idx + 1}
              </div>
              <span className={`text-xs mt-2 font-medium ${isCurrent ? 'text-accent font-semibold' : 'text-text-secondary'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
