'use strict';

/**
 * Reusable validation helpers
 * Works alongside express-validator for custom logic
 */

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Validate Indian mobile number (10 digits)
 */
const isValidPhone = (phone) => {
  const re = /^[6-9]\d{9}$/;
  return re.test(phone);
};

/**
 * Parse and validate pagination query params
 * Returns { page, limit, offset }
 */
const getPagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

/**
 * Build Sequelize ORDER clause from query params
 * e.g. ?sortBy=createdAt&sortOrder=DESC
 */
const getOrderClause = (query, allowedFields = ['createdAt', 'updatedAt']) => {
  const sortBy = allowedFields.includes(query.sortBy) ? query.sortBy : 'createdAt';
  const sortOrder = ['ASC', 'DESC'].includes((query.sortOrder || '').toUpperCase())
    ? query.sortOrder.toUpperCase()
    : 'DESC';
  return [[sortBy, sortOrder]];
};

/**
 * Sanitize string — trim and lowercase
 */
const sanitizeString = (str) => (str || '').trim().toLowerCase();

module.exports = { isValidEmail, isValidPhone, getPagination, getOrderClause, sanitizeString };
