'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const LiveAstro = sequelize.define('LiveAstro', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  astrologerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  channelName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  token: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  liveChatToken: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'liveastro',
  timestamps: true,
});

module.exports = LiveAstro;
