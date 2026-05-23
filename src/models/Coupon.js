'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Coupon = sequelize.define('Coupon', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  couponCode: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  validFrom: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  validTo: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  minAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  maxAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
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
  tableName: 'coupons',
  timestamps: true,
});

module.exports = Coupon;
