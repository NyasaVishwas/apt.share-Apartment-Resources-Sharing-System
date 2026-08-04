const ApiError = require('../utils/ApiError');
const Membership = require('../models/Membership.model');

const authorize = (roles = []) => {
  return async (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Unauthenticated', 'UNAUTHORIZED'));
    }

    if (typeof roles === 'string') {
      roles = [roles];
    }

    // Super admin bypasses role checks
    if (req.user.role === 'super_admin') {
      return next();
    }

    // Top-level role check
    if (roles.length > 0 && roles.includes(req.user.role)) {
      return next();
    }

    // Community-level role check via X-Community-Id header
    const communityId = req.headers['x-community-id'] || req.params.communityId;
    if (communityId) {
      const membership = await Membership.findOne({
        userId: req.user._id,
        communityId,
        status: 'active'
      });

      if (membership && roles.includes(membership.role)) {
        req.membership = membership;
        return next();
      }
    }

    return next(new ApiError(403, 'Permission denied for this resource', 'FORBIDDEN'));
  };
};

module.exports = authorize;
