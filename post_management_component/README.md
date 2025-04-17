# Post Management Component

## Overview
This component handles the management of blog posts, including creation, editing, deletion, draft workflow, and categorization/tagging.

## Core Technologies
- **Primary Programming Language**: Node.js (v16.x or later)
- **Frameworks**: Express.js (v4.x), Mongoose (v6.x)
- **Database**: MongoDB (v5.x)
- **Authentication**: JWT (JSON Web Tokens)
- **Markdown Processing**: Marked.js (v4.x)

## Project Structure
```
├── config/             # Configuration files
│   ├── config.js       # Application configuration
│   └── db.js           # Database connection
├── controllers/        # Route controllers
│   ├── postController.js
│   ├── categoryController.js
│   └── tagController.js
├── middleware/         # Express middleware
│   ├── auth.js         # JWT authentication
│   ├── admin.js        # Admin role check
│   └── validation.js   # Request validation
├── models/             # Mongoose models
│   ├── Post.js
│   ├── User.js
│   ├── Category.js
│   └── Tag.js
├── routes/             # API routes
│   └── api/
│       ├── posts.js
│       ├── categories.js
│       └── tags.js
├── .env                # Environment variables
└── server.js           # Entry point
```

## API Endpoints

### Posts
- `GET /api/posts` - Get all posts with pagination
- `GET /api/posts/:id` - Get single post by ID or slug
- `POST /api/posts` - Create a new post
- `PUT /api/posts/:id` - Update a post
- `DELETE /api/posts/:id` - Delete a post
- `GET /api/posts/user/:userId` - Get all posts for a specific user
- `PUT /api/posts/:id/status` - Change post status

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get single category by ID or slug
- `POST /api/categories` - Create a new category (Admin only)
- `PUT /api/categories/:id` - Update a category (Admin only)
- `DELETE /api/categories/:id` - Delete a category (Admin only)
- `GET /api/categories/:id/posts` - Get posts by category

### Tags
- `GET /api/tags` - Get all tags
- `GET /api/tags/:id` - Get single tag by ID or slug
- `POST /api/tags` - Create a new tag
- `PUT /api/tags/:id` - Update a tag (Admin only)
- `DELETE /api/tags/:id` - Delete a tag (Admin only)
- `GET /api/tags/:id/posts` - Get posts by tag

## Setup and Running

1. Install dependencies:
   ```
   npm install
   ```

2. Set up environment variables in `.env` file:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/blogsphere
   JWT_SECRET=your_jwt_secret
   NODE_ENV=development
   ```

3. Run the server:
   ```
   npm run server
   ```

4. Run both frontend and backend in development mode:
   ```
   npm run dev
   ```
