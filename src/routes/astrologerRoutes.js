'use strict';

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { astrologerOnly } = require('../middleware/astrologerMiddleware');
const { uploadProfileImage, handleUploadError } = require('../middleware/uploadMiddleware');
const {
  createProfile, getMyProfile, updateProfile,
  listAstrologers, getAstrologerById,
  updateStatus, setSchedule, getEarnings, uploadAvatar,
} = require('../controllers/astrologerController');

// Public routes
router.get('/', listAstrologers);
router.get('/:id', getAstrologerById);

// Astrologer-protected routes
router.post('/profile', protect, astrologerOnly, createProfile);
router.get('/profile/me', protect, astrologerOnly, getMyProfile);
router.put('/profile', protect, astrologerOnly, updateProfile);
router.put('/status', protect, astrologerOnly, updateStatus);
router.post('/schedule', protect, astrologerOnly, setSchedule);
router.get('/earnings', protect, astrologerOnly, getEarnings);
router.post('/upload-avatar', protect, astrologerOnly, uploadProfileImage, handleUploadError, uploadAvatar);

module.exports = router;
