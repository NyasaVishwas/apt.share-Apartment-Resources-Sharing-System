const express = require('express');
const authenticate = require('../../middlewares/authenticate');
const WishlistService = require('./wishlist.service');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');
const asyncHandler = require('../../utils/asyncHandler');

const router = express.Router();

router.use(authenticate);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const communityId = req.headers['x-community-id'];
    const items = await WishlistService.getWishlist(req.user._id, communityId);
    res.status(200).json(new ApiResponse(200, items));
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const communityId = req.headers['x-community-id'];
    if (!communityId) {
      throw new ApiError(400, 'X-Community-Id header is required', 'COMMUNITY_REQUIRED');
    }
    const { listingId, category } = req.body;
    const result = await WishlistService.toggleWishlist(req.user._id, communityId, listingId, category);
    res.status(200).json(new ApiResponse(200, result, result.added ? 'Added to wishlist' : 'Removed from wishlist'));
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await WishlistService.removeFromWishlist(req.params.id, req.user._id);
    res.status(200).json(new ApiResponse(200, null, 'Wishlist item removed'));
  })
);

module.exports = router;
