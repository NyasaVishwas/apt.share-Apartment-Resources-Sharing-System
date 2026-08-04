const express = require('express');
const authenticate = require('../../middlewares/authenticate');
const RatingsService = require('./ratings.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

const router = express.Router();

router.use(authenticate);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const rating = await RatingsService.createRating(req.user._id, req.body);
    res.status(201).json(new ApiResponse(201, rating, 'Rating submitted successfully'));
  })
);

router.get(
  '/user/:userId',
  asyncHandler(async (req, res) => {
    const ratings = await RatingsService.getUserRatings(req.params.userId);
    res.status(200).json(new ApiResponse(200, ratings));
  })
);

router.get(
  '/listing/:listingId',
  asyncHandler(async (req, res) => {
    const ratings = await RatingsService.getListingRatings(req.params.listingId);
    res.status(200).json(new ApiResponse(200, ratings));
  })
);

module.exports = router;
