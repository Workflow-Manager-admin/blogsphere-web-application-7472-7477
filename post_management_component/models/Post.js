const mongoose = require('mongoose');
const { postStatus } = require('../config/config');

/**
 * Post Schema
 * Defines the structure for blog posts including title, content, author, status, etc.
 */
const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters']
    },
    content: {
      type: String,
      required: [true, 'Content is required']
    },
    excerpt: {
      type: String,
      maxlength: [500, 'Excerpt cannot be more than 500 characters']
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required']
    },
    status: {
      type: String,
      enum: Object.values(postStatus),
      default: postStatus.DRAFT
    },
    categories: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    }],
    tags: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tag'
    }],
    featuredImage: {
      type: String
    },
    slug: {
      type: String,
      unique: true,
      trim: true
    },
    viewCount: {
      type: Number,
      default: 0
    },
    isPublished: {
      type: Boolean,
      default: false
    },
    publishedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Create slug from title before saving
PostSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-');
  }
  
  // Set publishedAt date when post is published
  if (this.isModified('status') && this.status === postStatus.PUBLISHED) {
    this.publishedAt = Date.now();
    this.isPublished = true;
  }
  
  next();
});

module.exports = mongoose.model('Post', PostSchema);
