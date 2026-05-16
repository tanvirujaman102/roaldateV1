const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const chatController = require('../controllers/chatController');

// Get all chat rooms for user
router.get('/rooms', protect, chatController.getChatRooms);

// Create new chat room
router.post('/rooms', protect, [
  body('participants').isArray({ min: 1 }),
  body('participants.*').isMongoId(),
  body('name').optional().isLength({ min: 1, max: 100 }).trim(),
  body('type').isIn(['private', 'group', 'broadcast']),
], chatController.createChatRoom);

// Get specific chat room
router.get('/rooms/:roomId', protect, chatController.getChatRoom);

// Update chat room
router.put('/rooms/:roomId', protect, [
  body('name').optional().isLength({ min: 1, max: 100 }).trim(),
  body('description').optional().isLength({ max: 500 }).trim(),
], chatController.updateChatRoom);

// Delete chat room
router.delete('/rooms/:roomId', protect, chatController.deleteChatRoom);

// Add participants to group chat
router.post('/rooms/:roomId/participants', protect, [
  body('participants').isArray({ min: 1 }),
  body('participants.*').isMongoId(),
], chatController.addParticipants);

// Remove participants from group chat
router.delete('/rooms/:roomId/participants/:userId', protect, chatController.removeParticipant);

// Leave chat room
router.post('/rooms/:roomId/leave', protect, chatController.leaveChatRoom);

// Get messages in chat room
router.get('/rooms/:roomId/messages', protect, chatController.getMessages);

// Send message
router.post('/rooms/:roomId/messages', protect, upload.single('media'), [
  body('content').optional().isLength({ min: 1, max: 2000 }).trim(),
  body('messageType').isIn(['text', 'image', 'video', 'audio', 'file']),
  body('replyTo').optional().isMongoId(),
], chatController.sendMessage);

// Update message
router.put('/rooms/:roomId/messages/:messageId', protect, [
  body('content').isLength({ min: 1, max: 2000 }).trim(),
], chatController.updateMessage);

// Delete message
router.delete('/rooms/:roomId/messages/:messageId', protect, chatController.deleteMessage);

// Mark message as read
router.put('/rooms/:roomId/messages/:messageId/read', protect, chatController.markMessageAsRead);

// Mark all messages as read
router.put('/rooms/:roomId/read-all', protect, chatController.markAllAsRead);

// Get unread message count
router.get('/unread-count', protect, chatController.getUnreadCount);

// Search messages
router.get('/search', protect, chatController.searchMessages);

// Get typing users in chat room
router.get('/rooms/:roomId/typing', protect, chatController.getTypingUsers);

// Start typing
router.post('/rooms/:roomId/typing', protect, chatController.startTyping);

// Stop typing
router.delete('/rooms/:roomId/typing', protect, chatController.stopTyping);

// Block user in chat
router.post('/rooms/:roomId/block/:userId', protect, chatController.blockUser);

// Unblock user in chat
router.delete('/rooms/:roomId/block/:userId', protect, chatController.unblockUser);

// Report message
router.post('/rooms/:roomId/messages/:messageId/report', protect, [
  body('reason').isIn(['spam', 'inappropriate', 'harassment', 'fake', 'other']),
  body('description').optional().isLength({ max: 500 }).trim(),
], chatController.reportMessage);

module.exports = router;
