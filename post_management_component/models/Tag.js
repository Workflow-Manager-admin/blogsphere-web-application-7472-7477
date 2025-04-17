const mongoose = require('mongoose');

/**
 * Tag Schema
 * Defines the structure for post tags
 */
const TagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tag name is required'],
      trim: true,
      unique: true,
      maxlength: [30, 'Tag name cannot be more than 30 characters']
    },
    slug: {
      type: String,
      unique: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Create slug from name before saving
TagSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-');
  }
  next();
});

module.exports = mongoose.model('Tag', TagSchema);
