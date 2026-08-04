const ChatThread = require('../../models/ChatThread.model');
const ChatMessage = require('../../models/ChatMessage.model');
const ApiError = require('../../utils/ApiError');
const NotificationsService = require('../notifications/notifications.service');
const { getIO } = require('../../config/socket');

class ChatService {
  static async getOrCreateThread(userId, communityId, listingId = null, bookingId = null) {
    let filter = {
      communityId,
      participantIds: userId
    };

    if (bookingId) {
      filter.bookingId = bookingId;
    } else if (listingId) {
      filter.listingId = listingId;
    }

    let thread = await ChatThread.findOne(filter).populate('participantIds', 'name avatarUrl trustScore');

    if (!thread) {
      // Create new thread
      let targetUserId;
      if (bookingId) {
        const Booking = require('../../models/Booking.model');
        const booking = await Booking.findById(bookingId);
        targetUserId = booking.ownerId.toString() === userId.toString() ? booking.borrowerId : booking.ownerId;
      } else if (listingId) {
        const Listing = require('../../models/Listing.model');
        const listing = await Listing.findById(listingId);
        targetUserId = listing.ownerId;
      }

      thread = await ChatThread.create({
        communityId,
        bookingId: bookingId || null,
        listingId: listingId || null,
        participantIds: [userId, targetUserId],
        lastMessageAt: new Date(),
        lastMessagePreview: 'Inquiry thread started.'
      });

      thread = await thread.populate('participantIds', 'name avatarUrl trustScore');
    }

    return thread;
  }

  static async getUserThreads(userId) {
    return await ChatThread.find({ participantIds: userId })
      .sort({ lastMessageAt: -1 })
      .populate('participantIds', 'name avatarUrl trustScore')
      .populate('listingId', 'title images');
  }

  static async getThreadMessages(threadId, userId) {
    const thread = await ChatThread.findById(threadId);
    if (!thread || !thread.participantIds.includes(userId)) {
      throw new ApiError(403, 'Forbidden', 'FORBIDDEN');
    }

    return await ChatMessage.find({ threadId }).sort({ createdAt: 1 }).populate('senderId', 'name avatarUrl');
  }

  static async sendMessage(threadId, senderId, body, imageUrl = '') {
    const thread = await ChatThread.findById(threadId);
    if (!thread || !thread.participantIds.includes(senderId)) {
      throw new ApiError(403, 'Forbidden', 'FORBIDDEN');
    }

    const message = await ChatMessage.create({
      threadId,
      senderId,
      body,
      imageUrl: imageUrl || '',
      readBy: [senderId]
    });

    thread.lastMessageAt = new Date();
    thread.lastMessagePreview = body;
    await thread.save();

    const populatedMsg = await message.populate('senderId', 'name avatarUrl');

    // Socket.IO real-time dispatch to thread room
    const io = getIO();
    if (io) {
      io.to(`thread:${threadId}`).emit('message:new', populatedMsg);
    }

    // Send in-app notification to the recipient
    const recipientId = thread.participantIds.find((id) => id.toString() !== senderId.toString());
    if (recipientId) {
      await NotificationsService.createNotification({
        userId: recipientId,
        communityId: thread.communityId,
        type: 'chat_message',
        title: `New Message`,
        body: `${body.slice(0, 50)}...`,
        relatedEntityType: 'ChatThread',
        relatedEntityId: thread._id
      });
    }

    return populatedMsg;
  }
}

module.exports = ChatService;
