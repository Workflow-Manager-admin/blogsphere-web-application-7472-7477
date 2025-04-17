const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const tagController = require('../../controllers/tagController');
const auth = require('../../middleware/auth');
const validate = require('../../middleware/validation');

/**
 * @route   GET /api/tags
 * @desc    Get all tags
 * @access  Public
 */
router.get('/', tagController.getTags);

/**
 * @route   GET /api/tags/:id
 * @desc    Get single tag by ID or slug
 * @access  Public
 */
router.get('/:id', tagController.getTag);

/**
 * @route   POST /api/tags
 * @desc    Create a new tag
 * @access  Private
 */
router.post(
  '/',
  [
    auth,
    [
      check('name', 'Name is required').not().isEmpty(),
      check('name', 'Name cannot exceed 30 characters').isLength({ max: 30 })
    ],
    validate
  ],
  tagController.createTag
);

/**
 * @route   PUT /api/tags/:id
 * @desc    Update a tag
 * @access  Private (Admin only)
 */
router.put(
  '/:id',
  [
    auth,
    [
      check('name', 'Name is required if provided').optional().not().isEmpty(),
      check('name', 'Name cannot exceed 30 characters').optional().isLength({ max: 30 })
    ],
    validate
  ],
  tagController.updateTag
);

/**
 * @route   DELETE /api/tags/:id
 * @desc    Delete a tag
 * @access  Private (Admin only)
 */
router.delete('/:id', auth, tagController.deleteTag);

/**
 * @route   GET /api/tags/:id/posts
 * @desc    Get posts by tag
 * @access  Public
 */
router.get('/:id/posts', tagController.getTagPosts);

module.exports = router;
