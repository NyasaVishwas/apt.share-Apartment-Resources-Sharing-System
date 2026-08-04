import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchWishlist, removeFromWishlist } from '../../features/listings/api';
import { ListingCard } from '../../components/data-display/ListingCard';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ArrowLeft, Heart, HeartOff } from 'lucide-react';

export const WishlistPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      const data = await fetchWishlist();
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (wishlistId) => {
    try {
      await removeFromWishlist(wishlistId);
      setItems((prev) => prev.filter((item) => item._id !== wishlistId));
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
          <span className="font-bold text-base">Saved Wishlist</span>
          <div></div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Saved Items & Categories</h1>
          <p className="text-sm text-text-secondary mt-1">
            Track resources you plan to borrow in the future
          </p>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-4">
            {[1, 2].map((n) => (
              <div key={n} className="h-64 bg-surface border border-border rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <Card className="p-12 text-center space-y-3">
            <HeartOff className="w-12 h-12 text-text-secondary mx-auto" />
            <h3 className="text-lg font-semibold">Your Wishlist is Empty</h3>
            <p className="text-sm text-text-secondary max-w-sm mx-auto">
              Save items while browsing to keep quick access for upcoming projects or trips.
            </p>
            <Link to="/browse" className="inline-block pt-2">
              <Button variant="primary">Browse Inventory</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((w) =>
              w.listingId ? (
                <div key={w._id} className="relative">
                  <ListingCard
                    listing={w.listingId}
                    isWishlisted={true}
                    onToggleWishlist={() => handleRemove(w._id)}
                  />
                </div>
              ) : null
            )}
          </div>
        )}
      </main>
    </div>
  );
};
