'use strict';

const { LiveAstro, LiveChat, Astrologer, User, sequelize } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const asyncHandler = require('../utils/asyncHandler');
const { Op } = require('sequelize');

/**
 * Add Live Astrologer Session
 */
const addLiveAstrologer = asyncHandler(async (req, res) => {
  const { astrologerId, channelName, token } = req.body;

  const session = await LiveAstro.create({
    astrologerId,
    channelName,
    token,
    isActive: true
  });

  return successResponse(res, 'Live session started successfully', { recordList: session });
});

/**
 * Get Active Live Astrologers
 */
const getLiveAstrologer = asyncHandler(async (req, res) => {
  const sessions = await LiveAstro.findAll({
    where: { isActive: true },
    include: [{ model: Astrologer, as: 'astrologer', include: [{ model: User, as: 'user', attributes: ['name', 'profile'] }] }]
  });

  return successResponse(res, 'Live astrologers fetched successfully', { recordList: sessions });
});

/**
 * End Live Session
 */
const endLiveSession = asyncHandler(async (req, res) => {
  const { channelName } = req.body;
  
  await LiveAstro.update(
    { isActive: false },
    { where: { channelName } }
  );

  return successResponse(res, 'Live session ended successfully');
});

/**
 * Add Live User (Chat)
 */
const addLiveUser = asyncHandler(async (req, res) => {
  const { userId, partnerId, chatId } = req.body;

  const liveChat = await LiveChat.create({
    userId,
    partnerId,
    chatId
  });

  return successResponse(res, 'Live user added successfully', { recordList: liveChat });
});

/**
 * Get Live Users for a partner
 */
const getLiveUser = asyncHandler(async (req, res) => {
  const { partnerId } = req.query;

  const liveUsers = await LiveChat.findAll({
    where: { partnerId },
    include: [{ model: User, as: 'user', attributes: ['name', 'profile'] }]
  });

  return successResponse(res, 'Live users fetched successfully', { recordList: liveUsers });
});

module.exports = {
  addLiveAstrologer,
  getLiveAstrologer,
  endLiveSession,
  addLiveUser,
  getLiveUser
};
