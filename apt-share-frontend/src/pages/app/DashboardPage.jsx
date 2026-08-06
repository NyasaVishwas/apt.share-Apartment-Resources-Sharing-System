import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../app/providers/AuthProvider';
import { useTheme } from '../../app/providers/ThemeProvider';
import { useSocket } from '../../app/providers/SocketProvider';
import axiosClient from '../../lib/axiosClient';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import {
  ShieldCheck,
  Search,
  PlusCircle,
  Package,
  Calendar,
  Heart,
  LogOut,
  Sun,
  Moon,
  Building2,
  Award,
  ArrowRight,
  MessageSquare,
  Bell,
  Sparkles,
  BarChart3,
  QrCode
} from 'lucide-react';

export const DashboardPage = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { unreadNotificationsCount } = useSocket();
  const [memberships, setMemberships] = useState([]);
  const [activeCommunity, setActiveCommunity] = useState(null);
  const [recentListings, setRecentListings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMemberships();
  }, []);

  const fetchMemberships = async () => {
    try {
      const res = await axiosClient.get('/memberships/mine');
      setMemberships(res.data);
      if (res.data.length > 0) {
        const active = res.data.find((m) => m.isActiveContext) || res.data[0];
        setActiveCommunity(active.communityId);

        // Fetch recent community listings
        const listRes = await axiosClient.get('/listings?limit=4');
        setRecentListings(listRes.data || []);
      } else {
        navigate('/onboarding');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col font-sans selection:bg-amber selection:text-ink">
      {/* Top Application Header */}
      <header className="border-b border-border bg-surface sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded bg-ink text-bg font-serif font-bold text-lg flex items-center justify-center shadow-sm">
                a
              </div>
              <span className="font-serif font-bold text-lg tracking-tight text-ink">apt.share</span>
            </Link>

            {activeCommunity && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-surface-sunken rounded border border-border text-xs font-mono">
                <Building2 className="w-3.5 h-3.5 text-amber" />
                <span className="font-medium text-ink truncate max-w-[180px] sm:max-w-none">{activeCommunity.name}</span>
                <span className="text-[10px] text-teal font-bold uppercase border-l border-border pl-2">LEDGER ACTIVE</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            {user?.role === 'super_admin' && (
              <Link to="/platform/dashboard">
                <Button variant="outline" size="sm" className="text-xs font-mono">
                  Super Admin
                </Button>
              </Link>
            )}

            <Link to="/feed" className="p-2 rounded hover:bg-surface-sunken text-ink-secondary hover:text-ink transition-colors" title="Society Feed">
              <Sparkles className="w-4 h-4" />
            </Link>

            <Link to="/analytics" className="p-2 rounded hover:bg-surface-sunken text-ink-secondary hover:text-ink transition-colors" title="Analytics">
              <BarChart3 className="w-4 h-4" />
            </Link>

            <Link to="/chat" className="p-2 rounded hover:bg-surface-sunken text-ink-secondary hover:text-ink transition-colors relative" title="Messages">
              <MessageSquare className="w-4 h-4" />
            </Link>

            <Link to="/notifications" className="p-2 rounded hover:bg-surface-sunken text-ink-secondary hover:text-ink transition-colors relative" title="Notifications">
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber animate-pulse" />
              )}
            </Link>

            <button
              onClick={toggleTheme}
              className="p-2 rounded hover:bg-surface-sunken text-ink-secondary hover:text-ink transition-colors"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <div className="flex items-center space-x-3 border-l border-border pl-3">
              <div className="text-right hidden sm:block font-mono">
                <p className="text-xs font-bold text-ink leading-none">{user?.name}</p>
                <p className="text-[10px] text-ink-secondary mt-0.5">{user?.email}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout} title="Logout">
                <LogOut className="w-4 h-4 text-ink-secondary hover:text-danger" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full space-y-8">
        {/* Resident Greeting & Stamped Trust Ticket Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-surface border border-border p-6 rounded-lg shadow-sm relative overflow-hidden">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 text-xs font-mono text-ink-secondary uppercase tracking-wider">
              <span>RESIDENT CHECK-IN</span>
              <span>•</span>
              <span className="text-teal font-semibold">VERIFIED NEIGHBOR</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-ink">
              Welcome back, {user?.name}
            </h1>
            <p className="text-sm text-ink-secondary">
              Active ledger member in <span className="font-semibold text-ink">{activeCommunity?.name || 'Your Community'}</span>
            </p>
          </div>

          <Link to={`/profile/${user?._id}`}>
            <div className="ledger-ticket-sunken p-4 flex items-center gap-4 hover:border-ink-secondary/40 transition-colors">
              <div className="w-10 h-10 rounded bg-teal/10 border border-teal/30 text-teal flex items-center justify-center font-bold shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div className="font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] uppercase tracking-wider text-ink-secondary">TRUST SCORE</span>
                  <span className="stamp-badge stamp-badge-teal text-[10px] py-0.5 px-1.5">
                    VERIFIED
                  </span>
                </div>
                <div className="text-xl font-bold font-serif text-ink mt-0.5">
                  {user?.trustScore || 80} <span className="text-xs font-mono font-normal text-ink-secondary">/ 100</span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Quick Action Hub Cards — restyled with ledger receipt figures */}
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/browse">
            <div className="bg-surface border border-border rounded-lg p-5 hover:border-amber transition-all cursor-pointer group shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded bg-amber/10 border border-amber/30 text-ink group-hover:bg-amber transition-colors">
                  <Search className="w-5 h-5" />
                </div>
                <span className="font-mono text-xs text-ink-secondary">CATALOG</span>
              </div>
              <h4 className="font-serif font-bold text-base text-ink">Browse Items</h4>
              <p className="text-xs text-ink-secondary mt-1">Discover available tools & gear</p>
            </div>
          </Link>

          <Link to="/items/new">
            <div className="bg-surface border border-border rounded-lg p-5 hover:border-teal transition-all cursor-pointer group shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded bg-teal/10 border border-teal/30 text-teal group-hover:bg-teal group-hover:text-white transition-colors">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <span className="font-mono text-xs text-ink-secondary">LISTING</span>
              </div>
              <h4 className="font-serif font-bold text-base text-ink">List an Item</h4>
              <p className="text-xs text-ink-secondary mt-1">Share gear with your neighbors</p>
            </div>
          </Link>

          <Link to="/bookings">
            <div className="bg-surface border border-border rounded-lg p-5 hover:border-amber transition-all cursor-pointer group shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded bg-amber/10 border border-amber/30 text-amber group-hover:bg-amber group-hover:text-ink transition-colors">
                  <Calendar className="w-5 h-5" />
                </div>
                <span className="font-mono text-xs text-ink-secondary">LEDGER</span>
              </div>
              <h4 className="font-serif font-bold text-base text-ink">My Bookings</h4>
              <p className="text-xs text-ink-secondary mt-1">Track active pickup & returns</p>
            </div>
          </Link>

          <Link to="/feed">
            <div className="bg-surface border border-border rounded-lg p-5 hover:border-ink transition-all cursor-pointer group shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded bg-surface-sunken border border-border text-ink group-hover:bg-ink group-hover:text-bg transition-colors">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="font-mono text-xs text-ink-secondary">SOCIETY</span>
              </div>
              <h4 className="font-serif font-bold text-base text-ink">Community Feed</h4>
              <p className="text-xs text-ink-secondary mt-1">Announcements & top lenders</p>
            </div>
          </Link>
        </div>

        {/* Recent Community Listings Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <h2 className="font-serif font-bold text-xl text-ink">Recently Checked into {activeCommunity?.name}</h2>
            </div>
            <Link to="/browse" className="text-xs font-mono font-bold text-amber hover:underline flex items-center gap-1">
              VIEW FULL CATALOG <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentListings.length === 0 ? (
            /* Plain direct empty state */
            <div className="ledger-ticket-sunken p-8 text-center space-y-3 my-4">
              <Package className="w-10 h-10 text-ink-secondary mx-auto opacity-60" />
              <h3 className="font-serif font-bold text-lg text-ink">You haven't borrowed anything yet</h3>
              <p className="text-sm text-ink-secondary max-w-md mx-auto">
                Browse what your neighbors are sharing right now in {activeCommunity?.name || 'your building'} or list your rarely-used tools.
              </p>
              <div className="pt-2 flex items-center justify-center gap-3">
                <Link to="/browse">
                  <Button variant="primary" size="sm">Browse Neighborhood Catalog</Button>
                </Link>
                <Link to="/items/new">
                  <Button variant="outline" size="sm">List Your First Item</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
              {recentListings.map((item) => (
                <Link key={item._id} to={`/items/${item._id}`}>
                  <div className="ledger-ticket overflow-hidden group hover:border-amber transition-all">
                    <div className="aspect-[4/3] bg-surface-sunken relative overflow-hidden border-b border-border">
                      <img
                        src={item.images?.[0]?.url || 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&auto=format&fit=crop&q=80'}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute top-2 right-2">
                        <span className="stamp-badge stamp-badge-teal text-[9px] py-0.5 px-1 bg-surface/90">
                          AVAILABLE
                        </span>
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <h3 className="font-serif font-bold text-sm text-ink line-clamp-1 group-hover:text-amber transition-colors">
                        {item.title}
                      </h3>

                      <div className="flex items-center justify-between text-xs font-mono pt-1 border-t border-border/60 text-ink-secondary">
                        <span className="capitalize">{item.category?.replace('_', ' ')}</span>
                        <span className="font-bold text-ink">
                          {item.rentalFeePerDay === 0 ? 'FREE BORROW' : `₹${item.rentalFeePerDay}/day`}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-border py-6 bg-surface text-center text-xs font-mono text-ink-secondary">
        <p>apt.share v1.0 • Gated Neighborhood Resource Ledger System</p>
      </footer>
    </div>
  );
};

