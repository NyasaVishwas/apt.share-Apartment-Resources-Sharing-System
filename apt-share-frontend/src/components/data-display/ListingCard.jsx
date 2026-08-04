import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, ShieldCheck, Tag } from 'lucide-react';
import { Badge } from '../ui/Badge';

export const ListingCard = ({ listing, isWishlisted = false, onToggleWishlist }) => {
  const imageUrl = listing.images && listing.images[0] ? listing.images[0].url : 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80';

  return (
    <div className="group bg-surface border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md hover:border-accent/40 transition-all flex flex-col">
      {/* Image Header with Wishlist & Badge Overlays */}
      <div className="relative aspect-[4/3] overflow-hidden bg-bg-elevated">
        <img
          src={imageUrl}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <Badge variant={listing.rentalFeePerDay === 0 ? 'success' : 'primary'}>
            {listing.rentalFeePerDay === 0 ? 'Free Borrow' : `₹${listing.rentalFeePerDay}/day`}
          </Badge>
          {listing.securityDeposit > 0 && (
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-black/70 text-white rounded-full backdrop-blur-sm">
              Dep: ₹{listing.securityDeposit}
            </span>
          )}
        </div>

        {onToggleWishlist && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onToggleWishlist(listing._id);
            }}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-colors ${
              isWishlisted
                ? 'bg-danger text-white'
                : 'bg-black/40 text-white hover:bg-black/60'
            }`}
            title="Wishlist item"
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>

      {/* Card Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-text-secondary mb-1">
            <span className="capitalize">{listing.category?.replace('_', ' ')}</span>
            <div className="flex items-center space-x-1 text-warning">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="font-semibold text-text-primary">{listing.averageRating || 5.0}</span>
            </div>
          </div>

          <Link to={`/items/${listing._id}`}>
            <h3 className="font-semibold text-text-primary text-base line-clamp-1 group-hover:text-accent transition-colors">
              {listing.title}
            </h3>
          </Link>

          <p className="text-xs text-text-secondary mt-1.5 line-clamp-2">
            {listing.description}
          </p>
        </div>

        {/* Owner Info Bar */}
        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-accent/20 text-accent font-bold text-xs flex items-center justify-center">
              {listing.ownerId?.name?.charAt(0) || 'U'}
            </div>
            <span className="text-xs font-medium text-text-primary">{listing.ownerId?.name || 'Neighbor'}</span>
          </div>

          <div className="flex items-center space-x-1 text-xs text-success font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{listing.ownerId?.trustScore || 80} Trust</span>
          </div>
        </div>
      </div>
    </div>
  );
};
