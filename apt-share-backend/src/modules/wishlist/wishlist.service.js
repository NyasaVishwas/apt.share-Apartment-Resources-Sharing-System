const Wishlist = require('../../models/Wishlist.model');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');
const asyncHandler = require('../../utils/asyncHandler');

class WishlistService {
  static async getWishlist(userId, communityId) {
    return await Wishlist.find({ userId, communityId }).populate({
      path: 'listingId',
      populate: { path: 'ownerId', select: 'name avatarUrl trustScore' }
    });
  }

  static async toggleWishlist(userId, communityId, listingId, category) {
    const existing = await Wishlist.findOne({
      userId,
      communityId,
      ...(listingId ? { listingId } : { category })
    });

    if (existing) {
      await Wishlist.findByIdAndDelete(existing._id);
      return { added: false, wishlistId: null };
    }

    const item = await Wishlist.create({
      userId,
      communityId,
      listingId: listingId || null,
      category: category || null
    });

    return { added: true, wishlistId: item._id };
  }

  static async removeFromWishlist(wishlistId, userId) {
    const item = await Wishlist.findOneAndDelete({ _id: wishlistId, userId });
    if (!item) {
      throw new ApiError(404, 'Wishlist item not found', 'NOT_FOUND');
    }
    return true;
  }
}

module.exports = WishlistService;
