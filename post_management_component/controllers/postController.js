const Post = require('../models/Post');
const { postStatus, pagination } = require('../config/config');
const marked = require('marked');

/**
 * PUBLIC_INTERFACE
 * Get all posts with pagination
 * @route GET /api/posts
 * @access Public
 */
exports.getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || pagination.defaultLimit;
    const startIndex = (page - 1) * limit;
    
    // Only return published posts for public access
    const query = { status: postStatus.PUBLISHED };
    
    // Apply category filter if provided
    if (req.query.category) {
      query.categories = req.query.category;
    }
    
    // Apply tag filter if provided
    if (req.query.tag) {
      query.tags = req.query.tag;
    }
    
    const posts = await Post.find(query)
      .populate('author', 'name email')
      .populate('categories', 'name')
      .populate('tags', 'name')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);
    
    const total = await Post.countDocuments(query);
    
    res.json({
      success: true,
      count: posts.length,
      total,
      pagination: {
        current: page,
        totalPages: Math.ceil(total / limit)
      },
      data: posts
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * PUBLIC_INTERFACE
 * Get single post by ID or slug
 * @route GET /api/posts/:id
 * @access Public
 */
exports.getPost = async (req, res) => {
  try {
    let post;
    
    // Check if the parameter is a valid ObjectId
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      post = await Post.findById(req.params.id);
    } else {
      // If not an ObjectId, try to find by slug
      post = await Post.findOne({ slug: req.params.id });
    }
    
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    
    // Increment view count
    post.viewCount += 1;
    await post.save();
    
    // Populate related fields
    await post.populate('author', 'name email');
    await post.populate('categories', 'name');
    await post.populate('tags', 'name');
    
    res.json({ success: true, data: post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * PUBLIC_INTERFACE
 * Create a new post
 * @route POST /api/posts
 * @access Private
 */
exports.createPost = async (req, res) => {
  try {
    const { title, content, excerpt, categories, tags, status, featuredImage } = req.body;
    
    // Process markdown content if provided
    let processedContent = content;
    if (content) {
      processedContent = marked.parse(content);
    }
    
    const newPost = new Post({
      title,
      content: processedContent,
      excerpt: excerpt || content.substring(0, 160),
      author: req.user.id, // Set from auth middleware
      categories,
      tags,
      status: status || postStatus.DRAFT,
      featuredImage
    });
    
    const post = await newPost.save();
    
    res.status(201).json({ success: true, data: post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * PUBLIC_INTERFACE
 * Update a post
 * @route PUT /api/posts/:id
 * @access Private
 */
exports.updatePost = async (req, res) => {
  try {
    let post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    
    // Check if user is the author or an admin
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this post' });
    }
    
    // Process markdown content if provided
    if (req.body.content) {
      req.body.content = marked.parse(req.body.content);
    }
    
    // Update post
    post = await Post.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    
    res.json({ success: true, data: post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * PUBLIC_INTERFACE
 * Delete a post
 * @route DELETE /api/posts/:id
 * @access Private
 */
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    
    // Check if user is the author or an admin
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this post' });
    }
    
    await post.remove();
    
    res.json({ success: true, message: 'Post removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * PUBLIC_INTERFACE
 * Get all posts for a specific user (including drafts)
 * @route GET /api/posts/user/:userId
 * @access Private
 */
exports.getUserPosts = async (req, res) => {
  try {
    // Check if user is requesting their own posts or is an admin
    if (req.params.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    const posts = await Post.find({ author: req.params.userId })
      .populate('categories', 'name')
      .populate('tags', 'name')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, count: posts.length, data: posts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * PUBLIC_INTERFACE
 * Change post status (draft/published/archived)
 * @route PUT /api/posts/:id/status
 * @access Private
 */
exports.changePostStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!Object.values(postStatus).includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }
    
    let post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    
    // Check if user is the author or an admin
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this post' });
    }
    
    post.status = status;
    
    // If publishing, set publishedAt date
    if (status === postStatus.PUBLISHED && !post.publishedAt) {
      post.publishedAt = Date.now();
      post.isPublished = true;
    }
    
    await post.save();
    
    res.json({ success: true, data: post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
