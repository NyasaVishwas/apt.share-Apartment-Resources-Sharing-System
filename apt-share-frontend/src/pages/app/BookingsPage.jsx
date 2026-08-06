import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchBookings } from '../../features/bookings/api';
import { useAuth } from '../../app/providers/AuthProvider';
import { formatINR, formatIndianDate } from '../../lib/formatters';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ArrowLeft, Calendar, ShieldCheck, CheckCircle2, Clock, XCircle, ArrowRight } from 'lucide-react';

export const BookingsPage = () => {
  const { user } = useAuth();
  const [roleTab, setRoleTab] = useState('borrower'); // 'borrower' | 'owner'
  const [statusFilter, setStatusFilter] = useState('all');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, [roleTab, statusFilter]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await fetchBookings({ role: roleTab, status: statusFilter });
      setBookings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStamp = (st) => {
    switch (st) {
      case 'pending': return <span className="stamp-badge stamp-badge-amber text-[10px]">PENDING APPROVAL</span>;
      case 'confirmed': return <span className="stamp-badge stamp-badge-teal text-[10px]">READY FOR PICKUP</span>;
      case 'active': return <span className="stamp-badge stamp-badge-amber text-[10px]">ACTIVE BORROW</span>;
      case 'completed': return <span className="stamp-badge stamp-badge-teal text-[10px]">RETURNED</span>;
      case 'declined': return <span className="stamp-badge stamp-badge-danger text-[10px]">DECLINED</span>;
      case 'cancelled': return <span className="stamp-badge stamp-badge-danger text-[10px]">CANCELLED</span>;
      default: return <span className="stamp-badge stamp-badge-ink text-[10px]">{st.toUpperCase()}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col font-sans selection:bg-amber selection:text-ink">
      <header className="border-b border-border bg-surface sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between font-mono">
          <Link to="/dashboard" className="inline-flex items-center space-x-2 text-xs text-ink-secondary hover:text-ink">
            <ArrowLeft className="w-4 h-4" />
            <span>RETURN TO DASHBOARD</span>
          </Link>
          <span className="font-bold text-sm text-ink">BUILDING CHECK-OUT LEDGER</span>
          <div></div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 flex-1 w-full space-y-6">
        <div className="border-b border-border pb-4">
          <div className="text-xs font-mono uppercase tracking-wider text-ink-secondary mb-1">
            CHECK-OUT RECORDS
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink tracking-tight">Your Resource Bookings</h1>
          <p className="text-sm text-ink-secondary mt-1">
            Track doorstep borrow requests, owner approvals, and QR handoff verification stamps
          </p>
        </div>

        {/* Role Tab Controls */}
        <div className="flex border-b border-border font-mono text-xs">
          <button
            onClick={() => setRoleTab('borrower')}
            className={`py-3 px-6 font-bold uppercase tracking-wider border-b-2 transition-colors ${
              roleTab === 'borrower' ? 'border-amber text-amber' : 'border-transparent text-ink-secondary hover:text-ink'
            }`}
          >
            My Borrows (Borrower)
          </button>
          <button
            onClick={() => setRoleTab('owner')}
            className={`py-3 px-6 font-bold uppercase tracking-wider border-b-2 transition-colors ${
              roleTab === 'owner' ? 'border-amber text-amber' : 'border-transparent text-ink-secondary hover:text-ink'
            }`}
          >
            My Lends (Item Owner)
          </button>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((n) => (
              <div key={n} className="h-28 ledger-ticket animate-pulse bg-surface p-5"></div>
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="ledger-ticket-sunken p-12 text-center space-y-3">
            <Calendar className="w-12 h-12 text-ink-secondary mx-auto opacity-60" />
            <h3 className="font-serif font-bold text-xl text-ink">No Check-out Records Found</h3>
            <p className="text-sm text-ink-secondary max-w-md mx-auto">
              {roleTab === 'borrower'
                ? "You haven't requested any items from your neighbors yet. Browse the community catalog to get started."
                : 'No neighbor has requested your listed items yet.'}
            </p>
            {roleTab === 'borrower' && (
              <div className="pt-2">
                <Link to="/browse">
                  <Button variant="primary" size="sm" className="font-mono">Browse Building Catalog</Button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (
              <div key={b._id} className="ledger-ticket p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <img
                    src={b.listingId?.images?.[0]?.url || 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&auto=format&fit=crop&q=80'}
                    alt={b.listingId?.title}
                    className="w-16 h-16 rounded-md object-cover bg-surface-sunken border border-border shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-serif font-bold text-base text-ink">{b.listingId?.title}</h3>
                      {getStatusStamp(b.status)}
                    </div>
                    <p className="text-xs font-mono text-ink-secondary">
                      DATES: {formatIndianDate(b.startDate)} — {formatIndianDate(b.endDate)}
                    </p>
                    <p className="text-xs font-mono text-ink-secondary">
                      {roleTab === 'borrower' ? `Lender: ${b.ownerId?.name}` : `Borrower: ${b.borrowerId?.name}`} • Fee: {b.rentalFeeAmount === 0 ? 'Free' : formatINR(b.rentalFeeAmount)} • Deposit: {formatINR(b.depositAmount)}
                    </p>
                  </div>
                </div>

                <Link to={`/bookings/${b._id}`}>
                  <Button variant="outline" size="sm" className="font-mono flex items-center space-x-1">
                    <span>VIEW TICKET & QR</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
