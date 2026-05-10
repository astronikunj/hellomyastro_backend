'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Schedule = sequelize.define('Schedule', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  astrologerId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: { model: 'astrologers', key: 'id' },
    onDelete: 'CASCADE',
  },
  dayOfWeek: {
    // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: false,
    validate: { min: 0, max: 6 },
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'schedules',
  timestamps: true,
  indexes: [
    { fields: ['astrologerId'] },
    { fields: ['dayOfWeek'] },
  ],
});

module.exports = Schedule;
