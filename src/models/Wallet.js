'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Wallet = sequelize.define('Wallet', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    unique: true,
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE',
  },
  balance: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
    comment: 'Current wallet balance in INR',
  },
  totalAdded: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  totalSpent: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  totalRefunded: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
}, {
  tableName: 'wallets',
  timestamps: true,
  indexes: [
    { fields: ['userId'], unique: true },
  ],
});

module.exports = Wallet;
