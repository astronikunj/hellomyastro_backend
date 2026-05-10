'use strict';

const axios = require('axios').default;

/**
 * Kundli / Astrology API Service
 * Wraps an external astrology API (e.g., AstroAPI / VedicRishiAstro)
 * Replace KUNDLI_API_URL and KUNDLI_API_KEY in .env with your provider credentials
 */

const apiClient = axios.create({
  baseURL: process.env.KUNDLI_API_URL || 'https://api.vedicastroapi.com/v3-json',
  headers: {
    'x-api-key': process.env.KUNDLI_API_KEY,
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

/**
 * Generate birth chart (Kundli)
 * @param {object} params - { dob, tob, lat, lon, tz, lang }
 */
const generateKundli = async (params) => {
  try {
    const response = await apiClient.get('/horoscope/birth-chart', { params });
    return response.data;
  } catch (err) {
    throw new Error(`Kundli API error: ${err.response?.data?.message || err.message}`);
  }
};

/**
 * Get daily horoscope for a zodiac sign
 * @param {string} sign - e.g. 'aries', 'taurus'
 * @param {string} lang - e.g. 'en'
 */
const getDailyHoroscope = async (sign, lang = 'en') => {
  try {
    const response = await apiClient.get('/horoscope/daily-sun', {
      params: { zodiac: sign, lang, type: 'daily' },
    });
    return response.data;
  } catch (err) {
    throw new Error(`Horoscope API error: ${err.response?.data?.message || err.message}`);
  }
};

/**
 * Kundli matching (Gun Milan / Compatibility)
 * @param {object} boy - { dob, tob, lat, lon, tz }
 * @param {object} girl - { dob, tob, lat, lon, tz }
 */
const getKundliMatching = async (boy, girl) => {
  try {
    const response = await apiClient.get('/matching/gun-milan', {
      params: {
        boy_dob: boy.dob,
        boy_tob: boy.tob,
        boy_lat: boy.lat,
        boy_lon: boy.lon,
        boy_tz: boy.tz,
        girl_dob: girl.dob,
        girl_tob: girl.tob,
        girl_lat: girl.lat,
        girl_lon: girl.lon,
        girl_tz: girl.tz,
        lang: 'en',
      },
    });
    return response.data;
  } catch (err) {
    throw new Error(`Matching API error: ${err.response?.data?.message || err.message}`);
  }
};

/**
 * Get weekly horoscope
 * @param {string} sign
 */
const getWeeklyHoroscope = async (sign) => {
  try {
    const response = await apiClient.get('/horoscope/weekly-sun', {
      params: { zodiac: sign, lang: 'en', type: 'weekly' },
    });
    return response.data;
  } catch (err) {
    throw new Error(`Weekly horoscope error: ${err.response?.data?.message || err.message}`);
  }
};

/**
 * Get monthly horoscope
 * @param {string} sign
 */
const getMonthlyHoroscope = async (sign) => {
  try {
    const response = await apiClient.get('/horoscope/monthly-sun', {
      params: { zodiac: sign, lang: 'en', type: 'monthly' },
    });
    return response.data;
  } catch (err) {
    throw new Error(`Monthly horoscope error: ${err.response?.data?.message || err.message}`);
  }
};

module.exports = {
  generateKundli,
  getDailyHoroscope,
  getKundliMatching,
  getWeeklyHoroscope,
  getMonthlyHoroscope,
};
