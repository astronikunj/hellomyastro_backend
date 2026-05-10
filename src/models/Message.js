'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  chatId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: { model: 'chats', key: 'id' },
    onDelete: 'CASCADE',
  },
  senderId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
  senderRole: {
    type: DataTypes.ENUM('user', 'astrologer'),
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('text', 'image', 'audio', 'file'),
    defaultValue: 'text',
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Text message content',
  },
  mediaUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Cloudinary URL for media messages',
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  readAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'messages',
  timestamps: true,
  indexes: [
    { fields: ['chatId'] },
    { fields: ['senderId'] },
    { fields: ['isRead'] },
    { fields: ['createdAt'] },
  ],
});

module.exports = Message;
