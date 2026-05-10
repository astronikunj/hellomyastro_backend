'use strict';

const crypto = require('crypto');
const { body } = require('express-validator');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, createdResponse, errorResponse } = require('../utils/responseHandler');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/generateToken');
const { saveOTP, verifyOTP, sendSmsOTP, generatePasswordResetToken } = require('../services/otpService');
const { getOrCreateWallet } = require('../services/walletService');
const { User } = require('../models');

// ===========================================================
// VALIDATION RULES (used in routes)
// ===========================================================
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').optional().isEmail().withMessage('Invalid email'),
  body('phone').optional().isMobilePhone('en-IN').withMessage('Invalid phone number'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['user', 'astrologer']).withMessage('Invalid role'),
];

const loginValidation = [
  body('email').optional().isEmail(),
  body('phone').optional().isMobilePhone('en-IN'),
  body('password').notEmpty().withMessage('Password required'),
];

// ===========================================================
// CONTROLLERS
// ===========================================================

/**
 * @route POST /api/auth/register
 * @desc Register a new user or astrologer
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password, role = 'user', dateOfBirth, gender } = req.body;

  if (!email && !phone) {
    return errorResponse(res, 'Email or phone is required', 400);
  }

  // Check if user already exists
  const existingUser = await User.findOne({
    where: email ? { email } : { phone },
  });
  if (existingUser) {
    return errorResponse(res, 'User already exists with this email/phone', 409);
  }

  const user = await User.create({ name, email, phone, password, role, dateOfBirth, gender });

  // Auto-create wallet
  await getOrCreateWallet(user.id);

  const accessToken = generateAccessToken({ id: user.id, role: user.role });
  const refreshToken = generateRefreshToken({ id: user.id });
  await user.update({ refreshToken });

  return createdResponse(res, 'Registration successful', {
    user: user.toSafeObject(),
    accessToken,
    refreshToken,
  });
});

/**
 * @route POST /api/auth/login
 * @desc Login with email/phone + password
 */
const login = asyncHandler(async (req, res) => {
  const { email, phone, password } = req.body;

  if (!email && !phone) {
    return errorResponse(res, 'Email or phone is required', 400);
  }

  const user = await User.findOne({ where: email ? { email } : { phone } });
  if (!user) return errorResponse(res, 'Invalid credentials', 401);
  if (user.isBanned) return errorResponse(res, 'Account banned', 403);
  if (!user.isActive) return errorResponse(res, 'Account deactivated', 403);
  if (!user.password) return errorResponse(res, 'Please login with OTP', 400);

  const isMatch = await user.comparePassword(password);
  if (!isMatch) return errorResponse(res, 'Invalid credentials', 401);

  const accessToken = generateAccessToken({ id: user.id, role: user.role });
  const refreshToken = generateRefreshToken({ id: user.id });
  await user.update({ refreshToken, lastLogin: new Date() });

  return successResponse(res, 'Login successful', {
    user: user.toSafeObject(),
    accessToken,
    refreshToken,
  });
});

/**
 * @route POST /api/auth/send-otp
 * @desc Send OTP to phone number
 */
const sendOTP = asyncHandler(async (req, res) => {
  const { phone } = req.body;
  if (!phone) return errorResponse(res, 'Phone is required', 400);

  let user = await User.findOne({ where: { phone } });
  if (!user) {
    // Auto-register on first OTP
    user = await User.create({ name: 'User', phone, role: 'user' });
    await getOrCreateWallet(user.id);
  }

  const otp = await saveOTP(user.id);
  await sendSmsOTP(phone, otp);

  return successResponse(res, 'OTP sent successfully', { userId: user.id });
});

/**
 * @route POST /api/auth/verify-otp
 * @desc Verify OTP and return tokens
 */
const verifyOTPController = asyncHandler(async (req, res) => {
  const { userId, otp } = req.body;
  if (!userId || !otp) return errorResponse(res, 'userId and otp are required', 400);

  const result = await verifyOTP(userId, otp);
  if (!result.valid) return errorResponse(res, result.reason, 400);

  const user = await User.findByPk(userId);
  const accessToken = generateAccessToken({ id: user.id, role: user.role });
  const refreshToken = generateRefreshToken({ id: user.id });
  await user.update({ refreshToken, lastLogin: new Date() });

  return successResponse(res, 'OTP verified', {
    user: user.toSafeObject(),
    accessToken,
    refreshToken,
  });
});

/**
 * @route POST /api/auth/refresh-token
 * @desc Issue new access token using refresh token
 */
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;
  if (!token) return errorResponse(res, 'Refresh token required', 400);

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    return errorResponse(res, 'Invalid or expired refresh token', 401);
  }

  const user = await User.findByPk(decoded.id);
  if (!user || user.refreshToken !== token) {
    return errorResponse(res, 'Token mismatch. Please login again.', 401);
  }

  const accessToken = generateAccessToken({ id: user.id, role: user.role });
  return successResponse(res, 'Token refreshed', { accessToken });
});

/**
 * @route POST /api/auth/forgot-password
 * @desc Send password reset link
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) return errorResponse(res, 'Email is required', 400);

  const user = await User.findOne({ where: { email } });
  if (!user) {
    // Don't reveal if email exists
    return successResponse(res, 'If the email exists, a reset link has been sent.');
  }

  const { token, hashedToken, expiry } = generatePasswordResetToken();
  await user.update({ passwordResetToken: hashedToken, passwordResetExpiry: expiry });

  // In production, send via nodemailer
  console.log(`🔑 Password reset token for ${email}: ${token}`);

  return successResponse(res, 'Password reset link sent to your email.');
});

/**
 * @route POST /api/auth/reset-password
 * @desc Reset password using token from email
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return errorResponse(res, 'Token and new password required', 400);

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    where: { passwordResetToken: hashedToken },
  });

  if (!user || !user.passwordResetExpiry || new Date() > user.passwordResetExpiry) {
    return errorResponse(res, 'Reset token is invalid or expired', 400);
  }

  await user.update({
    password: newPassword,
    passwordResetToken: null,
    passwordResetExpiry: null,
  });

  return successResponse(res, 'Password reset successful. Please login.');
});

/**
 * @route POST /api/auth/logout
 * @desc Invalidate refresh token
 */
const logout = asyncHandler(async (req, res) => {
  await req.user.update({ refreshToken: null });
  return successResponse(res, 'Logged out successfully');
});

module.exports = {
  register,
  registerValidation,
  login,
  loginValidation,
  sendOTP,
  verifyOTPController,
  refreshToken,
  forgotPassword,
  resetPassword,
  logout,
};
