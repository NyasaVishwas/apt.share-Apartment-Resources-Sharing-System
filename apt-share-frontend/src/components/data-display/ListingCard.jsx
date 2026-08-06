import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, ShieldCheck } from 'lucide-react';
import { Badge } from '../ui/Badge';

export const ListingCard = ({ listing, isWishlisted = false, onToggleWishlist }) => {
  const imageUrl = listing.images && listing.images[0] ? listing.images[0].url : 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80';

  return (
    <div className="ledger-ticket overflow-hidden group hover:border-amber transition-all flex flex-col h-full bg-surface">
      {/* Image Header with Stamped Tag Overlays */}
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-sunken border-b border-border">
        <img
          src={imageUrl}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Top Left Stamped Badge */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          <Badge stamp variant={listing.rentalFeePerDay === 0 ? 'teal' : 'amber'}>
            {listing.rentalFeePerDay === 0 ? 'FREE BORROW' : `₹${listing.rentalFeePerDay}/DAY`}
          </Badge>
        </div>

        {/* Wishlist Button */}
        {onToggleWishlist && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onToggleWishlist(listing._id);
            }}
            className={`absolute top-2.5 right-2.5 p-2 rounded-md backdrop-blur-md transition-colors border border-border/40 ${
              isWishlisted
                ? 'bg-danger text-white border-danger'
                : 'bg-surface/80 text-ink hover:bg-surface'
            }`}
            title="Wishlist item"
          >
            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
        )}

        {/* Bottom Deposit Banner */}
        {listing.securityDeposit > 0 && (
          <div className="absolute bottom-2 left-2.5 font-mono text-[10px] bg-ink/90 text-bg px-2 py-0.5 rounded border border-border/40 backdrop-blur-sm">
            DEPOSIT: ₹{listing.securityDeposit}
          </div>
        )}
      </div>

      {/* Card Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between text-xs font-mono text-ink-secondary mb-1">
            <span className="capitalize">{listing.category?.replace('_', ' ')}</span>
            <div className="flex items-center space-x-1 text-amber">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="font-bold text-ink">{listing.averageRating || 5.0}</span>
            </div>
          </div>

          <Link to={`/items/${listing._id}`}>
            <h3 className="font-serif font-bold text-ink text-base line-clamp-1 group-hover:text-amber transition-colors">
              {listing.title}
            </h3>
          </Link>

          <p className="text-xs text-ink-secondary mt-1 line-clamp-2 leading-relaxed">
            {listing.description}
          </p>
        </div>

        {/* Owner Info Bar */}
        <div className="pt-3 border-t border-border/80 flex items-center justify-between font-mono text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded bg-surface-sunken border border-border text-ink font-bold text-xs flex items-center justify-center">
              {listing.ownerId?.name?.charAt(0) || 'U'}
            </div>
            <span className="font-medium text-ink truncate max-w-[90px]">{listing.ownerId?.name || 'Neighbor'}</span>
          </div>

          <div className="flex items-center space-x-1 text-teal font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{listing.ownerId?.trustScore || 80} TRUST</span>
          </div>
        </div>
      </div>
    </div>
  );
};
