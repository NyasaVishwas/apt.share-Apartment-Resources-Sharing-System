const BookingsService = require('./bookings.service');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');
const asyncHandler = require('../../utils/asyncHandler');

class BookingsController {
  static createBooking = asyncHandler(async (req, res) => {
    const communityId = req.headers['x-community-id'];
    if (!communityId) {
      throw new ApiError(400, 'X-Community-Id header is required', 'COMMUNITY_REQUIRED');
    }

    const booking = await BookingsService.createBooking(req.user._id, communityId, req.body);
    res.status(201).json(new ApiResponse(201, booking, 'Booking request submitted successfully'));
  });

  static getBookings = asyncHandler(async (req, res) => {
    const communityId = req.headers['x-community-id'];
    const { role = 'borrower', status } = req.query;

    const bookings = await BookingsService.getBookings(req.user._id, communityId, role, status);
    res.status(200).json(new ApiResponse(200, bookings));
  });

  static getBookingById = asyncHandler(async (req, res) => {
    const booking = await BookingsService.getBookingById(req.params.bookingId, req.user._id);
    res.status(200).json(new ApiResponse(200, booking));
  });

  static approveBooking = asyncHandler(async (req, res) => {
    const booking = await BookingsService.approveBooking(req.params.bookingId, req.user._id);
    res.status(200).json(new ApiResponse(200, booking, 'Booking approved successfully'));
  });

  static declineBooking = asyncHandler(async (req, res) => {
    const { declineReason } = req.body;
    const booking = await BookingsService.declineBooking(req.params.bookingId, req.user._id, declineReason);
    res.status(200).json(new ApiResponse(200, booking, 'Booking request declined'));
  });

  static cancelBooking = asyncHandler(async (req, res) => {
    const { cancellationReason } = req.body;
    const booking = await BookingsService.cancelBooking(req.params.bookingId, req.user._id, cancellationReason);
    res.status(200).json(new ApiResponse(200, booking, 'Booking cancelled'));
  });

  static getPickupQr = asyncHandler(async (req, res) => {
    const qrData = await BookingsService.getQrToken(req.params.bookingId, req.user._id, 'pickup');
    res.status(200).json(new ApiResponse(200, qrData));
  });

  static getReturnQr = asyncHandler(async (req, res) => {
    const qrData = await BookingsService.getQrToken(req.params.bookingId, req.user._id, 'return');
    res.status(200).json(new ApiResponse(200, qrData));
  });

  static pickupScan = asyncHandler(async (req, res) => {
    const { rawToken } = req.body;
    const booking = await BookingsService.pickupScan(req.params.bookingId, req.user._id, rawToken);
    res.status(200).json(new ApiResponse(200, booking, 'Pickup confirmed! Booking is now active.'));
  });

  static returnScan = asyncHandler(async (req, res) => {
    const { rawToken } = req.body;
    const booking = await BookingsService.returnScan(req.params.bookingId, req.user._id, rawToken);
    res.status(200).json(new ApiResponse(200, booking, 'Return confirmed! Deposit hold released.'));
  });
}

module.exports = BookingsController;
