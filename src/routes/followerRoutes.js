'use strict';

const express = require('express');
const router = express.Router();
const followerController = require('../controllers/followerController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/add', followerController.addFollowing);
router.post('/update', followerController.updateFollowing);
router.post('/getFollowing', followerController.getFollowing);
router.post('/getAstrologerFollower', followerController.getFollowers);

module.exports = router;
