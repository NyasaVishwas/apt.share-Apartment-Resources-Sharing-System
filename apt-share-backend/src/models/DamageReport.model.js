const mongoose = require('mongoose');

const damageReportSchema = new mongoose.Schema(
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
    reportedByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    againstUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    description: {
      type: String,
      required: [true, 'Damage description is required']
    },
    photos: [
      {
        url: { type: String, required: true },
        publicId: { type: String, default: '' }
      }
    ],
    status: {
      type: String,
      enum: ['open', 'under_review', 'resolved_deducted', 'resolved_dismissed'],
      default: 'open'
    },
    resolutionAmount: {
      type: Number,
      default: 0
    },
    resolvedByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolutionNote: {
      type: String,
      default: ''
    },
    resolvedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

damageReportSchema.index({ communityId: 1, status: 1 });
damageReportSchema.index({ bookingId: 1 });

const DamageReport = mongoose.model('DamageReport', damageReportSchema);

module.exports = DamageReport;
