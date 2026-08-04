const Booking = require('../../models/Booking.model');
const Listing = require('../../models/Listing.model');
const AnalyticsSnapshot = require('../../models/AnalyticsSnapshot.model');

class AnalyticsService {
  static async getUserAnalytics(userId) {
    const completedBorrows = await Booking.find({ borrowerId: userId, status: 'completed' }).populate('listingId');
    const completedLends = await Booking.find({ ownerId: userId, status: 'completed' });

    let moneySaved = 0;
    let co2Saved = 0;

    for (const b of completedBorrows) {
      const deposit = b.depositAmount || 1500;
      const rentalFee = b.rentalFeeAmount || 0;
      // Money saved by borrowing instead of purchasing new item
      moneySaved += Math.max(0, deposit - rentalFee);
      // CO2 offset estimation: 15kg per borrowed power tool/appliance
      co2Saved += 15;
    }

    return {
      metrics: {
        moneySaved,
        co2Saved,
        itemsBorrowed: completedBorrows.length,
        itemsLent: completedLends.length
      }
    };
  }

  static async getCommunityAnalytics(communityId) {
    const completedBookings = await Booking.find({ communityId, status: 'completed' });
    const totalListings = await Listing.countDocuments({ communityId, status: 'active' });

    let moneySaved = 0;
    let co2Saved = 0;

    for (const b of completedBookings) {
      moneySaved += Math.max(0, (b.depositAmount || 1500) - (b.rentalFeeAmount || 0));
      co2Saved += 15;
    }

    return {
      metrics: {
        moneySaved,
        co2Saved,
        totalCompletedBookings: completedBookings.length,
        activeListingsCount: totalListings
      }
    };
  }
}

module.exports = AnalyticsService;
