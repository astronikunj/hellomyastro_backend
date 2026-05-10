'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE',
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  body: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM(
      'booking', 'chat', 'call', 'payment',
      'review', 'admin', 'system', 'promo'
    ),
    defaultValue: 'system',
  },
  referenceId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
    comment: 'ID of the related entity (booking, chat, etc.)',
  },
  referenceType: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  readAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  isSentViaPush: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'notifications',
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['isRead'] },
    { fields: ['type'] },
    { fields: ['createdAt'] },
  ],
});

module.exports = Notification;
