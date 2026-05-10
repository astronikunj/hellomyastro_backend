'use strict';

const { Server } = require('socket.io');

let io;

/**
 * Initialize Socket.IO with the HTTP server
 * @param {http.Server} server
 * @returns {Server} io instance
 */
const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [process.env.CLIENT_URL, process.env.ADMIN_URL],
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  console.log('✅ Socket.IO initialized');
  return io;
};

/**
 * Get the existing Socket.IO instance
 */
const getIO = () => {
  if (!io) throw new Error('Socket.IO not initialized. Call initSocket first.');
  return io;
};

module.exports = { initSocket, getIO };
