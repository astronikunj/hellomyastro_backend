'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const astrologerRoutes = require('./routes/astrologerRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const chatRoutes = require('./routes/chatRoutes');
const callRoutes = require('./routes/callRoutes');
const walletRoutes = require('./routes/walletRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const kundliRoutes = require('./routes/kundliRoutes');
const horoscopeRoutes = require('./routes/horoscopeRoutes');
const astromallRoutes = require('./routes/astromallRoutes');
const commonRoutes = require('./routes/commonRoutes');

// Import error handlers
const { errorMiddleware, notFoundMiddleware } = require('./middleware/errorMiddleware');

// Initialize configs (Cloudinary, Firebase)
require('./config/cloudinary');
require('./config/firebase');

const app = express();

// ===========================================================
// SECURITY MIDDLEWARE
// ===========================================================

app.use(helmet()); // Security headers

app.use(
  cors({
    origin: [
      process.env.CLIENT_URL || 'http://localhost:3000',
      process.env.ADMIN_URL || 'http://localhost:3001',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate limiting — 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Stricter rate limit for auth routes (20 req / 15 min)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts, please try again later.' },
});
app.use('/api/auth/', authLimiter);

// ===========================================================
// BODY PARSING
// ===========================================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for local uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ===========================================================
// SWAGGER API DOCUMENTATION
// ===========================================================
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Astrolly API',
      version: '1.0.0',
      description: 'Production-ready REST API for the Astrolly astrology application',
      contact: {
        name: 'Astrolly Team',
        email: 'dev@astrolly.com',
      },
    },
    servers: [
      { url: `http://localhost:${process.env.PORT || 5000}/api`, description: 'Development Server' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
app.get('/api/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ===========================================================
// HEALTH CHECK
// ===========================================================
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🌟 Astrolly API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ===========================================================
// API ROUTES
// ===========================================================
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/astrologers', astrologerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/calls', callRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/kundli', kundliRoutes);
app.use('/api/horoscope', horoscopeRoutes);
app.use('/api/astromall', astromallRoutes);
app.use('/api/common', commonRoutes);

// ===========================================================
// ERROR HANDLING
// ===========================================================
app.use(notFoundMiddleware); // 404 handler
app.use(errorMiddleware);    // Global error handler

module.exports = app;
