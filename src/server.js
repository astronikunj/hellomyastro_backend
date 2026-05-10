'use strict';

require('dotenv').config();

const http = require('http');
const app = require('./app');
const { connectDB } = require('./config/db');
const { initSocket } = require('./config/socket');
const { initSocketService } = require('./services/socketService');

// Initialize models + associations
require('./models/index');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // 1. Connect to the database
  await connectDB();

  // 2. Create HTTP server
  const server = http.createServer(app);

  // 3. Initialize Socket.IO
  const io = initSocket(server);

  // 4. Set up socket event handlers
  initSocketService(io);

  // 5. Start listening
  server.listen(PORT, () => {
    console.log(`\n🚀 Astrolly Backend running on port ${PORT}`);
    console.log(`📌 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📖 API Docs:    http://localhost:${PORT}/api/docs`);
    console.log(`❤️  Health:      http://localhost:${PORT}/health\n`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Promise Rejection:', err);
    server.close(() => process.exit(1));
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
    process.exit(1);
  });

  // Graceful shutdown on SIGTERM
  process.on('SIGTERM', () => {
    console.log('📴 SIGTERM received — shutting down gracefully');
    server.close(() => {
      console.log('✅ Process terminated');
      process.exit(0);
    });
  });
};

startServer();
