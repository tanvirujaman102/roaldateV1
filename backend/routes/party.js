const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const partyController = require('../controllers/partyController');

// ✅ Static routes BEFORE /:partyId

// Get user's party rooms (static - must be before /:partyId)
router.get('/my-rooms', protect, partyController.getUserPartyRooms);

// Get all party rooms
router.get('/', protect, partyController.getPartyRooms);

// Create a new party room
router.post('/', protect, [
  body('name').isLength({ min: 1, max: 100 }).trim(),
  body('description').optional().isLength({ max: 500 }).trim(),
  body('type').isIn(['voice', 'video', 'both']),
  body('maxParticipants').isInt({ min: 2, max: 50 }),
  body('isPrivate').optional().isBoolean(),
  body('password').optional().isLength({ min: 4, max: 20 }).trim(),
], partyController.createPartyRoom);

// Dynamic routes (/:partyId)
router.get('/:partyId', protect, partyController.getPartyRoom);

router.post('/:partyId/join', protect, [
  body('password').optional().isLength({ min: 4, max: 20 }).trim(),
], partyController.joinPartyRoom);

router.post('/:partyId/leave', protect, partyController.leavePartyRoom);

router.put('/:partyId', protect, [
  body('name').optional().isLength({ min: 1, max: 100 }).trim(),
  body('description').optional().isLength({ max: 500 }).trim(),
  body('maxParticipants').optional().isInt({ min: 2, max: 50 }),
  body('isPrivate').optional().isBoolean(),
], partyController.updatePartyRoom);

router.delete('/:partyId', protect, partyController.deletePartyRoom);

router.post('/:partyId/kick/:userId', protect, partyController.kickParticipant);
router.post('/:partyId/ban/:userId', protect, partyController.banParticipant);
router.delete('/:partyId/ban/:userId', protect, partyController.unbanParticipant);

router.get('/:partyId/participants', protect, partyController.getParticipants);

router.post('/:partyId/participants/:userId/mute', protect, partyController.muteParticipant);
router.delete('/:partyId/participants/:userId/mute', protect, partyController.unmuteParticipant);

router.post('/:partyId/participants/:userId/moderator', protect, partyController.makeModerator);
router.delete('/:partyId/participants/:userId/moderator', protect, partyController.removeModerator);

router.post('/:partyId/screen-share/start', protect, partyController.startScreenShare);
router.post('/:partyId/screen-share/stop', protect, partyController.stopScreenShare);

router.get('/:partyId/history', protect, partyController.getPartyHistory);

router.post('/:partyId/report', protect, [
  body('reason').isIn(['inappropriate', 'harassment', 'spam', 'violence', 'other']),
  body('description').optional().isLength({ max: 500 }).trim(),
], partyController.reportPartyRoom);

router.get('/:partyId/stats', protect, partyController.getPartyStats);

module.exports = router;
