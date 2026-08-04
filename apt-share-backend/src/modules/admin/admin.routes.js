const express = require('express');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const Announcement = require('../../models/Announcement.model');
const Membership = require('../../models/Membership.model');
const Listing = require('../../models/Listing.model');
const Booking = require('../../models/Booking.model');
const ReportGenerator = require('../../utils/reportGenerator');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');
const asyncHandler = require('../../utils/asyncHandler');

const router = express.Router();

router.use(authenticate, authorize(['community_admin', 'super_admin']));

// GET /api/v1/admin/overview
router.get(
  '/overview',
  asyncHandler(async (req, res) => {
    const communityId = req.headers['x-community-id'];
    const memberCount = await Membership.countDocuments({ communityId, status: 'active' });
    const pendingMembersCount = await Membership.countDocuments({ communityId, status: 'pending' });
    const listingCount = await Listing.countDocuments({ communityId, status: 'active' });
    const activeBookingCount = await Booking.countDocuments({ communityId, status: { $in: ['confirmed', 'active'] } });

    res.status(200).json(
      new ApiResponse(200, {
        memberCount,
        pendingMembersCount,
        listingCount,
        activeBookingCount
      })
    );
  })
);

// GET /api/v1/admin/members
router.get(
  '/members',
  asyncHandler(async (req, res) => {
    const communityId = req.headers['x-community-id'];
    const members = await Membership.find({ communityId }).populate('userId', 'name email avatarUrl trustScore phone');
    res.status(200).json(new ApiResponse(200, members));
  })
);

// POST /api/v1/admin/announcements
router.post(
  '/announcements',
  asyncHandler(async (req, res) => {
    const communityId = req.headers['x-community-id'];
    const { title, body, pinned } = req.body;
    const announcement = await Announcement.create({
      communityId,
      authorUserId: req.user._id,
      title,
      body,
      pinned: pinned || false
    });
    res.status(201).json(new ApiResponse(201, announcement, 'Announcement published'));
  })
);

// GET /api/v1/admin/reports/inventory (CSV Download)
router.get(
  '/reports/inventory',
  asyncHandler(async (req, res) => {
    const communityId = req.headers['x-community-id'];
    const listings = await Listing.find({ communityId });
    const csvContent = ReportGenerator.generateInventoryCSV(listings);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=community-inventory-report.csv');
    res.status(200).send(csvContent);
  })
);

// GET /api/v1/admin/reports/bookings (CSV Download)
router.get(
  '/reports/bookings',
  asyncHandler(async (req, res) => {
    const communityId = req.headers['x-community-id'];
    const bookings = await Booking.find({ communityId }).populate('listingId', 'title').populate('borrowerId', 'email');
    const csvContent = ReportGenerator.generateBookingsCSV(bookings);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=community-bookings-report.csv');
    res.status(200).send(csvContent);
  })
);

module.exports = router;
