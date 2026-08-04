const Listing = require('../../models/Listing.model');
const Announcement = require('../../models/Announcement.model');
const User = require('../../models/User.model');
const Booking = require('../../models/Booking.model');
const MaxHeap = require('../../utils/heap');
const CategoryAffinityGraph = require('../../utils/graph');

class FeedService {
  static async getCommunityFeed(communityId, userId) {
    // 1. Pinned Announcements
    const announcements = await Announcement.find({ communityId }).sort({ pinned: -1, createdAt: -1 }).limit(5);

    // 2. Recent Active Listings
    const recentListings = await Listing.find({ communityId, status: 'active' })
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('ownerId', 'name avatarUrl trustScore');

    // 3. Top Contributors Leaderboard via Max-Heap (DSA)
    const bookings = await Booking.find({ communityId, status: 'completed' });
    const lenderMap = new Map();

    for (const b of bookings) {
      const id = b.ownerId.toString();
      lenderMap.set(id, (lenderMap.get(id) || 0) + 1);
    }

    const heap = new MaxHeap();
    for (const [lenderId, count] of lenderMap.entries()) {
      heap.insert({ userId: lenderId, count }, count);
    }

    const topContributors = [];
    while (!heap.isEmpty() && topContributors.length < 5) {
      const top = heap.extractMax();
      const user = await User.findById(top.userId).select('name avatarUrl trustScore trustBadges');
      if (user) {
        topContributors.push({ user, completedLends: top.count });
      }
    }

    // 4. Item Recommendations via Graph BFS (DSA)
    const graph = new CategoryAffinityGraph();
    const userLastBooking = await Booking.findOne({ borrowerId: userId }).sort({ createdAt: -1 }).populate('listingId');
    const startCat = userLastBooking?.listingId?.category || 'tools_diy';
    const relatedCategories = graph.getRelatedCategoriesBFS(startCat, 2);

    const recommendations = await Listing.find({
      communityId,
      status: 'active',
      category: { $in: relatedCategories }
    })
      .limit(4)
      .populate('ownerId', 'name avatarUrl trustScore');

    return {
      announcements,
      recentListings,
      topContributors,
      recommendations
    };
  }
}

module.exports = FeedService;
