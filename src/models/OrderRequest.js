'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const OrderRequest = sequelize.define('OrderRequest', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  productCategoryId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  orderAddressId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  payableAmount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  walletBalanceDeducted: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  totalPayable: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  orderStatus: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  gstPercent: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
  },
  orderType: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  couponCode: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  astrologerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'order_request',
  timestamps: true,
});

module.exports = OrderRequest;
