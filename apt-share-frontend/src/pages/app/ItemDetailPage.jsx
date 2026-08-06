import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchListingById, toggleWishlist } from '../../features/listings/api';
import { createBooking } from '../../features/bookings/api';
import { formatINR, formatIndianDate } from '../../lib/formatters';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import {
  ShieldCheck,
  Star,
  Heart,
  Calendar,
  CheckCircle2,
  AlertCircle,
  MapPin,
  ArrowLeft,
  Info,
  QrCode
} from 'lucide-react';

export const ItemDetailPage = () => {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showBorrowModal, setShowBorrowModal] = useState(false);

  // Borrow form state
  const [startDate, setStartDate] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]);
  const [requestMessage, setRequestMessage] = useState('');
  const [borrowLoading, setBorrowLoading] = useState(false);
  const [borrowError, setBorrowError] = useState('');

  useEffect(() => {
    loadListing();
  }, [listingId]);

  const loadListing = async () => {
    try {
      const data = await fetchListingById(listingId);
      setListing(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleWishlistToggle = async () => {
    try {
      const res = await toggleWishlist({ listingId });
      setIsWishlisted(res.added);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitBorrowRequest = async (e) => {
    e.preventDefault();
    setBorrowError('');
    setBorrowLoading(true);

    try {
      const payload = {
        listingId,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        requestMessage
      };

      const booking = await createBooking(payload);
      setShowBorrowModal(false);
      navigate(`/bookings/${booking._id}`);
    } catch (err) {
      setBorrowError(err.message || 'Failed to submit booking request.');
    } finally {
      setBorrowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center font-mono text-ink-secondary">
        Loading resource catalog record...
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-bg p-8 text-center font-sans">
        <h2 className="text-xl font-serif font-bold text-ink">Listing Record Not Found</h2>
        <Link to="/browse" className="text-amber underline mt-4 inline-block font-mono text-sm">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const mainImage = listing.images && listing.images[0] ? listing.images[0].url : 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80';

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col font-sans selection:bg-amber selection:text-ink">
      {/* Top Header Navigation */}
      <header className="border-b border-border bg-surface sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between font-mono">
          <Link to="/browse" className="inline-flex items-center space-x-2 text-xs text-ink-secondary hover:text-ink">
            <ArrowLeft className="w-4 h-4" />
            <span>RETURN TO CATALOG</span>
          </Link>
          <button
            onClick={handleWishlistToggle}
            className={`p-2 rounded border transition-colors ${
              isWishlisted ? 'bg-danger text-white border-danger' : 'bg-surface border-border text-ink-secondary hover:text-ink'
            }`}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
        </div>
      </header>

      {/* Detail Layout */}
      <main className="max-w-6xl mx-auto px-6 py-8 flex-1 w-full grid md:grid-cols-12 gap-8">
        {/* Left Column: Image Gallery & Description */}
        <div className="md:col-span-7 space-y-6">
          <div className="aspect-[4/3] rounded-lg overflow-hidden bg-surface-sunken border border-border relative">
            <img src={mainImage} alt={listing.title} className="w-full h-full object-cover" />
            <div className="absolute top-3 left-3">
              <Badge stamp variant={listing.rentalFeePerDay === 0 ? 'teal' : 'amber'}>
                {listing.rentalFeePerDay === 0 ? 'FREE BORROW' : `${formatINR(listing.rentalFeePerDay)}/DAY`}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs font-mono text-ink-secondary">
              <Badge variant="primary">{listing.category?.replace('_', ' ')}</Badge>
              <span>•</span>
              <span className="capitalize">Condition: {listing.condition?.replace('_', ' ')}</span>
              {listing.brand && (
                <>
                  <span>•</span>
                  <span>Brand: {listing.brand}</span>
                </>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink leading-tight">{listing.title}</h1>
            <p className="text-sm text-ink-secondary whitespace-pre-line leading-relaxed">
              {listing.description}
            </p>
          </div>

          {/* Accessories Included Section */}
          {listing.accessoriesIncluded && listing.accessoriesIncluded.length > 0 && (
            <div className="ledger-ticket p-5 space-y-3">
              <h3 className="font-serif font-bold text-sm text-ink flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-teal" />
                <span>Included Accessories Package</span>
              </h3>
              <ul className="grid grid-cols-2 gap-2 text-xs font-mono text-ink-secondary">
                {listing.accessoriesIncluded.map((acc, i) => (
                  <li key={i} className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber"></span>
                    <span>{acc}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Usage & Pickup Instructions */}
          <div className="ledger-ticket p-5 space-y-4">
            <div>
              <h3 className="font-serif font-bold text-sm text-ink mb-1 flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-amber" />
                <span>Doorstep Pickup Location & Time</span>
              </h3>
              <p className="text-xs text-ink-secondary leading-relaxed">
                {listing.pickupInstructions || 'Pick up directly from owner doorstep upon QR check-out issuance.'}
              </p>
            </div>
            {listing.usageInstructions && (
              <div className="pt-3 border-t border-border">
                <h3 className="font-serif font-bold text-sm text-ink mb-1 flex items-center space-x-2">
                  <Info className="w-4 h-4 text-amber" />
                  <span>Owner Usage Guidelines</span>
                </h3>
                <p className="text-xs text-ink-secondary leading-relaxed">{listing.usageInstructions}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Pricing, Owner Card & Borrow CTA */}
        <div className="md:col-span-5 space-y-6">
          <div className="ledger-ticket p-6 space-y-6 shadow-ticket">
            {/* Price Header */}
            <div className="space-y-1">
              <div className="flex items-baseline space-x-2 font-mono">
                <span className="text-3xl font-serif font-bold text-ink">
                  {listing.rentalFeePerDay === 0 ? 'Free Borrow' : formatINR(listing.rentalFeePerDay)}
                </span>
                {listing.rentalFeePerDay > 0 && <span className="text-xs text-ink-secondary">/ day</span>}
              </div>
              <p className="text-xs font-mono text-ink-secondary">
                Escrow Deposit Hold: <span className="font-bold text-amber">{formatINR(listing.securityDeposit)}</span> (Released on return scan)
              </p>
            </div>

            {/* Owner Profile Card */}
            <div className="p-4 bg-surface-sunken rounded border border-border flex items-center justify-between font-mono">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded bg-amber/10 border border-amber/30 text-ink font-bold flex items-center justify-center text-sm">
                  {listing.ownerId?.name?.charAt(0) || 'O'}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-ink leading-none">{listing.ownerId?.name || 'Resident'}</h4>
                  <p className="text-[10px] text-ink-secondary mt-1">Verified Neighbor</p>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center space-x-1 text-xs text-teal font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{listing.ownerId?.trustScore || 80}/100</span>
                </div>
                <span className="text-[9px] text-ink-secondary uppercase">TRUST SCORE</span>
              </div>
            </div>

            {/* Max Duration Badge */}
            <div className="flex items-center justify-between text-xs font-mono text-ink-secondary p-3 bg-surface border border-border rounded">
              <span className="flex items-center space-x-1.5">
                <Calendar className="w-4 h-4 text-amber" />
                <span>Max Borrow Duration</span>
              </span>
              <span className="font-bold text-ink">{listing.maxBorrowDurationDays} Days</span>
            </div>

            {/* Borrow CTA */}
            <Button
              size="lg"
              variant="primary"
              className="w-full font-mono tracking-wide"
              onClick={() => setShowBorrowModal(true)}
            >
              REQUEST TO BORROW ITEM
            </Button>
          </div>
        </div>
      </main>

      {/* Request Borrow Confirmation Modal */}
      <Modal
        isOpen={showBorrowModal}
        onClose={() => setShowBorrowModal(false)}
        title={`Request Borrow Tag: ${listing.title}`}
      >
        <form onSubmit={handleSubmitBorrowRequest} className="space-y-4 font-sans">
          {borrowError && (
            <div className="p-3 rounded bg-danger/10 border border-danger/30 text-danger text-xs font-mono">
              {borrowError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
            <Input
              label="Return Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>

          <Input
            label="Message to Owner (Optional)"
            placeholder="e.g. Need this for balcony tile cleaning on Saturday"
            value={requestMessage}
            onChange={(e) => setRequestMessage(e.target.value)}
          />

          <div className="p-4 bg-surface-sunken border border-border rounded font-mono text-xs space-y-1.5">
            <div className="flex justify-between text-ink-secondary">
              <span>Rental Fee / Day:</span>
              <span className="font-bold text-ink">
                {listing.rentalFeePerDay === 0 ? 'Free Borrow' : formatINR(listing.rentalFeePerDay)}
              </span>
            </div>
            <div className="flex justify-between text-ink-secondary">
              <span>Escrow Deposit Hold:</span>
              <span className="font-bold text-amber">{formatINR(listing.securityDeposit)}</span>
            </div>
            <div className="text-[10px] text-ink-secondary border-t border-border/60 pt-1 mt-1">
              • Escrow hold is authorized instantly and released upon doorstep QR return scan.
            </div>
          </div>

          <Button type="submit" loading={borrowLoading} variant="primary" className="w-full font-mono">
            SUBMIT BORROW TICKET REQUEST
          </Button>
        </form>
      </Modal>
    </div>
  );
};
