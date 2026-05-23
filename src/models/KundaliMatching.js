'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const KundaliMatching = sequelize.define('KundaliMatching', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  boyName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  boyBirthDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  boyBirthTime: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  boyBirthPlace: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  girlName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  girlBirthDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  girlBirthTime: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  girlBirthPlace: {
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
}, {
  tableName: 'kundali_matchings',
  timestamps: true,
});

module.exports = KundaliMatching;
