const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const postController = require('../../controllers/postController');
const auth = require('../../middleware/auth');
const validate = require('../../middleware/validation');

/**
 * @route   GET /api/posts
 * @desc    Get all posts with pagination
 * @access  Public
 */
router.get('/', postController.getPosts);

/**
 * @route   GET /api/posts/:id
 * @desc    Get single post by ID or slug
 * @access  Public
 */
router.get('/:id', postController.getPost);

/**
 * @route   POST /api/posts
 * @desc    Create a new post
 * @access  Private
 */
router.post(
  '/',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('content', 'Content is required').not().isEmpty()
    ],
    validate
  ],
  postController.createPost
);

/**
 * @route   PUT /api/posts/:id
 * @desc    Update a post
 * @access  Private
 */
router.put(
  '/:id',
  [
    auth,
    [
      check('title', 'Title is required if provided').optional().not().isEmpty(),
      check('content', 'Content is required if provided').optional().not().isEmpty()
    ],
    validate
  ],
  postController.updatePost
);

/**
 * @route   DELETE /api/posts/:id
 * @desc    Delete a post
 * @access  Private
 */
router.delete('/:id', auth, postController.deletePost);

/**
 * @route   GET /api/posts/user/:userId
 * @desc    Get all posts for a specific user (including drafts)
 * @access  Private
 */
router.get('/user/:userId', auth, postController.getUserPosts);

/**
 * @route   PUT /api/posts/:id/status
 * @desc    Change post status (draft/published/archived)
 * @access  Private
 */
router.put(
  '/:id/status',
  [
    auth,
    [
      check('status', 'Status is required').not().isEmpty()
    ],
    validate
  ],
  postController.changePostStatus
);

module.exports = router;
