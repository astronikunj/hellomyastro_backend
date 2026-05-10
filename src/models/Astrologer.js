'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Astrologer = sequelize.define('Astrologer', {
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
  displayName: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  specializations: {
    // Stored as JSON array: ["Vedic", "Tarot", "Numerology"]
    type: DataTypes.JSON,
    allowNull: true,
  },
  languages: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  experience: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Years of experience',
  },
  chatRate: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: 'Rate per minute for chat (in INR)',
  },
  callRate: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: 'Rate per minute for audio call (in INR)',
  },
  videoCallRate: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: 'Rate per minute for video call (in INR)',
  },
  isOnline: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  isApproved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  approvedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  totalEarnings: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  totalRatings: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  averageRating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0,
  },
  totalSessions: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  profileImage: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  bannerImage: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  documents: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array of document URLs for verification',
  },
  bankDetails: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Bank account, IFSC, UPI for withdrawal',
  },
  withdrawalPending: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
}, {
  tableName: 'astrologers',
  timestamps: true,
  indexes: [
    { fields: ['userId'], unique: true },
    { fields: ['isOnline'] },
    { fields: ['isApproved'] },
    { fields: ['averageRating'] },
  ],
});

module.exports = Astrologer;
