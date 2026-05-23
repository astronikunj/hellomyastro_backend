'use strict';

const { 
  AstromallProduct, 
  ProductCategory, 
  OrderAddress, 
  OrderRequest, 
  ProductDetail, 
  Review, 
  User, 
  Wallet, 
  WalletTransaction, 
  sequelize 
} = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const asyncHandler = require('../utils/asyncHandler');
const { TRANSACTION_TYPES } = require('../utils/constants');
const { Op } = require('sequelize');

/**
 * Get Astromall Products
 */
const getAstromallProducts = asyncHandler(async (req, res) => {
  const { productCategoryId, startIndex = 0, fetchRecord, s } = req.body;

  const where = { isActive: true, isDelete: false };
  if (productCategoryId) {
    where.productCategoryId = productCategoryId;
  }
  if (s) {
    where.name = { [Op.like]: `%${s}%` };
  }

  const { count, rows } = await AstromallProduct.findAndCountAll({
    where,
    order: [['id', 'DESC']],
    offset: parseInt(startIndex),
    limit: fetchRecord ? parseInt(fetchRecord) : undefined
  });

  return successResponse(res, 'Products fetched successfully', {
    recordList: rows,
    totalRecords: count
  });
});

/**
 * Get Product By ID with Details and Reviews
 */
const getAstromallProductById = asyncHandler(async (req, res) => {
  const { id } = req.body;

  const product = await AstromallProduct.findByPk(id, {
    include: [
      { model: ProductCategory, as: 'category', attributes: ['name'] },
      { model: ProductDetail, as: 'details', where: { isActive: true }, required: false },
      { 
        model: Review, 
        as: 'productReviews', 
        include: [{ model: User, as: 'user', attributes: ['name', 'profile'] }],
        required: false
      }
    ]
  });

  if (!product) {
    return errorResponse(res, 'Product not found', 404);
  }

  // Flatten the category name as expected by some frontend implementations
  const productData = product.toJSON();
  productData.productCategory = productData.category?.name;
  productData.questionAnswer = productData.details;
  productData.productReview = productData.productReviews;

  return successResponse(res, 'Product details fetched successfully', {
    recordList: [productData]
  });
});

/**
 * Search Products in Category
 */
const searchInProductCategory = asyncHandler(async (req, res) => {
  const { productCategoryId, searchString } = req.body;

  const where = { productCategoryId, isActive: true, isDelete: false };
  if (searchString) {
    where.name = { [Op.like]: `%${searchString}%` };
  }

  const products = await AstromallProduct.findAll({ where });

  return successResponse(res, 'Products fetched successfully', { recordList: products });
});

/**
 * Get Product Categories
 */
const getProductCategories = asyncHandler(async (req, res) => {
  const { s, startIndex = 0, fetchRecord } = req.body;

  const where = { isActive: true };
  if (s) {
    where.name = { [Op.like]: `%${s}%` };
  }

  const { count, rows } = await ProductCategory.findAndCountAll({
    where,
    offset: parseInt(startIndex),
    limit: fetchRecord ? parseInt(fetchRecord) : undefined
  });

  return successResponse(res, 'Categories fetched successfully', {
    recordList: rows,
    totalRecords: count
  });
});

/**
 * Get Top Product Categories
 */
const getTopProductCategories = asyncHandler(async (req, res) => {
  // Logic to find top 3 categories based on orders
  const topCategories = await OrderRequest.findAll({
    attributes: [
      'productCategoryId',
      [sequelize.fn('COUNT', sequelize.col('productCategoryId')), 'orderCount']
    ],
    where: { orderType: 'astromall' },
    include: [{ model: ProductCategory, as: 'category', attributes: ['name', 'id'] }],
    group: ['productCategoryId', 'category.id'],
    order: [[sequelize.literal('orderCount'), 'DESC']],
    limit: 3
  });

  const formattedCategories = topCategories.map(tc => ({
    id: tc.category.id,
    name: tc.category.name
  }));

  return successResponse(res, 'Top categories fetched successfully', { recordList: formattedCategories });
});

/**
 * Order Address Methods
 */
const addOrderAddress = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const address = await OrderAddress.create({
    ...req.body,
    userId,
    createdBy: userId,
    modifiedBy: userId
  });

  return successResponse(res, 'Order address added successfully', { recordList: address });
});

const updateOrderAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const address = await OrderAddress.findByPk(id);

  if (!address) {
    return errorResponse(res, 'Address not found', 404);
  }

  await address.update(req.body);

  return successResponse(res, 'Order address updated successfully', { recordList: address });
});

const getOrderAddresses = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { s } = req.body;

  const where = { userId };
  if (s) {
    where.name = { [Op.like]: `%${s}%` };
  }

  const addresses = await OrderAddress.findAll({ where });

  return successResponse(res, 'Order addresses fetched successfully', { recordList: addresses });
});

/**
 * User Order Methods
 */
const addUserOrder = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { 
    productCategoryId, productId, orderAddressId, 
    payableAmount, gstPercent, paymentMethod, totalPayable, couponCode 
  } = req.body;

  const t = await sequelize.transaction();

  try {
    const wallet = await Wallet.findOne({ where: { userId } });
    const amountToDeduct = parseFloat(totalPayable.toString().replace(/,/g, ''));

    if (!wallet || parseFloat(wallet.balance) < amountToDeduct) {
      throw new Error('Insufficient Balance in Your Wallet!');
    }

    const order = await OrderRequest.create({
      userId,
      productCategoryId,
      productId,
      orderAddressId,
      payableAmount: parseFloat(payableAmount.toString().replace(/,/g, '')),
      gstPercent,
      totalPayable: amountToDeduct,
      paymentMethod,
      couponCode,
      orderType: 'astromall',
      orderStatus: 'Pending'
    }, { transaction: t });

    const balanceBefore = parseFloat(wallet.balance);
    const balanceAfter = balanceBefore - amountToDeduct;

    await wallet.update({ 
      balance: balanceAfter,
      totalSpent: parseFloat(wallet.totalSpent) + amountToDeduct
    }, { transaction: t });

    await WalletTransaction.create({
      walletId: wallet.id,
      userId,
      type: TRANSACTION_TYPES.DEBIT,
      amount: amountToDeduct,
      balanceBefore,
      balanceAfter,
      description: `Astromall Order: ${order.id}`,
      referenceType: 'booking', // Or use a new reference type if needed
      status: 'success'
    }, { transaction: t });

    await t.commit();
    return successResponse(res, 'Order placed successfully', { recordList: order });
  } catch (error) {
    await t.rollback();
    return errorResponse(res, error.message, 500);
  }
});

const cancelOrder = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.body;

  const t = await sequelize.transaction();

  try {
    const order = await OrderRequest.findOne({ where: { id, userId } });
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.orderStatus === 'Cancelled') {
      throw new Error('Order is already cancelled');
    }

    await order.update({ orderStatus: 'Cancelled' }, { transaction: t });

    const wallet = await Wallet.findOne({ where: { userId } });
    const refundAmount = parseFloat(order.totalPayable);

    const balanceBefore = parseFloat(wallet.balance);
    const balanceAfter = balanceBefore + refundAmount;

    await wallet.update({ 
      balance: balanceAfter,
      totalSpent: parseFloat(wallet.totalSpent) - refundAmount
    }, { transaction: t });

    await WalletTransaction.create({
      walletId: wallet.id,
      userId,
      type: TRANSACTION_TYPES.REFUND,
      amount: refundAmount,
      balanceBefore,
      balanceAfter,
      description: `Order Refund: ${order.id}`,
      referenceType: 'refund',
      status: 'success'
    }, { transaction: t });

    await t.commit();
    return successResponse(res, 'Order cancelled successfully', { recordList: [{ totalPayable: refundAmount }] });
  } catch (error) {
    await t.rollback();
    return errorResponse(res, error.message, 500);
  }
});

module.exports = {
  getAstromallProducts,
  getAstromallProductById,
  searchInProductCategory,
  getProductCategories,
  getTopProductCategories,
  addOrderAddress,
  updateOrderAddress,
  getOrderAddresses,
  addUserOrder,
  cancelOrder
};
