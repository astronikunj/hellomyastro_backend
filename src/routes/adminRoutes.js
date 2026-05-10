'use strict';

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const { uploadBannerImage, handleUploadError } = require('../middleware/uploadMiddleware');
const {
  getDashboard,
  getUsers, banUser,
  getPendingAstrologers, approveAstrologer,
  getBanners, createBanner, updateBanner, deleteBanner,
  getReports, getRevenue,
} = require('../controllers/adminController');

// All admin routes require protect + adminOnly
router.use(protect, adminOnly);

// Dashboard
router.get('/dashboard', getDashboard);
router.get('/revenue', getRevenue);

// User management
router.get('/users', getUsers);
router.put('/users/:id/ban', banUser);

// Astrologer management
router.get('/astrologers/pending', getPendingAstrologers);
router.put('/astrologers/:id/approve', approveAstrologer);

// Banner management
router.get('/banners', getBanners);
router.post('/banners', uploadBannerImage, handleUploadError, createBanner);
router.put('/banners/:id', updateBanner);
router.delete('/banners/:id', deleteBanner);

// Reports
router.get('/reports', getReports);

module.exports = router;
