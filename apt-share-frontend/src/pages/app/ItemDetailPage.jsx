import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchListingById, toggleWishlist } from '../../features/listings/api';
import { createBooking } from '../../features/bookings/api';
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
  Info
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
      <div className="min-h-screen bg-bg flex items-center justify-center text-text-secondary">
        Loading item specification...
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-bg p-8 text-center">
        <h2 className="text-xl font-bold">Item Not Found</h2>
        <Link to="/browse" className="text-accent underline mt-4 inline-block">
          Return to Browse
        </Link>
      </div>
    );
  }

  const mainImage = listing.images && listing.images[0] ? listing.images[0].url : 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80';

  return (
    <div className="min-h-screen bg-bg text-text-primary flex flex-col">
      {/* Top Header Navigation */}
      <header className="border-b border-border bg-surface sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/browse" className="inline-flex items-center space-x-2 text-sm text-text-secondary hover:text-text-primary">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Inventory</span>
          </Link>
          <button
            onClick={handleWishlistToggle}
            className={`p-2 rounded-full border transition-colors ${
              isWishlisted ? 'bg-danger text-white border-danger' : 'bg-surface border-border text-text-secondary hover:text-text-primary'
            }`}
          >
            <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
        </div>
      </header>

      {/* Detail Layout */}
      <main className="max-w-6xl mx-auto px-6 py-8 flex-1 w-full grid md:grid-cols-12 gap-8">
        {/* Left Column: Image Gallery & Description */}
        <div className="md:col-span-7 space-y-6">
          <div className="aspect-[4/3] rounded-lg overflow-hidden bg-bg-elevated border border-border">
            <img src={mainImage} alt={listing.title} className="w-full h-full object-cover" />
          </div>

          <div>
            <div className="flex items-center space-x-2 text-xs text-text-secondary mb-2">
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
            <h1 className="text-2xl font-bold text-text-primary">{listing.title}</h1>
            <p className="text-sm text-text-secondary mt-3 whitespace-pre-line leading-relaxed">
              {listing.description}
            </p>
          </div>

          {/* Accessories Included Section */}
          {listing.accessoriesIncluded && listing.accessoriesIncluded.length > 0 && (
            <Card className="p-5">
              <h3 className="font-semibold text-sm mb-3 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span>Included Accessories</span>
              </h3>
              <ul className="grid grid-cols-2 gap-2 text-xs text-text-secondary">
                {listing.accessoriesIncluded.map((acc, i) => (
                  <li key={i} className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                    <span>{acc}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Usage & Pickup Instructions */}
          <Card className="p-5 space-y-4">
            <div>
              <h3 className="font-semibold text-sm text-text-primary mb-1 flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-accent" />
                <span>Pickup Location & Time</span>
              </h3>
              <p className="text-xs text-text-secondary">
                {listing.pickupInstructions || 'Pickup directly from owner upon booking approval.'}
              </p>
            </div>
            {listing.usageInstructions && (
              <div className="pt-3 border-t border-border">
                <h3 className="font-semibold text-sm text-text-primary mb-1 flex items-center space-x-2">
                  <Info className="w-4 h-4 text-warning" />
                  <span>Owner Usage Guidelines</span>
                </h3>
                <p className="text-xs text-text-secondary">{listing.usageInstructions}</p>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Pricing, Owner Card & Borrow CTA */}
        <div className="md:col-span-5 space-y-6">
          <Card elevated className="p-6 space-y-6 border-accent/30">
            {/* Price Header */}
            <div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-text-primary">
                  {listing.rentalFeePerDay === 0 ? 'Free' : `₹${listing.rentalFeePerDay}`}
                </span>
                {listing.rentalFeePerDay > 0 && <span className="text-xs text-text-secondary">/ day</span>}
              </div>
              <p className="text-xs text-text-secondary mt-1">
                Security Deposit Hold: <span className="font-semibold text-text-primary">₹{listing.securityDeposit}</span> (Held in ledger, released on return)
              </p>
            </div>

            {/* Owner Profile Card */}
            <div className="p-4 bg-bg-elevated rounded-lg border border-border flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 text-accent font-bold flex items-center justify-center text-sm">
                  {listing.ownerId?.name?.charAt(0) || 'O'}
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-text-primary">{listing.ownerId?.name || 'Resident'}</h4>
                  <p className="text-xs text-text-secondary">Verified Neighbor</p>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center space-x-1 text-xs text-success font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{listing.ownerId?.trustScore || 80}/100</span>
                </div>
                <span className="text-[10px] text-text-secondary">Trust Rating</span>
              </div>
            </div>

            {/* Max Duration Badge */}
            <div className="flex items-center justify-between text-xs text-text-secondary p-3 bg-surface border border-border rounded-md">
              <span className="flex items-center space-x-1">
                <Calendar className="w-4 h-4 text-accent" />
                <span>Max Borrow Period</span>
              </span>
              <span className="font-semibold text-text-primary">{listing.maxBorrowDurationDays} Days</span>
            </div>

            {/* Borrow CTA */}
            <Button
              size="lg"
              className="w-full font-bold shadow-md"
              onClick={() => setShowBorrowModal(true)}
            >
              Request to Borrow Item
            </Button>
          </Card>
        </div>
      </main>

      {/* Request Borrow Confirmation Modal */}
      <Modal
        isOpen={showBorrowModal}
        onClose={() => setShowBorrowModal(false)}
        title={`Request Borrow: ${listing.title}`}
      >
        <form onSubmit={handleSubmitBorrowRequest} className="space-y-4">
          {borrowError && (
            <div className="p-3 rounded bg-danger/10 border border-danger/20 text-danger text-sm">
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
            placeholder="e.g. Need this for balcony cleaning on Saturday"
            value={requestMessage}
            onChange={(e) => setRequestMessage(e.target.value)}
          />

          <div className="p-4 bg-bg-elevated border border-border rounded-md text-xs space-y-1">
            <div className="flex justify-between text-text-secondary">
              <span>Rental Fee:</span>
              <span className="font-semibold text-text-primary">
                {listing.rentalFeePerDay === 0 ? 'Free' : `₹${listing.rentalFeePerDay} / day`}
              </span>
            </div>
            <div className="flex justify-between text-text-secondary">
              <span>Security Deposit Hold:</span>
              <span className="font-semibold text-accent">₹{listing.securityDeposit}</span>
            </div>
          </div>

          <Button type="submit" loading={borrowLoading} className="w-full">
            Submit Borrow Request
          </Button>
        </form>
      </Modal>
    </div>
  );
};
