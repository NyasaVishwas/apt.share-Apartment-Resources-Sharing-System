const Rating = require('../../models/Rating.model');
const Booking = require('../../models/Booking.model');
const User = require('../../models/User.model');
const Listing = require('../../models/Listing.model');
const TrustScoreEvent = require('../../models/TrustScoreEvent.model');
const ApiError = require('../../utils/ApiError');

class RatingsService {
  static async createRating(raterUserId, ratingData) {
    const { bookingId, direction, scores, comment } = ratingData;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new ApiError(404, 'Booking not found', 'NOT_FOUND');
    }

    if (booking.status !== 'completed') {
      throw new ApiError(400, 'Ratings can only be submitted for completed bookings', 'INVALID_STATUS');
    }

    let rateeUserId = null;
    let listingId = booking.listingId;

    if (direction === 'borrower_to_owner') {
      rateeUserId = booking.ownerId;
    } else if (direction === 'owner_to_borrower') {
      rateeUserId = booking.borrowerId;
    }

    const rating = await Rating.create({
      bookingId,
      communityId: booking.communityId,
      raterUserId,
      rateeUserId,
      listingId,
      direction,
      scores,
      comment: comment || ''
    });

    // Update Trust Score if rating a user
    if (rateeUserId) {
      const overall = scores.overall || 5;
      const delta = overall >= 4 ? 2 : overall <= 2 ? -5 : 0;

      await TrustScoreEvent.create({
        userId: rateeUserId,
        communityId: booking.communityId,
        eventType: 'rating_received',
        scoreDelta: delta,
        relatedBookingId: bookingId
      });

      const user = await User.findById(rateeUserId);
      if (user) {
        user.trustScore = Math.max(0, Math.min(100, user.trustScore + delta));
        if (user.trustScore >= 90 && !user.trustBadges.includes('trusted_lender')) {
          user.trustBadges.push('trusted_lender');
        }
        await user.save();
      }
    }

    // Update Listing average rating if rating an item/owner
    if (listingId && scores.overall) {
      const allItemRatings = await Rating.find({ listingId, direction: { $in: ['borrower_to_owner', 'borrower_to_item'] } });
      const avg = allItemRatings.reduce((acc, curr) => acc + curr.scores.overall, 0) / allItemRatings.length;
      await Listing.findByIdAndUpdate(listingId, {
        averageRating: Number(avg.toFixed(1)),
        ratingCount: allItemRatings.length
      });
    }

    return rating;
  }

  static async getUserRatings(userId) {
    return await Rating.find({ rateeUserId: userId })
      .sort({ createdAt: -1 })
      .populate('raterUserId', 'name avatarUrl trustScore')
      .populate('listingId', 'title category');
  }

  static async getListingRatings(listingId) {
    return await Rating.find({ listingId })
      .sort({ createdAt: -1 })
      .populate('raterUserId', 'name avatarUrl trustScore');
  }
}

module.exports = RatingsService;
