import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../../lib/axiosClient';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { AuthPageHeader } from '../../components/navigation/AuthPageHeader';
import { ShieldCheck, UserCheck } from 'lucide-react';

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axiosClient.post('/auth/register', { name, email, password, phone });
      navigate('/verify-otp', { state: { email } });
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col font-sans selection:bg-amber selection:text-ink">
      <AuthPageHeader />

      {/* Main Split-Screen Container */}
      <main className="flex-1 grid lg:grid-cols-12 w-full max-w-7xl mx-auto">
        {/* Form Panel (Tightened vertical spacing, centered as a unit) */}
        <div className="lg:col-span-6 flex flex-col justify-center px-6 lg:px-12 py-8 my-auto">
          <div className="max-w-md w-full mx-auto space-y-5">
            <div className="space-y-1.5">
              <div className="text-xs font-mono uppercase tracking-widest text-ink-secondary">
                JOIN NEIGHBORHOOD LEDGER
              </div>
              <h1 className="text-3xl font-serif font-bold text-ink">Create Resident Account</h1>
              <p className="text-sm text-ink-secondary">
                Register your profile to start borrowing and sharing resources in your apartment complex
              </p>
            </div>

            <div className="ledger-ticket p-8 shadow-ticket space-y-6">
              {error && (
                <div className="p-3 rounded bg-danger/10 border border-danger/30 text-danger text-xs font-mono">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Full Name"
                  type="text"
                  placeholder="e.g. Nyasa Vishwas"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="e.g. nyasa@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Input
                  label="Password"
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Input
                  label="Phone Number (optional)"
                  type="tel"
                  placeholder="+91 XXXXX XXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />

                <Button type="submit" loading={loading} variant="primary" className="w-full font-mono mt-2">
                  CREATE RESIDENT ACCOUNT
                </Button>
              </form>
            </div>

            <p className="text-center text-xs font-mono text-ink-secondary">
              Already registered?{' '}
              <Link to="/login" className="text-amber hover:underline font-bold">
                Sign In to Ledger
              </Link>
            </p>
          </div>
        </div>

        {/* Brand Context Panel with Grid Texture, Card Stack & Redacted Data */}
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-center items-center p-12 bg-surface-sunken border-l border-border relative overflow-hidden ledger-grid-bg">
          <div className="relative w-full max-w-md my-auto flex flex-col items-center">
            {/* Stack Layer 2 (Bottom peek-out card) */}
            <div className="absolute inset-0 bg-surface/40 border border-border rounded-lg shadow-sm -rotate-2 scale-[0.96] translate-y-3 pointer-events-none -z-20"></div>

            {/* Stack Layer 1 (Middle peek-out card) */}
            <div className="absolute inset-0 bg-surface/70 border border-border rounded-lg shadow-sm rotate-[1.5deg] scale-[0.98] translate-y-1.5 pointer-events-none -z-10"></div>

            {/* Main Front Ticket Card */}
            <div className="ledger-ticket p-6 space-y-4 shadow-ticket bg-surface w-full relative">
              <div className="flex items-center justify-between text-xs font-mono border-b border-border pb-3">
                <span className="text-ink-secondary tracking-wider uppercase font-semibold">
                  APT.SHARE // CHECK-OUT TICKET
                </span>
                <span className="text-ink font-bold">REF: #BRW-7819</span>
              </div>

              <div className="flex items-start gap-4 py-2">
                <div className="w-14 h-14 rounded bg-surface-sunken border border-border flex items-center justify-center shrink-0 text-2xl font-serif">
                  🎪
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber bg-amber/10 px-1.5 py-0.5 rounded border border-amber/30">
                    4-PERSON TENT & GEAR
                  </span>
                  <h3 className="font-serif font-bold text-base text-ink mt-1">Coleman Waterproof Camping Tent</h3>
                  <p className="text-xs text-ink-secondary font-sans">Includes 2 sleeping bags & LED lantern</p>
                </div>
              </div>

              {/* Masked Privacy Redacted Route Ledger */}
              <div className="bg-surface-sunken p-4 rounded border border-border space-y-2 font-mono text-xs">
                <div className="flex justify-between items-center text-ink-secondary">
                  <span>BORROWER:</span>
                  <span className="text-ink font-medium flex items-center gap-1">
                    Flat ██ (V████ D.)
                  </span>
                </div>
                <div className="flex justify-between items-center text-ink-secondary">
                  <span>LENDER:</span>
                  <span className="text-ink font-medium flex items-center gap-1">
                    Flat ██ (A████ R.)
                  </span>
                </div>
                <div className="flex justify-between items-center text-ink-secondary pt-1 border-t border-border/60">
                  <span>ESCROW DEPOSIT:</span>
                  <span className="text-amber font-bold">₹1,200 Hold</span>
                </div>
              </div>

              <div className="ticket-divider"></div>

              <div className="flex items-center justify-between pt-1 font-mono">
                <div className="flex items-center space-x-2 text-xs text-teal font-bold">
                  <UserCheck className="w-4 h-4 text-teal" />
                  <span>VERIFIED RESIDENT MEMBER</span>
                </div>
                <div className="stamp-badge stamp-badge-amber text-[10px]">
                  CONFIRMED & ISSUED
                </div>
              </div>

              {/* Integrated Audited Stat Block */}
              <div className="bg-surface-sunken p-3.5 rounded border border-border font-mono text-xs flex items-center justify-between mt-2">
                <span className="text-ink-secondary uppercase text-[10px] font-bold">VERIFIED RETURN RATE</span>
                <span className="font-serif font-bold text-base text-teal">94.8%</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
