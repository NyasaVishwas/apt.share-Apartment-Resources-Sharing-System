import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchCommunityDisputes, resolveDispute } from '../../features/ratings/api';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { ArrowLeft, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';

export const DisputePage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [decision, setDecision] = useState('deduct');
  const [resolutionAmount, setResolutionAmount] = useState('');
  const [note, setNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDisputes();
  }, []);

  const loadDisputes = async () => {
    const activeCommunityId = localStorage.getItem('activeCommunityId');
    if (!activeCommunityId) return;

    try {
      const data = await fetchCommunityDisputes(activeCommunityId);
      setReports(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (e) => {
    e.preventDefault();
    if (!selectedReport) return;
    setActionLoading(true);
    setError('');

    try {
      await resolveDispute(selectedReport._id, {
        decision,
        resolutionAmount: Number(resolutionAmount) || selectedReport.bookingId?.depositAmount || 0,
        note
      });

      setSelectedReport(null);
      await loadDisputes();
    } catch (err) {
      setError(err.message || 'Failed to resolve dispute.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col font-sans selection:bg-amber selection:text-ink">
      <header className="border-b border-border bg-surface sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between font-mono">
          <Link to="/dashboard" className="inline-flex items-center space-x-2 text-xs text-ink-secondary hover:text-ink">
            <ArrowLeft className="w-4 h-4" />
            <span>RETURN TO DASHBOARD</span>
          </Link>
          <span className="font-bold text-sm text-ink">COMMUNITY DISPUTE & AUDIT QUEUE</span>
          <div></div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 flex-1 w-full space-y-6">
        <div className="border-b border-border pb-4">
          <div className="text-xs font-mono uppercase tracking-wider text-ink-secondary mb-1">ADMIN OVERSIGHT</div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink tracking-tight">Damage Incident Queue</h1>
          <p className="text-sm text-ink-secondary mt-1">
            Review resident claims, inspect verification logs, and authorize deposit escrow adjustments.
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((n) => (
              <div key={n} className="h-28 ledger-ticket animate-pulse bg-surface p-5"></div>
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div className="ledger-ticket-sunken p-12 text-center space-y-3">
            <ShieldAlert className="w-12 h-12 text-teal mx-auto opacity-70" />
            <h3 className="font-serif font-bold text-xl text-ink">No Pending Disputes</h3>
            <p className="text-sm text-ink-secondary font-mono">Your building ledger currently has zero unresolved incident reports.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((r) => (
              <div key={r._id} className="ledger-ticket p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-serif font-bold text-base text-ink">
                      {r.bookingId?.listingId?.title || 'Shared Resource'}
                    </h3>
                    <span className={`stamp-badge ${
                      r.status === 'open' 
                        ? 'stamp-badge-danger' 
                        : r.decision === 'deduct' 
                        ? 'stamp-badge-amber' 
                        : 'stamp-badge-teal'
                    } text-[10px] py-0.5 px-2`}>
                      {r.status === 'open' ? 'OPEN INCIDENT' : r.decision ? r.decision.toUpperCase() : 'RESOLVED'}
                    </span>
                  </div>
                  <p className="text-xs text-ink-secondary font-mono">
                    CLAIMANT: <span className="font-bold text-ink">{r.reportedByUserId?.name}</span> • RESPONDENT: <span className="font-bold text-ink">{r.againstUserId?.name}</span>
                  </p>
                  <p className="text-xs text-ink bg-surface-sunken p-2.5 rounded border border-border italic font-serif leading-relaxed">
                    "{r.description}"
                  </p>
                </div>

                <div className="flex items-center space-x-4 shrink-0 font-mono">
                  <div className="text-right">
                    <span className="text-[10px] text-ink-secondary block uppercase">Deposit Escrow</span>
                    <span className="font-bold text-amber text-sm">₹{r.bookingId?.listingId?.securityDeposit || 0}</span>
                  </div>
                  {r.status === 'open' && (
                    <Button size="sm" variant="primary" onClick={() => setSelectedReport(r)} className="font-mono">
                      REVIEW & RESOLVE
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Resolution Modal */}
      <Modal
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        title="Admin Dispute Decision"
      >
        <form onSubmit={handleResolve} className="space-y-4 font-sans">
          {error && <div className="p-3 rounded bg-danger/10 border border-danger/30 text-danger text-xs font-mono">{error}</div>}

          <div className="p-4 bg-surface-sunken rounded border border-border text-xs font-mono space-y-1.5">
            <p><span className="text-ink-secondary">CLAIM:</span> {selectedReport?.description}</p>
            <p><span className="text-ink-secondary">DEPOSIT HOLD:</span> <span className="font-bold text-amber">₹{selectedReport?.bookingId?.listingId?.securityDeposit}</span></p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-ink-secondary">
              ADMIN DECISION
            </label>
            <select
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-surface border border-border rounded-md text-ink font-mono focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber"
            >
              <option value="deduct">STAMP: DEDUCT DEPOSIT & COMPENSATE OWNER</option>
              <option value="dismiss">STAMP: DISMISS CLAIM & RELEASE DEPOSIT</option>
            </select>
          </div>

          {decision === 'deduct' && (
            <Input
              label="Deduction Amount (₹)"
              type="number"
              value={resolutionAmount}
              onChange={(e) => setResolutionAmount(e.target.value)}
              placeholder={selectedReport?.bookingId?.listingId?.securityDeposit}
              required
            />
          )}

          <Input
            label="Resolution Audit Note"
            placeholder="Log technical reasoning to building audit trail..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            required
          />

          <Button type="submit" loading={actionLoading} variant="teal" className="w-full font-mono">
            AUTHORIZE STAMP DECISION
          </Button>
        </form>
      </Modal>
    </div>
  );
};
