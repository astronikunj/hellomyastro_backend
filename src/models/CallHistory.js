'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const CallHistory = sequelize.define('CallHistory', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  bookingId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: { model: 'bookings', key: 'id' },
    onDelete: 'CASCADE',
  },
  userId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
  astrologerId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: { model: 'astrologers', key: 'id' },
  },
  callType: {
    type: DataTypes.ENUM('audio_call', 'video_call'),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('connected', 'missed', 'rejected', 'failed'),
    allowNull: false,
  },
  startedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  endedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  durationSeconds: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  totalDeducted: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  agoraChannelName: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Agora channel for WebRTC call routing',
  },
}, {
  tableName: 'call_histories',
  timestamps: true,
  indexes: [
    { fields: ['bookingId'] },
    { fields: ['userId'] },
    { fields: ['astrologerId'] },
    { fields: ['callType'] },
    { fields: ['status'] },
  ],
});

module.exports = CallHistory;
