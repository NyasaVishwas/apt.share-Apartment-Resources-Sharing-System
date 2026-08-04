import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/providers/AuthProvider';
import axiosClient from '../../lib/axiosClient';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axiosClient.post('/auth/login', { email, password });
      login(res.data.user, res.data.accessToken);

      // Check active memberships
      const memRes = await axiosClient.get('/memberships/mine');
      if (memRes.data && memRes.data.length > 0) {
        localStorage.setItem('activeCommunityId', memRes.data[0].communityId._id);
        navigate('/dashboard');
      } else {
        navigate('/onboarding');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('aarav@example.com');
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <div className="w-10 h-10 rounded-lg bg-accent text-white font-bold text-2xl flex items-center justify-center">
              a
            </div>
            <span className="font-bold text-2xl tracking-tight text-text-primary">apt.share</span>
          </Link>
          <h2 className="text-xl font-semibold mt-4 text-text-primary">Welcome back</h2>
          <p className="text-sm text-text-secondary">Sign in to your community resource portal</p>
        </div>

        <Card elevated className="p-8">
          {error && (
            <div className="mb-4 p-3 rounded bg-danger/10 border border-danger/20 text-danger text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="aarav@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button type="submit" loading={loading} className="w-full">
              Sign In
            </Button>
          </form>

          <div className="mt-6 border-t border-border pt-4 text-center">
            <p className="text-xs text-text-secondary mb-2">Need a quick test login?</p>
            <Button variant="outline" size="sm" onClick={handleDemoLogin} className="w-full">
              Fill Demo Resident Credentials
            </Button>
          </div>
        </Card>

        <p className="text-center text-sm text-text-secondary mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-accent hover:underline font-semibold">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};
