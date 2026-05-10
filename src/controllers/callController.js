'use strict';

const asyncHandler = require('../utils/asyncHandler');
const { successResponse, createdResponse, errorResponse } = require('../utils/responseHandler');
const { getPagination } = require('../utils/validators');
const { CallHistory, Booking, Astrologer, User } = require('../models');
const { debitWallet } = require('../services/walletService');
const { createNotification } = require('../services/notificationService');
const { BOOKING_STATUS, PLATFORM_COMMISSION_PERCENT } = require('../utils/constants');

/**
 * @route POST /api/calls/initiate/:bookingId
 * @desc Initiate a call for an accepted booking
 */
const initiateCall = asyncHandler(async (req, res) => {
  const booking = await Booking.findByPk(req.params.bookingId, {
    include: [{ model: Astrologer, as: 'astrologer' }],
  });

  if (!booking) return errorResponse(res, 'Booking not found', 404);
  if (booking.userId !== req.user.id) return errorResponse(res, 'Unauthorized', 403);
  if (booking.status !== BOOKING_STATUS.ACCEPTED) return errorResponse(res, 'Booking not accepted', 400);

  // Generate Agora channel name
  const channelName = `call_${booking.id}_${Date.now()}`;

  const callHistory = await CallHistory.create({
    bookingId: booking.id,
    userId: booking.userId,
    astrologerId: booking.astrologerId,
    callType: booking.type,
    status: 'connected',
    startedAt: new Date(),
    agoraChannelName: channelName,
  });

  await booking.update({ status: BOOKING_STATUS.ONGOING, startedAt: new Date() });

  // Notify astrologer
  const astrologerUser = await User.findByPk(booking.astrologer.userId);
  if (astrologerUser) {
    await createNotification(astrologerUser.id, 'Incoming Call', 'User is calling you!', 'call', {
      referenceId: booking.id,
      referenceType: 'Booking',
    });
  }

  return createdResponse(res, 'Call initiated', {
    callHistoryId: callHistory.id,
    channelName,
    bookingId: booking.id,
  });
});

/**
 * @route PUT /api/calls/:callHistoryId/end
 * @desc End a call and deduct wallet
 */
const endCall = asyncHandler(async (req, res) => {
  const callHistory = await CallHistory.findByPk(req.params.callHistoryId, {
    include: [{ model: Booking, as: 'booking' }],
  });

  if (!callHistory) return errorResponse(res, 'Call not found', 404);
  if (callHistory.endedAt) return errorResponse(res, 'Call already ended', 400);

  const endedAt = new Date();
  const durationSeconds = Math.ceil((endedAt - callHistory.startedAt) / 1000);
  const durationMinutes = Math.ceil(durationSeconds / 60);
  const ratePerMinute = parseFloat(callHistory.booking.ratePerMinute);
  const totalCost = durationMinutes * ratePerMinute;
  const platformFee = (totalCost * PLATFORM_COMMISSION_PERCENT) / 100;
  const astrologerEarning = totalCost - platformFee;

  // Deduct from user wallet
  if (totalCost > 0) {
    await debitWallet(
      callHistory.userId,
      totalCost,
      `${callHistory.callType} session`,
      String(callHistory.bookingId),
      'booking'
    );
  }

  await callHistory.update({ status: 'connected', endedAt, durationSeconds, totalDeducted: totalCost });

  // Complete booking
  await Booking.update(
    {
      status: BOOKING_STATUS.COMPLETED,
      endedAt,
      durationMinutes,
      totalAmount: totalCost,
      platformFee,
      astrologerEarning,
    },
    { where: { id: callHistory.bookingId } }
  );

  // Credit astrologer
  await Astrologer.increment(
    { totalEarnings: astrologerEarning, totalSessions: 1 },
    { where: { id: callHistory.astrologerId } }
  );

  return successResponse(res, 'Call ended', { durationSeconds, durationMinutes, totalCost });
});

/**
 * @route GET /api/calls/history
 * @desc Get call history for current user
 */
const getCallHistory = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const where = {};

  if (req.user.role === 'user') {
    where.userId = req.user.id;
  } else if (req.user.role === 'astrologer') {
    const profile = await Astrologer.findOne({ where: { userId: req.user.id } });
    if (!profile) return errorResponse(res, 'Profile not found', 404);
    where.astrologerId = profile.id;
  }

  if (req.query.callType) where.callType = req.query.callType;
  if (req.query.status) where.status = req.query.status;

  const { count, rows } = await CallHistory.findAndCountAll({
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
    message: 'Call history fetched',
    data: rows,
    pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
  });
});

/**
 * @route PUT /api/calls/:callHistoryId/missed
 * @desc Mark call as missed
 */
const markMissed = asyncHandler(async (req, res) => {
  const callHistory = await CallHistory.findByPk(req.params.callHistoryId);
  if (!callHistory) return errorResponse(res, 'Call not found', 404);

  await callHistory.update({ status: 'missed', endedAt: new Date() });
  await Booking.update({ status: BOOKING_STATUS.MISSED }, { where: { id: callHistory.bookingId } });

  return successResponse(res, 'Call marked as missed');
});

module.exports = { initiateCall, endCall, getCallHistory, markMissed };
