'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const HelpSupportQuestion = sequelize.define('HelpSupportQuestion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  helpSupportId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  question: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  answer: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  isChatWithus: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
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
  tableName: 'help_support_questions',
  timestamps: true,
});

module.exports = HelpSupportQuestion;
