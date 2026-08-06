import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../lib/axiosClient';
import { useTheme } from '../../app/providers/ThemeProvider';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Logo } from '../../components/ui/Logo';
import { Building2, PlusCircle, Search, Sun, Moon } from 'lucide-react';

export const OnboardingPage = () => {
  const [mode, setMode] = useState('join'); // 'join' | 'create'
  const [searchTerm, setSearchTerm] = useState('');
  const [communities, setCommunities] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [unit, setUnit] = useState('');
  const [block, setBlock] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Create form state
  const [name, setName] = useState('');
  const [type, setType] = useState('apartment');
  const [city, setCity] = useState('');

  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCommunities();
  }, [searchTerm]);

  const fetchCommunities = async () => {
    try {
      const res = await axiosClient.get(`/communities/search?q=${searchTerm}`);
      setCommunities(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!selectedCommunity) return;
    setLoading(true);
    setError('');

    try {
      const res = await axiosClient.post('/memberships', {
        communityId: selectedCommunity._id,
        unit,
        block
      });
      localStorage.setItem('activeCommunityId', selectedCommunity._id);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to join community.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const commRes = await axiosClient.post('/communities/request', {
        name,
        type,
        address: { line1: 'Main Road', city, state: 'Karnataka', pincode: '560066', country: 'India' }
      });
      const newComm = commRes.data;

      // Automatically join newly created community
      await axiosClient.post('/memberships', {
        communityId: newComm._id,
        unit: 'Flat A-101',
        block: 'Wing A'
      });

      localStorage.setItem('activeCommunityId', newComm._id);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to create community.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col font-sans selection:bg-amber selection:text-ink">
      {/* Top Bar Navigation */}
      <header className="h-16 border-b border-border bg-surface px-6 flex items-center justify-between sticky top-0 z-40">
        <Logo to="/" />
        <button
          onClick={toggleTheme}
          className="p-2 rounded-md hover:bg-surface-sunken text-ink-secondary hover:text-ink transition-colors border border-transparent hover:border-border"
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </header>

      {/* Main Form Container */}
      <main className="flex-1 flex flex-col justify-center items-center p-6 py-10">
        <div className="w-full max-w-2xl space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-ink-secondary">
              RESIDENTIAL DIRECTORY ONBOARDING
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-ink">
              Connect to Your Society Ledger
            </h1>
            <p className="text-sm text-ink-secondary max-w-md mx-auto">
              Select your apartment complex, gated society, or campus to start lending and borrowing
            </p>
          </div>

          <div className="flex border-b border-border font-mono text-xs">
            <button
              onClick={() => setMode('join')}
              className={`flex-1 py-3 font-bold uppercase tracking-wider border-b-2 flex items-center justify-center space-x-2 transition-colors ${
                mode === 'join' ? 'border-amber text-amber' : 'border-transparent text-ink-secondary hover:text-ink'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Join Existing Society</span>
            </button>
            <button
              onClick={() => setMode('create')}
              className={`flex-1 py-3 font-bold uppercase tracking-wider border-b-2 flex items-center justify-center space-x-2 transition-colors ${
                mode === 'create' ? 'border-amber text-amber' : 'border-transparent text-ink-secondary hover:text-ink'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Request New Society Ledger</span>
            </button>
          </div>

          {error && (
            <div className="p-3 rounded bg-danger/10 border border-danger/30 text-danger text-xs font-mono">
              {error}
            </div>
          )}

          {mode === 'join' ? (
            <div className="ledger-ticket p-6 space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-ink-secondary">
                  Find Your Apartment or Gated Society
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-ink-secondary" />
                  <input
                    type="text"
                    placeholder="Search society name (e.g. Green Valley Heights)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-surface border border-border rounded-md text-sm text-ink placeholder:text-ink-secondary/50 focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber font-sans"
                  />
                </div>
              </div>

              {/* Communities list */}
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {communities.length === 0 ? (
                  <p className="text-xs font-mono text-ink-secondary text-center py-6">
                    No registered societies found matching your search term.
                  </p>
                ) : (
                  communities.map((c) => (
                    <div
                      key={c._id}
                      onClick={() => setSelectedCommunity(c)}
                      className={`p-4 rounded border cursor-pointer transition-all flex items-center justify-between ${
                        selectedCommunity?._id === c._id
                          ? 'border-amber bg-amber/10'
                          : 'border-border bg-surface hover:bg-surface-sunken'
                      }`}
                    >
                      <div>
                        <h4 className="font-serif font-bold text-base text-ink">{c.name}</h4>
                        <p className="text-xs font-mono text-ink-secondary">
                          {c.address?.city || 'Bengaluru'}, {c.address?.state || 'Karnataka'} • {c.memberCount || 0} verified members
                        </p>
                      </div>
                      <Badge stamp variant="teal">{c.type?.toUpperCase()}</Badge>
                    </div>
                  ))
                )}
              </div>

              {selectedCommunity && (
                <form onSubmit={handleJoin} className="pt-4 border-t border-border space-y-4 font-sans">
                  <h4 className="font-serif font-bold text-sm text-ink">Residence Unit Details for {selectedCommunity.name}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Block / Wing / Tower"
                      placeholder="Wing B / Tower 2"
                      value={block}
                      onChange={(e) => setBlock(e.target.value)}
                      required
                    />
                    <Input
                      label="Flat / Unit No."
                      placeholder="Flat B-402"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" loading={loading} variant="primary" className="w-full font-mono">
                    SUBMIT SOCIETY JOIN REQUEST
                  </Button>
                </form>
              )}
            </div>
          ) : (
            <div className="ledger-ticket p-6">
              <form onSubmit={handleCreate} className="space-y-4 font-sans">
                <Input
                  label="Society / Complex Name"
                  placeholder="e.g. Shanti Nagar Housing Society"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-ink-secondary">
                    Community Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-surface border border-border rounded-md text-ink font-mono focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber"
                  >
                    <option value="apartment">Apartment Complex</option>
                    <option value="gated_society">Gated Society</option>
                    <option value="hostel">Hostel / Campus</option>
                    <option value="coworking">Coworking Space</option>
                  </select>
                </div>
                <Input
                  label="City"
                  placeholder="e.g. Bengaluru, Mumbai, Pune, Delhi NCR"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
                <Button type="submit" loading={loading} variant="primary" className="w-full font-mono mt-4">
                  REGISTER & INITIALIZE SOCIETY LEDGER
                </Button>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
