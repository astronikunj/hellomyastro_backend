'use strict';

const { messaging } = require('../config/firebase');
const { Notification, User } = require('../models');

/**
 * Send a push notification via Firebase FCM
 * @param {string} fcmToken - Device FCM token
 * @param {string} title
 * @param {string} body
 * @param {object} data - Extra payload for the app
 */
const sendPushNotification = async (fcmToken, title, body, data = {}) => {
  if (!fcmToken || !messaging) return; // Skip if FCM not configured
  try {
    const message = {
      token: fcmToken,
      notification: { title, body },
      data: Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, String(v)])
      ),
      android: { priority: 'high' },
      apns: { payload: { aps: { sound: 'default', badge: 1 } } },
    };
    const response = await messaging.send(message);
    console.log(`📲 FCM sent: ${response}`);
    return response;
  } catch (err) {
    console.error('FCM error:', err.message);
  }
};

/**
 * Create DB notification record and optionally send push
 * @param {number} userId - Recipient user ID
 * @param {string} title
 * @param {string} body
 * @param {string} type - NotificationTypes constant
 * @param {object} options - { referenceId, referenceType, sendPush }
 */
const createNotification = async (userId, title, body, type = 'system', options = {}) => {
  const { referenceId = null, referenceType = null, sendPush = true } = options;

  const notification = await Notification.create({
    userId,
    title,
    body,
    type,
    referenceId,
    referenceType,
    isSentViaPush: false,
  });

  if (sendPush) {
    const user = await User.findByPk(userId, { attributes: ['fcmToken'] });
    if (user?.fcmToken) {
      await sendPushNotification(user.fcmToken, title, body, {
        type,
        referenceId: referenceId || '',
        referenceType: referenceType || '',
      });
      await notification.update({ isSentViaPush: true });
    }
  }

  return notification;
};

/**
 * Broadcast push notification to multiple users
 * @param {number[]} userIds
 * @param {string} title
 * @param {string} body
 * @param {string} type
 */
const broadcastNotification = async (userIds, title, body, type = 'admin') => {
  const users = await User.findAll({
    where: { id: userIds },
    attributes: ['id', 'fcmToken'],
  });

  const validTokens = users.filter((u) => u.fcmToken).map((u) => u.fcmToken);

  if (validTokens.length > 0) {
    const message = {
      tokens: validTokens,
      notification: { title, body },
      data: { type },
    };
    try {
      const response = await messaging.sendEachForMulticast(message);
      console.log(`📲 Broadcast: ${response.successCount} sent, ${response.failureCount} failed`);
    } catch (err) {
      console.error('FCM broadcast error:', err.message);
    }
  }

  // Save DB notifications for all users
  await Promise.all(
    userIds.map((uid) =>
      Notification.create({ userId: uid, title, body, type, isSentViaPush: false })
    )
  );
};

module.exports = { sendPushNotification, createNotification, broadcastNotification };
