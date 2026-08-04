const mongoose = require('mongoose');

const analyticsSnapshotSchema = new mongoose.Schema(
  {
    scope: {
      type: String,
      enum: ['community', 'user'],
      default: 'community'
    },
    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community',
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    metrics: {
      moneySaved: { type: Number, default: 0 },
      co2Saved: { type: Number, default: 0 },
      itemsBorrowed: { type: Number, default: 0 },
      itemsLent: { type: Number, default: 0 }
    },
    computedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

analyticsSnapshotSchema.index({ communityId: 1, scope: 1 });

const AnalyticsSnapshot = mongoose.model('AnalyticsSnapshot', analyticsSnapshotSchema);

module.exports = AnalyticsSnapshot;
