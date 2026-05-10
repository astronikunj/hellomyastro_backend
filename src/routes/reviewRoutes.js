'use strict';

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const { createReview, getReviews, deleteReview } = require('../controllers/reviewController');

// Public
router.get('/:astrologerId', getReviews);

// Protected
router.post('/', protect, createReview);
router.delete('/:id', protect, adminOnly, deleteReview);

module.exports = router;
