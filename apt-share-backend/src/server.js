const app = require('./app');
const env = require('./config/env');
const connectDB = require('./config/db');
const logger = require('./config/logger');
const { initSocket } = require('./config/socket');
const { startScheduler, stopScheduler } = require('./jobs/scheduler');

const startServer = async () => {
  await connectDB();

  const server = app.listen(env.PORT, () => {
    logger.info(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
  });

  // Attach Socket.IO real-time engine
  initSocket(server);

  // Start background job scheduler
  startScheduler();

  const handleExit = (signal) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    stopScheduler();
    server.close(() => {
      logger.info('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => handleExit('SIGTERM'));
  process.on('SIGINT', () => handleExit('SIGINT'));
};

startServer();
