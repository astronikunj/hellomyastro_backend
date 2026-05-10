'use strict';

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createBooking, acceptBooking, rejectBooking,
  cancelBooking, completeBooking, getBookings, getBookingById,
} = require('../controllers/bookingController');

router.use(protect);

router.post('/', createBooking);
router.get('/', getBookings);
router.get('/:id', getBookingById);
router.put('/:id/accept', acceptBooking);
router.put('/:id/reject', rejectBooking);
router.put('/:id/cancel', cancelBooking);
router.put('/:id/complete', completeBooking);

module.exports = router;
