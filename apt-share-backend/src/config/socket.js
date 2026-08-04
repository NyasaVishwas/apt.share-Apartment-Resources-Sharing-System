const { Server } = require('socket.io');
const logger = require('./logger');
const { verifyAccessToken } = require('../utils/tokenUtils');

let io = null;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      credentials: true
    }
  });

  // Socket Authentication Middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      return next(new Error('Authentication token missing'));
    }

    try {
      const decoded = verifyAccessToken(token);
      socket.userId = decoded.userId;
      next();
    } catch (err) {
      return next(new Error('Invalid socket token'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Socket Connected: ${socket.id} (User: ${socket.userId})`);

    // Join personal user notification room
    socket.join(`user:${socket.userId}`);

    // Join chat thread room
    socket.on('thread:join', (threadId) => {
      socket.join(`thread:${threadId}`);
      logger.info(`User ${socket.userId} joined thread:${threadId}`);
    });

    socket.on('thread:leave', (threadId) => {
      socket.leave(`thread:${threadId}`);
    });

    socket.on('typing:start', ({ threadId }) => {
      socket.to(`thread:${threadId}`).emit('typing:user_start', { userId: socket.userId });
    });

    socket.on('typing:stop', ({ threadId }) => {
      socket.to(`thread:${threadId}`).emit('typing:user_stop', { userId: socket.userId });
    });

    socket.on('disconnect', () => {
      logger.info(`Socket Disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  return io;
};

module.exports = {
  initSocket,
  getIO
};
