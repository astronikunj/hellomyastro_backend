'use strict';

const { Op } = require('sequelize');
const cloudinary = require('../config/cloudinary');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { getPagination } = require('../utils/validators');
const { User, Astrologer, Booking, Notification, Wallet } = require('../models');

/**
 * @route GET /api/users/profile
 * @desc Get current user profile
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ['password', 'refreshToken', 'otp', 'otpExpiry', 'passwordResetToken'] },
    include: [{ model: Wallet, as: 'wallet', attributes: ['balance'] }],
  });
  return successResponse(res, 'Profile fetched', user);
});

/**
 * @route PUT /api/users/profile
 * @desc Update user profile
 */
const updateProfile = asyncHandler(async (req, res) => {
  const allowed = ['name', 'gender', 'dateOfBirth', 'timeOfBirth', 'placeOfBirth', 'fcmToken'];
  const updates = {};
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  });

  await User.update(updates, { where: { id: req.user.id } });
  const updatedUser = await User.findByPk(req.user.id, {
    attributes: { exclude: ['password', 'refreshToken', 'otp', 'otpExpiry'] },
  });

  return successResponse(res, 'Profile updated', updatedUser);
});

/**
 * @route POST /api/users/upload-avatar
 * @desc Upload profile image to Cloudinary
 */
const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) return errorResponse(res, 'No image provided', 400);

  const result = await new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: 'astrolly/avatars', resource_type: 'image' }, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      })
      .end(req.file.buffer);
  });

  await User.update({ profileImage: result.secure_url }, { where: { id: req.user.id } });
  return successResponse(res, 'Avatar uploaded', { profileImage: result.secure_url });
});

/**
 * @route GET /api/users/booking-history
 * @desc Get paginated booking history for user
 */
const getBookingHistory = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const { type, status } = req.query;

  const where = { userId: req.user.id };
  if (type) where.type = type;
  if (status) where.status = status;

  const { count, rows } = await Booking.findAndCountAll({
    where,
    include: [{ model: Astrologer, as: 'astrologer', attributes: ['id', 'displayName', 'profileImage'] }],
    limit,
    offset,
    order: [['createdAt', 'DESC']],
  });

  return res.status(200).json({
    success: true,
    message: 'Booking history fetched',
    data: rows,
    pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
  });
});

/**
 * @route GET /api/users/notifications
 * @desc Get paginated notifications
 */
const getNotifications = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);

  const { count, rows } = await Notification.findAndCountAll({
    where: { userId: req.user.id },
    limit,
    offset,
    order: [['createdAt', 'DESC']],
  });

  return res.status(200).json({
    success: true,
    message: 'Notifications fetched',
    data: rows,
    pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
  });
});

/**
 * @route PUT /api/users/notifications/:id/read
 * @desc Mark a notification as read
 */
const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!notification) return errorResponse(res, 'Notification not found', 404);

  await notification.update({ isRead: true, readAt: new Date() });
  return successResponse(res, 'Notification marked as read');
});

/**
 * @route POST /api/users/favorites/:astrologerId
 * @desc Add astrologer to favorites
 */
const addFavorite = asyncHandler(async (req, res) => {
  const astrologer = await Astrologer.findByPk(req.params.astrologerId);
  if (!astrologer) return errorResponse(res, 'Astrologer not found', 404);

  const user = await User.findByPk(req.user.id);
  await user.addFavoriteAstrologers(astrologer);

  return successResponse(res, 'Added to favorites');
});

/**
 * @route DELETE /api/users/favorites/:astrologerId
 * @desc Remove astrologer from favorites
 */
const removeFavorite = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id);
  const astrologer = await Astrologer.findByPk(req.params.astrologerId);
  if (!astrologer) return errorResponse(res, 'Astrologer not found', 404);

  await user.removeFavoriteAstrologers(astrologer);
  return successResponse(res, 'Removed from favorites');
});

/**
 * @route GET /api/users/favorites
 * @desc Get list of favorite astrologers
 */
const getFavorites = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    include: [
      {
        model: Astrologer,
        as: 'favoriteAstrologers',
        attributes: ['id', 'displayName', 'profileImage', 'averageRating', 'isOnline'],
      },
    ],
  });
  return successResponse(res, 'Favorites fetched', user.favoriteAstrologers);
});

/**
 * @route PUT /api/users/fcm-token
 * @desc Update FCM token for push notifications
 */
const updateFcmToken = asyncHandler(async (req, res) => {
  const { fcmToken } = req.body;
  if (!fcmToken) return errorResponse(res, 'FCM token is required', 400);
  await User.update({ fcmToken }, { where: { id: req.user.id } });
  return successResponse(res, 'FCM token updated');
});

module.exports = {
  getProfile,
  updateProfile,
  uploadAvatar,
  getBookingHistory,
  getNotifications,
  markNotificationRead,
  addFavorite,
  removeFavorite,
  getFavorites,
  updateFcmToken,
};
