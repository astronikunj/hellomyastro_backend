'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
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
  type: {
    type: DataTypes.ENUM('chat', 'audio_call', 'video_call'),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM(
      'pending', 'accepted', 'rejected', 'ongoing',
      'completed', 'cancelled', 'missed'
    ),
    defaultValue: 'pending',
  },
  scheduledAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Null = instant booking',
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
  ratePerMinute: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  totalAmount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  platformFee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: 'Platform commission deducted from astrologer earnings',
  },
  astrologerEarning: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  cancellationReason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  cancelledBy: {
    type: DataTypes.ENUM('user', 'astrologer', 'admin'),
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'bookings',
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['astrologerId'] },
    { fields: ['status'] },
    { fields: ['type'] },
    { fields: ['scheduledAt'] },
  ],
});

module.exports = Booking;
