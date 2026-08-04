const Community = require('../models/Community.model');
const Booking = require('../models/Booking.model');
const AnalyticsSnapshot = require('../models/AnalyticsSnapshot.model');
const logger = require('../config/logger');

const runAnalyticsAggregationJob = async () => {
  try {
    const communities = await Community.find({ status: 'active' });

    for (const comm of communities) {
      const completed = await Booking.find({ communityId: comm._id, status: 'completed' });
      let moneySaved = 0;
      let co2Saved = 0;

      for (const b of completed) {
        moneySaved += Math.max(0, (b.depositAmount || 1500) - (b.rentalFeeAmount || 0));
        co2Saved += 15;
      }

      await AnalyticsSnapshot.create({
        scope: 'community',
        communityId: comm._id,
        metrics: {
          moneySaved,
          co2Saved,
          itemsBorrowed: completed.length
        }
      });
    }

    logger.info(`[SCHEDULER] Pre-computed analytics snapshots for ${communities.length} active communities.`);
  } catch (err) {
    logger.error(`[SCHEDULER] Error running analytics aggregation: ${err.message}`);
  }
};

module.exports = runAnalyticsAggregationJob;
