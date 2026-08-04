const Listing = require('../../models/Listing.model');
const ApiError = require('../../utils/ApiError');

class ListingsService {
  static async getListings(communityId, queryParams) {
    const {
      q,
      category,
      fee, // 'free' | 'paid'
      sort = 'newest',
      page = 1,
      limit = 20
    } = queryParams;

    const filter = { communityId, status: 'active' };

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (fee === 'free') {
      filter.rentalFeePerDay = 0;
    } else if (fee === 'paid') {
      filter.rentalFeePerDay = { $gt: 0 };
    }

    if (q) {
      filter.$text = { $search: q };
    }

    let sortOptions = { createdAt: -1 };
    if (sort === 'popular') {
      sortOptions = { viewCount: -1, createdAt: -1 };
    } else if (sort === 'rating') {
      sortOptions = { averageRating: -1, createdAt: -1 };
    } else if (sort === 'deposit_low') {
      sortOptions = { securityDeposit: 1 };
    } else if (sort === 'deposit_high') {
      sortOptions = { securityDeposit: -1 };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const listings = await Listing.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit))
      .populate('ownerId', 'name avatarUrl trustScore trustBadges');

    const total = await Listing.countDocuments(filter);

    return {
      listings,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    };
  }

  static async createListing(userId, communityId, listingData) {
    const listing = await Listing.create({
      ...listingData,
      ownerId: userId,
      communityId,
      status: 'active'
    });

    return await listing.populate('ownerId', 'name avatarUrl trustScore trustBadges');
  }

  static async getListingById(listingId) {
    const listing = await Listing.findById(listingId).populate(
      'ownerId',
      'name avatarUrl trustScore trustBadges bio createdAt'
    );

    if (!listing) {
      throw new ApiError(404, 'Listing not found', 'NOT_FOUND');
    }

    // Increment view count asynchronously
    Listing.findByIdAndUpdate(listingId, { $inc: { viewCount: 1 } }).exec();

    return listing;
  }

  static async getMyListings(userId, communityId) {
    return await Listing.find({ ownerId: userId, communityId }).sort({ createdAt: -1 });
  }

  static async updateListing(listingId, userId, updateData) {
    const listing = await Listing.findById(listingId);
    if (!listing) {
      throw new ApiError(404, 'Listing not found', 'NOT_FOUND');
    }

    if (listing.ownerId.toString() !== userId.toString()) {
      throw new ApiError(403, 'You can only edit your own listings', 'FORBIDDEN');
    }

    Object.assign(listing, updateData);
    await listing.save();
    return listing;
  }

  static async updateListingStatus(listingId, userId, status) {
    const listing = await Listing.findById(listingId);
    if (!listing) {
      throw new ApiError(404, 'Listing not found', 'NOT_FOUND');
    }

    if (listing.ownerId.toString() !== userId.toString()) {
      throw new ApiError(403, 'You can only modify status for your own listings', 'FORBIDDEN');
    }

    listing.status = status;
    await listing.save();
    return listing;
  }
}

module.exports = ListingsService;
