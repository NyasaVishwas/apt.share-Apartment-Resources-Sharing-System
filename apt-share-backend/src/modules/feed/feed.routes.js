const express = require('express');
const authenticate = require('../../middlewares/authenticate');
const FeedService = require('./feed.service');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');
const asyncHandler = require('../../utils/asyncHandler');

const router = express.Router();

router.use(authenticate);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const communityId = req.headers['x-community-id'];
    if (!communityId) {
      throw new ApiError(400, 'X-Community-Id header is required', 'COMMUNITY_REQUIRED');
    }

    const feed = await FeedService.getCommunityFeed(communityId, req.user._id);
    res.status(200).json(new ApiResponse(200, feed));
  })
);

module.exports = router;
