const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const categoryController = require('../../controllers/categoryController');
const auth = require('../../middleware/auth');
const validate = require('../../middleware/validation');

/**
 * @route   GET /api/categories
 * @desc    Get all categories
 * @access  Public
 */
router.get('/', categoryController.getCategories);

/**
 * @route   GET /api/categories/:id
 * @desc    Get single category by ID or slug
 * @access  Public
 */
router.get('/:id', categoryController.getCategory);

/**
 * @route   POST /api/categories
 * @desc    Create a new category
 * @access  Private (Admin only)
 */
router.post(
  '/',
  [
    auth,
    [
      check('name', 'Name is required').not().isEmpty(),
      check('name', 'Name cannot exceed 50 characters').isLength({ max: 50 })
    ],
    validate
  ],
  categoryController.createCategory
);

/**
 * @route   PUT /api/categories/:id
 * @desc    Update a category
 * @access  Private (Admin only)
 */
router.put(
  '/:id',
  [
    auth,
    [
      check('name', 'Name is required if provided').optional().not().isEmpty(),
      check('name', 'Name cannot exceed 50 characters').optional().isLength({ max: 50 })
    ],
    validate
  ],
  categoryController.updateCategory
);

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete a category
 * @access  Private (Admin only)
 */
router.delete('/:id', auth, categoryController.deleteCategory);

/**
 * @route   GET /api/categories/:id/posts
 * @desc    Get posts by category
 * @access  Public
 */
router.get('/:id/posts', categoryController.getCategoryPosts);

module.exports = router;
