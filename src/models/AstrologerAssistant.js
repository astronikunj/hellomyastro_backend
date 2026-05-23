'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const AstrologerAssistant = sequelize.define('AstrologerAssistant', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  astrologerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  contactNo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  birthdate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  primarySkill: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  allSkill: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  languageKnown: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  experienceInYears: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  profile: {
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
  tableName: 'astrologer_assistants',
  timestamps: true,
});

module.exports = AstrologerAssistant;
