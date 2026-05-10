'use strict';

const { v4: uuidv4 } = require('uuid');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, createdResponse, errorResponse } = require('../utils/responseHandler');
const { getPagination } = require('../utils/validators');
const { Booking, Astrologer, User, Chat, Wallet } = require('../models');
const { createNotification } = require('../services/notificationService');
const { debitWallet } = require('../services/walletService');
const { MIN_WALLET_BALANCE, BOOKING_STATUS, PLATFORM_COMMISSION_PERCENT } = require('../utils/constants');

/**
 * @route POST /api/bookings
 * @desc Create a new booking (chat / audio / video)
 */
const createBooking = asyncHandler(async (req, res) => {
  const { astrologerId, type, scheduledAt } = req.body;
  if (!astrologerId || !type) return errorResponse(res, 'astrologerId and type are required', 400);

  const astrologer = await Astrologer.findByPk(astrologerId);
  if (!astrologer) return errorResponse(res, 'Astrologer not found', 404);
  if (!astrologer.isApproved) return errorResponse(res, 'Astrologer is not approved', 400);

  // Check wallet balance
  const wallet = await Wallet.findOne({ where: { userId: req.user.id } });
  if (!wallet || parseFloat(wallet.balance) < MIN_WALLET_BALANCE) {
    return errorResponse(res, `Minimum wallet balance of ₹${MIN_WALLET_BALANCE} required`, 402);
  }

  const rateMap = { chat: astrologer.chatRate, audio_call: astrologer.callRate, video_call: astrologer.videoCallRate };
  const ratePerMinute = rateMap[type];

  const booking = await Booking.create({
    userId: req.user.id,
    astrologerId,
    type,
    status: scheduledAt ? BOOKING_STATUS.PENDING : BOOKING_STATUS.PENDING,
    scheduledAt: scheduledAt || null,
    ratePerMinute,
  });

  // Notify astrologer
  const astrologerUser = await User.findByPk(astrologer.userId);
  if (astrologerUser) {
    await createNotification(
      astrologerUser.id,
      'New Booking Request',
      `You have a new ${type} booking request.`,
      'booking',
      { referenceId: booking.id, referenceType: 'Booking' }
    );
  }

  return createdResponse(res, 'Booking created', booking);
});

/**
 * @route PUT /api/bookings/:id/accept
 * @desc Astrologer accepts booking
 */
const acceptBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findByPk(req.params.id, {
    include: [{ model: Astrologer, as: 'astrologer' }],
  });
  if (!booking) return errorResponse(res, 'Booking not found', 404);
  if (booking.astrologer.userId !== req.user.id) return errorResponse(res, 'Unauthorized', 403);
  if (booking.status !== BOOKING_STATUS.PENDING) {
    return errorResponse(res, `Cannot accept booking with status ${booking.status}`, 400);
  }

  await booking.update({ status: BOOKING_STATUS.ACCEPTED });

  // Create chat room if type is chat
  if (booking.type === 'chat') {
    await Chat.create({
      bookingId: booking.id,
      userId: booking.userId,
      astrologerId: booking.astrologerId,
      roomId: `chat_${booking.id}_${uuidv4().slice(0, 8)}`,
    });
  }

  await createNotification(
    booking.userId,
    'Booking Accepted!',
    `Your ${booking.type} session has been accepted.`,
    'booking',
    { referenceId: booking.id, referenceType: 'Booking' }
  );

  return successResponse(res, 'Booking accepted', booking);
});

/**
 * @route PUT /api/bookings/:id/reject
 * @desc Astrologer rejects booking
 */
const rejectBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findByPk(req.params.id, {
    include: [{ model: Astrologer, as: 'astrologer' }],
  });
  if (!booking) return errorResponse(res, 'Booking not found', 404);
  if (booking.astrologer.userId !== req.user.id) return errorResponse(res, 'Unauthorized', 403);
  if (booking.status !== BOOKING_STATUS.PENDING) return errorResponse(res, 'Cannot reject this booking', 400);

  await booking.update({ status: BOOKING_STATUS.REJECTED, cancellationReason: req.body.reason, cancelledBy: 'astrologer' });

  await createNotification(
    booking.userId,
    'Booking Rejected',
    `Your ${booking.type} booking was rejected.`,
    'booking',
    { referenceId: booking.id, referenceType: 'Booking' }
  );

  return successResponse(res, 'Booking rejected');
});

/**
 * @route PUT /api/bookings/:id/cancel
 * @desc User cancels booking
 */
const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findByPk(req.params.id);
  if (!booking) return errorResponse(res, 'Booking not found', 404);
  if (booking.userId !== req.user.id) return errorResponse(res, 'Unauthorized', 403);

  const cancellableStatuses = [BOOKING_STATUS.PENDING, BOOKING_STATUS.ACCEPTED];
  if (!cancellableStatuses.includes(booking.status)) {
    return errorResponse(res, 'Booking cannot be cancelled now', 400);
  }

  await booking.update({
    status: BOOKING_STATUS.CANCELLED,
    cancellationReason: req.body.reason,
    cancelledBy: 'user',
  });

  return successResponse(res, 'Booking cancelled');
});

/**
 * @route PUT /api/bookings/:id/complete
 * @desc Mark booking as completed (system/astrologer)
 */
const completeBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findByPk(req.params.id, {
    include: [{ model: Astrologer, as: 'astrologer' }],
  });
  if (!booking) return errorResponse(res, 'Booking not found', 404);
  if (booking.status !== BOOKING_STATUS.ONGOING) return errorResponse(res, 'Booking is not ongoing', 400);

  const endedAt = new Date();
  const durationMs = endedAt - (booking.startedAt || booking.createdAt);
  const durationMinutes = Math.ceil(durationMs / 60000);
  const totalAmount = durationMinutes * parseFloat(booking.ratePerMinute);
  const platformFee = (totalAmount * PLATFORM_COMMISSION_PERCENT) / 100;
  const astrologerEarning = totalAmount - platformFee;

  await booking.update({
    status: BOOKING_STATUS.COMPLETED,
    endedAt,
    durationMinutes,
    totalAmount,
    platformFee,
    astrologerEarning,
  });

  // Credit astrologer earnings
  await Astrologer.increment(
    { totalEarnings: astrologerEarning, totalSessions: 1 },
    { where: { id: booking.astrologerId } }
  );

  return successResponse(res, 'Booking completed', booking);
});

/**
 * @route GET /api/bookings
 * @desc Get bookings (user sees own, astrologer sees assigned)
 */
const getBookings = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const where = {};

  if (req.user.role === 'user') where.userId = req.user.id;
  else if (req.user.role === 'astrologer') {
    const profile = await Astrologer.findOne({ where: { userId: req.user.id } });
    if (!profile) return errorResponse(res, 'Astrologer profile not found', 404);
    where.astrologerId = profile.id;
  }

  if (req.query.status) where.status = req.query.status;
  if (req.query.type) where.type = req.query.type;

  const { count, rows } = await Booking.findAndCountAll({
    where,
    include: [
      { model: User, as: 'user', attributes: ['id', 'name', 'profileImage'] },
      { model: Astrologer, as: 'astrologer', attributes: ['id', 'displayName', 'profileImage'] },
    ],
    limit,
    offset,
    order: [['createdAt', 'DESC']],
  });

  return res.status(200).json({
    success: true,
    message: 'Bookings fetched',
    data: rows,
    pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
  });
});

/**
 * @route GET /api/bookings/:id
 * @desc Get single booking detail
 */
const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findByPk(req.params.id, {
    include: [
      { model: User, as: 'user', attributes: ['id', 'name', 'profileImage'] },
      { model: Astrologer, as: 'astrologer', attributes: ['id', 'displayName', 'profileImage', 'chatRate', 'callRate'] },
      { model: Chat, as: 'chat', attributes: ['id', 'roomId', 'status'] },
    ],
  });
  if (!booking) return errorResponse(res, 'Booking not found', 404);
  return successResponse(res, 'Booking fetched', booking);
});

module.exports = {
  createBooking,
  acceptBooking,
  rejectBooking,
  cancelBooking,
  completeBooking,
  getBookings,
  getBookingById,
};
