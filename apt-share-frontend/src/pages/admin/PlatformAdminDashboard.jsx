import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchPendingCommunities, approveCommunity, fetchAuditLogs } from '../../features/analytics/api';
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
      <div className="min-h-screen bg-bg flex items-center justify-center text-text-secondary">
        Loading Platform Super Admin control panel...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-text-primary flex flex-col">
      <header className="border-b border-border bg-surface sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="inline-flex items-center space-x-2 text-sm text-text-secondary hover:text-text-primary">
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
          <span className="font-bold text-base">Super Admin Platform Panel</span>
          <div></div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 flex-1 w-full space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Platform Control Center</h1>
          <p className="text-sm text-text-secondary mt-1">
            Approve new society registration applications and inspect platform audit trails
          </p>
        </div>

        {/* Pending Communities Approval Queue */}
        <div>
          <h2 className="text-base font-bold mb-4 flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-accent" />
            <span>Pending Community Onboarding Queue</span>
          </h2>
          {pendingCommunities.length === 0 ? (
            <Card className="p-8 text-center text-text-secondary text-sm">
              No pending community registration requests.
            </Card>
          ) : (
            <div className="space-y-3">
              {pendingCommunities.map((c) => (
                <Card key={c._id} className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-sm">{c.name}</h3>
                    <p className="text-xs text-text-secondary">
                      Type: {c.type} • City: {c.address?.city} • Applicant: {c.requestedByUserId?.name} ({c.requestedByUserId?.email})
                    </p>
                  </div>
                  <Button size="sm" onClick={() => handleApprove(c._id)} className="flex items-center space-x-1">
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    <span>Approve Society</span>
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Platform Audit Trail Logs */}
        <div>
          <h2 className="text-base font-bold mb-4 flex items-center space-x-2">
            <History className="w-5 h-5 text-accent" />
            <span>Global Audit Trail Logs</span>
          </h2>
          <div className="space-y-2">
            {auditLogs.map((log) => (
              <Card key={log._id} className="p-3 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="font-bold text-accent">[{log.action}]</span> By {log.actorUserId?.name || 'Admin'}
                </div>
                <span className="text-text-secondary">{new Date(log.createdAt).toLocaleString()}</span>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
