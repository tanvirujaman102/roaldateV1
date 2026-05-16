const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const { uploadDatingPhotos } = require('../middleware/upload');
const datingController = require('../controllers/datingController');

// Get dating profile
router.get('/profile', protect, datingController.getDatingProfile);

// Create/update dating profile
router.put('/profile', protect, [
  body('bio').optional().isLength({ min: 50, max: 500 }).trim(),
  body('age').optional().isInt({ min: 18, max: 100 }),
  body('gender').optional().isIn(['male', 'female', 'other']),
  body('interestedIn').optional().isArray(),
  body('interestedIn.*').isIn(['male', 'female', 'other']),
  body('location').optional().isLength({ max: 100 }).trim(),
  body('interests').optional().isArray(),
  body('interests.*').isLength({ min: 1, max: 30 }).trim(),
  body('lookingFor').optional().isLength({ max: 200 }).trim(),
  body('relationshipType').optional().isIn(['casual', 'serious', 'friendship', 'any']),
  body('height').optional().isInt({ min: 100, max: 300 }),
  body('education').optional().isLength({ max: 100 }).trim(),
  body('job').optional().isLength({ max: 100 }).trim(),
  body('company').optional().isLength({ max: 100 }).trim(),
], datingController.updateDatingProfile);

// Upload dating profile photos
router.post('/profile/photos', protect, uploadDatingPhotos, datingController.uploadPhotos);

// Delete dating profile photo
router.delete('/profile/photos/:photoId', protect, datingController.deletePhoto);

// Set primary photo
router.put('/profile/photos/:photoId/primary', protect, datingController.setPrimaryPhoto);

// Get potential matches (swipe deck)
router.get('/matches', protect, datingController.getPotentialMatches);

// Swipe on profile
router.post('/swipe/:profileId', protect, [
  body('action').isIn(['like', 'pass', 'super_like']),
], datingController.swipeProfile);

// Get user's matches
router.get('/my-matches', protect, datingController.getUserMatches);

// Get match details
router.get('/my-matches/:matchId', protect, datingController.getMatchDetails);

// Send message to match
router.post('/my-matches/:matchId/message', protect, [
  body('content').isLength({ min: 1, max: 500 }).trim(),
], datingController.sendMessage);

// Get conversation with match
router.get('/my-matches/:matchId/messages', protect, datingController.getMessages);

// Unmatch with user
router.delete('/my-matches/:matchId', protect, datingController.unmatch);

// Report user
router.post('/report/:profileId', protect, [
  body('reason').isIn(['inappropriate', 'harassment', 'spam', 'fake', 'other']),
  body('description').optional().isLength({ max: 500 }).trim(),
], datingController.reportUser);

// Block user
router.post('/block/:profileId', protect, datingController.blockUser);

// Unblock user
router.delete('/block/:profileId', protect, datingController.unblockUser);

// Get blocked users
router.get('/blocked', protect, datingController.getBlockedUsers);

// Get dating preferences
router.get('/preferences', protect, datingController.getPreferences);

// Update dating preferences
router.put('/preferences', protect, [
  body('ageRange.min').optional().isInt({ min: 18, max: 100 }),
  body('ageRange.max').optional().isInt({ min: 18, max: 100 }),
  body('maxDistance').optional().isInt({ min: 1, max: 500 }),
  body('interestedIn').optional().isArray(),
  body('interestedIn.*').isIn(['male', 'female', 'other']),
  body('showOnlyVerified').optional().isBoolean(),
], datingController.updatePreferences);

// Get dating statistics
router.get('/stats', protect, datingController.getStats);

// Boost profile (premium feature)
router.post('/boost', protect, datingController.boostProfile);

// Get super likes count
router.get('/super-likes', protect, datingController.getSuperLikesCount);

// Purchase super likes
router.post('/super-likes/purchase', protect, [
  body('quantity').isInt({ min: 1, max: 50 }),
], datingController.purchaseSuperLikes);

module.exports = router;
