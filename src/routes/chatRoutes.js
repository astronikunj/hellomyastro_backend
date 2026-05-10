'use strict';

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { uploadChatMedia, handleUploadError } = require('../middleware/uploadMiddleware');
const {
  getChatSession, getMessages, sendMessage,
  uploadChatMedia: uploadChatMediaController,
  endChat, markAllRead,
} = require('../controllers/chatController');

router.use(protect);

router.get('/booking/:bookingId', getChatSession);
router.get('/:chatId/messages', getMessages);
router.post('/:chatId/message', sendMessage);
router.post('/:chatId/media', uploadChatMedia, handleUploadError, uploadChatMediaController);
router.put('/:chatId/end', endChat);
router.put('/:chatId/messages/read', markAllRead);

module.exports = router;
