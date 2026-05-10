'use strict';

const crypto = require('crypto');
const { User } = require('../models');
const { OTP_EXPIRY_MINUTES } = require('../utils/constants');

/**
 * Generate a 6-digit numeric OTP
 */
const generateOTP = () => {
  return String(Math.floor(100000 + Math.random() * 900000));
};

/**
 * Save OTP to user record with expiry
 * @param {number} userId
 * @returns {string} plaintext OTP (to be sent via SMS/email)
 */
const saveOTP = async (userId) => {
  const otp = generateOTP();
  const expiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await User.update({ otp, otpExpiry: expiry }, { where: { id: userId } });

  return otp;
};

/**
 * Verify OTP — checks value and expiry
 * @param {number} userId
 * @param {string} inputOtp
 * @returns {{ valid: boolean, reason?: string }}
 */
const verifyOTP = async (userId, inputOtp) => {
  const user = await User.findByPk(userId, { attributes: ['id', 'otp', 'otpExpiry'] });

  if (!user || !user.otp) return { valid: false, reason: 'No OTP found' };
  if (user.otp !== inputOtp) return { valid: false, reason: 'Invalid OTP' };
  if (new Date() > new Date(user.otpExpiry)) return { valid: false, reason: 'OTP expired' };

  // Clear OTP after successful verification
  await User.update({ otp: null, otpExpiry: null, isVerified: true }, { where: { id: userId } });

  return { valid: true };
};

/**
 * Send OTP via SMS (Twilio integration stub)
 * Replace with your preferred OTP provider
 */
const sendSmsOTP = async (phone, otp) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`📱 [DEV] OTP for ${phone}: ${otp}`);
    return true;
  }

  // --- Twilio integration ---
  // const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  // await client.messages.create({
  //   body: `Your Astrolly OTP is: ${otp}. Valid for ${OTP_EXPIRY_MINUTES} minutes.`,
  //   from: process.env.TWILIO_PHONE_NUMBER,
  //   to: `+91${phone}`,
  // });

  return true;
};

/**
 * Generate a secure password reset token
 */
const generatePasswordResetToken = () => {
  const token = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const expiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
  return { token, hashedToken, expiry };
};

module.exports = { generateOTP, saveOTP, verifyOTP, sendSmsOTP, generatePasswordResetToken };
