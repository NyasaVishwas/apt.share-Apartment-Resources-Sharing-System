import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchUserAnalytics, fetchCommunityAnalytics } from '../../features/analytics/api';
import { formatINR } from '../../lib/formatters';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ArrowLeft, IndianRupee, Leaf, Package, Award } from 'lucide-react';

export const AnalyticsPage = () => {
  const [userMetrics, setUserMetrics] = useState(null);
  const [commMetrics, setCommMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    const activeCommunityId = localStorage.getItem('activeCommunityId');
    try {
      const uRes = await fetchUserAnalytics();
      setUserMetrics(uRes.metrics);

      if (activeCommunityId) {
        const cRes = await fetchCommunityAnalytics(activeCommunityId);
        setCommMetrics(cRes.metrics);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center font-mono text-ink-secondary">
        Computing sustainability & financial ledger metrics...
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
          <span className="font-bold text-sm text-ink">SUSTAINABILITY & SAVINGS AUDIT</span>
          <div></div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 flex-1 w-full space-y-8">
        <div className="border-b border-border pb-4">
          <div className="text-xs font-mono uppercase tracking-wider text-ink-secondary mb-1">
            IMPACT METRICS
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink tracking-tight">
            Your Environmental & Financial Impact
          </h1>
          <p className="text-sm text-ink-secondary mt-1">
            Real-time sustainability ledger metrics powered by neighborhood sharing instead of purchasing
          </p>
        </div>

        {/* Personal Impact Stat Cards */}
        <div className="space-y-3">
          <h2 className="font-mono text-xs text-ink-secondary uppercase tracking-widest font-semibold">
            Personal Impact Summary
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="ledger-ticket p-5 flex items-center space-x-4 border-teal/40">
              <div className="p-3.5 rounded bg-teal/10 text-teal border border-teal/30">
                <IndianRupee className="w-6 h-6" />
              </div>
              <div className="font-mono">
                <span className="text-[10px] text-ink-secondary uppercase block">Money Saved</span>
                <h3 className="text-2xl font-serif font-bold text-ink mt-0.5">
                  {formatINR(userMetrics?.moneySaved || 0, { compact: true })}
                </h3>
              </div>
            </div>

            <div className="ledger-ticket p-5 flex items-center space-x-4 border-teal/40">
              <div className="p-3.5 rounded bg-teal/10 text-teal border border-teal/30">
                <Leaf className="w-6 h-6" />
              </div>
              <div className="font-mono">
                <span className="text-[10px] text-ink-secondary uppercase block">CO₂ Offset</span>
                <h3 className="text-2xl font-serif font-bold text-ink mt-0.5">
                  {userMetrics?.co2Saved || 0} kg
                </h3>
              </div>
            </div>

            <div className="ledger-ticket p-5 flex items-center space-x-4">
              <div className="p-3.5 rounded bg-amber/10 text-ink border border-amber/30">
                <Package className="w-6 h-6" />
              </div>
              <div className="font-mono">
                <span className="text-[10px] text-ink-secondary uppercase block">Items Borrowed</span>
                <h3 className="text-2xl font-serif font-bold text-ink mt-0.5">
                  {userMetrics?.itemsBorrowed || 0}
                </h3>
              </div>
            </div>

            <div className="ledger-ticket p-5 flex items-center space-x-4">
              <div className="p-3.5 rounded bg-amber/10 text-ink border border-amber/30">
                <Award className="w-6 h-6" />
              </div>
              <div className="font-mono">
                <span className="text-[10px] text-ink-secondary uppercase block">Items Shared</span>
                <h3 className="text-2xl font-serif font-bold text-ink mt-0.5">
                  {userMetrics?.itemsLent || 0}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Community Cumulative Impact */}
        {commMetrics && (
          <div className="ledger-ticket p-6 space-y-4">
            <h2 className="font-serif font-bold text-xl text-ink">Society Cumulative Impact</h2>
            <div className="grid sm:grid-cols-3 gap-6 pt-2 font-mono">
              <div className="p-4 rounded bg-surface-sunken border border-border">
                <span className="text-[10px] text-ink-secondary uppercase block">Total Society Savings</span>
                <p className="text-2xl font-serif font-bold text-teal mt-1">{formatINR(commMetrics.moneySaved, { compact: true })}</p>
              </div>
              <div className="p-4 rounded bg-surface-sunken border border-border">
                <span className="text-[10px] text-ink-secondary uppercase block">Total CO₂ Prevented</span>
                <p className="text-2xl font-serif font-bold text-teal mt-1">{commMetrics.co2Saved} kg</p>
              </div>
              <div className="p-4 rounded bg-surface-sunken border border-border">
                <span className="text-[10px] text-ink-secondary uppercase block">Active Shared Inventory</span>
                <p className="text-2xl font-serif font-bold text-ink mt-1">{commMetrics.activeListingsCount} Items</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
