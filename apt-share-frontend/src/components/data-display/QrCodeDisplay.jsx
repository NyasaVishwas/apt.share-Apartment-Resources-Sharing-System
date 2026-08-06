import React from 'react';
import { QrCode, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';

export const QrCodeDisplay = ({ qrData, tokenType, isOwner, onScanSimulate, loading }) => {
  if (!qrData) return null;

  return (
    <div className="ledger-ticket p-6 relative overflow-hidden bg-surface">
      {/* Ticket Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border text-xs font-mono">
        <div className="flex items-center space-x-2 text-ink">
          <ShieldCheck className="w-4 h-4 text-teal" />
          <span className="font-bold uppercase tracking-wider">
            DYNAMIC VERIFICATION TAG // {tokenType.toUpperCase()}
          </span>
        </div>
        <span className="text-ink-secondary">EXP: 24-HOUR TOKEN</span>
      </div>

      {!isOwner ? (
        /* Borrower View: Ticket with QR Code */
        <div className="py-6 space-y-4 text-center">
          <div className="w-56 h-56 mx-auto bg-surface border border-border rounded-lg p-4 shadow-sm flex flex-col items-center justify-center relative">
            <div className="w-full h-full border-4 border-ink p-3 flex flex-col justify-between bg-white text-ink">
              <div className="flex justify-between">
                <div className="w-10 h-10 bg-ink"></div>
                <div className="w-10 h-10 bg-ink"></div>
              </div>
              <div className="text-[11px] font-mono font-bold tracking-widest text-center break-all px-1 text-ink">
                {qrData.rawToken?.slice(0, 20)}...
              </div>
              <div className="flex justify-between">
                <div className="w-10 h-10 bg-ink"></div>
                <div className="w-5 h-5 bg-ink"></div>
              </div>
            </div>

            {/* Stamp Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="stamp-badge stamp-badge-amber animate-stamp-thud shadow-lg bg-surface/95 px-4 py-2 text-xs">
                {tokenType === 'pickup' ? 'READY FOR PICKUP' : 'READY FOR RETURN'}
              </div>
            </div>
          </div>

          <div className="ticket-divider"></div>

          <div className="text-xs font-mono text-ink-secondary space-y-1">
            <p className="font-semibold text-ink">INSTRUCTIONS FOR DOORSTEP HANDOFF</p>
            <p>Present this QR code tag to the owner. Once scanned, status flips to confirmed instantly on the ledger.</p>
          </div>
        </div>
      ) : (
        /* Owner View: Scanner Simulation Card */
        <div className="py-6 space-y-4">
          <div className="ledger-ticket-sunken p-5 text-xs font-mono space-y-2">
            <div className="flex items-center justify-between text-ink font-bold border-b border-border/60 pb-2">
              <span>SCANNER INTERFACE READY</span>
              <span className="stamp-badge stamp-badge-teal text-[10px]">ACTIVE SCANNER</span>
            </div>
            <p className="text-ink-secondary leading-relaxed">
              Target the borrower's phone screen to verify {tokenType} handoff. Scanned timestamps and deposit state will automatically log in your building ledger.
            </p>
          </div>

          <div className="pt-2">
            <Button
              loading={loading}
              onClick={() => onScanSimulate(qrData.rawToken)}
              variant="teal"
              size="lg"
              className="w-full font-mono tracking-wide"
            >
              Simulate QR Scan & Confirm {tokenType === 'pickup' ? 'Item Pickup' : 'Item Return'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
