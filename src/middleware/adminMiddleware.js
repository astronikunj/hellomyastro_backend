'use strict';

const { errorResponse } = require('../utils/responseHandler');

/**
 * Admin-only middleware — must be used after protect()
 */
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return errorResponse(res, 'Access denied. Admin only.', 403);
  }
  next();
};

module.exports = { adminOnly };
