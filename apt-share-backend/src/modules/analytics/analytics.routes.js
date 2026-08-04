const express = require('express');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const AnalyticsService = require('./analytics.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

const router = express.Router();

router.use(authenticate);

router.get(
  '/me',
  asyncHandler(async (req, res) => {
    const data = await AnalyticsService.getUserAnalytics(req.user._id);
    res.status(200).json(new ApiResponse(200, data));
  })
);

router.get(
  '/community/:communityId',
  authorize(['community_admin', 'super_admin']),
  asyncHandler(async (req, res) => {
    const data = await AnalyticsService.getCommunityAnalytics(req.params.communityId);
    res.status(200).json(new ApiResponse(200, data));
  })
);

module.exports = router;
