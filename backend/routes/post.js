const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const postController = require('../controllers/postController');
const { upload } = require('../middleware/upload');

// ✅ Static routes MUST come before dynamic /:postId routes

// Get saved posts
router.get('/saved', protect, postController.getSavedPosts);

// Get trending posts
router.get('/trending', protect, postController.getTrendingPosts);

// Get user's posts
router.get('/user/:userId', protect, postController.getUserPosts);

// Get all posts (feed)
router.get('/', protect, postController.getPosts);

// Create a new post
router.post('/', protect, upload.array('media', 10), [
  body('content').optional().isLength({ max: 2000 }).trim(),
  body('tags').optional().isArray(),
  body('location').optional().isLength({ max: 100 }).trim(),
  body('feeling').optional().isLength({ max: 50 }).trim(),
], postController.createPost);

// Get post by ID (dynamic - must be after all static routes)
router.get('/:postId', protect, postController.getPostById);

// Update post
router.put('/:postId', protect, [
  body('content').optional().isLength({ max: 2000 }).trim(),
  body('tags').optional().isArray(),
], postController.updatePost);

// Delete post
router.delete('/:postId', protect, postController.deletePost);

// Like/unlike post
router.post('/:postId/like', protect, postController.likePost);
router.delete('/:postId/like', protect, postController.unlikePost);

// Comment on post
router.post('/:postId/comments', protect, [
  body('content').isLength({ min: 1, max: 500 }).trim(),
], postController.addComment);

// Get post comments
router.get('/:postId/comments', protect, postController.getComments);

// Update comment
router.put('/:postId/comments/:commentId', protect, [
  body('content').isLength({ min: 1, max: 500 }).trim(),
], postController.updateComment);

// Delete comment
router.delete('/:postId/comments/:commentId', protect, postController.deleteComment);

// Share post
router.post('/:postId/share', protect, postController.sharePost);

// Save/unsave post
router.post('/:postId/save', protect, postController.savePost);
router.delete('/:postId/save', protect, postController.unsavePost);

// Report post
router.post('/:postId/report', protect, [
  body('reason').isIn(['spam', 'inappropriate', 'harassment', 'fake', 'other']),
  body('description').optional().isLength({ max: 500 }).trim(),
], postController.reportPost);

module.exports = router;
