'use strict';

const axios = require('axios').default;
const fs = require('fs');
const path = require('path');
const { SystemFlag } = require('../models');

/**
 * Kundli / Astrology API Service
 * Wraps an external astrology API (Vedic Astro API)
 */

const getApiKey = async () => {
  const flag = await SystemFlag.findOne({ where: { name: 'vedicAstroAPI' } });
  return flag ? flag.value : process.env.KUNDLI_API_KEY;
};

/**
 * Generate birth chart (Kundli)
 */
const generateKundli = async (params) => {
  const apiKey = await getApiKey();
  try {
    const response = await axios.get('https://api.vedicastroapi.com/v3-json/horoscope/birth-chart', {
      params: { ...params, api_key: apiKey },
    });
    return response.data;
  } catch (err) {
    throw new Error(`Kundli API error: ${err.response?.data?.message || err.message}`);
  }
};

/**
 * Get daily horoscope
 */
const getDailyHoroscope = async (sign, lang = 'en') => {
  const apiKey = await getApiKey();
  try {
    const response = await axios.get('https://api.vedicastroapi.com/v3-json/horoscope/daily-sun', {
      params: { zodiac: sign, lang, type: 'daily', api_key: apiKey },
    });
    return response.data;
  } catch (err) {
    throw new Error(`Horoscope API error: ${err.response?.data?.message || err.message}`);
  }
};

/**
 * Kundli matching
 */
const getKundliMatching = async (boy, girl) => {
  const apiKey = await getApiKey();
  try {
    const response = await axios.get('https://api.vedicastroapi.com/v3-json/matching/gun-milan', {
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
        api_key: apiKey,
      },
    });
    return response.data;
  } catch (err) {
    throw new Error(`Matching API error: ${err.response?.data?.message || err.message}`);
  }
};

/**
 * Get Panchang
 */
const getPanchang = async (date, lat, lon, time = '05:20', tz = '5.5', lang = 'en') => {
  const apiKey = await getApiKey();
  try {
    const response = await axios.get('https://api.vedicastroapi.com/v3-json/panchang/panchang', {
      params: {
        api_key: apiKey,
        date,
        tz,
        lat,
        lon,
        time,
        lang,
      },
    });
    return response.data;
  } catch (err) {
    throw new Error(`Panchang API error: ${err.response?.data?.message || err.message}`);
  }
};

/**
 * Get Kundli PDF
 */
const getKundliPDF = async (params) => {
  const apiKey = await getApiKey();
  try {
    const response = await axios.get('https://api.vedicastroapi.com/v3-json/pdf/horoscope', {
      params: {
        ...params,
        api_key: apiKey,
        color: '140',
      },
    });

    if (response.data && response.data.status === 200) {
      const pdfUrl = response.data.response;
      const timestamp = Date.now();
      const fileName = `${params.name.replace(/\s+/g, '_')}_kundli_${timestamp}.pdf`;
      const relativePath = `kundli/${fileName}`;
      const absolutePath = path.join(__dirname, '../../public/kundli', fileName);

      // Ensure directory exists
      const dir = path.dirname(absolutePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Download PDF
      const pdfResponse = await axios.get(pdfUrl, { responseType: 'arraybuffer' });
      fs.writeFileSync(absolutePath, pdfResponse.data);

      return relativePath;
    }
    return null;
  } catch (err) {
    throw new Error(`Kundli PDF API error: ${err.response?.data?.message || err.message}`);
  }
};

/**
 * Get Manglik Dosha
 */
const getManglikDosha = async (params) => {
  const apiKey = await getApiKey();
  try {
    const response = await axios.get('https://api.vedicastroapi.com/v3-json/dosha/manglik-dosh', {
      params: { ...params, api_key: apiKey },
    });
    return response.data;
  } catch (err) {
    throw new Error(`Manglik Dosha error: ${err.response?.data?.message || err.message}`);
  }
};

/**
 * Get Ashtakoot Matching (North Indian)
 */
const getAshtakootMatching = async (params) => {
  const apiKey = await getApiKey();
  try {
    const response = await axios.get('https://api.vedicastroapi.com/v3-json/matching/ashtakoot', {
      params: { ...params, api_key: apiKey },
    });
    return response.data;
  } catch (err) {
    throw new Error(`Ashtakoot Matching error: ${err.response?.data?.message || err.message}`);
  }
};

/**
 * Get Dashakoot Matching (South Indian)
 */
const getDashakootMatching = async (params) => {
  const apiKey = await getApiKey();
  try {
    const response = await axios.get('https://api.vedicastroapi.com/v3-json/matching/dashakoot', {
      params: { ...params, api_key: apiKey },
    });
    return response.data;
  } catch (err) {
    throw new Error(`Dashakoot Matching error: ${err.response?.data?.message || err.message}`);
  }
};

module.exports = {
  generateKundli,
  getDailyHoroscope,
  getKundliMatching,
  getPanchang,
  getKundliPDF,
  getManglikDosha,
  getAshtakootMatching,
  getDashakootMatching,
};
