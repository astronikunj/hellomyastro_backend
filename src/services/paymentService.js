'use strict';

const crypto = require('crypto');
const razorpay = require('../config/razorpay');

/**
 * Create a Razorpay order for wallet recharge
 * @param {number} amountInPaise - Amount in smallest currency unit (paise)
 * @param {string} receiptId - Unique receipt identifier
 * @returns {object} Razorpay order object
 */
const createOrder = async (amountInPaise, receiptId) => {
  const order = await razorpay.orders.create({
    amount: amountInPaise,
    currency: 'INR',
    receipt: receiptId,
    payment_capture: 1,
  });
  return order;
};

/**
 * Verify Razorpay payment signature
 * @param {string} orderId
 * @param {string} paymentId
 * @param {string} signature - signature from client
 * @returns {boolean}
 */
const verifyPayment = (orderId, paymentId, signature) => {
  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');
  return expectedSignature === signature;
};

/**
 * Verify Razorpay webhook signature
 * @param {string} rawBody - raw request body string
 * @param {string} signature - X-Razorpay-Signature header
 * @returns {boolean}
 */
const verifyWebhookSignature = (rawBody, signature) => {
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');
  return expectedSignature === signature;
};

/**
 * Fetch Razorpay payment details by payment ID
 */
const fetchPayment = async (paymentId) => {
  return await razorpay.payments.fetch(paymentId);
};

module.exports = { createOrder, verifyPayment, verifyWebhookSignature, fetchPayment };
