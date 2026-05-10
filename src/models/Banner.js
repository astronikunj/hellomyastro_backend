'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Banner = sequelize.define('Banner', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  subtitle: {
    type: DataTypes.STRING(300),
    allowNull: true,
  },
  imageUrl: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  linkUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Deep link or external URL',
  },
  position: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Display order',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  startsAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  endsAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'banners',
  timestamps: true,
  indexes: [
    { fields: ['isActive'] },
    { fields: ['position'] },
  ],
});

module.exports = Banner;
