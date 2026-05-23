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
const { createSkill, updateSkill, deleteSkill } = require('../controllers/skillController');
const { createGift, updateGift, deleteGift } = require('../controllers/giftController');
const { createBlog, updateBlog, deleteBlog } = require('../controllers/blogController');
const { getCoupons, createCoupon, deleteCoupon } = require('../controllers/couponController');
const { getAllWithdrawals, updateWithdrawalStatus } = require('../controllers/withdrawController');

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

// Skill management
router.post('/skills', createSkill);
router.put('/skills/:id', updateSkill);
router.delete('/skills/:id', deleteSkill);

// Gift management
router.post('/gifts', createGift);
router.put('/gifts/:id', updateGift);
router.delete('/gifts/:id', deleteGift);

// Blog management
router.post('/blogs', createBlog);
router.put('/blogs/:id', updateBlog);
router.delete('/blogs/:id', deleteBlog);

// Coupon management
router.get('/coupons', getCoupons);
router.post('/coupons', createCoupon);
router.delete('/coupons/:id', deleteCoupon);

// Withdrawal management
router.get('/withdrawals', getAllWithdrawals);
router.put('/withdrawals/:id/status', updateWithdrawalStatus);

module.exports = router;
