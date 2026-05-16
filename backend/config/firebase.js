const admin = require('firebase-admin');
const dotenv = require('dotenv');
const logger = require('../utils/logger');

dotenv.config();

// Firebase Admin SDK configuration
const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  clientId: process.env.FIREBASE_CLIENT_ID,
  authUri: process.env.FIREBASE_AUTH_URI,
  tokenUri: process.env.FIREBASE_TOKEN_URI,
};

let firebaseApp;

try {
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(firebaseConfig),
    });
    logger.info('✅ Firebase Admin SDK initialized');
  } else {
    logger.warn('⚠️ Firebase credentials not provided, Firebase features will be disabled');
  }
} catch (error) {
  logger.error('❌ Firebase initialization failed:', error);
}

module.exports = firebaseApp;
