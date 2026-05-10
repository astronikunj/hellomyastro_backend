'use strict';

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { uploadProfileImage, handleUploadError } = require('../middleware/uploadMiddleware');
const {
  getProfile, updateProfile, uploadAvatar,
  getBookingHistory, getNotifications, markNotificationRead,
  addFavorite, removeFavorite, getFavorites, updateFcmToken,
} = require('../controllers/userController');

// All routes require authentication
router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/upload-avatar', uploadProfileImage, handleUploadError, uploadAvatar);
router.put('/fcm-token', updateFcmToken);

router.get('/booking-history', getBookingHistory);
router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationRead);

router.get('/favorites', getFavorites);
router.post('/favorites/:astrologerId', addFavorite);
router.delete('/favorites/:astrologerId', removeFavorite);

module.exports = router;
