import React from 'react';
import { Check } from 'lucide-react';

const STEPS = [
  { id: 'pending', label: '01 / REQUESTED' },
  { id: 'confirmed', label: '02 / APPROVED' },
  { id: 'active', label: '03 / PICKED UP' },
  { id: 'completed', label: '04 / RETURNED' }
];

export const BookingTimeline = ({ status }) => {
  if (['declined', 'cancelled'].includes(status)) {
    return (
      <div className="stamp-badge stamp-badge-danger w-full justify-center py-2 text-xs uppercase font-mono">
        STAMPED RECORD: BOOKING {status}
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
    <div className="w-full py-2 font-mono">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {STEPS.map((step, idx) => {
          const isDone = idx <= currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div
              key={step.id}
              className={`p-3 rounded border text-xs flex flex-col justify-between transition-all ${
                isCurrent
                  ? 'bg-amber/10 border-amber text-ink shadow-sm'
                  : isDone
                  ? 'bg-surface-sunken border-teal/40 text-teal'
                  : 'bg-surface border-border text-ink-secondary/60'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider mb-1">
                <span>{step.label}</span>
                {isDone && <Check className="w-3.5 h-3.5" />}
              </div>
              <div className="text-[10px]">
                {isCurrent ? '• ACTIVE STATE' : isDone ? '✓ VERIFIED' : 'PENDING'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
