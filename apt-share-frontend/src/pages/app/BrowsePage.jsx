import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchListings, fetchWishlist, toggleWishlist } from '../../features/listings/api';
import { ListingCard } from '../../components/data-display/ListingCard';
import { CategoryFilter } from '../../components/data-display/CategoryFilter';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Search, PlusCircle, SlidersHorizontal, PackageX } from 'lucide-react';

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
    <div className="min-h-screen bg-bg text-text-primary flex flex-col">
      {/* Header Bar */}
      <header className="border-b border-border bg-surface sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-md bg-accent text-white font-bold text-lg flex items-center justify-center">
              a
            </div>
            <span className="font-bold text-lg tracking-tight">apt.share</span>
          </Link>

          <div className="flex items-center space-x-3">
            <Link to="/items/new">
              <Button size="sm" className="flex items-center space-x-1">
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
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Community Inventory</h1>
          <p className="text-sm text-text-secondary mt-1">
            Discover tools, camping gear, and appliances available for borrow in your society
          </p>
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-text-secondary" />
            <input
              type="text"
              placeholder="Search by item title, brand, or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-surface border border-border rounded-md text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={feeFilter}
              onChange={(e) => setFeeFilter(e.target.value)}
              className="px-3 py-2 bg-surface border border-border rounded-md text-xs font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="all">All Fees</option>
              <option value="free">Free Borrow</option>
              <option value="paid">Paid Rental</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-surface border border-border rounded-md text-xs font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="newest">Newest First</option>
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="deposit_low">Deposit: Low to High</option>
            </select>
          </div>
        </div>

        {/* Category Horizontal Filter Chips */}
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Listings Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-8">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-64 bg-surface border border-border rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="p-12 bg-surface border border-border rounded-lg text-center space-y-3">
            <PackageX className="w-12 h-12 text-text-secondary mx-auto" />
            <h3 className="text-lg font-semibold">No Listings Found</h3>
            <p className="text-sm text-text-secondary max-w-sm mx-auto">
              No items match your search or filter options. Be the first to share an item with your neighbors!
            </p>
            <Link to="/items/new">
              <Button variant="primary" size="sm" className="mt-2">
                Create First Listing
              </Button>
            </Link>
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

      <footer className="border-t border-border py-6 text-center text-xs text-text-secondary">
        <p>apt.share v1.0 • Community Inventory</p>
      </footer>
    </div>
  );
};
