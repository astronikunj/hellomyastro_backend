'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const HelpSupport = sequelize.define('HelpSupport', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  modifiedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'help_supports',
  timestamps: true,
});

module.exports = HelpSupport;
