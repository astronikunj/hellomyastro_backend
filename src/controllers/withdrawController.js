'use strict';

const asyncHandler = require('../utils/asyncHandler');
const { successResponse, createdResponse, errorResponse } = require('../utils/responseHandler');
const { WithdrawRequest, Astrologer, Wallet } = require('../models');
const { getPagination } = require('../utils/validators');

/**
 * @route POST /api/astrologer/withdraw
 * @desc Request a withdrawal
 */
const requestWithdrawal = asyncHandler(async (req, res) => {
  const { amount, remarks } = req.body;
  if (!amount || amount <= 0) return errorResponse(res, 'Invalid amount', 400);

  const astrologer = await Astrologer.findOne({ where: { userId: req.user.id } });
  if (!astrologer) return errorResponse(res, 'Astrologer profile not found', 404);

  const wallet = await Wallet.findOne({ where: { userId: req.user.id } });
  if (!wallet || wallet.balance < amount) {
    return errorResponse(res, 'Insufficient balance', 400);
  }

  const withdrawRequest = await WithdrawRequest.create({
    astrologerId: astrologer.id,
    withdrawAmount: amount,
    remarks,
    status: 'pending',
    createdBy: req.user.id
  });

  return createdResponse(res, 'Withdrawal request submitted', withdrawRequest);
});

/**
 * @route GET /api/astrologer/withdraw/history
 * @desc Get withdrawal history for astrologer
 */
const getWithdrawalHistory = asyncHandler(async (req, res) => {
  const astrologer = await Astrologer.findOne({ where: { userId: req.user.id } });
  if (!astrologer) return errorResponse(res, 'Astrologer profile not found', 404);

  const requests = await WithdrawRequest.findAll({
    where: { astrologerId: astrologer.id },
    order: [['createdAt', 'DESC']]
  });

  return successResponse(res, 'Withdrawal history fetched', requests);
});

/**
 * @route GET /api/admin/withdrawals
 * @desc Get all withdrawal requests (Admin)
 */
const getAllWithdrawals = asyncHandler(async (req, res) => {
  const { limit, offset, page } = getPagination(req.query);
  const { status } = req.query;
  const where = {};
  if (status) where.status = status;

  const { count, rows } = await WithdrawRequest.findAndCountAll({
    where,
    include: [{
      model: Astrologer,
      as: 'astrologer',
      include: [{ model: User, as: 'user', attributes: ['name', 'email'] }]
    }],
    limit,
    offset,
    order: [['createdAt', 'DESC']]
  });

  return res.status(200).json({
    success: true,
    message: 'Withdrawal requests fetched',
    data: rows,
    pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) }
  });
});

/**
 * @route PUT /api/admin/withdrawals/:id/status
 * @desc Approve or reject withdrawal (Admin)
 */
const updateWithdrawalStatus = asyncHandler(async (req, res) => {
  const { status, remarks } = req.body;
  if (!['approved', 'rejected'].includes(status)) {
    return errorResponse(res, 'Invalid status', 400);
  }

  const withdrawRequest = await WithdrawRequest.findByPk(req.params.id);
  if (!withdrawRequest) return errorResponse(res, 'Request not found', 404);

  if (withdrawRequest.status !== 'pending') {
    return errorResponse(res, 'Request already processed', 400);
  }

  await withdrawRequest.update({ status, remarks, modifiedBy: req.user.id });

  // If approved, deduct from wallet (Note: In a real app, this should be a transaction)
  if (status === 'approved') {
    const astrologer = await Astrologer.findByPk(withdrawRequest.astrologerId);
    const wallet = await Wallet.findOne({ where: { userId: astrologer.userId } });
    if (wallet) {
      await wallet.decrement('balance', { by: withdrawRequest.withdrawAmount });
    }
  }

  return successResponse(res, `Withdrawal request ${status}`);
});

module.exports = {
  requestWithdrawal,
  getWithdrawalHistory,
  getAllWithdrawals,
  updateWithdrawalStatus
};
