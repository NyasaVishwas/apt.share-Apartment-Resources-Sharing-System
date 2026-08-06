import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchPendingCommunities, approveCommunity, fetchAuditLogs } from '../../features/analytics/api';
import { formatIndianDateTime } from '../../lib/formatters';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ArrowLeft, Building2, CheckCircle2, ShieldCheck, History } from 'lucide-react';

export const PlatformAdminDashboard = () => {
  const [pendingCommunities, setPendingCommunities] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const pRes = await fetchPendingCommunities();
      setPendingCommunities(pRes);

      const aRes = await fetchAuditLogs();
      setAuditLogs(aRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveCommunity(id);
      setPendingCommunities((prev) => prev.filter((c) => c._id !== id));
      const logs = await fetchAuditLogs();
      setAuditLogs(logs);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center font-mono text-ink-secondary">
        Loading Platform Super Admin Panel...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col font-sans selection:bg-amber selection:text-ink">
      <header className="border-b border-border bg-surface sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between font-mono">
          <Link to="/dashboard" className="inline-flex items-center space-x-2 text-xs text-ink-secondary hover:text-ink">
            <ArrowLeft className="w-4 h-4" />
            <span>RETURN TO DASHBOARD</span>
          </Link>
          <span className="font-bold text-sm text-ink">SUPER ADMIN PLATFORM CONTROL</span>
          <div></div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 flex-1 w-full space-y-8">
        <div className="border-b border-border pb-4">
          <div className="text-xs font-mono uppercase tracking-wider text-ink-secondary mb-1">
            PLATFORM MANAGEMENT
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink tracking-tight">Platform Control Center</h1>
          <p className="text-sm text-ink-secondary mt-1">
            Approve new society registration applications and inspect global platform audit trails
          </p>
        </div>

        {/* Pending Communities Approval Queue */}
        <div className="space-y-4">
          <h2 className="font-serif font-bold text-lg text-ink flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-amber" />
            <span>Pending Society Onboarding Queue</span>
          </h2>
          {pendingCommunities.length === 0 ? (
            <div className="ledger-ticket-sunken p-8 text-center text-ink-secondary font-mono text-xs">
              No pending residential society registration requests.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingCommunities.map((c) => (
                <div key={c._id} className="ledger-ticket p-4 flex items-center justify-between font-mono text-xs">
                  <div>
                    <h3 className="font-serif font-bold text-base text-ink">{c.name}</h3>
                    <p className="text-ink-secondary mt-0.5">
                      Type: {c.type} • City: {c.address?.city || 'Bengaluru'} • Applicant: {c.requestedByUserId?.name} ({c.requestedByUserId?.email})
                    </p>
                  </div>
                  <Button size="sm" variant="primary" onClick={() => handleApprove(c._id)} className="font-mono flex items-center space-x-1">
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    <span>APPROVE SOCIETY</span>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Platform Audit Trail Logs */}
        <div className="space-y-4">
          <h2 className="font-serif font-bold text-lg text-ink flex items-center space-x-2">
            <History className="w-5 h-5 text-amber" />
            <span>Global Audit Trail Logs</span>
          </h2>
          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div key={log._id} className="ledger-ticket p-3 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="font-bold text-amber">[{log.action}]</span> By {log.actorUserId?.name || 'Admin'}
                </div>
                <span className="text-ink-secondary">{formatIndianDateTime(log.createdAt)}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
