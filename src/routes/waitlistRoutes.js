'use strict';

const express = require('express');
const router = express.Router();
const waitlistController = require('../controllers/waitlistController');
const { protect } = require('../middleware/authMiddleware');

router.post('/add', waitlistController.addWaitList);
router.post('/get', waitlistController.getWaitList);
router.post('/delete', waitlistController.deleteFromWaitList);
router.post('/updateStatus', waitlistController.editWaitList);

module.exports = router;
