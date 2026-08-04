import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosClient from '../../lib/axiosClient';
import { useAuth } from '../../app/providers/AuthProvider';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

export const VerifyEmailPage = () => {
  const location = useLocation();
  const email = location.state?.email || '';
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axiosClient.post('/auth/verify-otp', { email, code });
      login(res.data.user, res.data.accessToken);
      navigate('/onboarding');
    } catch (err) {
      setError(err.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await axiosClient.post('/auth/resend-otp', { email });
      setMessage('A new OTP has been sent to your email.');
    } catch (err) {
      setError(err.message || 'Failed to resend OTP.');
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-text-primary">Verify Email</h2>
          <p className="text-sm text-text-secondary mt-1">
            Enter the 6-digit code sent to <span className="font-semibold text-text-primary">{email}</span>
          </p>
        </div>

        <Card elevated className="p-8">
          {error && <div className="mb-4 p-3 rounded bg-danger/10 border border-danger/20 text-danger text-sm">{error}</div>}
          {message && <div className="mb-4 p-3 rounded bg-success/10 border border-success/20 text-success text-sm">{message}</div>}

          <form onSubmit={handleVerify} className="space-y-4">
            <Input
              label="6-Digit Verification Code"
              type="text"
              maxLength={6}
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="text-center tracking-widest text-lg font-mono"
              required
            />

            <Button type="submit" loading={loading} className="w-full">
              Verify Code & Continue
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button onClick={handleResend} type="button" className="text-xs text-accent hover:underline font-medium">
              Didn't receive code? Resend OTP
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};
