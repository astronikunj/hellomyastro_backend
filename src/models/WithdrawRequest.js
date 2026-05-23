'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const WithdrawRequest = sequelize.define('WithdrawRequest', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  astrologerId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: { model: 'astrologers', key: 'id' },
  },
  withdrawAmount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
  },
  remarks: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  createdBy: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
  },
  modifiedBy: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
  }
}, {
  tableName: 'withdraw_requests',
  timestamps: true,
});

module.exports = WithdrawRequest;
