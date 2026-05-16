const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const videoChatController = require('../controllers/videoChatController');

// Find random chat partner
router.post('/find-partner', protect, videoChatController.findRandomPartner);

// Start video call with specific user
router.post('/call/:userId', protect, videoChatController.startVideoCall);

// Accept video call
router.post('/accept/:callId', protect, videoChatController.acceptVideoCall);

// Reject video call
router.post('/reject/:callId', protect, videoChatController.rejectVideoCall);

// End video call
router.post('/end/:callId', protect, videoChatController.endVideoCall);

// Get call history
router.get('/history', protect, videoChatController.getCallHistory);

// Get active calls
router.get('/active', protect, videoChatController.getActiveCalls);

// Report user in video chat
router.post('/report/:userId', protect, [
  body('reason').isIn(['inappropriate', 'harassment', 'spam', 'fake', 'other']),
  body('description').optional().isLength({ max: 500 }).trim(),
], videoChatController.reportUser);

// Block user from video chat
router.post('/block/:userId', protect, videoChatController.blockUser);

// Unblock user
router.delete('/block/:userId', protect, videoChatController.unblockUser);

// Get blocked users
router.get('/blocked', protect, videoChatController.getBlockedUsers);

// Update video chat preferences
router.put('/preferences', protect, [
  body('maxAge').optional().isInt({ min: 18, max: 100 }),
  body('gender').optional().isIn(['male', 'female', 'other', 'any']),
  body('location').optional().isInt({ min: 1, max: 1000 }),
  body('interests').optional().isArray(),
], videoChatController.updatePreferences);

// Get video chat statistics
router.get('/stats', protect, videoChatController.getStats);

module.exports = router;
