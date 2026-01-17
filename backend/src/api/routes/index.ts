import { Router } from 'express';
import authRoutes from './auth.js';
import entitiesRoutes from './entities.js';
import servicesRoutes from './services.js';

export const apiRoutes = Router();

// Health check
apiRoutes.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Authentication routes
apiRoutes.use('/auth', authRoutes);

// Home Assistant routes
apiRoutes.use('/entities', entitiesRoutes);
apiRoutes.use('/services', servicesRoutes);
