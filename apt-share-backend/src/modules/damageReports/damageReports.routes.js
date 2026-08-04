const express = require('express');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const DamageReportsService = require('./damageReports.service');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');
const asyncHandler = require('../../utils/asyncHandler');

const router = express.Router();

router.use(authenticate);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const report = await DamageReportsService.createReport(req.user._id, req.body);
    res.status(201).json(new ApiResponse(201, report, 'Damage report filed successfully. Escalated to community admin.'));
  })
);

router.get(
  '/community/:communityId',
  authorize(['community_admin', 'super_admin']),
  asyncHandler(async (req, res) => {
    const reports = await DamageReportsService.getCommunityReports(req.params.communityId);
    res.status(200).json(new ApiResponse(200, reports));
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const report = await DamageReportsService.getReportById(req.params.id);
    res.status(200).json(new ApiResponse(200, report));
  })
);

router.patch(
  '/:id/resolve',
  authorize(['community_admin', 'super_admin']),
  asyncHandler(async (req, res) => {
    const report = await DamageReportsService.resolveReport(req.params.id, req.user, req.body);
    res.status(200).json(new ApiResponse(200, report, 'Damage report dispute resolved successfully.'));
  })
);

module.exports = router;
