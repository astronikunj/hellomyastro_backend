'use strict';

const asyncHandler = require('../utils/asyncHandler');
const { successResponse, createdResponse, errorResponse } = require('../utils/responseHandler');
const {
  generateKundli,
  getDailyHoroscope,
  getKundliMatching,
  getWeeklyHoroscope,
  getMonthlyHoroscope,
} = require('../services/kundliService');

/**
 * @route POST /api/kundli/generate
 * @desc Generate birth chart (Kundli) from user birth details
 */
const generateKundliController = asyncHandler(async (req, res) => {
  const { dob, tob, lat, lon, tz, lang = 'en' } = req.body;
  if (!dob || !tob || !lat || !lon) {
    return errorResponse(res, 'dob, tob, lat, lon are required', 400);
  }
  const data = await generateKundli({ dob, tob, lat, lon, tz: tz || 5.5, lang });
  return successResponse(res, 'Kundli generated', data);
});

/**
 * @route GET /api/kundli/horoscope/daily/:sign
 * @desc Get daily horoscope for zodiac sign
 */
const dailyHoroscope = asyncHandler(async (req, res) => {
  const { sign } = req.params;
  const validSigns = ['aries','taurus','gemini','cancer','leo','virgo','libra','scorpio','sagittarius','capricorn','aquarius','pisces'];
  if (!validSigns.includes(sign.toLowerCase())) {
    return errorResponse(res, 'Invalid zodiac sign', 400);
  }
  const data = await getDailyHoroscope(sign.toLowerCase(), req.query.lang || 'en');
  return successResponse(res, 'Daily horoscope fetched', data);
});

/**
 * @route GET /api/kundli/horoscope/weekly/:sign
 * @desc Get weekly horoscope
 */
const weeklyHoroscope = asyncHandler(async (req, res) => {
  const data = await getWeeklyHoroscope(req.params.sign.toLowerCase());
  return successResponse(res, 'Weekly horoscope fetched', data);
});

/**
 * @route GET /api/kundli/horoscope/monthly/:sign
 * @desc Get monthly horoscope
 */
const monthlyHoroscope = asyncHandler(async (req, res) => {
  const data = await getMonthlyHoroscope(req.params.sign.toLowerCase());
  return successResponse(res, 'Monthly horoscope fetched', data);
});

/**
 * @route POST /api/kundli/match
 * @desc Kundli matching (Gun Milan)
 */
const kundliMatch = asyncHandler(async (req, res) => {
  const { boy, girl } = req.body;
  if (!boy || !girl) return errorResponse(res, 'boy and girl birth details are required', 400);
  const data = await getKundliMatching(boy, girl);
  return successResponse(res, 'Kundli matching completed', data);
});

module.exports = {
  generateKundliController,
  dailyHoroscope,
  weeklyHoroscope,
  monthlyHoroscope,
  kundliMatch,
};
