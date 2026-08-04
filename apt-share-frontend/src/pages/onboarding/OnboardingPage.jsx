import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../lib/axiosClient';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Building2, PlusCircle, Search } from 'lucide-react';

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
        address: { line1: 'Main St', city, state: 'State', pincode: '560001' }
      });
      const newComm = commRes.data;

      // Automatically join newly created community
      await axiosClient.post('/memberships', {
        communityId: newComm._id,
        unit: 'Admin Suite',
        block: 'Tower A'
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
    <div className="min-h-screen bg-bg p-6 flex flex-col justify-center items-center">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">
            Community Onboarding
          </h1>
          <p className="text-text-secondary mt-2">
            Connect with your apartment or society to start sharing resources
          </p>
        </div>

        <div className="flex border-b border-border mb-6">
          <button
            onClick={() => setMode('join')}
            className={`flex-1 py-3 font-semibold text-sm border-b-2 flex items-center justify-center space-x-2 transition-colors ${
              mode === 'join' ? 'border-accent text-accent' : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Join Existing Community</span>
          </button>
          <button
            onClick={() => setMode('create')}
            className={`flex-1 py-3 font-semibold text-sm border-b-2 flex items-center justify-center space-x-2 transition-colors ${
              mode === 'create' ? 'border-accent text-accent' : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Request New Community</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded bg-danger/10 border border-danger/20 text-danger text-sm">
            {error}
          </div>
        )}

        {mode === 'join' ? (
          <Card elevated className="p-6 space-y-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
                Find Your Apartment or Gated Society
              </label>
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-2.5 text-text-secondary" />
                <input
                  type="text"
                  placeholder="Search by community name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-md text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>

            {/* Communities list */}
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {communities.length === 0 ? (
                <p className="text-sm text-text-secondary text-center py-4">
                  No communities found matching your search.
                </p>
              ) : (
                communities.map((c) => (
                  <div
                    key={c._id}
                    onClick={() => setSelectedCommunity(c)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                      selectedCommunity?._id === c._id
                        ? 'border-accent bg-accent/5 ring-1 ring-accent'
                        : 'border-border hover:bg-bg-elevated'
                    }`}
                  >
                    <div>
                      <h4 className="font-semibold text-sm text-text-primary">{c.name}</h4>
                      <p className="text-xs text-text-secondary">
                        {c.address?.city}, {c.address?.state} • {c.memberCount || 0} members
                      </p>
                    </div>
                    <Badge variant="primary">{c.type}</Badge>
                  </div>
                ))
              )}
            </div>

            {selectedCommunity && (
              <form onSubmit={handleJoin} className="pt-4 border-t border-border space-y-4">
                <h4 className="font-semibold text-sm">Residence Details for {selectedCommunity.name}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Block / Tower"
                    placeholder="Tower A"
                    value={block}
                    onChange={(e) => setBlock(e.target.value)}
                    required
                  />
                  <Input
                    label="Flat / Unit No."
                    placeholder="A-402"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" loading={loading} className="w-full">
                  Submit Join Request
                </Button>
              </form>
            )}
          </Card>
        ) : (
          <Card elevated className="p-6">
            <form onSubmit={handleCreate} className="space-y-4">
              <Input
                label="Community Name"
                placeholder="Green Valley Heights"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Community Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-surface border border-border rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="apartment">Apartment Complex</option>
                  <option value="gated_society">Gated Society</option>
                  <option value="hostel">Hostel / Campus</option>
                  <option value="coworking">Coworking Space</option>
                </select>
              </div>
              <Input
                label="City"
                placeholder="Bengaluru"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
              <Button type="submit" loading={loading} className="w-full">
                Register & Initialize Community
              </Button>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
};
