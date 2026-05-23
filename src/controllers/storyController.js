'use strict';

const asyncHandler = require('../utils/asyncHandler');
const { successResponse, createdResponse, errorResponse } = require('../utils/responseHandler');
const { AstrologerStory, Astrologer, User, sequelize } = require('../models');
const { Op } = require('sequelize');
const cloudinary = require('../config/cloudinary');

/**
 * @route POST /api/astrologer/stories
 * @desc Add a new story
 */
const addStory = asyncHandler(async (req, res) => {
  const { astrologerId, mediaType } = req.body;
  if (!astrologerId || !mediaType) return errorResponse(res, 'astrologerId and mediaType are required', 400);

  if (!req.file) return errorResponse(res, 'Media file is required', 400);

  const result = await new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream({
      folder: 'astrolly/stories',
      resource_type: mediaType === 'video' ? 'video' : 'image'
    }, (err, r) => {
      if (err) reject(err);
      else resolve(r);
    }).end(req.file.buffer);
  });

  const story = await AstrologerStory.create({
    astrologerId,
    mediaType,
    media: result.secure_url
  });

  return createdResponse(res, 'Story added successfully', story);
});

/**
 * @route GET /api/stories
 * @desc Get all active stories grouped by astrologer
 */
const getStories = asyncHandler(async (req, res) => {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const stories = await AstrologerStory.findAll({
    where: {
      createdAt: { [Op.gte]: twentyFourHoursAgo },
      isActive: true
    },
    include: [{
      model: Astrologer,
      as: 'astrologer',
      attributes: ['id', 'displayName', 'profileImage']
    }],
    order: [['createdAt', 'DESC']]
  });

  // Group by astrologer
  const grouped = stories.reduce((acc, story) => {
    const aid = story.astrologerId;
    if (!acc[aid]) {
      acc[aid] = {
        astrologer: story.astrologer,
        stories: []
      };
    }
    acc[aid].stories.push(story);
    return acc;
  }, {});

  return successResponse(res, 'Stories fetched', Object.values(grouped));
});

/**
 * @route POST /api/stories/:id/view
 * @desc Increment story view count
 */
const viewStory = asyncHandler(async (req, res) => {
  const story = await AstrologerStory.findByPk(req.params.id);
  if (!story) return errorResponse(res, 'Story not found', 404);

  await story.increment('views');
  return successResponse(res, 'Story view recorded');
});

module.exports = {
  addStory,
  getStories,
  viewStory
};
