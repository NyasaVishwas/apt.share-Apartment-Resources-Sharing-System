const express = require('express');
const authenticate = require('../../middlewares/authenticate');
const Membership = require('../../models/Membership.model');
const Community = require('../../models/Community.model');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');
const asyncHandler = require('../../utils/asyncHandler');

const router = express.Router();

// GET /api/v1/memberships/mine - Current user memberships
router.get(
  '/mine',
  authenticate,
  asyncHandler(async (req, res) => {
    const memberships = await Membership.find({ userId: req.user._id, status: 'active' }).populate('communityId');
    res.status(200).json(new ApiResponse(200, memberships));
  })
);

// POST /api/v1/memberships - Join a community
router.post(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const { communityId, unit, block } = req.body;
    const community = await Community.findById(communityId);
    if (!community) {
      throw new ApiError(404, 'Community not found', 'NOT_FOUND');
    }

    const existing = await Membership.findOne({ userId: req.user._id, communityId });
    if (existing) {
      if (existing.status === 'active') {
        throw new ApiError(400, 'You are already a member of this community', 'ALREADY_MEMBER');
      }
      existing.status = 'active'; // Auto-activate for MVP demo
      existing.unit = unit || existing.unit;
      existing.block = block || existing.block;
      await existing.save();
      return res.status(200).json(new ApiResponse(200, existing, 'Rejoined community successfully'));
    }

    // Set other memberships isActiveContext to false
    await Membership.updateMany({ userId: req.user._id }, { isActiveContext: false });

    const membership = await Membership.create({
      userId: req.user._id,
      communityId,
      role: 'resident',
      status: 'active', // Auto-active for MVP demo
      unit: unit || 'Unit 101',
      block: block || 'A',
      isActiveContext: true
    });

    community.memberCount += 1;
    await community.save();

    res.status(201).json(new ApiResponse(201, membership, 'Joined community successfully'));
  })
);

// PATCH /api/v1/memberships/:membershipId/set-active
router.patch(
  '/:membershipId/set-active',
  authenticate,
  asyncHandler(async (req, res) => {
    const membership = await Membership.findOne({ _id: req.params.membershipId, userId: req.user._id });
    if (!membership) {
      throw new ApiError(404, 'Membership not found', 'NOT_FOUND');
    }

    await Membership.updateMany({ userId: req.user._id }, { isActiveContext: false });
    membership.isActiveContext = true;
    await membership.save();

    res.status(200).json(new ApiResponse(200, membership, 'Active community updated'));
  })
);

module.exports = router;
