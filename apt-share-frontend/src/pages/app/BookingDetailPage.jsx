import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  fetchBookingById,
  approveBooking,
  declineBooking,
  fetchPickupQr,
  fetchReturnQr,
  pickupScan,
  returnScan
} from '../../features/bookings/api';
import { fileDamageReport } from '../../features/ratings/api';
import { useAuth } from '../../app/providers/AuthProvider';
import { BookingTimeline } from '../../components/data-display/BookingTimeline';
import { QrCodeDisplay } from '../../components/data-display/QrCodeDisplay';
import { RatingModal } from '../../components/feedback/RatingModal';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { ArrowLeft, ShieldCheck, CheckCircle2, AlertTriangle, Star } from 'lucide-react';

export const BookingDetailPage = () => {
  const { bookingId } = useParams();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Modals
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [damageDescription, setDamageDescription] = useState('');

  useEffect(() => {
    loadBookingDetail();
  }, [bookingId]);

  const loadBookingDetail = async () => {
    try {
      const data = await fetchBookingById(bookingId);
      setBooking(data);

      if (data.status === 'confirmed') {
        const qr = await fetchPickupQr(bookingId);
        setQrData(qr);
      } else if (data.status === 'active') {
        const qr = await fetchReturnQr(bookingId);
        setQrData(qr);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load booking details.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setActionLoading(true);
    setError('');
    try {
      const updated = await approveBooking(bookingId);
      setBooking(updated);
      const qr = await fetchPickupQr(bookingId);
      setQrData(qr);
      setMessage('Booking approved! Pickup QR code generated for borrower.');
    } catch (err) {
      setError(err.message || 'Approval failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecline = async () => {
    setActionLoading(true);
    setError('');
    try {
      const updated = await declineBooking(bookingId, 'Owner unavailable.');
      setBooking(updated);
      setMessage('Booking request declined.');
    } catch (err) {
      setError(err.message || 'Decline failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePickupScanSimulate = async (rawToken) => {
    setActionLoading(true);
    setError('');
    try {
      const updated = await pickupScan(bookingId, rawToken);
      setBooking(updated);
      const returnQr = await fetchReturnQr(bookingId);
      setQrData(returnQr);
      setMessage('Pickup confirmed! Booking status is now active.');
    } catch (err) {
      setError(err.message || 'Pickup scan failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReturnScanSimulate = async (rawToken) => {
    setActionLoading(true);
    setError('');
    try {
      const updated = await returnScan(bookingId, rawToken);
      setBooking(updated);
      setQrData(null);
      setMessage('Return confirmed! Deposit released back to borrower.');
    } catch (err) {
      setError(err.message || 'Return scan failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFileDamageReport = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    try {
      await fileDamageReport({
        bookingId,
        description: damageDescription
      });
      setShowDisputeModal(false);
      setMessage('Damage report filed. Case escalated to Community Admin.');
      await loadBookingDetail();
    } catch (err) {
      setError(err.message || 'Failed to file damage report.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center text-text-secondary">
        Loading booking details & timeline...
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-bg p-8 text-center">
        <h2 className="text-xl font-bold">Booking Record Not Found</h2>
        <Link to="/bookings" className="text-accent underline mt-4 inline-block">
          Return to Bookings List
        </Link>
      </div>
    );
  }

  const isOwner = booking.ownerId?._id?.toString() === user?._id?.toString();
  const item = booking.listingId;

  return (
    <div className="min-h-screen bg-bg text-text-primary flex flex-col">
      <header className="border-b border-border bg-surface sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/bookings" className="inline-flex items-center space-x-2 text-sm text-text-secondary hover:text-text-primary">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Bookings</span>
          </Link>
          <span className="font-bold text-base">Booking #{booking._id.slice(-6)}</span>
          <div></div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 flex-1 w-full space-y-6">
        {error && <div className="p-4 rounded-md bg-danger/10 border border-danger/20 text-danger text-sm">{error}</div>}
        {message && <div className="p-4 rounded-md bg-success/10 border border-success/20 text-success text-sm">{message}</div>}

        {/* Timeline Indicator */}
        <Card className="p-6">
          <BookingTimeline status={booking.status} />
        </Card>

        {/* Item Header & Summary */}
        <Card className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <img
              src={item?.images?.[0]?.url || 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&auto=format&fit=crop&q=80'}
              alt={item?.title}
              className="w-20 h-20 rounded-md object-cover bg-bg-elevated border border-border"
            />
            <div>
              <h2 className="font-bold text-lg">{item?.title}</h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Dates: {new Date(booking.startDate).toLocaleDateString()} — {new Date(booking.endDate).toLocaleDateString()}
              </p>
              <div className="flex items-center space-x-3 mt-2 text-xs">
                <span className="font-semibold text-text-primary">Rental Fee: ₹{booking.rentalFeeAmount}</span>
                <span className="text-text-secondary">•</span>
                <span className="font-semibold text-accent">Deposit Hold: ₹{booking.depositAmount} ({booking.depositStatus})</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col space-y-2 w-full sm:w-auto">
            {booking.status === 'completed' && (
              <Button size="sm" onClick={() => setShowRatingModal(true)} className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-warning mr-1 fill-current" />
                <span>Leave Review</span>
              </Button>
            )}

            {['active', 'completed'].includes(booking.status) && (
              <Button size="sm" variant="outline" onClick={() => setShowDisputeModal(true)} className="text-danger border-danger/30 hover:bg-danger/10">
                <AlertTriangle className="w-4 h-4 mr-1 text-danger" />
                <span>Report Damage</span>
              </Button>
            )}
          </div>
        </Card>

        {/* Role Action Center */}
        {booking.status === 'pending' && isOwner && (
          <Card elevated className="p-6 border-accent/40 text-center space-y-4">
            <h3 className="font-semibold text-base">Pending Borrower Request</h3>
            <p className="text-xs text-text-secondary max-w-md mx-auto">
              <span className="font-semibold text-text-primary">{booking.borrowerId?.name}</span> (Trust Score {booking.borrowerId?.trustScore}/100) has requested to borrow this item.
              {booking.requestMessage && ` Message: "${booking.requestMessage}"`}
            </p>
            <div className="flex justify-center space-x-3 pt-2">
              <Button loading={actionLoading} onClick={handleApprove} variant="primary">
                Approve Request & Issue QR Code
              </Button>
              <Button loading={actionLoading} onClick={handleDecline} variant="outline">
                Decline Request
              </Button>
            </div>
          </Card>
        )}

        {/* QR Handoff Container */}
        {['confirmed', 'active'].includes(booking.status) && (
          <QrCodeDisplay
            qrData={qrData}
            tokenType={booking.status === 'confirmed' ? 'pickup' : 'return'}
            isOwner={isOwner}
            onScanSimulate={booking.status === 'confirmed' ? handlePickupScanSimulate : handleReturnScanSimulate}
            loading={actionLoading}
          />
        )}

        {/* Completed State Card */}
        {booking.status === 'completed' && (
          <Card className="p-6 text-center space-y-3 bg-success/5 border-success/30">
            <CheckCircle2 className="w-10 h-10 text-success mx-auto" />
            <h3 className="font-bold text-base text-success">Booking Successfully Completed!</h3>
            <p className="text-xs text-text-secondary max-w-sm mx-auto">
              The item was safely returned and confirmed by the owner. Security deposit hold of ₹{booking.depositAmount} has been released.
            </p>
          </Card>
        )}
      </main>

      {/* Rating Modal */}
      <RatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        booking={booking}
        onSuccess={() => setMessage('Rating submitted successfully! Target user trust score updated.')}
      />

      {/* File Damage Report Modal */}
      <Modal
        isOpen={showDisputeModal}
        onClose={() => setShowDisputeModal(false)}
        title="File Damage Incident Report"
      >
        <form onSubmit={handleFileDamageReport} className="space-y-4">
          <Input
            label="Damage Description"
            placeholder="Describe scratches, broken parts, or missing accessories..."
            value={damageDescription}
            onChange={(e) => setDamageDescription(e.target.value)}
            required
          />

          <Button type="submit" loading={actionLoading} variant="danger" className="w-full">
            File Report & Freeze Deposit Hold
          </Button>
        </form>
      </Modal>
    </div>
  );
};
