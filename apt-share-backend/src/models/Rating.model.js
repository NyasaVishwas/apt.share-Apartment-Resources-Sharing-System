const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true
    },
    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community',
      required: true
    },
    raterUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rateeUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing'
    },
    direction: {
      type: String,
      enum: ['borrower_to_owner', 'owner_to_borrower', 'borrower_to_item'],
      required: true
    },
    scores: {
      communication: { type: Number, min: 1, max: 5 },
      condition: { type: Number, min: 1, max: 5 },
      overall: { type: Number, required: true, min: 1, max: 5 }
    },
    comment: { type: String, default: '' }
  },
  {
    timestamps: true
  }
);

ratingSchema.index({ bookingId: 1, direction: 1 }, { unique: true });
ratingSchema.index({ rateeUserId: 1 });
ratingSchema.index({ listingId: 1 });

const Rating = mongoose.model('Rating', ratingSchema);

module.exports = Rating;
