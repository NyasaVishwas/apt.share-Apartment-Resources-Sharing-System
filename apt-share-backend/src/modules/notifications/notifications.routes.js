const express = require('express');
const authenticate = require('../../middlewares/authenticate');
const NotificationsService = require('./notifications.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

const router = express.Router();

router.use(authenticate);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const notifs = await NotificationsService.getUserNotifications(req.user._id, req.query.read);
    res.status(200).json(new ApiResponse(200, notifs));
  })
);

router.get(
  '/unread-count',
  asyncHandler(async (req, res) => {
    const result = await NotificationsService.getUnreadCount(req.user._id);
    res.status(200).json(new ApiResponse(200, result));
  })
);

router.patch(
  '/:id/read',
  asyncHandler(async (req, res) => {
    const notif = await NotificationsService.markAsRead(req.params.id, req.user._id);
    res.status(200).json(new ApiResponse(200, notif, 'Notification marked as read'));
  })
);

router.patch(
  '/read-all',
  asyncHandler(async (req, res) => {
    await NotificationsService.markAllAsRead(req.user._id);
    res.status(200).json(new ApiResponse(200, null, 'All notifications marked as read'));
  })
);

module.exports = router;
