'use strict';

const express = require('express');
const router = express.Router();
const horoscopeController = require('../controllers/horoscopeController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/getHoroscopeSign', horoscopeController.getHoroscopeSigns);
router.post('/activeHororscopeSign', horoscopeController.getActiveHoroscopeSigns);
router.post('/getDailyHoroscope', horoscopeController.getDailyHoroscope);
router.post('/getHoroscope', horoscopeController.getHoroscopeInsight);

// Protected routes
router.post('/addHoroscopeFeedback', protect, horoscopeController.addHoroscopeFeedback);

module.exports = router;
