'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Kundli = sequelize.define('Kundli', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  birthDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  birthTime: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  birthPlace: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  modifiedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
  },
  timezone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  pdf_type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  match_type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  pdf_link: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  forMatch: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isForTrackPlanet: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'kundlis',
  timestamps: true,
});

module.exports = Kundli;
