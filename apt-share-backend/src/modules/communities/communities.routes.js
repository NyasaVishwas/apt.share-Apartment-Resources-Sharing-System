const express = require('express');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const Community = require('../../models/Community.model');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');
const asyncHandler = require('../../utils/asyncHandler');

const router = express.Router();

// GET /api/v1/communities/search?q=
router.get(
  '/search',
  authenticate,
  asyncHandler(async (req, res) => {
    const q = req.query.q || '';
    const query = { status: 'active' };
    if (q) {
      query.name = { $regex: q, $options: 'i' };
    }
    const communities = await Community.find(query).limit(20);
    res.status(200).json(new ApiResponse(200, communities));
  })
);

// POST /api/v1/communities/request (Request creation of new community)
router.post(
  '/request',
  authenticate,
  asyncHandler(async (req, res) => {
    const { name, type, address, joinPolicy } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const existing = await Community.findOne({ slug });
    if (existing) {
      throw new ApiError(400, 'A community with a similar name already exists', 'DUPLICATE_COMMUNITY');
    }

    const community = await Community.create({
      name,
      slug,
      type: type || 'apartment',
      address: address || { line1: 'Main St', city: 'Metropolis', state: 'State', pincode: '560001' },
      joinPolicy: joinPolicy || 'admin_approval',
      status: 'active', // Auto-active for MVP demo
      requestedByUserId: req.user._id,
      memberCount: 1
    });

    res.status(201).json(new ApiResponse(201, community, 'Community created successfully'));
  })
);

// GET /api/v1/communities/:communityId
router.get(
  '/:communityId',
  authenticate,
  asyncHandler(async (req, res) => {
    const community = await Community.findById(req.params.communityId);
    if (!community) {
      throw new ApiError(404, 'Community not found', 'NOT_FOUND');
    }
    res.status(200).json(new ApiResponse(200, community));
  })
);

module.exports = router;
