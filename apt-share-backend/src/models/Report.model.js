const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community',
      required: true
    },
    requestedByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: ['inventory', 'bookings', 'transactions', 'community_stats'],
      required: true
    },
    dateRangeStart: { type: Date },
    dateRangeEnd: { type: Date },
    status: {
      type: String,
      enum: ['queued', 'processing', 'ready', 'failed'],
      default: 'ready'
    },
    fileUrl: { type: String, default: '' }
  },
  {
    timestamps: true
  }
);

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
