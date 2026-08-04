const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community',
      required: true
    },
    role: {
      type: String,
      enum: ['resident', 'community_admin'],
      default: 'resident'
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'rejected', 'removed'],
      default: 'pending'
    },
    unit: {
      type: String,
      default: ''
    },
    block: {
      type: String,
      default: ''
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    approvedByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    isActiveContext: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

membershipSchema.index({ userId: 1, communityId: 1 }, { unique: true });
membershipSchema.index({ communityId: 1, status: 1 });

const Membership = mongoose.model('Membership', membershipSchema);

module.exports = Membership;
