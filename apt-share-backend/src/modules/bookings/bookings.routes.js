const express = require('express');
const BookingsController = require('./bookings.controller');
const authenticate = require('../../middlewares/authenticate');
const validateRequest = require('../../middlewares/validateRequest');
const {
  createBookingSchema,
  declineBookingSchema,
  cancelBookingSchema,
  qrScanSchema
} = require('./bookings.validation');

const router = express.Router();

router.use(authenticate);

router.post('/', validateRequest(createBookingSchema), BookingsController.createBooking);
router.get('/', BookingsController.getBookings);
router.get('/:bookingId', BookingsController.getBookingById);
router.patch('/:bookingId/approve', BookingsController.approveBooking);
router.patch('/:bookingId/decline', validateRequest(declineBookingSchema), BookingsController.declineBooking);
router.patch('/:bookingId/cancel', validateRequest(cancelBookingSchema), BookingsController.cancelBooking);

// QR Token Fetch & Handoff Scan Endpoints
router.get('/:bookingId/qr/pickup', BookingsController.getPickupQr);
router.get('/:bookingId/qr/return', BookingsController.getReturnQr);
router.post('/:bookingId/pickup-scan', validateRequest(qrScanSchema), BookingsController.pickupScan);
router.post('/:bookingId/return-scan', validateRequest(qrScanSchema), BookingsController.returnScan);

module.exports = router;
