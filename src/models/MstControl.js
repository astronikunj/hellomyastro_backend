'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const MstControl = sequelize.define('MstControl', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  astro_api_call_type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'mst_control',
  timestamps: true,
});

module.exports = MstControl;
