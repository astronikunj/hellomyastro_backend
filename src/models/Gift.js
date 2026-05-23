'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Gift = sequelize.define('Gift', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
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
  tableName: 'gifts',
  timestamps: true,
});

module.exports = Gift;
