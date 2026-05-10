'use strict';

const { sequelize } = require('../config/db');
const { Wallet, WalletTransaction } = require('../models');

/**
 * Get or create wallet for a user
 */
const getOrCreateWallet = async (userId, transaction = null) => {
  const [wallet] = await Wallet.findOrCreate({
    where: { userId },
    defaults: { userId, balance: 0 },
    transaction,
  });
  return wallet;
};

/**
 * Credit wallet — adds balance atomically
 * @param {number} userId
 * @param {number} amount - Amount in INR
 * @param {string} description
 * @param {string} referenceId
 * @param {string} referenceType
 */
const creditWallet = async (userId, amount, description, referenceId = null, referenceType = null) => {
  const t = await sequelize.transaction();
  try {
    const wallet = await Wallet.findOne({ where: { userId }, lock: true, transaction: t });
    if (!wallet) throw new Error('Wallet not found');

    const balanceBefore = parseFloat(wallet.balance);
    const balanceAfter = balanceBefore + parseFloat(amount);

    await wallet.update(
      { balance: balanceAfter, totalAdded: parseFloat(wallet.totalAdded) + parseFloat(amount) },
      { transaction: t }
    );

    const txn = await WalletTransaction.create(
      {
        walletId: wallet.id,
        userId,
        type: 'credit',
        amount,
        balanceBefore,
        balanceAfter,
        description,
        referenceId,
        referenceType,
        status: 'success',
      },
      { transaction: t }
    );

    await t.commit();
    return { wallet, transaction: txn };
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

/**
 * Debit wallet — deducts balance atomically
 * Throws error if insufficient balance
 */
const debitWallet = async (userId, amount, description, referenceId = null, referenceType = null) => {
  const t = await sequelize.transaction();
  try {
    const wallet = await Wallet.findOne({ where: { userId }, lock: true, transaction: t });
    if (!wallet) throw new Error('Wallet not found');

    const balanceBefore = parseFloat(wallet.balance);
    if (balanceBefore < parseFloat(amount)) {
      await t.rollback();
      throw Object.assign(new Error('Insufficient wallet balance'), { statusCode: 402 });
    }

    const balanceAfter = balanceBefore - parseFloat(amount);

    await wallet.update(
      { balance: balanceAfter, totalSpent: parseFloat(wallet.totalSpent) + parseFloat(amount) },
      { transaction: t }
    );

    const txn = await WalletTransaction.create(
      {
        walletId: wallet.id,
        userId,
        type: 'debit',
        amount,
        balanceBefore,
        balanceAfter,
        description,
        referenceId,
        referenceType,
        status: 'success',
      },
      { transaction: t }
    );

    await t.commit();
    return { wallet, transaction: txn };
  } catch (err) {
    if (t.finished !== 'commit') await t.rollback();
    throw err;
  }
};

/**
 * Refund — credits back with refund type
 */
const refundWallet = async (userId, amount, description, referenceId = null) => {
  const t = await sequelize.transaction();
  try {
    const wallet = await Wallet.findOne({ where: { userId }, lock: true, transaction: t });
    if (!wallet) throw new Error('Wallet not found');

    const balanceBefore = parseFloat(wallet.balance);
    const balanceAfter = balanceBefore + parseFloat(amount);

    await wallet.update(
      { balance: balanceAfter, totalRefunded: parseFloat(wallet.totalRefunded) + parseFloat(amount) },
      { transaction: t }
    );

    const txn = await WalletTransaction.create(
      {
        walletId: wallet.id,
        userId,
        type: 'refund',
        amount,
        balanceBefore,
        balanceAfter,
        description,
        referenceId,
        referenceType: 'refund',
        status: 'success',
      },
      { transaction: t }
    );

    await t.commit();
    return { wallet, transaction: txn };
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

module.exports = { getOrCreateWallet, creditWallet, debitWallet, refundWallet };
