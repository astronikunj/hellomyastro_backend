'use strict';

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validateMiddleware');
const { protect } = require('../middleware/authMiddleware');
const {
  register, registerValidation,
  login, loginValidation,
  sendOTP, verifyOTPController,
  refreshToken, forgotPassword,
  resetPassword, logout,
} = require('../controllers/authController');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

// POST /api/auth/register
router.post('/register', registerValidation, validate, register);

// POST /api/auth/login
router.post('/login', loginValidation, validate, login);

// POST /api/auth/send-otp
router.post('/send-otp', [body('phone').isMobilePhone('en-IN')], validate, sendOTP);

// POST /api/auth/verify-otp
router.post('/verify-otp', [body('userId').isInt(), body('otp').isLength({ min: 6, max: 6 })], validate, verifyOTPController);

// POST /api/auth/refresh-token
router.post('/refresh-token', refreshToken);

// POST /api/auth/forgot-password
router.post('/forgot-password', [body('email').isEmail()], validate, forgotPassword);

// POST /api/auth/reset-password
router.post('/reset-password', [body('token').notEmpty(), body('newPassword').isLength({ min: 6 })], validate, resetPassword);

// POST /api/auth/logout (protected)
router.post('/logout', protect, logout);

module.exports = router;
