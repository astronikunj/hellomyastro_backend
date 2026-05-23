'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Popup = sequelize.define('Popup', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  PopupImage: {
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
  tableName: 'popups',
  timestamps: true,
});

module.exports = Popup;
