'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Report = sequelize.define('Report', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  reportedBy: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
  reportedUser: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
    references: { model: 'users', key: 'id' },
    comment: 'Reported user/astrologer',
  },
  bookingId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
    references: { model: 'bookings', key: 'id' },
  },
  reason: {
    type: DataTypes.STRING(300),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'reviewed', 'resolved', 'dismissed'),
    defaultValue: 'pending',
  },
  adminNote: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  resolvedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'reports',
  timestamps: true,
  indexes: [
    { fields: ['reportedBy'] },
    { fields: ['reportedUser'] },
    { fields: ['status'] },
  ],
});

module.exports = Report;
