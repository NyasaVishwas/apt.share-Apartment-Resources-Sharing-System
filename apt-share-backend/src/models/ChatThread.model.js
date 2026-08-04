const mongoose = require('mongoose');

const chatThreadSchema = new mongoose.Schema(
  {
    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community',
      required: true
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null
    },
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      default: null
    },
    participantIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      }
    ],
    lastMessageAt: {
      type: Date,
      default: Date.now
    },
    lastMessagePreview: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

chatThreadSchema.index({ participantIds: 1, lastMessageAt: -1 });

const ChatThread = mongoose.model('ChatThread', chatThreadSchema);

module.exports = ChatThread;
