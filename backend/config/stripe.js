const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const dotenv = require('dotenv');
const logger = require('../utils/logger');

dotenv.config();

// Verify Stripe is properly configured
if (!process.env.STRIPE_SECRET_KEY) {
  logger.warn('⚠️ Stripe secret key not provided, payment features will be disabled');
}

module.exports = stripe;
