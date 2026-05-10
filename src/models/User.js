'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: true,
    unique: true,
    validate: { isEmail: true },
  },
  phone: {
    type: DataTypes.STRING(15),
    allowNull: true,
    unique: true,
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  role: {
    type: DataTypes.ENUM('user', 'astrologer', 'admin'),
    defaultValue: 'user',
  },
  profileImage: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: true,
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  timeOfBirth: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  placeOfBirth: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  fcmToken: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  refreshToken: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  otp: {
    type: DataTypes.STRING(6),
    allowNull: true,
  },
  otpExpiry: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  isBanned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  passwordResetToken: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  passwordResetExpiry: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'users',
  timestamps: true,
  indexes: [
    { fields: ['email'] },
    { fields: ['phone'] },
    { fields: ['role'] },
  ],
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password') && user.password) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    },
  },
});

/**
 * Instance method to compare passwords
 */
User.prototype.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * Instance method to return safe user object (no password)
 */
User.prototype.toSafeObject = function () {
  const { password, refreshToken, otp, otpExpiry, passwordResetToken, passwordResetExpiry, ...safe } = this.toJSON();
  return safe;
};

module.exports = User;
