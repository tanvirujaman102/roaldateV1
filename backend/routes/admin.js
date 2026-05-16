const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

// ✅ FIX: adminOnly নেই — requireAdmin ব্যবহার করতে হবে
const { protect, requireAdmin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// Get admin dashboard statistics
router.get('/dashboard/stats', protect, requireAdmin, adminController.getDashboardStats);

// Get all users
router.get('/users', protect, requireAdmin, adminController.getAllUsers);

// Get user by ID
router.get('/users/:userId', protect, requireAdmin, adminController.getUserById);

// Update user
router.put('/users/:userId', protect, requireAdmin, [
  body('email').optional().isEmail().normalizeEmail(),
  body('username').optional().isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9_]+$/),
  body('role').optional().isIn(['user', 'moderator', 'admin']),
  body('isActive').optional().isBoolean(),
  body('isVerified').optional().isBoolean(),
], adminController.updateUser);

// Delete user
router.delete('/users/:userId', protect, requireAdmin, adminController.deleteUser);

// Ban/unban user
router.post('/users/:userId/ban', protect, requireAdmin, [
  body('reason').isLength({ min: 1, max: 500 }).trim(),
  body('duration').optional().isIn(['7d', '30d', 'permanent']),
], adminController.banUser);

router.delete('/users/:userId/ban', protect, requireAdmin, adminController.unbanUser);

// ✅ Static routes আগে — /banned-users /:userId এর আগে
router.get('/banned-users', protect, requireAdmin, adminController.getBannedUsers);
router.post('/banned-users/:userId/unban', protect, requireAdmin, adminController.unbanUser);

// Get all posts
router.get('/posts', protect, requireAdmin, adminController.getAllPosts);

// Get post by ID
router.get('/posts/:postId', protect, requireAdmin, adminController.getPostById);

// Delete post
router.delete('/posts/:postId', protect, requireAdmin, adminController.deletePost);

// Get all reports
router.get('/reports', protect, requireAdmin, adminController.getAllReports);

// Get report by ID
router.get('/reports/:reportId', protect, requireAdmin, adminController.getReportById);

// Handle report
router.put('/reports/:reportId/handle', protect, requireAdmin, [
  body('action').isIn(['ignore', 'warn', 'suspend', 'delete', 'ban']),
  body('reason').optional().isLength({ max: 500 }).trim(),
], adminController.handleReport);

// Get all chat rooms
router.get('/chat-rooms', protect, requireAdmin, adminController.getAllChatRooms);

// Get chat room by ID
router.get('/chat-rooms/:roomId', protect, requireAdmin, adminController.getChatRoomById);

// Delete chat room
router.delete('/chat-rooms/:roomId', protect, requireAdmin, adminController.deleteChatRoom);

// Get all party rooms
router.get('/party-rooms', protect, requireAdmin, adminController.getAllPartyRooms);

// Get party room by ID
router.get('/party-rooms/:partyId', protect, requireAdmin, adminController.getPartyRoomById);

// Delete party room
router.delete('/party-rooms/:partyId', protect, requireAdmin, adminController.deletePartyRoom);

// Get all transactions
router.get('/transactions', protect, requireAdmin, adminController.getAllTransactions);

// Get transaction by ID
router.get('/transactions/:transactionId', protect, requireAdmin, adminController.getTransactionById);

// Refund transaction
router.post('/transactions/:transactionId/refund', protect, requireAdmin, adminController.refundTransaction);

// Get all subscriptions
router.get('/subscriptions', protect, requireAdmin, adminController.getAllSubscriptions);

// Cancel user subscription
router.post('/subscriptions/:subscriptionId/cancel', protect, requireAdmin, adminController.cancelUserSubscription);

// Get system logs
router.get('/logs', protect, requireAdmin, adminController.getSystemLogs);

// Get analytics data
router.get('/analytics', protect, requireAdmin, adminController.getAnalytics);

// Send system announcement
router.post('/announcements', protect, requireAdmin, [
  body('title').isLength({ min: 1, max: 100 }).trim(),
  body('message').isLength({ min: 1, max: 1000 }).trim(),
  body('type').isIn(['info', 'warning', 'maintenance']),
  body('targetAudience').optional().isIn(['all', 'verified', 'premium', 'moderators']),
], adminController.sendAnnouncement);

// Get system settings
router.get('/settings', protect, requireAdmin, adminController.getSystemSettings);

// Update system settings
router.put('/settings', protect, requireAdmin, [
  body('siteName').optional().isLength({ min: 1, max: 50 }).trim(),
  body('siteDescription').optional().isLength({ max: 500 }).trim(),
  body('maintenanceMode').optional().isBoolean(),
  body('registrationEnabled').optional().isBoolean(),
  body('maxFileSize').optional().isInt({ min: 1, max: 100000 }),
], adminController.updateSystemSettings);

// Backup database
router.post('/backup', protect, requireAdmin, adminController.backupDatabase);

// Restore database
router.post('/restore', protect, requireAdmin, [
  body('backupFile').isString(),
], adminController.restoreDatabase);

module.exports = router;