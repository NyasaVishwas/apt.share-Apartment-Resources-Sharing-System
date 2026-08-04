import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchBookings } from '../../features/bookings/api';
import { useAuth } from '../../app/providers/AuthProvider';
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

  const getStatusBadge = (st) => {
    switch (st) {
      case 'pending': return <Badge variant="warning">Pending Approval</Badge>;
      case 'confirmed': return <Badge variant="primary">Approved (Ready for Pickup)</Badge>;
      case 'active': return <Badge variant="success">Active (Item Picked Up)</Badge>;
      case 'completed': return <Badge variant="default">Completed</Badge>;
      case 'declined': return <Badge variant="danger">Declined</Badge>;
      case 'cancelled': return <Badge variant="danger">Cancelled</Badge>;
      default: return <Badge>{st}</Badge>;
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
          <span className="font-bold text-base">Booking Dashboard</span>
          <div></div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 flex-1 w-full space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Your Resource Bookings</h1>
          <p className="text-sm text-text-secondary mt-1">
            Track borrow requests, owner approvals, and QR handoff confirmations
          </p>
        </div>

        {/* Role Tab Controls */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setRoleTab('borrower')}
            className={`py-3 px-6 font-semibold text-sm border-b-2 transition-colors ${
              roleTab === 'borrower' ? 'border-accent text-accent' : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            My Borrows (Borrower)
          </button>
          <button
            onClick={() => setRoleTab('owner')}
            className={`py-3 px-6 font-semibold text-sm border-b-2 transition-colors ${
              roleTab === 'owner' ? 'border-accent text-accent' : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            My Lends (Item Owner)
          </button>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((n) => (
              <div key={n} className="h-28 bg-surface border border-border rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <Card className="p-12 text-center space-y-3">
            <Calendar className="w-12 h-12 text-text-secondary mx-auto" />
            <h3 className="text-lg font-semibold">No Bookings Found</h3>
            <p className="text-sm text-text-secondary">
              {roleTab === 'borrower'
                ? 'You have not submitted any borrow requests yet.'
                : 'No neighbor has requested your listed items yet.'}
            </p>
            {roleTab === 'borrower' && (
              <Link to="/browse" className="inline-block pt-2">
                <Button variant="primary">Browse Inventory</Button>
              </Link>
            )}
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (
              <Card key={b._id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <img
                    src={b.listingId?.images?.[0]?.url || 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&auto=format&fit=crop&q=80'}
                    alt={b.listingId?.title}
                    className="w-16 h-16 rounded-md object-cover bg-bg-elevated border border-border"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-sm text-text-primary">{b.listingId?.title}</h3>
                      {getStatusBadge(b.status)}
                    </div>
                    <p className="text-xs text-text-secondary mt-1">
                      Dates: {new Date(b.startDate).toLocaleDateString()} — {new Date(b.endDate).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-text-secondary mt-0.5">
                      {roleTab === 'borrower' ? `Lender: ${b.ownerId?.name}` : `Borrower: ${b.borrowerId?.name}`} • Fee: ₹{b.rentalFeeAmount} • Deposit: ₹{b.depositAmount}
                    </p>
                  </div>
                </div>

                <Link to={`/bookings/${b._id}`}>
                  <Button variant="outline" size="sm" className="flex items-center space-x-1">
                    <span>View Timeline & QR</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
