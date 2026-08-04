const express = require('express');
const authenticate = require('../../middlewares/authenticate');
const ChatService = require('./chat.service');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');
const asyncHandler = require('../../utils/asyncHandler');

const router = express.Router();

router.use(authenticate);

router.get(
  '/threads',
  asyncHandler(async (req, res) => {
    const threads = await ChatService.getUserThreads(req.user._id);
    res.status(200).json(new ApiResponse(200, threads));
  })
);

router.post(
  '/threads',
  asyncHandler(async (req, res) => {
    const communityId = req.headers['x-community-id'];
    if (!communityId) {
      throw new ApiError(400, 'X-Community-Id header is required', 'COMMUNITY_REQUIRED');
    }
    const { listingId, bookingId } = req.body;
    const thread = await ChatService.getOrCreateThread(req.user._id, communityId, listingId, bookingId);
    res.status(200).json(new ApiResponse(200, thread));
  })
);

router.get(
  '/threads/:threadId/messages',
  asyncHandler(async (req, res) => {
    const messages = await ChatService.getThreadMessages(req.params.threadId, req.user._id);
    res.status(200).json(new ApiResponse(200, messages));
  })
);

router.post(
  '/threads/:threadId/messages',
  asyncHandler(async (req, res) => {
    const { body, imageUrl } = req.body;
    const message = await ChatService.sendMessage(req.params.threadId, req.user._id, body, imageUrl);
    res.status(201).json(new ApiResponse(201, message));
  })
);

module.exports = router;
