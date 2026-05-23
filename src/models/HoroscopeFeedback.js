'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const HoroscopeFeedback = sequelize.define('HoroscopeFeedback', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  feedback: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  feedbacktype: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'horoscope_feedbacks',
  timestamps: true,
});

module.exports = HoroscopeFeedback;
