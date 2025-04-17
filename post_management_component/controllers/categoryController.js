const Category = require('../models/Category');
const Post = require('../models/Post');

/**
 * PUBLIC_INTERFACE
 * Get all categories
 * @route GET /api/categories
 * @access Public
 */
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    
    res.json({ success: true, count: categories.length, data: categories });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * PUBLIC_INTERFACE
 * Get single category by ID or slug
 * @route GET /api/categories/:id
 * @access Public
 */
exports.getCategory = async (req, res) => {
  try {
    let category;
    
    // Check if the parameter is a valid ObjectId
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      category = await Category.findById(req.params.id);
    } else {
      // If not an ObjectId, try to find by slug
      category = await Category.findOne({ slug: req.params.id });
    }
    
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    
    res.json({ success: true, data: category });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * PUBLIC_INTERFACE
 * Create a new category
 * @route POST /api/categories
 * @access Private (Admin only)
 */
exports.createCategory = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    const { name, description } = req.body;
    
    // Check if category already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }
    
    const newCategory = new Category({
      name,
      description
    });
    
    const category = await newCategory.save();
    
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * PUBLIC_INTERFACE
 * Update a category
 * @route PUT /api/categories/:id
 * @access Private (Admin only)
 */
exports.updateCategory = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    let category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    
    category = await Category.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    
    res.json({ success: true, data: category });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * PUBLIC_INTERFACE
 * Delete a category
 * @route DELETE /api/categories/:id
 * @access Private (Admin only)
 */
exports.deleteCategory = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    
    // Remove category from all posts that use it
    await Post.updateMany(
      { categories: req.params.id },
      { $pull: { categories: req.params.id } }
    );
    
    await category.remove();
    
    res.json({ success: true, message: 'Category removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * PUBLIC_INTERFACE
 * Get posts by category
 * @route GET /api/categories/:id/posts
 * @access Public
 */
exports.getCategoryPosts = async (req, res) => {
  try {
    let categoryId = req.params.id;
    
    // If the parameter is not a valid ObjectId, try to find by slug
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      const category = await Category.findOne({ slug: req.params.id });
      if (!category) {
        return res.status(404).json({ success: false, message: 'Category not found' });
      }
      categoryId = category._id;
    }
    
    const posts = await Post.find({
      categories: categoryId,
      status: 'published'
    })
      .populate('author', 'name')
      .populate('categories', 'name')
      .populate('tags', 'name')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, count: posts.length, data: posts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
