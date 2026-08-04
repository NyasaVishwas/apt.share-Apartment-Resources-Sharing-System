import React from 'react';
import { QrCode, ShieldCheck, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';

export const QrCodeDisplay = ({ qrData, tokenType, isOwner, onScanSimulate, loading }) => {
  if (!qrData) return null;

  return (
    <div className="bg-surface border border-border rounded-lg p-6 text-center space-y-4 shadow-sm">
      <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold">
        <ShieldCheck className="w-4 h-4" />
        <span className="capitalize">{tokenType} Dynamic Verification Token</span>
      </div>

      {!isOwner ? (
        // Borrower View: Show QR Code
        <div className="space-y-3">
          <div className="w-48 h-48 mx-auto bg-white p-4 border border-border rounded-lg shadow-inner flex flex-col items-center justify-center">
            {/* Visual QR pattern representation */}
            <div className="w-full h-full border-4 border-black p-2 flex flex-col justify-between">
              <div className="flex justify-between">
                <div className="w-8 h-8 bg-black"></div>
                <div className="w-8 h-8 bg-black"></div>
              </div>
              <div className="text-[10px] font-mono tracking-widest font-bold break-all text-black px-1">
                {qrData.rawToken?.slice(0, 16)}...
              </div>
              <div className="flex justify-between">
                <div className="w-8 h-8 bg-black"></div>
                <div className="w-3 h-3 bg-black"></div>
              </div>
            </div>
          </div>
          <p className="text-xs text-text-secondary">
            Show this QR code to the owner upon {tokenType} handoff to confirm timestamp.
          </p>
        </div>
      ) : (
        // Owner View: Scanner Simulation Card
        <div className="space-y-3">
          <div className="p-4 bg-bg-elevated border border-border rounded-md text-xs text-text-secondary">
            <p className="font-semibold text-text-primary mb-1">Owner Scanner Active</p>
            <p>Scan the borrower's phone screen to verify {tokenType} handoff.</p>
          </div>
          <Button
            loading={loading}
            onClick={() => onScanSimulate(qrData.rawToken)}
            className="w-full font-bold"
          >
            Simulate QR Code Scan & Confirm {tokenType === 'pickup' ? 'Pickup' : 'Return'}
          </Button>
        </div>
      )}
    </div>
  );
};
