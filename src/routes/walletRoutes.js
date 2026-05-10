'use strict';

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const {
  getWallet, createRechargeOrder, verifyRecharge,
  getTransactions, initiateRefund,
} = require('../controllers/walletController');

router.use(protect);

router.get('/', getWallet);
router.post('/recharge/create-order', createRechargeOrder);
router.post('/recharge/verify', verifyRecharge);
router.get('/transactions', getTransactions);
router.post('/refund', adminOnly, initiateRefund); // Admin only

module.exports = router;
