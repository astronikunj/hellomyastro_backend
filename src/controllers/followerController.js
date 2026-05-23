'use strict';

const { User, Astrologer, sequelize } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const asyncHandler = require('../utils/asyncHandler');
const { Op } = require('sequelize');

/**
 * Follow an Astrologer
 */
const addFollowing = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { astrologerId } = req.body;

  const user = await User.findByPk(userId);
  const astrologer = await Astrologer.findByPk(astrologerId);

  if (!astrologer) {
    return errorResponse(res, 'Astrologer not found', 404);
  }

  // user_favorites is the through table defined in models/index.js
  await user.addFavoriteAstrologers(astrologer);

  return successResponse(res, 'Astrologer followed successfully');
});

/**
 * Unfollow an Astrologer
 */
const updateFollowing = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { astrologerId } = req.body;

  const user = await User.findByPk(userId);
  const astrologer = await Astrologer.findByPk(astrologerId);

  if (!astrologer) {
    return errorResponse(res, 'Astrologer not found', 404);
  }

  await user.removeFavoriteAstrologers(astrologer);

  return successResponse(res, 'Astrologer unfollowed successfully');
});

/**
 * Get Astrologers Followed by User
 */
const getFollowing = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { startIndex = 0, fetchRecord } = req.body;

  const user = await User.findByPk(userId);
  const followedAstrologers = await user.getFavoriteAstrologers({
    offset: parseInt(startIndex),
    limit: fetchRecord ? parseInt(fetchRecord) : undefined,
    joinTableAttributes: []
  });

  const count = await user.countFavoriteAstrologers();

  return successResponse(res, 'Followed astrologers fetched successfully', {
    recordList: followedAstrologers,
    totalFollower: count
  });
});

/**
 * Get Followers of an Astrologer
 */
const getFollowers = asyncHandler(async (req, res) => {
  const { astrologerId } = req.body;

  const astrologer = await Astrologer.findByPk(astrologerId);
  if (!astrologer) {
    return errorResponse(res, 'Astrologer not found', 404);
  }

  const followers = await astrologer.getFavoritedByUsers({
    attributes: ['id', 'name', 'profile', 'email'],
    joinTableAttributes: []
  });

  const count = await astrologer.countFavoritedByUsers();

  return successResponse(res, 'Followers fetched successfully', {
    recordList: followers,
    totalCount: count
  });
});

module.exports = {
  addFollowing,
  updateFollowing,
  getFollowing,
  getFollowers
};
