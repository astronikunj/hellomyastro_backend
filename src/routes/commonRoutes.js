'use strict';

const express = require('express');
const router = express.Router();
const { getSkills } = require('../controllers/skillController');
const { getGifts } = require('../controllers/giftController');
const { getBlogs, getBlogById } = require('../controllers/blogController');
const { validateCoupon } = require('../controllers/couponController');
const { getStories, viewStory } = require('../controllers/storyController');

// Publicly accessible routes
router.get('/skills', getSkills);
router.get('/gifts', getGifts);
router.get('/blogs', getBlogs);
router.get('/blogs/:id', getBlogById);
router.get('/coupons/validate/:code', validateCoupon);
router.get('/stories', getStories);
router.post('/stories/:id/view', viewStory);

module.exports = router;
