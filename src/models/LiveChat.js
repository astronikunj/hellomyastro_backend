'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const LiveChat = sequelize.define('LiveChat', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  partnerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  chatId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'livechat',
  timestamps: true,
});

module.exports = LiveChat;
