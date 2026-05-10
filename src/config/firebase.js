'use strict';

const admin = require('firebase-admin');

/**
 * Firebase Admin SDK initialization
 * Uses environment variables for credentials.
 * Gracefully skips if credentials are placeholder values.
 */
let messaging = null;

try {
  if (!admin.apps.length) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined;

    // Only initialize if real credentials are provided
    if (
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_PROJECT_ID !== 'your_firebase_project_id' &&
      privateKey &&
      !privateKey.includes('YOUR_PRIVATE_KEY')
    ) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
      });
      messaging = admin.messaging();
      console.log('✅ Firebase Admin initialized');
    } else {
      console.warn('⚠️  Firebase credentials are placeholder — FCM notifications disabled');
    }
  } else {
    messaging = admin.messaging();
  }
} catch (err) {
  console.warn('⚠️  Firebase initialization failed (FCM disabled):', err.message);
}

module.exports = { admin, messaging };
