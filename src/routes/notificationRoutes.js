'use strict';

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const { getNotifications, markRead, markAllRead, deleteNotification, broadcast } = require('../controllers/notificationController');

router.use(protect);

router.get('/', getNotifications);
router.put('/read-all', markAllRead);
router.put('/:id/read', markRead);
router.delete('/:id', deleteNotification);
router.post('/broadcast', adminOnly, broadcast);

module.exports = router;
