'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const SystemFlag = sequelize.define('SystemFlag', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  valueType: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'systemflag',
  timestamps: true,
});

module.exports = SystemFlag;
