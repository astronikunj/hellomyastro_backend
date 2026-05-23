'use strict';

const { AstrologyVideo, Popup, sequelize } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const asyncHandler = require('../utils/asyncHandler');
const { Op } = require('sequelize');

/**
 * Get Astrology Videos
 */
const getAstrologyVideo = asyncHandler(async (req, res) => {
  const videos = await AstrologyVideo.findAll({
    order: [['createdAt', 'DESC']]
  });
  return successResponse(res, 'Astrology videos fetched successfully', { recordList: videos });
});

/**
 * Get Popups
 */
const getPopup = asyncHandler(async (req, res) => {
  const popups = await Popup.findAll({
    order: [['createdAt', 'DESC']]
  });
  return successResponse(res, 'Popups fetched successfully', { recordList: popups });
});

module.exports = {
  getAstrologyVideo,
  getPopup
};
