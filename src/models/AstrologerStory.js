'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const AstrologerStory = sequelize.define('AstrologerStory', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  astrologerId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: { model: 'astrologers', key: 'id' },
  },
  mediaType: {
    type: DataTypes.ENUM('image', 'video'),
    defaultValue: 'image',
  },
  media: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  }
}, {
  tableName: 'astrologer_stories',
  timestamps: true,
});

module.exports = AstrologerStory;
