'use strict';

/**
 * Wraps async route handlers to avoid try/catch repetition
 * Passes any errors to the global error handler via next()
 *
 * @param {Function} fn - async controller function
 * @returns {Function} express middleware
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
