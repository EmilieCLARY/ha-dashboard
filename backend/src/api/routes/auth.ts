import { Router, Request, Response } from 'express';
import { authService } from '../../services/auth.service.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { logger } from '../../utils/logger.js';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long',
      });
      return;
    }

    // Register user
    try {
      const result = await authService.register({ email, password, name });
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error('Registration error:', error);
      let message = 'Échec de l\'inscription.';
      if (error instanceof Error && error.message.includes('User with this email already exists')) {
        message = 'Un compte existe déjà avec cet email.';
      }
      res.status(400).json({
        success: false,
        error: message,
      });
    }
});

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
      return;
    }

    // Login user
    try {
      const result = await authService.login({ email, password });
      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error('Login error:', error);
      let message = 'Échec de la connexion.';
      if (error instanceof Error && error.message.includes('Invalid email or password')) {
        message = 'Email ou mot de passe invalide.';
      }
      res.status(401).json({
        success: false,
        error: message,
      });
    }
});

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        error: 'Refresh token is required',
      });
      return;
    }

    const tokens = await authService.refreshAccessToken(refreshToken);

    res.json({
      success: true,
      data: tokens,
    });
  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      error: error instanceof Error ? error.message : 'Token refresh failed',
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout user
 */
router.post('/logout', async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await authService.logout(refreshToken);
    }

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed',
    });
  }
});

/**
 * GET /api/auth/me
 * Get current user info
 */
router.get('/me', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
      return;
    }

    const user = await authService.getUserById(req.user.userId);

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found',
      });
      return;
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    logger.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user info',
    });
  }
});

export default router;
