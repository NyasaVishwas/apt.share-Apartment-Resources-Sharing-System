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
    <div className="min-h-screen bg-bg text-text-primary flex flex-col">
      <header className="border-b border-border bg-surface sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="inline-flex items-center space-x-2 text-sm text-text-secondary hover:text-text-primary">
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
          <span className="font-bold text-base">Community Admin Dispute Center</span>
          <div></div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 flex-1 w-full space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Damage Incident Queue</h1>
          <p className="text-sm text-text-secondary mt-1">
            Review resident claims, photo evidence, and authorize deposit ledger adjustments
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((n) => (
              <div key={n} className="h-28 bg-surface border border-border rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : reports.length === 0 ? (
          <Card className="p-12 text-center space-y-3">
            <ShieldAlert className="w-12 h-12 text-success mx-auto" />
            <h3 className="text-lg font-semibold">No Pending Disputes</h3>
            <p className="text-sm text-text-secondary">Your community currently has 0 open damage reports.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {reports.map((r) => (
              <Card key={r._id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-sm text-text-primary">
                      {r.bookingId?.listingId?.title || 'Shared Resource'}
                    </h3>
                    <Badge variant={r.status === 'open' ? 'danger' : 'default'}>
                      {r.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-text-secondary">
                    Reported by: <span className="font-semibold text-text-primary">{r.reportedByUserId?.name}</span> against <span className="font-semibold text-text-primary">{r.againstUserId?.name}</span>
                  </p>
                  <p className="text-xs text-text-secondary italic">"{r.description}"</p>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-xs font-semibold text-accent">
                    Deposit Hold: ₹{r.bookingId?.listingId?.securityDeposit || 0}
                  </span>
                  {r.status === 'open' && (
                    <Button size="sm" onClick={() => setSelectedReport(r)}>
                      Review & Resolve
                    </Button>
                  )}
                </div>
              </Card>
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
        <form onSubmit={handleResolve} className="space-y-4">
          {error && <div className="p-3 rounded bg-danger/10 border border-danger/20 text-danger text-sm">{error}</div>}

          <div className="p-3 bg-bg-elevated rounded border border-border text-xs space-y-1">
            <p><span className="font-semibold">Claim:</span> {selectedReport?.description}</p>
            <p><span className="font-semibold">Deposit Hold Amount:</span> ₹{selectedReport?.bookingId?.listingId?.securityDeposit}</p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Admin Decision
            </label>
            <select
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-surface border border-border rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="deduct">Deduct Deposit & Compensate Owner</option>
              <option value="dismiss">Dismiss Claim & Release Deposit</option>
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
            label="Resolution Note"
            placeholder="Reasoning for decision logged to immutable audit trail..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            required
          />

          <Button type="submit" loading={actionLoading} className="w-full">
            Authorize Decision & Log Audit Event
          </Button>
        </form>
      </Modal>
    </div>
  );
};
