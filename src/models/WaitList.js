'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const WaitList = sequelize.define('WaitList', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  profile: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  time: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  channelName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  requestType: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  userFcmToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
  },
  astrologerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'waitlist',
  timestamps: true,
});

module.exports = WaitList;
