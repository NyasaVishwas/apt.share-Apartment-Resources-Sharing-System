const runAutoDeclineSweep = require('./autoDeclineBooking.job');
const runReturnReminderSweep = require('./returnReminder.job');
const logger = require('../config/logger');

let timer = null;

const startScheduler = (intervalMs = 60000) => {
  logger.info('[SCHEDULER] Background job scheduler initialized.');
  timer = setInterval(async () => {
    await runAutoDeclineSweep();
    await runReturnReminderSweep();
  }, intervalMs);
};

const stopScheduler = () => {
  if (timer) {
    clearInterval(timer);
    logger.info('[SCHEDULER] Background job scheduler stopped.');
  }
};

module.exports = {
  startScheduler,
  stopScheduler
};
