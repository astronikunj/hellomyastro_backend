'use strict';

const asyncHandler = require('../utils/asyncHandler');
const { successResponse, createdResponse, errorResponse } = require('../utils/responseHandler');
const { Gift } = require('../models');
const cloudinary = require('../config/cloudinary');

/**
 * @route GET /api/gifts
 * @desc Get all active gifts
 */
const getGifts = asyncHandler(async (req, res) => {
  const gifts = await Gift.findAll({
    where: { isActive: true },
    order: [['displayOrder', 'ASC'], ['amount', 'ASC']]
  });
  return successResponse(res, 'Gifts fetched', gifts);
});

/**
 * @route POST /api/admin/gifts
 * @desc Create a new gift (Admin)
 */
const createGift = asyncHandler(async (req, res) => {
  const { name, amount, displayOrder } = req.body;
  if (!name || !amount) return errorResponse(res, 'Name and amount are required', 400);

  let imageUrl = null;
  if (req.file) {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({ folder: 'astrolly/gifts' }, (err, r) => {
        if (err) reject(err);
        else resolve(r);
      }).end(req.file.buffer);
    });
    imageUrl = result.secure_url;
  }

  const gift = await Gift.create({
    name,
    amount,
    image: imageUrl,
    displayOrder: displayOrder || 0,
    createdBy: req.user.id
  });
  return createdResponse(res, 'Gift created', gift);
});

/**
 * @route PUT /api/admin/gifts/:id
 * @desc Update a gift (Admin)
 */
const updateGift = asyncHandler(async (req, res) => {
  const gift = await Gift.findByPk(req.params.id);
  if (!gift) return errorResponse(res, 'Gift not found', 404);

  let imageUrl = gift.image;
  if (req.file) {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({ folder: 'astrolly/gifts' }, (err, r) => {
        if (err) reject(err);
        else resolve(r);
      }).end(req.file.buffer);
    });
    imageUrl = result.secure_url;
  }

  await gift.update({
    ...req.body,
    image: imageUrl,
    modifiedBy: req.user.id
  });
  return successResponse(res, 'Gift updated', gift);
});

/**
 * @route DELETE /api/admin/gifts/:id
 * @desc Delete a gift (Admin)
 */
const deleteGift = asyncHandler(async (req, res) => {
  const gift = await Gift.findByPk(req.params.id);
  if (!gift) return errorResponse(res, 'Gift not found', 404);

  await gift.destroy();
  return successResponse(res, 'Gift deleted');
});

module.exports = {
  getGifts,
  createGift,
  updateGift,
  deleteGift
};
