'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const AstrologerCategory = sequelize.define('AstrologerCategory', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  image: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  displayOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
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
  tableName: 'astrologer_categories',
  timestamps: true,
});

module.exports = AstrologerCategory;
