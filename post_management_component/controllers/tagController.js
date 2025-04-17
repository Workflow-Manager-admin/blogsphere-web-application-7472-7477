const Tag = require('../models/Tag');
const Post = require('../models/Post');

/**
 * PUBLIC_INTERFACE
 * Get all tags
 * @route GET /api/tags
 * @access Public
 */
exports.getTags = async (req, res) => {
  try {
    const tags = await Tag.find().sort({ name: 1 });
    
    res.json({ success: true, count: tags.length, data: tags });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * PUBLIC_INTERFACE
 * Get single tag by ID or slug
 * @route GET /api/tags/:id
 * @access Public
 */
exports.getTag = async (req, res) => {
  try {
    let tag;
    
    // Check if the parameter is a valid ObjectId
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      tag = await Tag.findById(req.params.id);
    } else {
      // If not an ObjectId, try to find by slug
      tag = await Tag.findOne({ slug: req.params.id });
    }
    
    if (!tag) {
      return res.status(404).json({ success: false, message: 'Tag not found' });
    }
    
    res.json({ success: true, data: tag });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * PUBLIC_INTERFACE
 * Create a new tag
 * @route POST /api/tags
 * @access Private
 */
exports.createTag = async (req, res) => {
  try {
    const { name } = req.body;
    
    // Check if tag already exists
    const existingTag = await Tag.findOne({ name });
    if (existingTag) {
      return res.status(400).json({ success: false, message: 'Tag already exists' });
    }
    
    const newTag = new Tag({ name });
    
    const tag = await newTag.save();
    
    res.status(201).json({ success: true, data: tag });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * PUBLIC_INTERFACE
 * Update a tag
 * @route PUT /api/tags/:id
 * @access Private (Admin only)
 */
exports.updateTag = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    let tag = await Tag.findById(req.params.id);
    
    if (!tag) {
      return res.status(404).json({ success: false, message: 'Tag not found' });
    }
    
    tag = await Tag.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    
    res.json({ success: true, data: tag });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * PUBLIC_INTERFACE
 * Delete a tag
 * @route DELETE /api/tags/:id
 * @access Private (Admin only)
 */
exports.deleteTag = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    const tag = await Tag.findById(req.params.id);
    
    if (!tag) {
      return res.status(404).json({ success: false, message: 'Tag not found' });
    }
    
    // Remove tag from all posts that use it
    await Post.updateMany(
      { tags: req.params.id },
      { $pull: { tags: req.params.id } }
    );
    
    await tag.remove();
    
    res.json({ success: true, message: 'Tag removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * PUBLIC_INTERFACE
 * Get posts by tag
 * @route GET /api/tags/:id/posts
 * @access Public
 */
exports.getTagPosts = async (req, res) => {
  try {
    let tagId = req.params.id;
    
    // If the parameter is not a valid ObjectId, try to find by slug
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      const tag = await Tag.findOne({ slug: req.params.id });
      if (!tag) {
        return res.status(404).json({ success: false, message: 'Tag not found' });
      }
      tagId = tag._id;
    }
    
    const posts = await Post.find({
      tags: tagId,
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
