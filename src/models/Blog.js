'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Blog = sequelize.define('Blog', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  blogImage: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  author: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  viewer: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  postedOn: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  createdBy: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
  },
  modifiedBy: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
  }
}, {
  tableName: 'blogs',
  timestamps: true,
});

module.exports = Blog;
