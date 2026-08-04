const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, 'INTERNAL_ERROR', [], err.stack);
  }

  logger.error(`${req.method} ${req.originalUrl} - ${error.statusCode} ${error.message}`);

  const response = {
    success: false,
    error: {
      code: error.code,
      message: error.message,
      ...(error.errors && error.errors.length > 0 && { details: error.errors })
    }
  };

  res.status(error.statusCode).json(response);
};

module.exports = errorHandler;
