'use strict';

const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/add', ticketController.addTicket);
router.post('/get', ticketController.getTicket);

module.exports = router;
