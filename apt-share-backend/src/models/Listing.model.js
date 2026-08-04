const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community',
      required: true
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Description is required']
    },
    category: {
      type: String,
      enum: [
        'tools_diy',
        'cleaning_equipment',
        'electronics_camera',
        'outdoor_camping',
        'party_events',
        'kitchen_appliances',
        'baby_kids',
        'sports_fitness',
        'furniture',
        'other'
      ],
      required: true
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, default: '' },
        order: { type: Number, default: 0 }
      }
    ],
    brand: { type: String, default: '' },
    condition: {
      type: String,
      enum: ['new', 'like_new', 'good', 'fair', 'worn'],
      default: 'good'
    },
    purchaseYear: { type: Number },
    securityDeposit: {
      type: Number,
      required: true,
      default: 0
    },
    rentalFeePerDay: {
      type: Number,
      default: 0
    },
    maxBorrowDurationDays: {
      type: Number,
      default: 7
    },
    pickupInstructions: { type: String, default: '' },
    usageInstructions: { type: String, default: '' },
    accessoriesIncluded: [{ type: String }],
    tags: [{ type: String }],
    blackoutDates: [
      {
        start: { type: Date },
        end: { type: Date },
        reason: { type: String, default: '' }
      }
    ],
    status: {
      type: String,
      enum: ['draft', 'active', 'paused', 'under_maintenance', 'removed'],
      default: 'active'
    },
    viewCount: { type: Number, default: 0 },
    bookingCount: { type: Number, default: 0 },
    averageRating: { type: Number, default: 5.0 },
    ratingCount: { type: Number, default: 0 }
  },
  {
    timestamps: true
  }
);

listingSchema.index({ communityId: 1, status: 1, createdAt: -1 });
listingSchema.index({ communityId: 1, category: 1 });
listingSchema.index({ title: 'text', description: 'text', tags: 'text', brand: 'text' });

const Listing = mongoose.model('Listing', listingSchema);

module.exports = Listing;
