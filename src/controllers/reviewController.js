'use strict';

const asyncHandler = require('../utils/asyncHandler');
const { successResponse, createdResponse, errorResponse } = require('../utils/responseHandler');
const { getPagination } = require('../utils/validators');
const { Review, User, Astrologer, Booking } = require('../models');
const { BOOKING_STATUS } = require('../utils/constants');

/**
 * @route POST /api/reviews
 * @desc Submit a review for a completed booking
 */
const createReview = asyncHandler(async (req, res) => {
  const { bookingId, rating, comment } = req.body;

  if (!bookingId || !rating) return errorResponse(res, 'bookingId and rating are required', 400);

  const booking = await Booking.findByPk(bookingId);
  if (!booking) return errorResponse(res, 'Booking not found', 404);
  if (booking.userId !== req.user.id) return errorResponse(res, 'Unauthorized', 403);
  if (booking.status !== BOOKING_STATUS.COMPLETED) {
    return errorResponse(res, 'Can only review completed bookings', 400);
  }

  const existingReview = await Review.findOne({ where: { bookingId } });
  if (existingReview) return errorResponse(res, 'Review already submitted for this booking', 409);

  const review = await Review.create({
    userId: req.user.id,
    astrologerId: booking.astrologerId,
    bookingId,
    rating,
    comment,
  });

  // Recalculate astrologer average rating
  const allReviews = await Review.findAll({ where: { astrologerId: booking.astrologerId } });
  const avgRating = allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;

  await Astrologer.update(
    { averageRating: avgRating.toFixed(2), totalRatings: allReviews.length },
    { where: { id: booking.astrologerId } }
  );

  return createdResponse(res, 'Review submitted', review);
});

/**
 * @route GET /api/reviews/:astrologerId
 * @desc Get paginated reviews for an astrologer
 */
const getReviews = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);

  const { count, rows } = await Review.findAndCountAll({
    where: { astrologerId: req.params.astrologerId, isApproved: true },
    include: [{ model: User, as: 'user', attributes: ['id', 'name', 'profileImage'] }],
    limit,
    offset,
    order: [['createdAt', 'DESC']],
  });

  return res.status(200).json({
    success: true,
    message: 'Reviews fetched',
    data: rows,
    pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
  });
});

/**
 * @route DELETE /api/reviews/:id
 * @desc Admin deletes a review
 */
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findByPk(req.params.id);
  if (!review) return errorResponse(res, 'Review not found', 404);

  await review.destroy();
  return successResponse(res, 'Review deleted');
});

module.exports = { createReview, getReviews, deleteReview };
