'use strict';

const { Op } = require('sequelize');
const cloudinary = require('../config/cloudinary');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, createdResponse, errorResponse } = require('../utils/responseHandler');
const { getPagination, getOrderClause } = require('../utils/validators');
const { Astrologer, User, Review, Schedule, Booking } = require('../models');
const { sequelize } = require('../config/db');

/**
 * @route POST /api/astrologers/profile
 * @desc Create astrologer profile (by astrologer user)
 */
const createProfile = asyncHandler(async (req, res) => {
  const existing = await Astrologer.findOne({ where: { userId: req.user.id } });
  if (existing) return errorResponse(res, 'Profile already exists', 409);

  const {
    displayName, bio, specializations, languages,
    experience, chatRate, callRate, videoCallRate,
  } = req.body;

  const profile = await Astrologer.create({
    userId: req.user.id,
    displayName,
    bio,
    specializations,
    languages,
    experience,
    chatRate,
    callRate,
    videoCallRate,
  });

  return createdResponse(res, 'Astrologer profile created', profile);
});

/**
 * @route GET /api/astrologers/profile/me
 * @desc Get own astrologer profile
 */
const getMyProfile = asyncHandler(async (req, res) => {
  const profile = await Astrologer.findOne({
    where: { userId: req.user.id },
    include: [
      { model: User, as: 'user', attributes: ['name', 'email', 'phone', 'profileImage'] },
      { model: Schedule, as: 'schedules' },
    ],
  });
  if (!profile) return errorResponse(res, 'Profile not found', 404);
  return successResponse(res, 'Profile fetched', profile);
});

/**
 * @route PUT /api/astrologers/profile
 * @desc Update astrologer profile
 */
const updateProfile = asyncHandler(async (req, res) => {
  const profile = await Astrologer.findOne({ where: { userId: req.user.id } });
  if (!profile) return errorResponse(res, 'Profile not found', 404);

  const allowed = [
    'displayName', 'bio', 'specializations', 'languages',
    'experience', 'chatRate', 'callRate', 'videoCallRate', 'bankDetails',
  ];
  const updates = {};
  allowed.forEach((key) => { if (req.body[key] !== undefined) updates[key] = req.body[key]; });

  await profile.update(updates);
  return successResponse(res, 'Profile updated', profile);
});

/**
 * @route GET /api/astrologers
 * @desc List all approved astrologers with filtering & pagination
 */
const listAstrologers = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const { search, specialization, isOnline, sortBy, sortOrder } = req.query;

  const where = { isApproved: true };
  if (isOnline !== undefined) where.isOnline = isOnline === 'true';
  if (specialization) {
    where.specializations = sequelize.where(
      sequelize.fn('JSON_CONTAINS', sequelize.col('specializations'),
        JSON.stringify(specialization)),
      true
    );
  }

  const userWhere = {};
  if (search) {
    userWhere.name = { [Op.like]: `%${search}%` };
  }

  const allowedSort = ['averageRating', 'experience', 'chatRate', 'createdAt'];
  const order = getOrderClause({ sortBy, sortOrder }, allowedSort);

  const { count, rows } = await Astrologer.findAndCountAll({
    where,
    include: [{ model: User, as: 'user', where: userWhere, attributes: ['name', 'profileImage'] }],
    limit,
    offset,
    order,
  });

  return res.status(200).json({
    success: true,
    message: 'Astrologers fetched',
    data: rows,
    pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
  });
});

/**
 * @route GET /api/astrologers/:id
 * @desc Get public astrologer profile
 */
const getAstrologerById = asyncHandler(async (req, res) => {
  const astrologer = await Astrologer.findByPk(req.params.id, {
    include: [
      { model: User, as: 'user', attributes: ['name', 'profileImage'] },
      { model: Schedule, as: 'schedules' },
      {
        model: Review,
        as: 'reviews',
        limit: 5,
        order: [['createdAt', 'DESC']],
        include: [{ model: User, as: 'user', attributes: ['name', 'profileImage'] }],
      },
    ],
  });
  if (!astrologer) return errorResponse(res, 'Astrologer not found', 404);
  return successResponse(res, 'Astrologer fetched', astrologer);
});

/**
 * @route PUT /api/astrologers/status
 * @desc Toggle online/offline status
 */
const updateStatus = asyncHandler(async (req, res) => {
  const { isOnline } = req.body;
  const profile = await Astrologer.findOne({ where: { userId: req.user.id } });
  if (!profile) return errorResponse(res, 'Profile not found', 404);

  await profile.update({ isOnline });
  return successResponse(res, `Status updated to ${isOnline ? 'online' : 'offline'}`, { isOnline });
});

/**
 * @route POST /api/astrologers/schedule
 * @desc Set availability schedule
 */
const setSchedule = asyncHandler(async (req, res) => {
  const profile = await Astrologer.findOne({ where: { userId: req.user.id } });
  if (!profile) return errorResponse(res, 'Profile not found', 404);

  const { schedules } = req.body; // [{ dayOfWeek, startTime, endTime }]
  if (!Array.isArray(schedules)) return errorResponse(res, 'schedules must be an array', 400);

  // Delete old schedule and recreate
  await Schedule.destroy({ where: { astrologerId: profile.id } });
  const created = await Schedule.bulkCreate(
    schedules.map((s) => ({ ...s, astrologerId: profile.id }))
  );

  return successResponse(res, 'Schedule updated', created);
});

/**
 * @route GET /api/astrologers/earnings
 * @desc Get earnings dashboard
 */
const getEarnings = asyncHandler(async (req, res) => {
  const profile = await Astrologer.findOne({ where: { userId: req.user.id } });
  if (!profile) return errorResponse(res, 'Profile not found', 404);

  const completedBookings = await Booking.count({
    where: { astrologerId: profile.id, status: 'completed' },
  });

  return successResponse(res, 'Earnings fetched', {
    totalEarnings: profile.totalEarnings,
    withdrawalPending: profile.withdrawalPending,
    totalSessions: profile.totalSessions,
    completedBookings,
    averageRating: profile.averageRating,
    totalRatings: profile.totalRatings,
  });
});

/**
 * @route POST /api/astrologers/upload-avatar
 * @desc Upload astrologer profile image
 */
const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) return errorResponse(res, 'No image provided', 400);

  const result = await new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: 'astrolly/astrologers', resource_type: 'image' }, (err, r) => {
        if (err) reject(err);
        else resolve(r);
      })
      .end(req.file.buffer);
  });

  await Astrologer.update({ profileImage: result.secure_url }, { where: { userId: req.user.id } });
  return successResponse(res, 'Avatar uploaded', { profileImage: result.secure_url });
});

module.exports = {
  createProfile,
  getMyProfile,
  updateProfile,
  listAstrologers,
  getAstrologerById,
  updateStatus,
  setSchedule,
  getEarnings,
  uploadAvatar,
};
