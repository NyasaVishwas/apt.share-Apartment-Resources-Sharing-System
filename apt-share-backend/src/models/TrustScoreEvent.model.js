const mongoose = require('mongoose');

const trustScoreEventSchema = new mongoose.Schema(
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
    eventType: {
      type: String,
      enum: [
        'successful_return',
        'rating_received',
        'complaint',
        'damage_incident',
        'late_return',
        'completed_transaction'
      ],
      required: true
    },
    scoreDelta: {
      type: Number,
      required: true
    },
    relatedBookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    }
  },
  {
    timestamps: true
  }
);

trustScoreEventSchema.index({ userId: 1, createdAt: -1 });

const TrustScoreEvent = mongoose.model('TrustScoreEvent', trustScoreEventSchema);

module.exports = TrustScoreEvent;
