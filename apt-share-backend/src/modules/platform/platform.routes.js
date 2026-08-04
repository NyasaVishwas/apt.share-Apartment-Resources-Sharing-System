const express = require('express');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const Community = require('../../models/Community.model');
const AuditLog = require('../../models/AuditLog.model');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');
const asyncHandler = require('../../utils/asyncHandler');

const router = express.Router();

router.use(authenticate, authorize(['super_admin']));

// GET /api/v1/platform/communities?status=pending
router.get(
  '/communities',
  asyncHandler(async (req, res) => {
    const status = req.query.status || 'pending';
    const communities = await Community.find({ status }).populate('requestedByUserId', 'name email');
    res.status(200).json(new ApiResponse(200, communities));
  })
);

// PATCH /api/v1/platform/communities/:id/approve
router.patch(
  '/communities/:id/approve',
  asyncHandler(async (req, res) => {
    const community = await Community.findById(req.params.id);
    if (!community) {
      throw new ApiError(404, 'Community not found', 'NOT_FOUND');
    }

    community.status = 'active';
    community.approvedByUserId = req.user._id;
    await community.save();

    await AuditLog.create({
      actorUserId: req.user._id,
      actorRole: 'super_admin',
      action: 'community.approved',
      targetEntityType: 'Community',
      targetEntityId: community._id,
      metadata: { name: community.name, slug: community.slug }
    });

    res.status(200).json(new ApiResponse(200, community, 'Community approved successfully'));
  })
);

// GET /api/v1/platform/audit-log
router.get(
  '/audit-log',
  asyncHandler(async (req, res) => {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100).populate('actorUserId', 'name email role');
    res.status(200).json(new ApiResponse(200, logs));
  })
);

module.exports = router;
