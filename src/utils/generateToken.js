'use strict';

const jwt = require('jsonwebtoken');

/**
 * Generate access JWT token
 * @param {object} payload - { id, role }
 * @returns {string} signed JWT
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

/**
 * Generate refresh JWT token
 * @param {object} payload - { id }
 * @returns {string} signed refresh token
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d',
  });
};

/**
 * Verify refresh token and return decoded payload
 * @param {string} token
 * @returns {object} decoded payload
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

module.exports = { generateAccessToken, generateRefreshToken, verifyRefreshToken };
