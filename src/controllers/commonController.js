'use strict';

const { Language, MaritalStatus, ReportType, SystemFlag, sequelize } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const asyncHandler = require('../utils/asyncHandler');
const { Op } = require('sequelize');

/**
 * Get All Languages
 */
const getLanguages = asyncHandler(async (req, res) => {
  const languages = await Language.findAll();
  return successResponse(res, 'Languages fetched successfully', { recordList: languages });
});

/**
 * Get All Marital Statuses
 */
const getMaritalStatus = asyncHandler(async (req, res) => {
  const statuses = await MaritalStatus.findAll();
  return successResponse(res, 'Marital statuses fetched successfully', { recordList: statuses });
});

/**
 * Get All Report Types
 */
const getReportTypes = asyncHandler(async (req, res) => {
  const types = await ReportType.findAll();
  return successResponse(res, 'Report types fetched successfully', { recordList: types });
});

/**
 * Get All System Flags
 */
const getSystemFlags = asyncHandler(async (req, res) => {
  const flags = await SystemFlag.findAll();
  return successResponse(res, 'System flags fetched successfully', { recordList: flags });
});

/**
 * Get App Languages (configured via SystemFlag)
 */
const getAppLanguages = asyncHandler(async (req, res) => {
  const langFlag = await SystemFlag.findOne({ where: { name: 'Language' } });
  
  if (!langFlag || !langFlag.value) {
    const allLangs = await Language.findAll();
    return successResponse(res, 'Languages fetched successfully', { recordList: allLangs });
  }

  const langIds = langFlag.value.split(',').map(id => parseInt(id.trim()));
  const languages = await Language.findAll({
    where: { id: { [Op.in]: langIds } }
  });

  return successResponse(res, 'App languages fetched successfully', { recordList: languages });
});

module.exports = {
  getLanguages,
  getMaritalStatus,
  getReportTypes,
  getSystemFlags,
  getAppLanguages
};
