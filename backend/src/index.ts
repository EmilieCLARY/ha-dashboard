import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import { logger } from './utils/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiRoutes } from './api/routes/index.js';
import { initializeWebSocket } from './websocket/socketManager.js';
import homeAssistantService from './services/homeAssistant.service.js';
import { cacheService } from './services/cache.service.js';
import { authService } from './services/auth.service.js';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
});

const PORT = process.env.PORT || 4000;

// Middleware
app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', apiRoutes);

// Error handling
app.use(errorHandler);

// Initialize WebSocket
initializeWebSocket(io);

// Initialize Home Assistant connection
async function initializeHomeAssistant() {
  try {
    // Test connection first
    const isConnected = await homeAssistantService.testConnection();
    if (!isConnected) {
      logger.error('❌ Failed to connect to Home Assistant');
      return;
    }

    // Connect to WebSocket
    await homeAssistantService.connect();

    // Forward state changes to Socket.IO clients
    homeAssistantService.on('state_changed', (data) => {
      io.emit('ha:state_changed', data);
    });

    homeAssistantService.on('connected', () => {
      logger.info('✅ Home Assistant WebSocket connected');
      io.emit('ha:connected');
    });

    homeAssistantService.on('auth_failed', () => {
      logger.error('❌ Home Assistant authentication failed');
    });

  } catch (error) {
    logger.error('Failed to initialize Home Assistant connection', error);
  }
}

// Start server
httpServer.listen(PORT, async () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📡 WebSocket server ready`);
  logger.info(`🏠 Home Assistant URL: ${process.env.HA_URL}`);
  
  // Initialize Redis cache
  try {
    await cacheService.connect();
    logger.info('✅ Redis cache connected');
  } catch (error) {
    logger.error('❌ Failed to connect to Redis cache:', error);
  }
  
  // Initialize HA connection after server starts
  await initializeHomeAssistant();
  
  // Cleanup expired tokens periodically (every hour)
  setInterval(async () => {
    try {
      await authService.cleanupExpiredTokens();
    } catch (error) {
      logger.error('Failed to cleanup expired tokens:', error);
    }
  }, 60 * 60 * 1000);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  
  // Disconnect from Redis
  await cacheService.disconnect();
  
  // Close HTTP server
  httpServer.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});
