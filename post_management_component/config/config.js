/**
 * Configuration settings for the application
 */
module.exports = {
  // JWT settings
  jwtSecret: process.env.JWT_SECRET || 'blogsphere_secret_key',
  jwtExpiration: '24h',
  
  // Post status options
  postStatus: {
    DRAFT: 'draft',
    PUBLISHED: 'published',
    ARCHIVED: 'archived'
  },
  
  // Default pagination settings
  pagination: {
    defaultLimit: 10,
    maxLimit: 50
  }
};
