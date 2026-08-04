const { z } = require('zod');

const createBookingSchema = {
  body: z.object({
    listingId: z.string().min(1, 'Listing ID is required'),
    startDate: z.string().datetime({ message: 'Invalid start date format' }),
    endDate: z.string().datetime({ message: 'Invalid end date format' }),
    requestMessage: z.string().optional()
  })
};

const declineBookingSchema = {
  body: z.object({
    declineReason: z.string().optional()
  })
};

const cancelBookingSchema = {
  body: z.object({
    cancellationReason: z.string().optional()
  })
};

const qrScanSchema = {
  body: z.object({
    rawToken: z.string().min(1, 'Raw QR token is required')
  })
};

module.exports = {
  createBookingSchema,
  declineBookingSchema,
  cancelBookingSchema,
  qrScanSchema
};
