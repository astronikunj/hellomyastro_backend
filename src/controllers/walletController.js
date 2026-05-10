'use strict';

const { v4: uuidv4 } = require('uuid');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, createdResponse, errorResponse } = require('../utils/responseHandler');
const { getPagination } = require('../utils/validators');
const { Wallet, WalletTransaction } = require('../models');
const { getOrCreateWallet, creditWallet, refundWallet } = require('../services/walletService');
const { createOrder, verifyPayment } = require('../services/paymentService');

/**
 * @route GET /api/wallet
 * @desc Get current user wallet balance
 */
const getWallet = asyncHandler(async (req, res) => {
  const wallet = await getOrCreateWallet(req.user.id);
  return successResponse(res, 'Wallet fetched', wallet);
});

/**
 * @route POST /api/wallet/recharge/create-order
 * @desc Create a Razorpay order for wallet recharge
 */
const createRechargeOrder = asyncHandler(async (req, res) => {
  const { amount } = req.body; // Amount in INR
  if (!amount || amount < 10) return errorResponse(res, 'Minimum recharge amount is ₹10', 400);

  const receiptId = `wallet_${req.user.id}_${uuidv4().slice(0, 8)}`;
  const amountInPaise = Math.round(parseFloat(amount) * 100);

  const order = await createOrder(amountInPaise, receiptId);

  return createdResponse(res, 'Order created', {
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    receipt: order.receipt,
    key: process.env.RAZORPAY_KEY_ID,
  });
});

/**
 * @route POST /api/wallet/recharge/verify
 * @desc Verify Razorpay payment and credit wallet
 */
const verifyRecharge = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return errorResponse(res, 'Payment details are incomplete', 400);
  }

  const isValid = verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);
  if (!isValid) return errorResponse(res, 'Invalid payment signature', 400);

  const amountInINR = parseFloat(amount) / 100; // Convert paise to INR

  const { wallet } = await creditWallet(
    req.user.id,
    amountInINR,
    `Wallet recharge via Razorpay`,
    razorpay_payment_id,
    'razorpay'
  );

  return successResponse(res, 'Wallet recharged successfully', {
    newBalance: wallet.balance,
    amountAdded: amountInINR,
  });
});

/**
 * @route GET /api/wallet/transactions
 * @desc Get paginated transaction history
 */
const getTransactions = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const wallet = await Wallet.findOne({ where: { userId: req.user.id } });
  if (!wallet) return errorResponse(res, 'Wallet not found', 404);

  const where = { walletId: wallet.id };
  if (req.query.type) where.type = req.query.type;

  const { count, rows } = await WalletTransaction.findAndCountAll({
    where,
    limit,
    offset,
    order: [['createdAt', 'DESC']],
  });

  return res.status(200).json({
    success: true,
    message: 'Transactions fetched',
    data: rows,
    pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
  });
});

/**
 * @route POST /api/wallet/refund
 * @desc Admin-initiated refund
 */
const initiateRefund = asyncHandler(async (req, res) => {
  const { userId, amount, reason } = req.body;
  if (!userId || !amount) return errorResponse(res, 'userId and amount are required', 400);

  const { wallet } = await refundWallet(userId, amount, reason || 'Admin refund', null);
  return successResponse(res, 'Refund processed', { newBalance: wallet.balance });
});

module.exports = { getWallet, createRechargeOrder, verifyRecharge, getTransactions, initiateRefund };
