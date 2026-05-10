'use strict';

const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const { errorResponse } = require('../utils/responseHandler');
const { User } = require('../models');

/**
 * Protect routes — verifies JWT access token
 * Attaches decoded user to req.user
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return errorResponse(res, 'Access denied. No token provided.', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password', 'refreshToken', 'otp', 'otpExpiry', 'passwordResetToken'] },
    });

    if (!user) return errorResponse(res, 'User not found.', 401);
    if (!user.isActive) return errorResponse(res, 'Account is deactivated.', 403);
    if (user.isBanned) return errorResponse(res, 'Account has been banned.', 403);

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token expired. Please login again.', 401);
    }
    return errorResponse(res, 'Invalid token.', 401);
  }
});

module.exports = { protect };
