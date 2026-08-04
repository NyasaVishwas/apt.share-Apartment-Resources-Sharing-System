import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchUserAnalytics, fetchCommunityAnalytics } from '../../features/analytics/api';
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
      <div className="min-h-screen bg-bg flex items-center justify-center text-text-secondary">
        Computing sustainability impact analytics...
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
          <span className="font-bold text-base">Sustainability & Savings Analytics</span>
          <div></div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 flex-1 w-full space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Your Environmental & Financial Impact</h1>
          <p className="text-sm text-text-secondary mt-1">
            Real-time sustainability metrics powered by borrowing instead of purchasing
          </p>
        </div>

        {/* Personal Impact Stat Cards */}
        <div>
          <h2 className="text-base font-semibold mb-4 text-text-secondary uppercase tracking-wider text-xs">
            Personal Impact Summary
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Card elevated className="p-5 flex items-center space-x-4 border-success/30">
              <div className="p-3.5 rounded-lg bg-success/10 text-success">
                <IndianRupee className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs text-text-secondary font-medium">Money Saved</span>
                <h3 className="text-2xl font-extrabold text-text-primary mt-0.5">
                  ₹{userMetrics?.moneySaved || 0}
                </h3>
              </div>
            </Card>

            <Card elevated className="p-5 flex items-center space-x-4 border-success/30">
              <div className="p-3.5 rounded-lg bg-success/10 text-success">
                <Leaf className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs text-text-secondary font-medium">CO₂ Offset</span>
                <h3 className="text-2xl font-extrabold text-text-primary mt-0.5">
                  {userMetrics?.co2Saved || 0} kg
                </h3>
              </div>
            </Card>

            <Card elevated className="p-5 flex items-center space-x-4">
              <div className="p-3.5 rounded-lg bg-accent/10 text-accent">
                <Package className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs text-text-secondary font-medium">Items Borrowed</span>
                <h3 className="text-2xl font-extrabold text-text-primary mt-0.5">
                  {userMetrics?.itemsBorrowed || 0}
                </h3>
              </div>
            </Card>

            <Card elevated className="p-5 flex items-center space-x-4">
              <div className="p-3.5 rounded-lg bg-warning/10 text-warning">
                <Award className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs text-text-secondary font-medium">Items Shared</span>
                <h3 className="text-2xl font-extrabold text-text-primary mt-0.5">
                  {userMetrics?.itemsLent || 0}
                </h3>
              </div>
            </Card>
          </div>
        </div>

        {/* Community Cumulative Impact */}
        {commMetrics && (
          <Card className="p-6 bg-surface border border-border space-y-4">
            <h2 className="text-base font-bold">Society Cumulative Impact</h2>
            <div className="grid sm:grid-cols-3 gap-6 pt-2">
              <div className="p-4 rounded-lg bg-bg-elevated border border-border">
                <span className="text-xs text-text-secondary font-semibold">Total Society Savings</span>
                <p className="text-2xl font-extrabold text-success mt-1">₹{commMetrics.moneySaved}</p>
              </div>
              <div className="p-4 rounded-lg bg-bg-elevated border border-border">
                <span className="text-xs text-text-secondary font-semibold">Total CO₂ Prevented</span>
                <p className="text-2xl font-extrabold text-success mt-1">{commMetrics.co2Saved} kg</p>
              </div>
              <div className="p-4 rounded-lg bg-bg-elevated border border-border">
                <span className="text-xs text-text-secondary font-semibold">Active Shared Inventory</span>
                <p className="text-2xl font-extrabold text-accent mt-1">{commMetrics.activeListingsCount} Items</p>
              </div>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
};
