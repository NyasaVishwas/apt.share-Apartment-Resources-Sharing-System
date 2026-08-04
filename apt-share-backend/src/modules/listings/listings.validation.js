const { z } = require('zod');

const createListingSchema = {
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    category: z.enum([
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
    ]),
    images: z.array(
      z.object({
        url: z.string().url('Invalid image URL'),
        publicId: z.string().optional(),
        order: z.number().optional()
      })
    ).min(1, 'At least one image is required'),
    brand: z.string().optional(),
    condition: z.enum(['new', 'like_new', 'good', 'fair', 'worn']).optional(),
    purchaseYear: z.number().optional(),
    securityDeposit: z.number().min(0, 'Security deposit cannot be negative'),
    rentalFeePerDay: z.number().min(0, 'Rental fee cannot be negative').default(0),
    maxBorrowDurationDays: z.number().min(1).default(7),
    pickupInstructions: z.string().optional(),
    usageInstructions: z.string().optional(),
    accessoriesIncluded: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional()
  })
};

const updateListingSchema = {
  body: createListingSchema.body.partial()
};

module.exports = {
  createListingSchema,
  updateListingSchema
};
