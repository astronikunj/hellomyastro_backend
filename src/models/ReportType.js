'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ReportType = sequelize.define('ReportType', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  reportImage: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'report_types',
  timestamps: true,
});

module.exports = ReportType;
