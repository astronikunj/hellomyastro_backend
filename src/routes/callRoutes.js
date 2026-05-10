'use strict';

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { initiateCall, endCall, getCallHistory, markMissed } = require('../controllers/callController');

router.use(protect);

router.post('/initiate/:bookingId', initiateCall);
router.put('/:callHistoryId/end', endCall);
router.put('/:callHistoryId/missed', markMissed);
router.get('/history', getCallHistory);

module.exports = router;
