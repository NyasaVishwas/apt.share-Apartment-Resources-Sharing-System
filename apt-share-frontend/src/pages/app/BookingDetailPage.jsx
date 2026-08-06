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
import { ArrowLeft, ShieldCheck, CheckCircle2, AlertTriangle, Star, QrCode } from 'lucide-react';

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
      <div className="min-h-screen bg-bg flex items-center justify-center font-mono text-ink-secondary">
        Loading ledger ticket record...
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-bg p-8 text-center font-sans">
        <h2 className="text-xl font-serif font-bold text-ink">Booking Record Not Found</h2>
        <Link to="/bookings" className="text-amber underline mt-4 inline-block font-mono text-sm">
          Return to Bookings List
        </Link>
      </div>
    );
  }

  const isOwner = booking.ownerId?._id?.toString() === user?._id?.toString();
  const item = booking.listingId;

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col font-sans selection:bg-amber selection:text-ink">
      <header className="border-b border-border bg-surface sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between font-mono">
          <Link to="/bookings" className="inline-flex items-center space-x-2 text-xs text-ink-secondary hover:text-ink">
            <ArrowLeft className="w-4 h-4" />
            <span>RETURN TO BOOKINGS</span>
          </Link>
          <span className="font-bold text-sm text-ink">LEDGER RECORD: #{booking._id.slice(-6).toUpperCase()}</span>
          <div></div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 flex-1 w-full space-y-6">
        {error && <div className="p-4 rounded bg-danger/10 border border-danger/30 text-danger text-sm font-mono">{error}</div>}
        {message && <div className="p-4 rounded bg-teal/10 border border-teal/30 text-teal text-sm font-mono">{message}</div>}

        {/* Timeline Checkpoint Indicator */}
        <div className="bg-surface border border-border p-5 rounded-lg shadow-sm">
          <BookingTimeline status={booking.status} />
        </div>

        {/* Master Stamped Booking Ticket */}
        <div className="ledger-ticket p-6 shadow-ticket space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-border">
            <div className="flex items-center space-x-4">
              <img
                src={item?.images?.[0]?.url || 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&auto=format&fit=crop&q=80'}
                alt={item?.title}
                className="w-20 h-20 rounded-md object-cover bg-surface-sunken border border-border shrink-0"
              />
              <div className="space-y-1">
                <div className="text-[10px] font-mono uppercase tracking-widest text-ink-secondary">
                  CHECK-OUT ITEM
                </div>
                <h2 className="font-serif font-bold text-xl text-ink leading-tight">{item?.title}</h2>
                <p className="text-xs font-mono text-ink-secondary">
                  RESERVATION DATES: {new Date(booking.startDate).toLocaleDateString()} — {new Date(booking.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="shrink-0">
              <span className={`stamp-badge ${
                booking.status === 'completed' 
                  ? 'stamp-badge-teal' 
                  : booking.status === 'active' 
                  ? 'stamp-badge-amber' 
                  : 'stamp-badge-ink'
              } animate-stamp-thud text-sm`}>
                {booking.status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Ledger Financial & Route Summary Table */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded bg-surface-sunken border border-border font-mono text-xs">
            <div>
              <span className="text-ink-secondary uppercase block text-[10px]">Rental Fee</span>
              <span className="font-bold text-ink text-sm">₹{booking.rentalFeeAmount}</span>
            </div>

            <div>
              <span className="text-ink-secondary uppercase block text-[10px]">Deposit Hold</span>
              <span className="font-bold text-amber text-sm">₹{booking.depositAmount}</span>
            </div>

            <div>
              <span className="text-ink-secondary uppercase block text-[10px]">Escrow Status</span>
              <span className="font-bold text-teal text-sm uppercase">{booking.depositStatus}</span>
            </div>

            <div>
              <span className="text-ink-secondary uppercase block text-[10px]">Handoff Mode</span>
              <span className="font-bold text-ink text-sm">QR DOORSTEP</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {booking.status === 'completed' && (
              <Button size="sm" variant="teal" onClick={() => setShowRatingModal(true)} className="flex items-center space-x-1">
                <Star className="w-4 h-4 mr-1 fill-current" />
                <span>LEAVE NEIGHBOR REVIEW</span>
              </Button>
            )}

            {['active', 'completed'].includes(booking.status) && (
              <Button size="sm" variant="outline" onClick={() => setShowDisputeModal(true)} className="text-danger border-danger/40 hover:bg-danger/10">
                <AlertTriangle className="w-4 h-4 mr-1 text-danger" />
                <span>REPORT DAMAGE INCIDENT</span>
              </Button>
            )}
          </div>
        </div>

        {/* Role Action Center */}
        {booking.status === 'pending' && isOwner && (
          <div className="ledger-ticket-sunken p-6 text-center space-y-4 border-amber/50">
            <h3 className="font-serif font-bold text-lg text-ink">Pending Borrower Request</h3>
            <p className="text-xs text-ink-secondary max-w-md mx-auto">
              <span className="font-bold text-ink">{booking.borrowerId?.name}</span> (Trust Score {booking.borrowerId?.trustScore}/100) has submitted a checkout tag for this item.
              {booking.requestMessage && ` Message: "${booking.requestMessage}"`}
            </p>
            <div className="flex justify-center space-x-3 pt-2">
              <Button loading={actionLoading} onClick={handleApprove} variant="primary" size="md">
                Approve Request & Issue QR Code
              </Button>
              <Button loading={actionLoading} onClick={handleDecline} variant="outline" size="md">
                Decline Request
              </Button>
            </div>
          </div>
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

        {/* Completed State Ticket */}
        {booking.status === 'completed' && (
          <div className="ledger-ticket p-6 text-center space-y-3 bg-teal/5 border-teal/30">
            <CheckCircle2 className="w-10 h-10 text-teal mx-auto" />
            <h3 className="font-serif font-bold text-xl text-teal">Booking Successfully Completed!</h3>
            <p className="text-xs text-ink-secondary max-w-sm mx-auto font-mono">
              The item was safely returned and verified. Escrow security deposit hold of ₹{booking.depositAmount} has been released back.
            </p>
          </div>
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

