const Booking = require('../models/Booking.model');
const NotificationsService = require('../modules/notifications/notifications.service');
const logger = require('../config/logger');

const runAutoDeclineSweep = async () => {
  try {
    const expiredBookings = await Booking.find({
      status: 'pending',
      autoDeclineAt: { $lte: new Date() }
    });

    for (const booking of expiredBookings) {
      booking.status = 'declined';
      booking.declineReason = 'Auto-declined due to 48h owner inactivity.';
      booking.depositStatus = 'released';
      await booking.save();

      await NotificationsService.createNotification({
        userId: booking.borrowerId,
        communityId: booking.communityId,
        type: 'booking_declined',
        title: 'Booking Request Expired',
        body: `Your request was auto-declined due to owner inactivity.`,
        relatedEntityType: 'Booking',
        relatedEntityId: booking._id
      });
    }

    if (expiredBookings.length > 0) {
      logger.info(`[SCHEDULER] Auto-declined ${expiredBookings.length} expired booking requests.`);
    }
  } catch (err) {
    logger.error(`[SCHEDULER] Error running auto-decline sweep: ${err.message}`);
  }
};

module.exports = runAutoDeclineSweep;
