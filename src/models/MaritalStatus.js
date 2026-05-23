'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const MaritalStatus = sequelize.define('MaritalStatus', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'marital_statuses',
  timestamps: true,
});

module.exports = MaritalStatus;
