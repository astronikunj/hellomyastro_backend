'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ProductDetail = sequelize.define('ProductDetail', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  astromallProductId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  question: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  answer: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'product_details',
  timestamps: true,
});

module.exports = ProductDetail;
