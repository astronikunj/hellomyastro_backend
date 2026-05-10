'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Chat = sequelize.define('Chat', {
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
  roomId: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    comment: 'Unique socket room identifier',
  },
  status: {
    type: DataTypes.ENUM('active', 'ended'),
    defaultValue: 'active',
  },
  totalDeducted: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
    comment: 'Total wallet amount deducted for this chat session',
  },
  startedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  endedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  durationMinutes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'chats',
  timestamps: true,
  indexes: [
    { fields: ['bookingId'], unique: true },
    { fields: ['roomId'] },
    { fields: ['userId'] },
    { fields: ['astrologerId'] },
    { fields: ['status'] },
  ],
});

module.exports = Chat;
