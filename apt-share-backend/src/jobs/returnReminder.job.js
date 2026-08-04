const Booking = require('../models/Booking.model');
const NotificationsService = require('../modules/notifications/notifications.service');
const PriorityQueue = require('../utils/priorityQueue');
const logger = require('../config/logger');

const runReturnReminderSweep = async () => {
  try {
    const tomorrow = new Date(Date.now() + 24 * 3600 * 1000);
    const activeBookings = await Booking.find({
      status: 'active',
      endDate: { $lte: tomorrow }
    });

    // Use Min-Heap Priority Queue to order notification dispatches
    const pq = new PriorityQueue();
    for (const b of activeBookings) {
      pq.enqueue(b, new Date(b.endDate).getTime());
    }

    let count = 0;
    while (!pq.isEmpty()) {
      const booking = pq.dequeue();
      await NotificationsService.createNotification({
        userId: booking.borrowerId,
        communityId: booking.communityId,
        type: 'return_reminder',
        title: 'Return Reminder: Item Due Soon',
        body: `Please remember to return the borrowed item by ${new Date(booking.endDate).toLocaleDateString()}.`,
        relatedEntityType: 'Booking',
        relatedEntityId: booking._id
      });
      count++;
    }

    if (count > 0) {
      logger.info(`[SCHEDULER] Dispatched ${count} return reminders via Priority Queue.`);
    }
  } catch (err) {
    logger.error(`[SCHEDULER] Error running return reminder sweep: ${err.message}`);
  }
};

module.exports = runReturnReminderSweep;
