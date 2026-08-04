const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true
    },
    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community',
      required: true
    },
    borrowerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'active', 'completed', 'declined', 'cancelled', 'disputed'],
      default: 'pending'
    },
    requestMessage: {
      type: String,
      default: ''
    },
    declineReason: {
      type: String,
      default: ''
    },
    cancellationReason: {
      type: String,
      default: ''
    },
    cancelledByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    depositAmount: {
      type: Number,
      required: true,
      default: 0
    },
    rentalFeeAmount: {
      type: Number,
      default: 0
    },
    depositStatus: {
      type: String,
      enum: ['not_applicable', 'held', 'released', 'deducted', 'disputed'],
      default: 'not_applicable'
    },
    depositDeductionAmount: {
      type: Number,
      default: 0
    },
    pickupQrToken: {
      rawToken: { type: String },
      tokenHash: { type: String },
      expiresAt: { type: Date },
      used: { type: Boolean, default: false }
    },
    returnQrToken: {
      rawToken: { type: String },
      tokenHash: { type: String },
      expiresAt: { type: Date },
      used: { type: Boolean, default: false }
    },
    pickupConfirmedAt: { type: Date },
    returnConfirmedAt: { type: Date },
    autoDeclineAt: { type: Date }
  },
  {
    timestamps: true
  }
);

bookingSchema.index({ listingId: 1, startDate: 1, endDate: 1 });
bookingSchema.index({ communityId: 1, status: 1 });
bookingSchema.index({ borrowerId: 1, status: 1 });
bookingSchema.index({ ownerId: 1, status: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
