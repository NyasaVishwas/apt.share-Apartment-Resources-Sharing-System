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
      setMessage('Announcement published successfully.');
    } catch (err) {
      console.error(err);
    } finally {
      setPostLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center text-text-secondary">
        Loading Community Admin portal...
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
          <span className="font-bold text-base">Community Admin Portal</span>
          <Link to="/admin/disputes">
            <Button variant="outline" size="sm" className="flex items-center space-x-1 text-danger border-danger/30">
              <ShieldAlert className="w-4 h-4 mr-1 text-danger" />
              <span>Dispute Queue</span>
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 flex-1 w-full space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Society Management Overview</h1>
          <p className="text-sm text-text-secondary mt-1">
            Monitor members, active listings, and post society announcements
          </p>
        </div>

        {/* Overview Stat Cards */}
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 flex items-center space-x-4">
            <div className="p-3 rounded-lg bg-accent/10 text-accent">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-text-secondary">Active Residents</span>
              <h3 className="text-xl font-bold">{overview?.memberCount || 0}</h3>
            </div>
          </Card>

          <Card className="p-4 flex items-center space-x-4">
            <div className="p-3 rounded-lg bg-success/10 text-success">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-text-secondary">Shared Listings</span>
              <h3 className="text-xl font-bold">{overview?.listingCount || 0}</h3>
            </div>
          </Card>

          <Card className="p-4 flex items-center space-x-4">
            <div className="p-3 rounded-lg bg-warning/10 text-warning">
              <Megaphone className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-text-secondary">Active Bookings</span>
              <h3 className="text-xl font-bold">{overview?.activeBookingCount || 0}</h3>
            </div>
          </Card>
        </div>

        {/* Post Announcement Section */}
        <Card elevated className="p-6">
          <h2 className="text-base font-bold mb-4 flex items-center space-x-2">
            <Megaphone className="w-5 h-5 text-accent" />
            <span>Post Society Announcement</span>
          </h2>
          {message && <div className="mb-4 p-3 rounded bg-success/10 border border-success/20 text-success text-sm">{message}</div>}

          <form onSubmit={handlePostAnnouncement} className="space-y-4">
            <Input
              label="Announcement Title"
              placeholder="e.g. Society Clubhouse Lawn Maintenance Schedule"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">
                Announcement Content
              </label>
              <textarea
                rows={3}
                placeholder="Message body visible to all community members..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-surface border border-border rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="pinned"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
                className="rounded border-border text-accent focus:ring-accent"
              />
              <label htmlFor="pinned" className="text-xs text-text-secondary font-medium">
                Pin to top of Community Feed
              </label>
            </div>
            <Button type="submit" loading={postLoading}>
              Publish Announcement
            </Button>
          </form>
        </Card>

        {/* Resident Roster */}
        <div>
          <h2 className="text-base font-bold mb-4">Resident Directory</h2>
          <div className="space-y-3">
            {members.map((m) => (
              <Card key={m._id} className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-accent/20 text-accent font-bold flex items-center justify-center text-sm">
                    {m.userId?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{m.userId?.name}</h4>
                    <p className="text-xs text-text-secondary">
                      Unit: {m.unit} ({m.block}) • Email: {m.userId?.email}
                    </p>
                  </div>
                </div>
                <Badge variant={m.role === 'community_admin' ? 'primary' : 'default'}>
                  {m.role}
                </Badge>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
