const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

// ✅ Static routes BEFORE dynamic /:notificationId routes

// Get unread notifications count
router.get('/unread-count', protect, notificationController.getUnreadCount);

// Get notification settings
router.get('/settings', protect, notificationController.getNotificationSettings);

// Get notification statistics
router.get('/stats', protect, notificationController.getNotificationStats);

// Mark all notifications as read
router.put('/read-all', protect, notificationController.markAllAsRead);

// Delete all notifications
router.delete('/all', protect, notificationController.deleteAllNotifications);

// Update notification settings
router.put('/settings', protect, [
  body('push').optional().isBoolean(),
  body('email').optional().isBoolean(),
  body('inApp').optional().isBoolean(),
  body('types.likes').optional().isBoolean(),
  body('types.comments').optional().isBoolean(),
  body('types.shares').optional().isBoolean(),
  body('types.follows').optional().isBoolean(),
  body('types.messages').optional().isBoolean(),
  body('types.matches').optional().isBoolean(),
  body('types.mentions').optional().isBoolean(),
  body('types.system').optional().isBoolean(),
], notificationController.updateNotificationSettings);

// Subscribe to push notifications
router.post('/push/subscribe', protect, [
  body('endpoint').isURL(),
  body('keys.p256dh').isString(),
  body('keys.auth').isString(),
], notificationController.subscribeToPush);

// Unsubscribe from push notifications
router.post('/push/unsubscribe', protect, [
  body('endpoint').isURL(),
], notificationController.unsubscribeFromPush);

// Send test notification (for development)
router.post('/test', protect, [
  body('title').isLength({ min: 1, max: 100 }).trim(),
  body('message').isLength({ min: 1, max: 500 }).trim(),
  body('type').isIn(['info', 'success', 'warning', 'error']),
], notificationController.sendTestNotification);

// Get all notifications
router.get('/', protect, notificationController.getNotifications);

// Dynamic routes (AFTER all static routes)
// Mark notification as read
router.put('/:notificationId/read', protect, notificationController.markAsRead);

// Delete notification
router.delete('/:notificationId', protect, notificationController.deleteNotification);

module.exports = router;
