'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const AstrologyVideo = sequelize.define('AstrologyVideo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  youtubeLink: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  coverImage: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  videoTitle: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  modifiedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'astrology_videos',
  timestamps: true,
});

module.exports = AstrologyVideo;
