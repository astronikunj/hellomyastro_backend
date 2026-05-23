'use strict';

const express = require('express');
const router = express.Router();
const { getSkills } = require('../controllers/skillController');
const { getGifts } = require('../controllers/giftController');
const { getBlogs, getBlogById } = require('../controllers/blogController');
const { validateCoupon } = require('../controllers/couponController');
const { getStories, viewStory } = require('../controllers/storyController');
const { 
  getLanguages, 
  getMaritalStatus, 
  getReportTypes, 
  getSystemFlags, 
  getAppLanguages 
} = require('../controllers/commonController');
const { 
  getHelpSupport, 
  getHelpSupportQuestion, 
  getHelpSupportSubSubCategory 
} = require('../controllers/supportController');
const { 
  getAstrologyVideo, 
  getPopup 
} = require('../controllers/promoController');

// Publicly accessible routes
router.get('/skills', getSkills);
router.get('/gifts', getGifts);
router.get('/blogs', getBlogs);
router.get('/blogs/:id', getBlogById);
router.get('/coupons/validate/:code', validateCoupon);
router.get('/stories', getStories);
router.post('/stories/:id/view', viewStory);

// New common lookups
router.post('/getLanguage', getLanguages);
router.post('/getMaritalStatus', getMaritalStatus);
router.post('/getReportType', getReportTypes);
router.post('/getSystemFlag', getSystemFlags);
router.post('/getAppLanguage', getAppLanguages);

// Help & Support
router.post('/getHelpSupport', getHelpSupport);
router.post('/getHelpSupportQuestion', getHelpSupportQuestion);
router.post('/getHelpSupportSubSubCategory', getHelpSupportSubSubCategory);

// Promo & Videos
router.post('/getAstrologyVideo', getAstrologyVideo);
router.post('/getPopup', getPopup);

module.exports = router;
