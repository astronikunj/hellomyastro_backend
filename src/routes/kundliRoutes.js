'use strict';

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  generateKundliController,
  dailyHoroscope,
  weeklyHoroscope,
  monthlyHoroscope,
  kundliMatch,
} = require('../controllers/kundliController');

// Public routes — no auth required
router.get('/horoscope/daily/:sign', dailyHoroscope);
router.get('/horoscope/weekly/:sign', weeklyHoroscope);
router.get('/horoscope/monthly/:sign', monthlyHoroscope);

// Protected routes
router.post('/generate', protect, generateKundliController);
router.post('/match', protect, kundliMatch);

module.exports = router;
