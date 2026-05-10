'use strict';

const multer = require('multer');
const path = require('path');
const { errorResponse } = require('../utils/responseHandler');

// Allowed file MIME types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_MEDIA_TYPES = [...ALLOWED_IMAGE_TYPES, 'audio/mpeg', 'audio/ogg', 'application/pdf'];

// --- Disk storage (for local temp before Cloudinary upload) ---
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// --- Memory storage (for direct Cloudinary buffer upload) ---
const memoryStorage = multer.memoryStorage();

/**
 * Filter by image types only
 */
const imageFilter = (req, file, cb) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WebP images are allowed.'), false);
  }
};

/**
 * Filter for image + audio + pdf
 */
const mediaFilter = (req, file, cb) => {
  if (ALLOWED_MEDIA_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type.'), false);
  }
};

/**
 * Single profile image upload (memory, for Cloudinary)
 */
const uploadProfileImage = multer({
  storage: memoryStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
}).single('profileImage');

/**
 * Single chat media upload
 */
const uploadChatMedia = multer({
  storage: memoryStorage,
  fileFilter: mediaFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
}).single('media');

/**
 * Multiple document uploads (for astrologer verification)
 */
const uploadDocuments = multer({
  storage: diskStorage,
  fileFilter: mediaFilter,
  limits: { fileSize: 10 * 1024 * 1024, files: 5 },
}).array('documents', 5);

/**
 * Banner image upload (admin)
 */
const uploadBannerImage = multer({
  storage: memoryStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
}).single('bannerImage');

/**
 * Multer error handler middleware
 */
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return errorResponse(res, 'File too large.', 400);
    }
    return errorResponse(res, `Upload error: ${err.message}`, 400);
  }
  if (err) {
    return errorResponse(res, err.message, 400);
  }
  next();
};

module.exports = {
  uploadProfileImage,
  uploadChatMedia,
  uploadDocuments,
  uploadBannerImage,
  handleUploadError,
};
