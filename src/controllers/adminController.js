'use strict';

const { Op } = require('sequelize');
const cloudinary = require('../config/cloudinary');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, createdResponse, errorResponse } = require('../utils/responseHandler');
const { getPagination } = require('../utils/validators');
const { User, Astrologer, Booking, Wallet, WalletTransaction, Review, Report, Banner } = require('../models');
const { sequelize } = require('../config/db');

// ===================== DASHBOARD =====================

/**
 * @route GET /api/admin/dashboard
 * @desc Get platform analytics dashboard
 */
const getDashboard = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalAstrologers,
    pendingApprovals,
    totalBookings,
    completedBookings,
    totalRevenue,
  ] = await Promise.all([
    User.count({ where: { role: 'user' } }),
    Astrologer.count(),
    Astrologer.count({ where: { isApproved: false } }),
    Booking.count(),
    Booking.count({ where: { status: 'completed' } }),
    Booking.sum('platformFee', { where: { status: 'completed' } }),
  ]);

  return successResponse(res, 'Dashboard data', {
    totalUsers,
    totalAstrologers,
    pendingApprovals,
    totalBookings,
    completedBookings,
    totalRevenue: totalRevenue || 0,
  });
});

// ===================== USER MANAGEMENT =====================

/**
 * @route GET /api/admin/users
 * @desc Get all users with search and pagination
 */
const getUsers = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const { search, role, isBanned } = req.query;
  const where = {};
  if (role) where.role = role;
  if (isBanned !== undefined) where.isBanned = isBanned === 'true';
  if (search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
      { phone: { [Op.like]: `%${search}%` } },
    ];
  }

  const { count, rows } = await User.findAndCountAll({
    where,
    attributes: { exclude: ['password', 'refreshToken', 'otp'] },
    limit,
    offset,
    order: [['createdAt', 'DESC']],
  });

  return res.status(200).json({
    success: true,
    message: 'Users fetched',
    data: rows,
    pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
  });
});

/**
 * @route PUT /api/admin/users/:id/ban
 * @desc Ban or unban a user
 */
const banUser = asyncHandler(async (req, res) => {
  const { isBanned, reason } = req.body;
  const user = await User.findByPk(req.params.id);
  if (!user) return errorResponse(res, 'User not found', 404);
  await user.update({ isBanned });
  return successResponse(res, `User ${isBanned ? 'banned' : 'unbanned'} successfully`);
});

// ===================== ASTROLOGER MANAGEMENT =====================

/**
 * @route GET /api/admin/astrologers/pending
 * @desc Get pending astrologer approvals
 */
const getPendingAstrologers = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const { count, rows } = await Astrologer.findAndCountAll({
    where: { isApproved: false },
    include: [{ model: User, as: 'user', attributes: ['name', 'email', 'phone', 'profileImage'] }],
    limit,
    offset,
    order: [['createdAt', 'DESC']],
  });

  return res.status(200).json({
    success: true,
    message: 'Pending approvals fetched',
    data: rows,
    pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
  });
});

/**
 * @route PUT /api/admin/astrologers/:id/approve
 * @desc Approve or reject astrologer
 */
const approveAstrologer = asyncHandler(async (req, res) => {
  const { isApproved } = req.body;
  const astrologer = await Astrologer.findByPk(req.params.id);
  if (!astrologer) return errorResponse(res, 'Astrologer not found', 404);

  await astrologer.update({ isApproved, approvedAt: isApproved ? new Date() : null });
  return successResponse(res, `Astrologer ${isApproved ? 'approved' : 'rejected'}`);
});

// ===================== BANNER MANAGEMENT =====================

/**
 * @route GET /api/admin/banners
 * @desc Get all banners
 */
const getBanners = asyncHandler(async (req, res) => {
  const banners = await Banner.findAll({ order: [['position', 'ASC']] });
  return successResponse(res, 'Banners fetched', banners);
});

/**
 * @route POST /api/admin/banners
 * @desc Create a new banner
 */
const createBanner = asyncHandler(async (req, res) => {
  const { title, subtitle, linkUrl, position, startsAt, endsAt } = req.body;
  if (!req.file) return errorResponse(res, 'Banner image is required', 400);

  const result = await new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: 'astrolly/banners', resource_type: 'image' }, (err, r) => {
        if (err) reject(err);
        else resolve(r);
      })
      .end(req.file.buffer);
  });

  const banner = await Banner.create({ title, subtitle, imageUrl: result.secure_url, linkUrl, position, startsAt, endsAt });
  return createdResponse(res, 'Banner created', banner);
});

/**
 * @route PUT /api/admin/banners/:id
 * @desc Update a banner
 */
const updateBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findByPk(req.params.id);
  if (!banner) return errorResponse(res, 'Banner not found', 404);
  await banner.update(req.body);
  return successResponse(res, 'Banner updated', banner);
});

/**
 * @route DELETE /api/admin/banners/:id
 * @desc Delete a banner
 */
const deleteBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findByPk(req.params.id);
  if (!banner) return errorResponse(res, 'Banner not found', 404);
  await banner.destroy();
  return successResponse(res, 'Banner deleted');
});

// ===================== REPORTS =====================

/**
 * @route GET /api/admin/reports
 * @desc Get all user reports
 */
const getReports = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const { status } = req.query;
  const where = {};
  if (status) where.status = status;

  const { count, rows } = await Report.findAndCountAll({
    where,
    include: [
      { model: User, as: 'reporter', attributes: ['id', 'name', 'email'] },
      { model: User, as: 'reportedUserDetails', attributes: ['id', 'name', 'email'] },
    ],
    limit,
    offset,
    order: [['createdAt', 'DESC']],
  });

  return res.status(200).json({
    success: true,
    message: 'Reports fetched',
    data: rows,
    pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
  });
});

/**
 * @route GET /api/admin/revenue
 * @desc Get revenue analytics
 */
const getRevenue = asyncHandler(async (req, res) => {
  // Monthly revenue breakdown
  const monthlyRevenue = await sequelize.query(
    `SELECT 
      DATE_FORMAT(createdAt, '%Y-%m') as month,
      SUM(platformFee) as revenue,
      COUNT(*) as sessions
    FROM bookings 
    WHERE status = 'completed'
    GROUP BY month 
    ORDER BY month DESC 
    LIMIT 12`,
    { type: sequelize.QueryTypes.SELECT }
  );

  const totalRevenue = await Booking.sum('platformFee', { where: { status: 'completed' } });
  const totalPaid = await WalletTransaction.sum('amount', { where: { type: 'credit', referenceType: 'razorpay' } });

  return successResponse(res, 'Revenue analytics', { totalRevenue: totalRevenue || 0, totalPaid: totalPaid || 0, monthlyRevenue });
});

module.exports = {
  getDashboard,
  getUsers,
  banUser,
  getPendingAstrologers,
  approveAstrologer,
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  getReports,
  getRevenue,
};
