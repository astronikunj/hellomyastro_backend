'use strict';

const { getIO } = require('../config/socket');

/**
 * In-memory map of connected users { userId: socketId }
 * For production, replace with Redis to support multi-process
 */
const connectedUsers = new Map();

/**
 * Initialize Socket.IO event handlers
 * @param {Server} io - Socket.IO server instance
 */
const initSocketService = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // ---- User comes online ----
    socket.on('user:join', (userId) => {
      connectedUsers.set(String(userId), socket.id);
      socket.userId = String(userId);
      socket.join(`user:${userId}`);
      console.log(`👤 User ${userId} joined — socketId: ${socket.id}`);

      // Broadcast online status to all rooms this user is part of
      io.emit('user:online', { userId });
    });

    // ---- Join a specific chat room ----
    socket.on('chat:join', ({ roomId }) => {
      socket.join(roomId);
      console.log(`💬 Socket ${socket.id} joined room: ${roomId}`);
    });

    // ---- Send a message ----
    socket.on('chat:message', (data) => {
      // Broadcast to the room (excluding sender)
      socket.to(data.roomId).emit('chat:message', data);
    });

    // ---- Typing indicator ----
    socket.on('chat:typing', ({ roomId, userId, isTyping }) => {
      socket.to(roomId).emit('chat:typing', { userId, isTyping });
    });

    // ---- Mark messages as read ----
    socket.on('chat:read', ({ roomId, userId }) => {
      socket.to(roomId).emit('chat:read', { userId });
    });

    // ---- Call events ----
    socket.on('call:initiate', (data) => {
      const targetSocketId = connectedUsers.get(String(data.targetUserId));
      if (targetSocketId) {
        io.to(targetSocketId).emit('call:incoming', data);
      } else {
        socket.emit('call:missed', { reason: 'User is offline' });
      }
    });

    socket.on('call:accepted', (data) => {
      const callerSocketId = connectedUsers.get(String(data.callerId));
      if (callerSocketId) io.to(callerSocketId).emit('call:accepted', data);
    });

    socket.on('call:rejected', (data) => {
      const callerSocketId = connectedUsers.get(String(data.callerId));
      if (callerSocketId) io.to(callerSocketId).emit('call:rejected', data);
    });

    socket.on('call:ended', (data) => {
      socket.to(data.roomId).emit('call:ended', data);
    });

    // ---- Disconnect ----
    socket.on('disconnect', () => {
      if (socket.userId) {
        connectedUsers.delete(socket.userId);
        io.emit('user:offline', { userId: socket.userId });
        console.log(`❌ User ${socket.userId} disconnected`);
      }
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });
};

/**
 * Check if a user is currently connected via socket
 */
const isUserOnline = (userId) => connectedUsers.has(String(userId));

/**
 * Emit an event to a specific user via their room
 */
const emitToUser = (userId, event, data) => {
  try {
    const io = getIO();
    io.to(`user:${userId}`).emit(event, data);
  } catch {
    // Socket not initialized — skip silently
  }
};

module.exports = { initSocketService, isUserOnline, emitToUser, connectedUsers };
