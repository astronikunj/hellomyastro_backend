'use strict';

const asyncHandler = require('../utils/asyncHandler');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { getPagination } = require('../utils/validators');
const { Notification } = require('../models');
const { broadcastNotification } = require('../services/notificationService');

/**
 * @route GET /api/notifications
 * @desc Get all notifications for current user
 */
const getNotifications = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const where = { userId: req.user.id };
  if (req.query.type) where.type = req.query.type;
  if (req.query.isRead !== undefined) where.isRead = req.query.isRead === 'true';

  const { count, rows } = await Notification.findAndCountAll({
    where,
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
 * @route PUT /api/notifications/:id/read
 * @desc Mark notification as read
 */
const markRead = asyncHandler(async (req, res) => {
  const notif = await Notification.findOne({ where: { id: req.params.id, userId: req.user.id } });
  if (!notif) return errorResponse(res, 'Notification not found', 404);
  await notif.update({ isRead: true, readAt: new Date() });
  return successResponse(res, 'Marked as read');
});

/**
 * @route PUT /api/notifications/read-all
 * @desc Mark all notifications as read
 */
const markAllRead = asyncHandler(async (req, res) => {
  await Notification.update(
    { isRead: true, readAt: new Date() },
    { where: { userId: req.user.id, isRead: false } }
  );
  return successResponse(res, 'All notifications marked as read');
});

/**
 * @route DELETE /api/notifications/:id
 * @desc Delete a notification
 */
const deleteNotification = asyncHandler(async (req, res) => {
  const notif = await Notification.findOne({ where: { id: req.params.id, userId: req.user.id } });
  if (!notif) return errorResponse(res, 'Notification not found', 404);
  await notif.destroy();
  return successResponse(res, 'Notification deleted');
});

/**
 * @route POST /api/notifications/broadcast (admin only)
 * @desc Send broadcast notification to all users
 */
const broadcast = asyncHandler(async (req, res) => {
  const { userIds, title, body, type = 'admin' } = req.body;
  if (!userIds || !title || !body) return errorResponse(res, 'userIds, title, and body required', 400);

  await broadcastNotification(userIds, title, body, type);
  return successResponse(res, `Notification broadcast to ${userIds.length} users`);
});

module.exports = { getNotifications, markRead, markAllRead, deleteNotification, broadcast };
