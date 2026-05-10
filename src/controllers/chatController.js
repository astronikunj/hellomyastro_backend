'use strict';

const cloudinary = require('../config/cloudinary');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { getPagination } = require('../utils/validators');
const { Chat, Message, Booking, Astrologer, User } = require('../models');
const { debitWallet } = require('../services/walletService');

/**
 * @route GET /api/chats/:bookingId
 * @desc Get or create chat session for a booking
 */
const getChatSession = asyncHandler(async (req, res) => {
  const booking = await Booking.findByPk(req.params.bookingId);
  if (!booking) return errorResponse(res, 'Booking not found', 404);

  const chat = await Chat.findOne({
    where: { bookingId: req.params.bookingId },
    include: [
      { model: User, as: 'user', attributes: ['id', 'name', 'profileImage'] },
      { model: Astrologer, as: 'astrologer', attributes: ['id', 'displayName', 'profileImage', 'chatRate'] },
    ],
  });

  if (!chat) return errorResponse(res, 'Chat not found. Booking must be accepted first.', 404);
  return successResponse(res, 'Chat session fetched', chat);
});

/**
 * @route GET /api/chats/:chatId/messages
 * @desc Get paginated messages for a chat
 */
const getMessages = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);

  const chat = await Chat.findByPk(req.params.chatId);
  if (!chat) return errorResponse(res, 'Chat not found', 404);

  const { count, rows } = await Message.findAndCountAll({
    where: { chatId: req.params.chatId, isDeleted: false },
    include: [{ model: User, as: 'sender', attributes: ['id', 'name', 'profileImage'] }],
    limit,
    offset,
    order: [['createdAt', 'ASC']],
  });

  return res.status(200).json({
    success: true,
    message: 'Messages fetched',
    data: rows,
    pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
  });
});

/**
 * @route POST /api/chats/:chatId/message
 * @desc Save a text message (REST fallback — real-time via Socket.IO)
 */
const sendMessage = asyncHandler(async (req, res) => {
  const { content, type = 'text' } = req.body;
  const chat = await Chat.findByPk(req.params.chatId);
  if (!chat) return errorResponse(res, 'Chat not found', 404);
  if (chat.status === 'ended') return errorResponse(res, 'Chat session has ended', 400);

  const message = await Message.create({
    chatId: chat.id,
    senderId: req.user.id,
    senderRole: req.user.role === 'astrologer' ? 'astrologer' : 'user',
    type,
    content,
  });

  return successResponse(res, 'Message sent', message, 201);
});

/**
 * @route POST /api/chats/:chatId/media
 * @desc Upload chat media (image/audio) to Cloudinary
 */
const uploadChatMedia = asyncHandler(async (req, res) => {
  if (!req.file) return errorResponse(res, 'No file provided', 400);

  const chat = await Chat.findByPk(req.params.chatId);
  if (!chat) return errorResponse(res, 'Chat not found', 404);

  const result = await new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: 'astrolly/chat-media', resource_type: 'auto' }, (err, r) => {
        if (err) reject(err);
        else resolve(r);
      })
      .end(req.file.buffer);
  });

  const message = await Message.create({
    chatId: chat.id,
    senderId: req.user.id,
    senderRole: req.user.role === 'astrologer' ? 'astrologer' : 'user',
    type: req.file.mimetype.startsWith('image') ? 'image' : 'audio',
    mediaUrl: result.secure_url,
  });

  return successResponse(res, 'Media sent', message, 201);
});

/**
 * @route PUT /api/chats/:chatId/end
 * @desc End a chat session
 */
const endChat = asyncHandler(async (req, res) => {
  const chat = await Chat.findByPk(req.params.chatId, {
    include: [{ model: Booking, as: 'booking' }],
  });
  if (!chat) return errorResponse(res, 'Chat not found', 404);
  if (chat.status === 'ended') return errorResponse(res, 'Chat already ended', 400);

  const endedAt = new Date();
  const durationMs = endedAt - (chat.startedAt || chat.createdAt);
  const durationMinutes = Math.ceil(durationMs / 60000);
  const ratePerMinute = parseFloat(chat.booking.ratePerMinute);
  const totalCost = durationMinutes * ratePerMinute;

  // Deduct wallet
  if (totalCost > 0) {
    await debitWallet(
      chat.userId,
      totalCost,
      `Chat session with astrologer`,
      String(chat.id),
      'booking'
    );
  }

  await chat.update({ status: 'ended', endedAt, durationMinutes, totalDeducted: totalCost });
  await Booking.update({ status: 'completed', endedAt, durationMinutes, totalAmount: totalCost }, { where: { id: chat.bookingId } });

  return successResponse(res, 'Chat ended', { durationMinutes, totalCost });
});

/**
 * @route PUT /api/chats/:chatId/messages/read
 * @desc Mark all messages as read
 */
const markAllRead = asyncHandler(async (req, res) => {
  await Message.update(
    { isRead: true, readAt: new Date() },
    { where: { chatId: req.params.chatId, senderId: { $ne: req.user.id }, isRead: false } }
  );
  return successResponse(res, 'Messages marked as read');
});

module.exports = {
  getChatSession,
  getMessages,
  sendMessage,
  uploadChatMedia,
  endChat,
  markAllRead,
};
