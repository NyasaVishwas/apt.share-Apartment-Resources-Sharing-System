import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../lib/axiosClient';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { AuthPageHeader } from '../../components/navigation/AuthPageHeader';
import { ShieldCheck, KeyRound } from 'lucide-react';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await axiosClient.post('/auth/forgot-password', { email });
      setMessage('Password reset instructions have been sent to your email.');
    } catch (err) {
      setError(err.message || 'Failed to request password reset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col font-sans selection:bg-amber selection:text-ink">
      <AuthPageHeader />

      <main className="flex-1 grid lg:grid-cols-12 w-full max-w-7xl mx-auto">
        {/* Form Panel */}
        <div className="lg:col-span-6 flex flex-col justify-center px-6 lg:px-12 py-8 my-auto">
          <div className="max-w-md w-full mx-auto space-y-5">
            <div className="space-y-1.5">
              <div className="text-xs font-mono uppercase tracking-widest text-ink-secondary">
                ACCOUNT RECOVERY LEDGER
              </div>
              <h1 className="text-3xl font-serif font-bold text-ink">Reset Your Password</h1>
              <p className="text-sm text-ink-secondary">
                Enter your registered resident email to receive a password reset link
              </p>
            </div>

            <div className="ledger-ticket p-8 shadow-ticket space-y-6">
              {error && (
                <div className="p-3 rounded bg-danger/10 border border-danger/30 text-danger text-xs font-mono">
                  {error}
                </div>
              )}
              {message && (
                <div className="p-3 rounded bg-teal/10 border border-teal/30 text-teal text-xs font-mono">
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="nyasa@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <Button type="submit" loading={loading} variant="primary" className="w-full font-mono mt-2">
                  SEND RESET LINK
                </Button>
              </form>
            </div>

            <p className="text-center text-xs font-mono text-ink-secondary">
              Remembered your password?{' '}
              <Link to="/login" className="text-amber hover:underline font-bold">
                Return to Sign In
              </Link>
            </p>
          </div>
        </div>

        {/* Brand Context Panel with Grid Texture & Card Stack */}
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-center items-center p-12 bg-surface-sunken border-l border-border relative overflow-hidden ledger-grid-bg">
          <div className="relative w-full max-w-md my-auto flex flex-col items-center">
            {/* Stack Layer 2 */}
            <div className="absolute inset-0 bg-surface/40 border border-border rounded-lg shadow-sm -rotate-2 scale-[0.96] translate-y-3 pointer-events-none -z-20"></div>
            {/* Stack Layer 1 */}
            <div className="absolute inset-0 bg-surface/70 border border-border rounded-lg shadow-sm rotate-[1.5deg] scale-[0.98] translate-y-1.5 pointer-events-none -z-10"></div>

            {/* Front Card */}
            <div className="ledger-ticket p-6 space-y-4 shadow-ticket bg-surface w-full relative">
              <div className="flex items-center space-x-3 pb-3 border-b border-border">
                <div className="p-3 rounded bg-amber/10 text-ink border border-amber/30">
                  <KeyRound className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-ink">Secure Recovery Protocol</h3>
                  <p className="text-xs text-ink-secondary font-mono">Encrypted password reset token validation</p>
                </div>
              </div>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Your community account safety is protected by token expiration timeouts and encrypted session state.
              </p>

              <div className="ticket-divider"></div>

              <div className="bg-surface-sunken p-3.5 rounded border border-border font-mono text-xs flex items-center justify-between">
                <span className="text-ink-secondary uppercase text-[10px] font-bold">SECURITY DISPATCH</span>
                <span className="font-bold text-teal text-xs">ACTIVE LEDGER SYSTEM</span>
              </div>
            </div>

            <p className="text-[11px] font-mono text-ink-secondary text-center mt-4 flex items-center justify-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal" />
              <span>Identity details masked pre-login — visible to verified residents only.</span>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
