'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Review = sequelize.define('Review', {
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
    onDelete: 'CASCADE',
  },
  bookingId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    unique: true,
    references: { model: 'bookings', key: 'id' },
  },
  rating: {
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: false,
    validate: { min: 1, max: 5 },
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  isApproved: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'reviews',
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['astrologerId'] },
    { fields: ['rating'] },
    { fields: ['bookingId'], unique: true },
  ],
});

module.exports = Review;
