const mongoose = require('mongoose');
const env = require('./env');
const logger = require('./logger');

const connectDB = async (uri = env.MONGO_URI) => {
  try {
    const conn = await mongoose.connect(uri);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    if (error.message && error.message.includes('querySrv ECONNREFUSED')) {
      logger.warn('SRV resolution failed with default DNS, falling back to public DNS (8.8.8.8)...');
      try {
        const dns = require('dns');
        dns.setServers(['8.8.8.8', '8.8.4.4']);
        const conn = await mongoose.connect(uri);
        logger.info(`MongoDB Connected via fallback DNS: ${conn.connection.host}`);
        return conn;
      } catch (fallbackError) {
        logger.error(`Error connecting to MongoDB: ${fallbackError.message}`);
        process.exit(1);
      }
    }
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
