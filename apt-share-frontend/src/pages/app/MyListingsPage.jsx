import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchMyListings, updateListingStatus } from '../../features/listings/api';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { PlusCircle, PauseCircle, PlayCircle, Trash2, ArrowLeft, Package } from 'lucide-react';

export const MyListingsPage = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyListings();
  }, []);

  const loadMyListings = async () => {
    try {
      const data = await fetchMyListings();
      setListings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'paused' : 'active';
    try {
      await updateListingStatus(id, nextStatus);
      setListings((prev) =>
        prev.map((item) => (item._id === id ? { ...item, status: nextStatus } : item))
      );
    } catch (err) {
      console.error(err);
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

          <Link to="/items/new">
            <Button size="sm">
              <PlusCircle className="w-4 h-4 mr-1" />
              <span>Add New Item</span>
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 flex-1 w-full space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Shared Listings</h1>
          <p className="text-sm text-text-secondary mt-1">
            Manage your listed tools, view borrow stats, or temporarily pause availability
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((n) => (
              <div key={n} className="h-24 bg-surface border border-border rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <Card className="p-12 text-center space-y-3">
            <Package className="w-12 h-12 text-text-secondary mx-auto" />
            <h3 className="text-lg font-semibold">No Shared Items Yet</h3>
            <p className="text-sm text-text-secondary">You have not published any listings to your society yet.</p>
            <Link to="/items/new" className="inline-block pt-2">
              <Button variant="primary">List Your First Item</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {listings.map((item) => (
              <Card key={item._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <img
                    src={item.images?.[0]?.url || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80'}
                    alt={item.title}
                    className="w-16 h-16 rounded-md object-cover bg-bg-elevated border border-border"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-sm text-text-primary">{item.title}</h3>
                      <Badge variant={item.status === 'active' ? 'success' : 'warning'}>
                        {item.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Fee: {item.rentalFeePerDay === 0 ? 'Free' : `₹${item.rentalFeePerDay}/day`} • Deposit: ₹{item.securityDeposit}
                    </p>
                    <p className="text-[10px] text-text-secondary mt-1">
                      Views: {item.viewCount || 0} • Bookings: {item.bookingCount || 0}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusToggle(item._id, item.status)}
                  >
                    {item.status === 'active' ? (
                      <>
                        <PauseCircle className="w-4 h-4 mr-1 text-warning" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <PlayCircle className="w-4 h-4 mr-1 text-success" />
                        <span>Activate</span>
                      </>
                    )}
                  </Button>
                  <Link to={`/items/${item._id}`}>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
