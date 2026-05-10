'use strict';

const { errorResponse } = require('../utils/responseHandler');

/**
 * Astrologer-only middleware — must be used after protect()
 * Also accepts admin role (admins can perform astrologer actions)
 */
const astrologerOnly = (req, res, next) => {
  if (!req.user || (req.user.role !== 'astrologer' && req.user.role !== 'admin')) {
    return errorResponse(res, 'Access denied. Astrologers only.', 403);
  }
  next();
};

module.exports = { astrologerOnly };
