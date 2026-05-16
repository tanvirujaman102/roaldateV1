const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const walletController = require('../controllers/walletController');

// Get wallet balance
router.get('/balance', protect, walletController.getBalance);

// Get wallet transactions
router.get('/transactions', protect, walletController.getTransactions);

// Add funds to wallet
router.post('/add-funds', protect, [
  body('amount').isFloat({ min: 1, max: 10000 }),
  body('paymentMethod').isIn(['card', 'paypal', 'stripe']),
], walletController.addFunds);

// Withdraw funds
router.post('/withdraw', protect, [
  body('amount').isFloat({ min: 1, max: 10000 }),
  body('accountType').isIn(['bank', 'paypal']),
  body('accountDetails').isObject(),
], walletController.withdrawFunds);

// Send money to another user
router.post('/send', protect, [
  body('recipientId').isMongoId(),
  body('amount').isFloat({ min: 0.01, max: 1000 }),
  body('message').optional().isLength({ max: 200 }).trim(),
], walletController.sendMoney);

// Request money from another user
router.post('/request', protect, [
  body('senderId').isMongoId(),
  body('amount').isFloat({ min: 0.01, max: 1000 }),
  body('message').optional().isLength({ max: 200 }).trim(),
], walletController.requestMoney);

// Accept money request
router.post('/requests/:requestId/accept', protect, walletController.acceptMoneyRequest);

// Reject money request
router.post('/requests/:requestId/reject', protect, walletController.rejectMoneyRequest);

// Get money requests
router.get('/requests', protect, walletController.getMoneyRequests);

// Get payment methods
router.get('/payment-methods', protect, walletController.getPaymentMethods);

// Add payment method
router.post('/payment-methods', protect, [
  body('type').isIn(['card', 'bank', 'paypal']),
  body('details').isObject(),
], walletController.addPaymentMethod);

// Remove payment method
router.delete('/payment-methods/:methodId', protect, walletController.removePaymentMethod);

// Get subscription plans
router.get('/subscriptions/plans', protect, walletController.getSubscriptionPlans);

// Subscribe to plan
router.post('/subscriptions/subscribe', protect, [
  body('planId').isMongoId(),
  body('paymentMethodId').isMongoId(),
], walletController.subscribeToPlan);

// Cancel subscription
router.post('/subscriptions/cancel', protect, walletController.cancelSubscription);

// Get subscription status
router.get('/subscriptions/status', protect, walletController.getSubscriptionStatus);

// Purchase premium features
router.post('/purchase', protect, [
  body('item').isIn(['super_likes', 'boosts', 'profile_visibility']),
  body('quantity').isInt({ min: 1, max: 100 }),
  body('paymentMethodId').isMongoId(),
], walletController.purchaseFeature);

// Get purchase history
router.get('/purchases', protect, walletController.getPurchaseHistory);

// Get earnings (for creators)
router.get('/earnings', protect, walletController.getEarnings);

// Withdraw earnings
router.post('/earnings/withdraw', protect, [
  body('amount').isFloat({ min: 1, max: 10000 }),
  body('accountType').isIn(['bank', 'paypal']),
  body('accountDetails').isObject(),
], walletController.withdrawEarnings);

// Get earnings report
router.get('/earnings/report', protect, walletController.getEarningsReport);

module.exports = router;
