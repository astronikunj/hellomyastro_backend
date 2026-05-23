'use strict';

const { Horoscope, HoroscopeSign, MstControl, HoroscopeFeedback, sequelize } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const asyncHandler = require('../utils/asyncHandler');
const { HOROSCOPE_TYPES } = require('../utils/constants');
const { Op } = require('sequelize');
const moment = require('moment');

/**
 * Get Daily/Weekly/Yearly Horoscope for a sign
 */
const getDailyHoroscope = asyncHandler(async (req, res) => {
  const { horoscopeSignId, langcode = 'en' } = req.body;

  const dt = moment().format('YYYY-MM-DD');
  const startOfWeek = moment().startOf('isoWeek').format('YYYY-MM-DD');
  const endOfWeek = moment().endOf('isoWeek').format('YYYY-MM-DD');
  const startOfYear = moment().startOf('year').format('YYYY-MM-DD');
  const endOfYear = moment().endOf('year').format('YYYY-MM-DD');

  const mstData = await MstControl.findAll();
  const astroApiCallType = mstData.length > 0 ? mstData[0].astro_api_call_type : null;

  const sign = await HoroscopeSign.findByPk(horoscopeSignId);
  if (!sign) {
    return errorResponse(res, 'Horoscope sign not found', 404);
  }
  const signName = sign.name;

  const getHoro = async (type, startDate, endDate, date) => {
    let where = { zodiac: signName, type, langcode };
    if (date) where.date = date;
    if (startDate && endDate) {
      where.start_date = { [Op.gte]: startDate };
      where.end_date = { [Op.lte]: endDate };
    }

    let horos = await Horoscope.findAll({
      where,
      attributes: {
        include: [
          [sequelize.fn('REPLACE', sequelize.col('lucky_color_code'), '#', '0xff'), 'color_code']
        ]
      }
    });

    if (horos.length === 0 && langcode !== 'en') {
      where.langcode = 'en';
      horos = await Horoscope.findAll({
        where,
        attributes: {
          include: [
            [sequelize.fn('REPLACE', sequelize.col('lucky_color_code'), '#', '0xff'), 'color_code']
          ]
        }
      });
    }
    return horos;
  };

  const [todayHoroscope, weeklyHoroscope, yearlyHoroscope] = await Promise.all([
    getHoro(HOROSCOPE_TYPES.DAILY, null, null, dt),
    getHoro(HOROSCOPE_TYPES.WEEKLY, startOfWeek, endOfWeek, null),
    getHoro(HOROSCOPE_TYPES.YEARLY, startOfYear, endOfYear, null)
  ]);

  return successResponse(res, 'Horoscope fetched successfully', {
    astroApiCallType,
    vedicList: {
      todayHoroscope,
      weeklyHoroscope,
      yearlyHoroscope
    }
  });
});

/**
 * Get Horoscope Insights (Admin/Internal)
 */
const getHoroscopeInsight = asyncHandler(async (req, res) => {
  const { filterSign, horoscopeType = 'Weekly' } = req.body;

  const where = {
    horoscopeSignId: filterSign || 1,
    horoscopeType: horoscopeType
  };

  const records = await Horoscope.findAll({ where });

  return successResponse(res, 'Horoscope insights fetched successfully', { recordList: records });
});

/**
 * Get Horoscope Signs
 */
const getHoroscopeSigns = asyncHandler(async (req, res) => {
  const { s, startIndex = 0, fetchRecord } = req.body;

  const where = {};
  if (s) {
    where.name = { [Op.like]: `%${s}%` };
  }

  const { count, rows } = await HoroscopeSign.findAndCountAll({
    where,
    order: [['id', 'DESC']],
    offset: parseInt(startIndex),
    limit: fetchRecord ? parseInt(fetchRecord) : undefined
  });

  return successResponse(res, 'Horoscope signs fetched successfully', {
    recordList: rows,
    totalRecords: count
  });
});

/**
 * Get Active Horoscope Signs
 */
const getActiveHoroscopeSigns = asyncHandler(async (req, res) => {
  const signs = await HoroscopeSign.findAll({
    where: { isActive: true }
  });

  return successResponse(res, 'Active horoscope signs fetched successfully', { recordList: signs });
});

/**
 * Add Horoscope Feedback
 */
const addHoroscopeFeedback = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { feedback, feedbacktype } = req.body;

  await HoroscopeFeedback.create({
    userId,
    feedback,
    feedbacktype
  });

  return successResponse(res, 'Feedback added successfully');
});

module.exports = {
  getDailyHoroscope,
  getHoroscopeInsight,
  getHoroscopeSigns,
  getActiveHoroscopeSigns,
  addHoroscopeFeedback
};
