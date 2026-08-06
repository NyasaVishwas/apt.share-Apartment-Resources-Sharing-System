import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchListings, fetchWishlist, toggleWishlist } from '../../features/listings/api';
import { ListingCard } from '../../components/data-display/ListingCard';
import { CategoryFilter } from '../../components/data-display/CategoryFilter';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Search, PlusCircle, SlidersHorizontal, PackageX, Building2 } from 'lucide-react';

export const BrowsePage = () => {
  const [listings, setListings] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [feeFilter, setFeeFilter] = useState('all'); // 'all' | 'free' | 'paid'
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [searchQuery, selectedCategory, feeFilter, sortBy]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchListings({
        q: searchQuery,
        category: selectedCategory,
        fee: feeFilter,
        sort: sortBy
      });
      setListings(res.data);

      const wish = await fetchWishlist();
      const ids = wish.map((w) => w.listingId?._id).filter(Boolean);
      setWishlistIds(ids);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleWishlistToggle = async (listingId) => {
    try {
      await toggleWishlist({ listingId });
      setWishlistIds((prev) =>
        prev.includes(listingId) ? prev.filter((id) => id !== listingId) : [...prev, listingId]
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col font-sans selection:bg-amber selection:text-ink">
      {/* Header Bar */}
      <header className="border-b border-border bg-surface sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded bg-ink text-bg font-serif font-bold text-lg flex items-center justify-center shadow-sm">
              a
            </div>
            <span className="font-serif font-bold text-lg tracking-tight text-ink">apt.share</span>
          </Link>

          <div className="flex items-center space-x-3">
            <Link to="/items/new">
              <Button size="sm" variant="primary" className="flex items-center space-x-1">
                <PlusCircle className="w-4 h-4 mr-1" />
                <span>List an Item</span>
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Browse Container */}
      <main className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-ink-secondary mb-1">
              BUILDING CATALOG
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-ink">
              Community Resource Inventory
            </h1>
            <p className="text-sm text-ink-secondary mt-1">
              Explore tools, camping gear, and household equipment posted by verified neighbors
            </p>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-ink-secondary" />
            <input
              type="text"
              placeholder="Search by item title, brand, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-md text-sm text-ink placeholder:text-ink-secondary/50 focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber transition-all"
            />
          </div>

          <div className="flex items-center space-x-3 font-mono">
            <select
              value={feeFilter}
              onChange={(e) => setFeeFilter(e.target.value)}
              className="px-3 py-2 bg-surface border border-border rounded-md text-xs font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber"
            >
              <option value="all">ALL FEES</option>
              <option value="free">FREE BORROW ONLY</option>
              <option value="paid">PAID RENTAL ONLY</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-surface border border-border rounded-md text-xs font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber"
            >
              <option value="newest">NEWEST LISTINGS</option>
              <option value="popular">MOST POPULAR</option>
              <option value="rating">HIGHEST RATED</option>
              <option value="deposit_low">LOWEST DEPOSIT</option>
            </select>
          </div>
        </div>

        {/* Category Horizontal Filter Chips */}
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Listings Grid with matching 4:3 skeleton loaders */}
        {loading ? (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="ledger-ticket overflow-hidden h-72 animate-pulse bg-surface p-4 flex flex-col justify-between">
                <div className="aspect-[4/3] w-full bg-surface-sunken rounded-md"></div>
                <div className="space-y-2 pt-2">
                  <div className="h-4 bg-surface-sunken rounded w-3/4"></div>
                  <div className="h-3 bg-surface-sunken rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          /* Direct, friendly empty state */
          <div className="ledger-ticket-sunken p-12 text-center space-y-3 my-6">
            <PackageX className="w-12 h-12 text-ink-secondary mx-auto opacity-60" />
            <h3 className="font-serif font-bold text-xl text-ink">No items match your filter</h3>
            <p className="text-sm text-ink-secondary max-w-md mx-auto">
              You haven't found any listings matching "{searchQuery || selectedCategory}". Try adjusting your filters or list an item you own to get started.
            </p>
            <div className="pt-2">
              <Link to="/items/new">
                <Button variant="primary" size="sm">
                  List an Item for Neighbors
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {listings.map((item) => (
              <ListingCard
                key={item._id}
                listing={item}
                isWishlisted={wishlistIds.includes(item._id)}
                onToggleWishlist={handleWishlistToggle}
              />
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-border py-6 bg-surface text-center text-xs font-mono text-ink-secondary">
        <p>apt.share v1.0 • Community Inventory</p>
      </footer>
    </div>
  );
};

