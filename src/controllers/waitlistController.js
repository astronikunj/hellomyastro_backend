'use strict';

const { WaitList, User, Astrologer, sequelize } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const asyncHandler = require('../utils/asyncHandler');
const { createNotification } = require('../services/notificationService');
const { NOTIFICATION_TYPES } = require('../utils/constants');

/**
 * Add to Waitlist
 */
const addWaitList = asyncHandler(async (req, res) => {
  const { 
    userName, profile, time, channelName, userId, 
    requestType, userFcmToken, status, astrologerId 
  } = req.body;

  const waitList = await WaitList.create({
    userName,
    profile,
    time,
    channelName,
    userId,
    requestType,
    userFcmToken,
    status,
    astrologerId
  });

  // Notify Astrologer
  const astrologer = await Astrologer.findByPk(astrologerId, {
    include: [{ model: User, as: 'user', attributes: ['id', 'name'] }]
  });

  if (astrologer && astrologer.user) {
    const user = await User.findByPk(userId, { attributes: ['name'] });
    const requesterName = user ? user.name : 'A user';
    
    let title = 'New Request';
    let body = `You received a ${requestType} request from ${requesterName}`;

    if (requestType === 'Chat') title = 'Receive Chat';
    else if (requestType === 'Audio') title = 'Receive Audio Call';
    else if (requestType === 'Video') title = 'Receive Video Call';

    await createNotification(
      astrologer.user.id,
      title,
      body,
      NOTIFICATION_TYPES.SYSTEM,
      { sendPush: true }
    );
  }

  return successResponse(res, 'Added to waitlist successfully', { recordList: waitList });
});

/**
 * Get Waitlist by Channel Name
 */
const getWaitList = asyncHandler(async (req, res) => {
  const { channelName } = req.body;

  const waitList = await WaitList.findAll({
    where: { channelName }
  });

  return successResponse(res, 'Waitlist fetched successfully', { recordList: waitList });
});

/**
 * Delete from Waitlist
 */
const deleteFromWaitList = asyncHandler(async (req, res) => {
  const { id } = req.body;
  const waitList = await WaitList.findByPk(id);

  if (!waitList) {
    return errorResponse(res, 'Waitlist entry not found', 404);
  }

  await waitList.destroy();
  return successResponse(res, 'Deleted from waitlist successfully');
});

/**
 * Edit Waitlist (Status Update)
 */
const editWaitList = asyncHandler(async (req, res) => {
  const { id, status } = req.body;
  const waitList = await WaitList.findByPk(id);

  if (!waitList) {
    return errorResponse(res, 'Waitlist entry not found', 404);
  }

  await waitList.update({ status });

  return successResponse(res, 'Waitlist status updated successfully', { recordList: waitList });
});

module.exports = {
  addWaitList,
  getWaitList,
  deleteFromWaitList,
  editWaitList
};
