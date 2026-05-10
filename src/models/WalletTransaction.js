'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const WalletTransaction = sequelize.define('WalletTransaction', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  walletId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: { model: 'wallets', key: 'id' },
    onDelete: 'CASCADE',
  },
  userId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
  type: {
    type: DataTypes.ENUM('credit', 'debit', 'refund', 'withdrawal'),
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  balanceBefore: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  balanceAfter: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING(300),
    allowNull: true,
  },
  referenceId: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Razorpay order/payment ID or booking ID',
  },
  referenceType: {
    type: DataTypes.ENUM('razorpay', 'booking', 'admin', 'refund'),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'success', 'failed'),
    defaultValue: 'success',
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
  },
}, {
  tableName: 'wallet_transactions',
  timestamps: true,
  indexes: [
    { fields: ['walletId'] },
    { fields: ['userId'] },
    { fields: ['type'] },
    { fields: ['status'] },
    { fields: ['createdAt'] },
  ],
});

module.exports = WalletTransaction;
