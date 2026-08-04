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
  ShieldAlert
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
    <div className="min-h-screen bg-bg text-text-primary flex flex-col">
      {/* Top Application Header */}
      <header className="border-b border-border bg-surface sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-md bg-accent text-white font-bold text-lg flex items-center justify-center">
                a
              </div>
              <span className="font-bold text-lg tracking-tight">apt.share</span>
            </Link>

            {activeCommunity && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-bg-elevated rounded-md border border-border text-xs">
                <Building2 className="w-3.5 h-3.5 text-accent" />
                <span className="font-medium">{activeCommunity.name}</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {user?.role === 'super_admin' && (
              <Link to="/platform/dashboard">
                <Button variant="outline" size="sm" className="text-xs">
                  Super Admin
                </Button>
              </Link>
            )}

            <Link to="/feed" className="p-2 rounded-md hover:bg-bg-elevated text-text-secondary hover:text-text-primary transition-colors" title="Feed">
              <Sparkles className="w-5 h-5" />
            </Link>

            <Link to="/analytics" className="p-2 rounded-md hover:bg-bg-elevated text-text-secondary hover:text-text-primary transition-colors" title="Analytics">
              <BarChart3 className="w-5 h-5" />
            </Link>

            <Link to="/chat" className="p-2 rounded-md hover:bg-bg-elevated text-text-secondary hover:text-text-primary transition-colors relative" title="Messages">
              <MessageSquare className="w-5 h-5" />
            </Link>

            <Link to="/notifications" className="p-2 rounded-md hover:bg-bg-elevated text-text-secondary hover:text-text-primary transition-colors relative" title="Notifications">
              <Bell className="w-5 h-5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent animate-pulse" />
              )}
            </Link>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-md hover:bg-bg-elevated text-text-secondary hover:text-text-primary transition-colors"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <div className="flex items-center space-x-3 border-l border-border pl-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-text-primary">{user?.name}</p>
                <p className="text-[10px] text-text-secondary">{user?.email}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout} title="Logout">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full space-y-8">
        {/* Resident Greeting & Trust Badge Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface border border-border p-6 rounded-lg shadow-sm">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Welcome back, {user?.name}! 👋</h1>
            <p className="text-sm text-text-secondary mt-1">
              Active resident in <span className="font-medium text-text-primary">{activeCommunity?.name || 'Your Community'}</span>
            </p>
          </div>

          <Link to={`/profile/${user?._id}`}>
            <div className="flex items-center space-x-4 bg-bg-elevated p-3 rounded-lg border border-border hover:border-accent transition-colors">
              <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs uppercase font-semibold text-text-secondary">Trust Score</span>
                  <Badge variant="success">{user?.trustScore || 80}/100</Badge>
                </div>
                <p className="text-xs text-text-secondary mt-0.5">Verified Neighbor Profile</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Quick Action Hub Cards */}
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/browse">
            <Card elevated className="p-4 flex items-center space-x-4 cursor-pointer hover:border-accent group">
              <div className="p-3 rounded-lg bg-accent/10 text-accent group-hover:bg-accent group-hover:text-white transition-colors">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Browse Items</h4>
                <p className="text-xs text-text-secondary">Discover tools & gear</p>
              </div>
            </Card>
          </Link>

          <Link to="/items/new">
            <Card elevated className="p-4 flex items-center space-x-4 cursor-pointer hover:border-accent group">
              <div className="p-3 rounded-lg bg-success/10 text-success group-hover:bg-success group-hover:text-white transition-colors">
                <PlusCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">List an Item</h4>
                <p className="text-xs text-text-secondary">Share with neighbors</p>
              </div>
            </Card>
          </Link>

          <Link to="/bookings">
            <Card elevated className="p-4 flex items-center space-x-4 cursor-pointer hover:border-accent group">
              <div className="p-3 rounded-lg bg-warning/10 text-warning group-hover:bg-warning group-hover:text-white transition-colors">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">My Bookings</h4>
                <p className="text-xs text-text-secondary">Track active borrows</p>
              </div>
            </Card>
          </Link>

          <Link to="/feed">
            <Card elevated className="p-4 flex items-center space-x-4 cursor-pointer hover:border-accent group">
              <div className="p-3 rounded-lg bg-accent/10 text-accent group-hover:bg-accent group-hover:text-white transition-colors">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Society Feed</h4>
                <p className="text-xs text-text-secondary">Announcements & Top Lenders</p>
              </div>
            </Card>
          </Link>
        </div>

        {/* Recent Community Listings Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Recently Listed in {activeCommunity?.name}</h2>
            <Link to="/browse" className="text-xs font-semibold text-accent hover:underline flex items-center">
              View All Items <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {recentListings.map((item) => (
              <Link key={item._id} to={`/items/${item._id}`}>
                <Card elevated className="p-4 space-y-2 hover:border-accent">
                  <img
                    src={item.images?.[0]?.url || 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&auto=format&fit=crop&q=80'}
                    alt={item.title}
                    className="w-full h-32 object-cover rounded-md bg-bg-elevated"
                  />
                  <h3 className="font-semibold text-sm line-clamp-1">{item.title}</h3>
                  <div className="flex justify-between text-xs text-text-secondary">
                    <span className="capitalize">{item.category?.replace('_', ' ')}</span>
                    <span className="font-bold text-accent">
                      {item.rentalFeePerDay === 0 ? 'Free' : `₹${item.rentalFeePerDay}/day`}
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-text-secondary">
        <p>apt.share v1.0 • Gated Resource Sharing Engine</p>
      </footer>
    </div>
  );
};
