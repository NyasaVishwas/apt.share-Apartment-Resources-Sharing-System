const Booking = require('../../models/Booking.model');
const Listing = require('../../models/Listing.model');
const ApiError = require('../../utils/ApiError');
const doIntervalsOverlap = require('../../utils/intervalOverlap');
const { generateQrToken, verifyQrToken } = require('../../utils/qrTokenUtils');

class BookingsService {
  static async createBooking(borrowerId, communityId, bookingData) {
    const { listingId, startDate, endDate, requestMessage } = bookingData;

    const listing = await Listing.findById(listingId);
    if (!listing || listing.status !== 'active') {
      throw new ApiError(404, 'Listing not available for booking', 'NOT_AVAILABLE');
    }

    if (listing.ownerId.toString() === borrowerId.toString()) {
      throw new ApiError(400, 'You cannot borrow your own item', 'INVALID_BORROWER');
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      throw new ApiError(400, 'End date must be after start date', 'INVALID_DATES');
    }

    const durationDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
    if (durationDays > listing.maxBorrowDurationDays) {
      throw new ApiError(
        400,
        `Booking duration (${durationDays} days) exceeds maximum allowed (${listing.maxBorrowDurationDays} days)`,
        'MAX_DURATION_EXCEEDED'
      );
    }

    // DSA Interval Overlap Check against existing pending, confirmed, active bookings
    const existingBookings = await Booking.find({
      listingId,
      status: { $in: ['pending', 'confirmed', 'active'] }
    });

    for (const existing of existingBookings) {
      if (doIntervalsOverlap(start, end, existing.startDate, existing.endDate)) {
        throw new ApiError(
          400,
          'These dates overlap with an existing booking request or confirmation for this item',
          'BOOKING_OVERLAP'
        );
      }
    }

    const rentalFeeAmount = listing.rentalFeePerDay * durationDays;

    const booking = await Booking.create({
      listingId,
      communityId,
      borrowerId,
      ownerId: listing.ownerId,
      startDate: start,
      endDate: end,
      requestMessage: requestMessage || '',
      depositAmount: listing.securityDeposit,
      rentalFeeAmount,
      depositStatus: listing.securityDeposit > 0 ? 'held' : 'not_applicable',
      status: 'pending',
      autoDeclineAt: new Date(Date.now() + 48 * 3600 * 1000) // 48h auto decline
    });

    return await booking.populate([
      { path: 'listingId', select: 'title images category rentalFeePerDay securityDeposit' },
      { path: 'borrowerId', select: 'name email avatarUrl trustScore' },
      { path: 'ownerId', select: 'name email avatarUrl trustScore' }
    ]);
  }

  static async getBookings(userId, communityId, role = 'borrower', statusFilter = null) {
    const filter = { communityId };
    if (role === 'owner') {
      filter.ownerId = userId;
    } else {
      filter.borrowerId = userId;
    }

    if (statusFilter && statusFilter !== 'all') {
      filter.status = statusFilter;
    }

    return await Booking.find(filter)
      .sort({ createdAt: -1 })
      .populate([
        { path: 'listingId', select: 'title images category brand rentalFeePerDay securityDeposit' },
        { path: 'borrowerId', select: 'name avatarUrl trustScore' },
        { path: 'ownerId', select: 'name avatarUrl trustScore' }
      ]);
  }

  static async getBookingById(bookingId, userId) {
    const booking = await Booking.findById(bookingId).populate([
      { path: 'listingId' },
      { path: 'borrowerId', select: 'name email avatarUrl trustScore trustBadges unit block' },
      { path: 'ownerId', select: 'name email avatarUrl trustScore trustBadges unit block' }
    ]);

    if (!booking) {
      throw new ApiError(404, 'Booking not found', 'NOT_FOUND');
    }

    const isBorrower = booking.borrowerId._id.toString() === userId.toString();
    const isOwner = booking.ownerId._id.toString() === userId.toString();

    if (!isBorrower && !isOwner) {
      throw new ApiError(403, 'Forbidden', 'FORBIDDEN');
    }

    return booking;
  }

  static async approveBooking(bookingId, ownerId) {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new ApiError(404, 'Booking not found', 'NOT_FOUND');
    }

    if (booking.ownerId.toString() !== ownerId.toString()) {
      throw new ApiError(403, 'Only the item owner can approve bookings', 'FORBIDDEN');
    }

    if (booking.status !== 'pending') {
      throw new ApiError(400, `Cannot approve booking with status '${booking.status}'`, 'INVALID_STATUS');
    }

    // Generate Pickup QR token
    const qrData = generateQrToken(booking._id, 'pickup');

    booking.status = 'confirmed';
    booking.pickupQrToken = {
      rawToken: qrData.rawToken,
      tokenHash: qrData.tokenHash,
      expiresAt: qrData.expiresAt,
      used: false
    };

    await booking.save();
    return await this.getBookingById(booking._id, ownerId);
  }

  static async declineBooking(bookingId, ownerId, declineReason) {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new ApiError(404, 'Booking not found', 'NOT_FOUND');
    }

    if (booking.ownerId.toString() !== ownerId.toString()) {
      throw new ApiError(403, 'Only owner can decline', 'FORBIDDEN');
    }

    booking.status = 'declined';
    booking.declineReason = declineReason || 'Declined by owner.';
    booking.depositStatus = 'released';
    await booking.save();
    return booking;
  }

  static async cancelBooking(bookingId, userId, cancellationReason) {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new ApiError(404, 'Booking not found', 'NOT_FOUND');
    }

    const isParticipant =
      booking.borrowerId.toString() === userId.toString() ||
      booking.ownerId.toString() === userId.toString();

    if (!isParticipant) {
      throw new ApiError(403, 'Forbidden', 'FORBIDDEN');
    }

    if (['completed', 'active'].includes(booking.status)) {
      throw new ApiError(400, 'Cannot cancel an active or completed booking', 'INVALID_STATUS');
    }

    booking.status = 'cancelled';
    booking.cancellationReason = cancellationReason || 'Cancelled by user.';
    booking.cancelledByUserId = userId;
    booking.depositStatus = 'released';
    await booking.save();
    return booking;
  }

  static async getQrToken(bookingId, userId, tokenType = 'pickup') {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new ApiError(404, 'Booking not found', 'NOT_FOUND');
    }

    if (booking.borrowerId.toString() !== userId.toString() && booking.ownerId.toString() !== userId.toString()) {
      throw new ApiError(403, 'Forbidden', 'FORBIDDEN');
    }

    let tokenDoc = tokenType === 'pickup' ? booking.pickupQrToken : booking.returnQrToken;

    if (!tokenDoc || !tokenDoc.rawToken || new Date() > new Date(tokenDoc.expiresAt)) {
      // Regenerate fresh token
      const qrData = generateQrToken(booking._id, tokenType);
      tokenDoc = {
        rawToken: qrData.rawToken,
        tokenHash: qrData.tokenHash,
        expiresAt: qrData.expiresAt,
        used: false
      };
      if (tokenType === 'pickup') {
        booking.pickupQrToken = tokenDoc;
      } else {
        booking.returnQrToken = tokenDoc;
      }
      await booking.save();
    }

    return {
      rawToken: tokenDoc.rawToken,
      expiresAt: tokenDoc.expiresAt,
      type: tokenType,
      bookingId: booking._id
    };
  }

  static async pickupScan(bookingId, userId, rawToken) {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new ApiError(404, 'Booking not found', 'NOT_FOUND');
    }

    if (booking.ownerId.toString() !== userId.toString()) {
      throw new ApiError(403, 'Only the item owner can scan the pickup QR code', 'FORBIDDEN');
    }

    if (booking.status !== 'confirmed') {
      throw new ApiError(400, `Cannot perform pickup on booking with status '${booking.status}'`, 'INVALID_STATUS');
    }

    const { valid, reason } = verifyQrToken(
      rawToken,
      booking.pickupQrToken.tokenHash,
      booking.pickupQrToken.expiresAt
    );

    if (!valid) {
      throw new ApiError(400, `QR Code Verification Failed: ${reason}`, reason);
    }

    // Generate Return QR token payload
    const returnQrData = generateQrToken(booking._id, 'return');

    booking.status = 'active';
    booking.pickupConfirmedAt = new Date();
    booking.pickupQrToken.used = true;
    booking.returnQrToken = {
      rawToken: returnQrData.rawToken,
      tokenHash: returnQrData.tokenHash,
      expiresAt: returnQrData.expiresAt,
      used: false
    };

    await booking.save();
    return await this.getBookingById(booking._id, userId);
  }

  static async returnScan(bookingId, userId, rawToken) {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new ApiError(404, 'Booking not found', 'NOT_FOUND');
    }

    if (booking.ownerId.toString() !== userId.toString()) {
      throw new ApiError(403, 'Only the item owner can scan the return QR code', 'FORBIDDEN');
    }

    if (booking.status !== 'active') {
      throw new ApiError(400, `Cannot perform return scan on booking with status '${booking.status}'`, 'INVALID_STATUS');
    }

    const { valid, reason } = verifyQrToken(
      rawToken,
      booking.returnQrToken.tokenHash,
      booking.returnQrToken.expiresAt
    );

    if (!valid) {
      throw new ApiError(400, `QR Code Verification Failed: ${reason}`, reason);
    }

    booking.status = 'completed';
    booking.returnConfirmedAt = new Date();
    booking.returnQrToken.used = true;
    booking.depositStatus = 'released';

    // Increment completed booking counter on listing
    Listing.findByIdAndUpdate(booking.listingId, { $inc: { bookingCount: 1 } }).exec();

    await booking.save();
    return await this.getBookingById(booking._id, userId);
  }
}

module.exports = BookingsService;
