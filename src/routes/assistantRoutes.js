'use strict';

const express = require('express');
const router = express.Router();
const assistantController = require('../controllers/assistantController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/add', assistantController.addAssistant);
router.post('/update', assistantController.updateAssistant);
router.post('/get', assistantController.getAssistants);
router.post('/delete', assistantController.deleteAssistant);

module.exports = router;
