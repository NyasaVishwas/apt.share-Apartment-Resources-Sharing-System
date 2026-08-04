const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Community name is required'],
      trim: true
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['apartment', 'gated_society', 'hostel', 'office_campus', 'coworking'],
      required: true
    },
    address: {
      line1: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      country: { type: String, default: 'India' },
      location: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point'
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          default: [77.5946, 12.9716]
        }
      }
    },
    logoUrl: { type: String, default: '' },
    coverImageUrl: { type: String, default: '' },
    joinPolicy: {
      type: String,
      enum: ['admin_approval', 'domain_auto_join', 'invite_code'],
      default: 'admin_approval'
    },
    allowedEmailDomain: { type: String, default: '' },
    inviteCode: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'active', 'suspended', 'rejected'],
      default: 'active'
    },
    requestedByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    memberCount: {
      type: Number,
      default: 0
    },
    activeListingCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

communitySchema.index({ status: 1 });
communitySchema.index({ 'address.location': '2dsphere' });

const Community = mongoose.model('Community', communitySchema);

module.exports = Community;
