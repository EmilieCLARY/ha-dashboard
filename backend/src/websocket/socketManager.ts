import { Server as SocketIOServer } from 'socket.io';
import { logger } from '../utils/logger.js';

export function initializeWebSocket(io: SocketIOServer) {
  io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id}`);

    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });

    // Placeholder event handlers
    socket.on('subscribe:entities', () => {
      logger.debug(`Client ${socket.id} subscribed to entities`);
    });
  });

  return io;
}
