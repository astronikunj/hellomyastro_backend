'use strict';

const { validationResult } = require('express-validator');
const { errorResponse } = require('../utils/responseHandler');

/**
 * Middleware to check express-validator results
 * Place after validation rule arrays in routes
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => `${e.path}: ${e.msg}`);
    return errorResponse(res, 'Validation failed', 422, messages);
  }
  next();
};

module.exports = { validate };
