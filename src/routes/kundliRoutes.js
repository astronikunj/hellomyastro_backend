'use strict';

const express = require('express');
const router = express.Router();
const kundliController = require('../controllers/kundliController');
const { protect } = require('../middleware/authMiddleware');

// All kundli routes require authentication
router.use(protect);

router.post('/add', kundliController.addKundli);
router.post('/addnew', kundliController.addKundli); // Alias for addnew if needed
router.post('/getkundali', kundliController.getKundalis);
router.post('/get/:id', kundliController.getKundali);
router.post('/update/:id', kundliController.updateKundali);
router.post('/delete', kundliController.deleteKundali);
router.post('/show/:id', kundliController.kundaliShow);
router.post('/price', kundliController.getKundaliPrice);

router.post('/get/panchang', kundliController.getPanchang);

router.post('/removeFromTrackPlanet', kundliController.removeFromTrackPlanet);
router.post('/addForTrackPlanet', kundliController.addForTrackPlanet);
router.post('/getForTrackPlanet', kundliController.getForTrackPlanet);

// Matching
router.post('/matching/add', kundliController.addKundaliMatching);
router.post('/matching/report', kundliController.getMatchReport);

module.exports = router;
