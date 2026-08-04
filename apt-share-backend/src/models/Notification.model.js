const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community'
    },
    type: {
      type: String,
      enum: [
        'booking_requested',
        'booking_approved',
        'booking_declined',
        'pickup_reminder',
        'return_reminder',
        'late_return',
        'wishlist_available',
        'deposit_released',
        'dispute_filed',
        'dispute_resolved',
        'announcement',
        'rating_received',
        'chat_message'
      ],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    body: {
      type: String,
      required: true
    },
    relatedEntityType: {
      type: String
    },
    relatedEntityId: {
      type: mongoose.Schema.Types.ObjectId
    },
    read: {
      type: Boolean,
      default: false
    },
    emailSent: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
