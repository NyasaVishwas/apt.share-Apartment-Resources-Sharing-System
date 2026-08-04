const Notification = require('../../models/Notification.model');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');
const { getIO } = require('../../config/socket');

class NotificationsService {
  static async createNotification({ userId, communityId, type, title, body, relatedEntityType, relatedEntityId }) {
    const notif = await Notification.create({
      userId,
      communityId,
      type,
      title,
      body,
      relatedEntityType,
      relatedEntityId,
      read: false
    });

    // Emit real-time notification to user's personal socket room if connected
    const io = getIO();
    if (io) {
      io.to(`user:${userId}`).emit('notification:new', notif);
    }

    return notif;
  }

  static async getUserNotifications(userId, readFilter = null) {
    const filter = { userId };
    if (readFilter !== null && readFilter !== undefined) {
      filter.read = readFilter === 'true';
    }

    return await Notification.find(filter).sort({ createdAt: -1 }).limit(50);
  }

  static async getUnreadCount(userId) {
    const count = await Notification.countDocuments({ userId, read: false });
    return { unreadCount: count };
  }

  static async markAsRead(notificationId, userId) {
    const notif = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { read: true },
      { new: true }
    );
    if (!notif) {
      throw new ApiError(404, 'Notification not found', 'NOT_FOUND');
    }
    return notif;
  }

  static async markAllAsRead(userId) {
    await Notification.updateMany({ userId, read: false }, { read: true });
    return true;
  }
}

module.exports = NotificationsService;
