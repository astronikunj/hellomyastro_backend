'use strict';

const { HelpSupport, HelpSupportQuestion, sequelize } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const asyncHandler = require('../utils/asyncHandler');
const { Op } = require('sequelize');

/**
 * Get All Help Support Categories
 */
const getHelpSupport = asyncHandler(async (req, res) => {
  const categories = await HelpSupport.findAll();
  return successResponse(res, 'Help support categories fetched successfully', { recordList: categories });
});

/**
 * Get Questions by Support Category
 */
const getHelpSupportQuestion = asyncHandler(async (req, res) => {
  const { helpSupportId } = req.body;
  
  const where = {};
  if (helpSupportId) {
    where.helpSupportId = helpSupportId;
  }

  const questions = await HelpSupportQuestion.findAll({ where });
  return successResponse(res, 'Help support questions fetched successfully', { recordList: questions });
});

/**
 * Get Sub Sub Category (Actually just filtered questions in Laravel)
 */
const getHelpSupportSubSubCategory = asyncHandler(async (req, res) => {
  // Logic from Laravel: just returns questions for a specific category
  const { helpSupportId } = req.body;
  const questions = await HelpSupportQuestion.findAll({ 
    where: { helpSupportId } 
  });
  return successResponse(res, 'Sub categories fetched successfully', { recordList: questions });
});

module.exports = {
  getHelpSupport,
  getHelpSupportQuestion,
  getHelpSupportSubSubCategory
};
