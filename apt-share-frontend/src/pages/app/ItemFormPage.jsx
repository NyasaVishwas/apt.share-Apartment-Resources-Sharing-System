import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createListing } from '../../features/listings/api';
import { CATEGORIES } from '../../lib/constants';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { ArrowLeft, PackagePlus } from 'lucide-react';

export const ItemFormPage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('tools_diy');
  const [imageUrl, setImageUrl] = useState('');
  const [brand, setBrand] = useState('');
  const [condition, setCondition] = useState('good');
  const [securityDeposit, setSecurityDeposit] = useState('1000');
  const [rentalFeePerDay, setRentalFeePerDay] = useState('0');
  const [maxBorrowDurationDays, setMaxBorrowDurationDays] = useState('7');
  const [pickupInstructions, setPickupInstructions] = useState('');
  const [usageInstructions, setUsageInstructions] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const finalImage = imageUrl.trim() || 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&auto=format&fit=crop&q=80';

      const payload = {
        title,
        description,
        category,
        images: [{ url: finalImage }],
        brand,
        condition,
        securityDeposit: Number(securityDeposit),
        rentalFeePerDay: Number(rentalFeePerDay),
        maxBorrowDurationDays: Number(maxBorrowDurationDays),
        pickupInstructions,
        usageInstructions
      };

      await createListing(payload);
      navigate('/browse');
    } catch (err) {
      setError(err.message || 'Failed to create listing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text-primary flex flex-col">
      <header className="border-b border-border bg-surface sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/browse" className="inline-flex items-center space-x-2 text-sm text-text-secondary hover:text-text-primary">
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel</span>
          </Link>
          <span className="font-bold text-base">List a Resource</span>
          <div></div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8 flex-1 w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Share an Item with Neighbors</h1>
          <p className="text-sm text-text-secondary mt-1">
            List your unused tools or equipment safely under community trust rules
          </p>
        </div>

        <Card elevated className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded bg-danger/10 border border-danger/20 text-danger text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Item Title"
              placeholder="e.g. Bosch Cordless Power Drill"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-surface border border-border rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
              >
                {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">
                Description
              </label>
              <textarea
                rows={3}
                placeholder="Describe condition, specifications, and what is included..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-surface border border-border rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                required
              />
            </div>

            <Input
              label="Image URL"
              placeholder="https://images.unsplash.com/..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              helperText="Provide a direct image URL or leave blank for a default photo"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Brand"
                placeholder="e.g. Bosch, Kärcher"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              />
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Item Condition
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-surface border border-border rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="new">Brand New</option>
                  <option value="like_new">Like New</option>
                  <option value="good">Good Condition</option>
                  <option value="fair">Fair</option>
                  <option value="worn">Worn</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-2">
              <Input
                label="Security Deposit (₹)"
                type="number"
                value={securityDeposit}
                onChange={(e) => setSecurityDeposit(e.target.value)}
                required
              />
              <Input
                label="Rental Fee / Day (₹)"
                type="number"
                value={rentalFeePerDay}
                onChange={(e) => setRentalFeePerDay(e.target.value)}
                helperText="0 for Free"
              />
              <Input
                label="Max Days"
                type="number"
                value={maxBorrowDurationDays}
                onChange={(e) => setMaxBorrowDurationDays(e.target.value)}
              />
            </div>

            <Input
              label="Pickup Instructions"
              placeholder="e.g. Pickup at Tower A 302 after 6 PM"
              value={pickupInstructions}
              onChange={(e) => setPickupInstructions(e.target.value)}
            />

            <Input
              label="Usage Guidelines"
              placeholder="e.g. Clean after use, keep away from rain"
              value={usageInstructions}
              onChange={(e) => setUsageInstructions(e.target.value)}
            />

            <Button type="submit" loading={loading} className="w-full mt-4">
              Publish Listing to Society
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
};
