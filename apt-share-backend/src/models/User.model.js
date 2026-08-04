const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required']
    },
    phone: {
      type: String,
      default: ''
    },
    phoneVerified: {
      type: Boolean,
      default: false
    },
    emailVerified: {
      type: Boolean,
      default: false
    },
    avatarUrl: {
      type: String,
      default: ''
    },
    avatarPublicId: {
      type: String,
      default: ''
    },
    role: {
      type: String,
      enum: ['resident', 'community_admin', 'super_admin'],
      default: 'resident'
    },
    profileComplete: {
      type: Boolean,
      default: false
    },
    bio: {
      type: String,
      default: ''
    },
    trustScore: {
      type: Number,
      default: 80,
      min: 0,
      max: 100
    },
    trustBadges: {
      type: [String],
      default: ['new_member']
    },
    notificationPreferences: {
      emailBookingUpdates: { type: Boolean, default: true },
      emailWishlistAlerts: { type: Boolean, default: true },
      emailReturnReminders: { type: Boolean, default: true },
      emailMarketing: { type: Boolean, default: false }
    },
    refreshTokens: [
      {
        tokenHash: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        expiresAt: { type: Date, required: true },
        userAgent: { type: String, default: '' }
      }
    ],
    otp: {
      codeHash: { type: String },
      purpose: { type: String, enum: ['email_verification', 'password_reset'] },
      expiresAt: { type: Date },
      attempts: { type: Number, default: 0 }
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'deleted'],
      default: 'active'
    },
    failedLoginAttempts: {
      type: Number,
      default: 0
    },
    lockoutUntil: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

userSchema.index({ status: 1 });

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.passwordHash;
  delete user.refreshTokens;
  delete user.otp;
  return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
