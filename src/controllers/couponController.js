'use strict';

const asyncHandler = require('../utils/asyncHandler');
const { successResponse, createdResponse, errorResponse } = require('../utils/responseHandler');
const { Coupon } = require('../models');
const { Op } = require('sequelize');

/**
 * @route GET /api/coupons/validate/:code
 * @desc Validate a coupon code
 */
const validateCoupon = asyncHandler(async (req, res) => {
  const { code } = req.params;
  const { amount } = req.query;

  const coupon = await Coupon.findOne({
    where: {
      couponCode: code,
      isActive: true,
      validFrom: { [Op.lte]: new Date() },
      validTo: { [Op.gte]: new Date() }
    }
  });

  if (!coupon) return errorResponse(res, 'Invalid or expired coupon code', 400);

  if (amount && amount < coupon.minAmount) {
    return errorResponse(res, `Minimum amount for this coupon is ${coupon.minAmount}`, 400);
  }

  return successResponse(res, 'Coupon is valid', coupon);
});

/**
 * @route GET /api/admin/coupons
 * @desc Get all coupons (Admin)
 */
const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.findAll({ order: [['createdAt', 'DESC']] });
  return successResponse(res, 'Coupons fetched', coupons);
});

/**
 * @route POST /api/admin/coupons
 * @desc Create a new coupon (Admin)
 */
const createCoupon = asyncHandler(async (req, res) => {
  const { name, couponCode, validFrom, validTo, minAmount, maxAmount, description } = req.body;
  if (!name || !couponCode || !validFrom || !validTo) {
    return errorResponse(res, 'Name, code, validFrom, and validTo are required', 400);
  }

  const existing = await Coupon.findOne({ where: { couponCode } });
  if (existing) return errorResponse(res, 'Coupon code already exists', 400);

  const coupon = await Coupon.create({
    name,
    couponCode,
    validFrom,
    validTo,
    minAmount: minAmount || 0,
    maxAmount: maxAmount || 0,
    description,
    createdBy: req.user.id
  });
  return createdResponse(res, 'Coupon created', coupon);
});

/**
 * @route DELETE /api/admin/coupons/:id
 * @desc Delete a coupon (Admin)
 */
const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByPk(req.params.id);
  if (!coupon) return errorResponse(res, 'Coupon not found', 404);

  await coupon.destroy();
  return successResponse(res, 'Coupon deleted');
});

module.exports = {
  validateCoupon,
  getCoupons,
  createCoupon,
  deleteCoupon
};
