import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Star } from 'lucide-react';
import { submitRating } from '../../features/ratings/api';

export const RatingModal = ({ isOpen, onClose, booking, onSuccess }) => {
  const [overall, setOverall] = useState(5);
  const [communication, setCommunication] = useState(5);
  const [condition, setCondition] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!booking) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await submitRating({
        bookingId: booking._id,
        direction: 'borrower_to_owner',
        scores: { overall, communication, condition },
        comment
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit rating.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Rate Your Borrow Experience">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="p-3 rounded bg-danger/10 border border-danger/20 text-danger text-sm">{error}</div>}

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
            Overall Rating
          </label>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setOverall(star)}
                className={`p-1 transition-transform ${star <= overall ? 'text-warning scale-110' : 'text-text-secondary/40'}`}
              >
                <Star className="w-8 h-8 fill-current" />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Review / Feedback
          </label>
          <textarea
            rows={3}
            placeholder="How was the communication, pickup handoff, and item condition?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-surface border border-border rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <Button type="submit" loading={loading} className="w-full">
          Submit Rating & Update Trust Score
        </Button>
      </form>
    </Modal>
  );
};
