const ApiError = require('../utils/ApiError');

const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }
      if (schema.query) {
        req.query = schema.query.parse(req.query);
      }
      if (schema.params) {
        req.params = schema.params.parse(req.params);
      }
      next();
    } catch (error) {
      const details = error.errors ? error.errors.map((e) => `${e.path.join('.')}: ${e.message}`) : [error.message];
      next(new ApiError(400, `Validation Error: ${details.join(', ')}`, 'VALIDATION_ERROR', details));
    }
  };
};

module.exports = validateRequest;
