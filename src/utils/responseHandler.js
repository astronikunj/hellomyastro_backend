'use strict';

/**
 * Standard API response helper
 * Enforces consistent response shape across all endpoints
 */

const successResponse = (res, message = 'Success', data = null, statusCode = 200) => {
  const response = {
    success: true,
    message,
    ...(data !== null && { data }),
  };
  return res.status(statusCode).json(response);
};

const createdResponse = (res, message = 'Created', data = null) => {
  return successResponse(res, message, data, 201);
};

const errorResponse = (res, message = 'Something went wrong', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message,
    ...(errors && { errors }),
  };
  return res.status(statusCode).json(response);
};

const paginatedResponse = (res, message = 'Success', data, pagination) => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: Math.ceil(pagination.total / pagination.limit),
      hasNextPage: pagination.page < Math.ceil(pagination.total / pagination.limit),
      hasPrevPage: pagination.page > 1,
    },
  });
};

module.exports = { successResponse, createdResponse, errorResponse, paginatedResponse };
