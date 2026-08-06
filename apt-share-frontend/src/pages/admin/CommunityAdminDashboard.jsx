import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchAdminOverview, fetchAdminMembers, postAnnouncement } from '../../features/analytics/api';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { ArrowLeft, Users, Package, Megaphone, ShieldAlert } from 'lucide-react';

export const CommunityAdminDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [members, setMembers] = useState([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [pinned, setPinned] = useState(false);
  const [loading, setLoading] = useState(true);
  const [postLoading, setPostLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const oRes = await fetchAdminOverview();
      setOverview(oRes);

      const mRes = await fetchAdminMembers();
      setMembers(mRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    setPostLoading(true);
    setMessage('');

    try {
      await postAnnouncement({ title, body, pinned });
      setTitle('');
      setBody('');
      setPinned(false);
      setMessage('Announcement published to society feed successfully.');
    } catch (err) {
      console.error(err);
    } finally {
      setPostLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center font-mono text-ink-secondary">
        Loading Society Admin Portal...
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
          <span className="font-bold text-sm text-ink">SOCIETY ADMIN PORTAL</span>
          <Link to="/admin/disputes">
            <Button variant="outline" size="sm" className="flex items-center space-x-1 text-danger border-danger/40 hover:bg-danger/10 font-mono text-xs">
              <ShieldAlert className="w-4 h-4 mr-1 text-danger" />
              <span>DISPUTE QUEUE</span>
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 flex-1 w-full space-y-8">
        <div className="border-b border-border pb-4">
          <div className="text-xs font-mono uppercase tracking-wider text-ink-secondary mb-1">
            SOCIETY OVERVIEW & CONTROLS
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink tracking-tight">Society Management Ledger</h1>
          <p className="text-sm text-ink-secondary mt-1">
            Monitor verified residents, active resource listings, and publish society notices
          </p>
        </div>

        {/* Overview Stat Cards */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="ledger-ticket p-5 flex items-center space-x-4">
            <div className="p-3 rounded bg-amber/10 text-ink border border-amber/30">
              <Users className="w-6 h-6" />
            </div>
            <div className="font-mono">
              <span className="text-[10px] text-ink-secondary uppercase block">Active Residents</span>
              <h3 className="text-2xl font-serif font-bold text-ink">{overview?.memberCount || 0}</h3>
            </div>
          </div>

          <div className="ledger-ticket p-5 flex items-center space-x-4">
            <div className="p-3 rounded bg-teal/10 text-teal border border-teal/30">
              <Package className="w-6 h-6" />
            </div>
            <div className="font-mono">
              <span className="text-[10px] text-ink-secondary uppercase block">Shared Catalog Listings</span>
              <h3 className="text-2xl font-serif font-bold text-ink">{overview?.listingCount || 0}</h3>
            </div>
          </div>

          <div className="ledger-ticket p-5 flex items-center space-x-4">
            <div className="p-3 rounded bg-amber/10 text-ink border border-amber/30">
              <Megaphone className="w-6 h-6" />
            </div>
            <div className="font-mono">
              <span className="text-[10px] text-ink-secondary uppercase block">Active Bookings</span>
              <h3 className="text-2xl font-serif font-bold text-ink">{overview?.activeBookingCount || 0}</h3>
            </div>
          </div>
        </div>

        {/* Post Announcement Section */}
        <div className="ledger-ticket p-6 space-y-4">
          <h2 className="font-serif font-bold text-lg text-ink flex items-center space-x-2">
            <Megaphone className="w-5 h-5 text-amber" />
            <span>Post Society Notice / Announcement</span>
          </h2>
          {message && <div className="p-3 rounded bg-teal/10 border border-teal/30 text-teal font-mono text-xs">{message}</div>}

          <form onSubmit={handlePostAnnouncement} className="space-y-4 font-sans">
            <Input
              label="Announcement Title"
              placeholder="e.g. Society Clubhouse & Lawn Maintenance Schedule"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-ink-secondary">
                Announcement Content
              </label>
              <textarea
                rows={3}
                placeholder="Notice text visible to all society members on their dashboard..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-surface border border-border rounded-md text-ink placeholder:text-ink-secondary/50 focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber"
                required
              />
            </div>
            <div className="flex items-center space-x-2 font-mono text-xs">
              <input
                type="checkbox"
                id="pinned"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
                className="rounded border-border text-amber focus:ring-amber"
              />
              <label htmlFor="pinned" className="text-ink-secondary">
                Pin to top of Society Notice Board
              </label>
            </div>
            <Button type="submit" loading={postLoading} variant="primary" className="font-mono">
              PUBLISH ANNOUNCEMENT
            </Button>
          </form>
        </div>

        {/* Resident Roster */}
        <div className="space-y-3">
          <h2 className="font-serif font-bold text-xl text-ink">Verified Resident Roster</h2>
          <div className="space-y-3">
            {members.map((m) => (
              <div key={m._id} className="ledger-ticket p-4 flex items-center justify-between font-mono text-xs">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded bg-surface-sunken border border-border text-ink font-bold flex items-center justify-center text-sm">
                    {m.userId?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-ink">{m.userId?.name}</h4>
                    <p className="text-ink-secondary">
                      Unit: {m.unit || 'Flat B-402'} ({m.block || 'Wing B'}) • Email: {m.userId?.email}
                    </p>
                  </div>
                </div>
                <Badge stamp variant={m.role === 'community_admin' ? 'amber' : 'teal'}>
                  {m.role === 'community_admin' ? 'SOCIETY ADMIN' : 'RESIDENT'}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
