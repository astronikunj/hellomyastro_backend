'use strict';

const asyncHandler = require('../utils/asyncHandler');
const { successResponse, createdResponse, errorResponse } = require('../utils/responseHandler');
const { Blog } = require('../models');
const { getPagination } = require('../utils/validators');
const cloudinary = require('../config/cloudinary');

/**
 * @route GET /api/blogs
 * @desc Get all active blogs with pagination
 */
const getBlogs = asyncHandler(async (req, res) => {
  const { limit, offset, page } = getPagination(req.query);
  const { count, rows } = await Blog.findAndCountAll({
    where: { isActive: true },
    limit,
    offset,
    order: [['postedOn', 'DESC']]
  });

  return res.status(200).json({
    success: true,
    message: 'Blogs fetched',
    data: rows,
    pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) }
  });
});

/**
 * @route GET /api/blogs/:id
 * @desc Get blog details
 */
const getBlogById = asyncHandler(async (req, res) => {
  const blog = await Blog.findByPk(req.params.id);
  if (!blog || !blog.isActive) return errorResponse(res, 'Blog not found', 404);

  // Increment view count
  await blog.increment('viewer');

  return successResponse(res, 'Blog details', blog);
});

/**
 * @route POST /api/admin/blogs
 * @desc Create a new blog (Admin)
 */
const createBlog = asyncHandler(async (req, res) => {
  const { title, description, author } = req.body;
  if (!title) return errorResponse(res, 'Title is required', 400);

  let imageUrl = null;
  if (req.file) {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({ folder: 'astrolly/blogs' }, (err, r) => {
        if (err) reject(err);
        else resolve(r);
      }).end(req.file.buffer);
    });
    imageUrl = result.secure_url;
  }

  const blog = await Blog.create({
    title,
    description,
    author,
    blogImage: imageUrl,
    createdBy: req.user.id
  });
  return createdResponse(res, 'Blog created', blog);
});

/**
 * @route PUT /api/admin/blogs/:id
 * @desc Update a blog (Admin)
 */
const updateBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findByPk(req.params.id);
  if (!blog) return errorResponse(res, 'Blog not found', 404);

  let imageUrl = blog.blogImage;
  if (req.file) {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({ folder: 'astrolly/blogs' }, (err, r) => {
        if (err) reject(err);
        else resolve(r);
      }).end(req.file.buffer);
    });
    imageUrl = result.secure_url;
  }

  await blog.update({
    ...req.body,
    blogImage: imageUrl,
    modifiedBy: req.user.id
  });
  return successResponse(res, 'Blog updated', blog);
});

/**
 * @route DELETE /api/admin/blogs/:id
 * @desc Delete a blog (Admin)
 */
const deleteBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findByPk(req.params.id);
  if (!blog) return errorResponse(res, 'Blog not found', 404);

  await blog.destroy();
  return successResponse(res, 'Blog deleted');
});

module.exports = {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog
};
