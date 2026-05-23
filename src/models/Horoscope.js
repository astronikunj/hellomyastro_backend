'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Horoscope = sequelize.define('Horoscope', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  zodiac: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  total_score: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  lucky_color: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  lucky_color_code: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  lucky_number: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  physique: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  finances: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  relationship: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  career: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  travel: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  family: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  friends: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  health: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  bot_response: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  health_remark: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  relationship_remark: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  travel_remark: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  family_remark: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  friends_remark: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  finances_remark: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status_remark: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  langcode: {
    type: DataTypes.STRING,
    defaultValue: 'en',
  },
}, {
  tableName: 'horoscopes',
  timestamps: true,
});

module.exports = Horoscope;
