'use strict';

const { AstrologerAssistant, sequelize } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const asyncHandler = require('../utils/asyncHandler');
const { Op } = require('sequelize');

/**
 * Add Astrologer Assistant
 */
const addAssistant = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const assistant = await AstrologerAssistant.create({
    ...req.body,
    createdBy: userId,
    modifiedBy: userId
  });

  return successResponse(res, 'Assistant added successfully', { recordList: assistant });
});

/**
 * Update Astrologer Assistant
 */
const updateAssistant = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.body;

  const assistant = await AstrologerAssistant.findByPk(id);
  if (!assistant) {
    return errorResponse(res, 'Assistant not found', 404);
  }

  await assistant.update({
    ...req.body,
    modifiedBy: userId
  });

  return successResponse(res, 'Assistant updated successfully', { recordList: assistant });
});

/**
 * Get Assistants for an Astrologer
 */
const getAssistants = asyncHandler(async (req, res) => {
  const { astrologerId } = req.body;

  const assistants = await AstrologerAssistant.findAll({
    where: { astrologerId }
  });

  return successResponse(res, 'Assistants fetched successfully', { recordList: assistants });
});

/**
 * Delete Assistant
 */
const deleteAssistant = asyncHandler(async (req, res) => {
  const { id } = req.body;
  
  const assistant = await AstrologerAssistant.findByPk(id);
  if (!assistant) {
    return errorResponse(res, 'Assistant not found', 404);
  }

  await assistant.destroy();
  return successResponse(res, 'Assistant deleted successfully');
});

module.exports = {
  addAssistant,
  updateAssistant,
  getAssistants,
  deleteAssistant
};
