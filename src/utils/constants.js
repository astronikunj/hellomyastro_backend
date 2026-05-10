'use strict';

/**
 * App-wide constants
 */

const ROLES = {
  USER: 'user',
  ASTROLOGER: 'astrologer',
  ADMIN: 'admin',
};

const BOOKING_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  MISSED: 'missed',
};

const BOOKING_TYPES = {
  CHAT: 'chat',
  AUDIO_CALL: 'audio_call',
  VIDEO_CALL: 'video_call',
};

const TRANSACTION_TYPES = {
  CREDIT: 'credit',
  DEBIT: 'debit',
  REFUND: 'refund',
  WITHDRAWAL: 'withdrawal',
};

const NOTIFICATION_TYPES = {
  BOOKING: 'booking',
  CHAT: 'chat',
  CALL: 'call',
  PAYMENT: 'payment',
  REVIEW: 'review',
  ADMIN: 'admin',
  SYSTEM: 'system',
  PROMO: 'promo',
};

// Platform commission percentage (e.g. 20% goes to platform)
const PLATFORM_COMMISSION_PERCENT = 20;

// Minimum wallet balance required to start a session (INR)
const MIN_WALLET_BALANCE = 50;

// Default pagination values
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

// OTP expiry in minutes
const OTP_EXPIRY_MINUTES = 10;

module.exports = {
  ROLES,
  BOOKING_STATUS,
  BOOKING_TYPES,
  TRANSACTION_TYPES,
  NOTIFICATION_TYPES,
  PLATFORM_COMMISSION_PERCENT,
  MIN_WALLET_BALANCE,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
  OTP_EXPIRY_MINUTES,
};
