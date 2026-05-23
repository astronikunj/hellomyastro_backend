'use strict';

const express = require('express');
const router = express.Router();
const liveAstroController = require('../controllers/liveAstroController');
const { protect } = require('../middleware/authMiddleware');

router.post('/add', protect, liveAstroController.addLiveAstrologer);
router.post('/get', liveAstroController.getLiveAstrologer);
router.post('/endSession', protect, liveAstroController.endLiveSession);

// Live User / Chat
router.post('/addLiveUser', protect, liveAstroController.addLiveUser);
router.get('/getLiveUser', protect, liveAstroController.getLiveUser);

module.exports = router;
