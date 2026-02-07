import { Router, Request, Response } from 'express';
import { prisma } from '../../config/database.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { logger } from '../../utils/logger.js';

const router = Router();

// Apply authentication to all dashboard routes
router.use(authenticate);

/**
 * GET /api/dashboards
 * Get all dashboards for current user
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const dashboards = await prisma.dashboard.findMany({
      where: {
        userId,
      },
      orderBy: [
        { isDefault: 'desc' },
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    res.json({
      success: true,
      data: dashboards,
      count: dashboards.length,
    });
  } catch (error) {
    logger.error('Error fetching dashboards', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboards',
    });
  }
});

/**
 * GET /api/dashboards/templates
 * Get all available dashboard templates
 */
router.get('/templates', async (req: Request, res: Response) => {
  try {
    const templates = await prisma.dashboard.findMany({
      where: {
        isTemplate: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    res.json({
      success: true,
      data: templates,
      count: templates.length,
    });
  } catch (error) {
    logger.error('Error fetching templates', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch templates',
    });
  }
});

/**
 * GET /api/dashboards/:id
 * Get specific dashboard
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const dashboard = await prisma.dashboard.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!dashboard) {
      return res.status(404).json({
        success: false,
        error: 'Dashboard not found',
      });
    }

    res.json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    logger.error(`Error fetching dashboard ${req.params.id}`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard',
    });
  }
});

/**
 * POST /api/dashboards
 * Create new dashboard
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { name, description, config, isDefault, templateId } = req.body;

    if (!name || !config) {
      return res.status(400).json({
        success: false,
        error: 'Name and config are required',
      });
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.dashboard.updateMany({
        where: {
          userId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const dashboard = await prisma.dashboard.create({
      data: {
        userId,
        name,
        description,
        config,
        isDefault: isDefault || false,
        templateId,
      },
    });

    logger.info(`Dashboard created: ${dashboard.id} for user ${userId}`);

    res.status(201).json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    logger.error('Error creating dashboard', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create dashboard',
    });
  }
});

/**
 * PUT /api/dashboards/:id
 * Update dashboard
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const { name, description, config, isDefault, order } = req.body;

    // Verify ownership
    const existing = await prisma.dashboard.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Dashboard not found',
      });
    }

    // If setting as default, unset other defaults
    if (isDefault && !existing.isDefault) {
      await prisma.dashboard.updateMany({
        where: {
          userId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const dashboard = await prisma.dashboard.update({
      where: { id },
      data: {
        name,
        description,
        config,
        isDefault,
        order,
      },
    });

    logger.info(`Dashboard updated: ${dashboard.id}`);

    res.json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    logger.error(`Error updating dashboard ${req.params.id}`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to update dashboard',
    });
  }
});

/**
 * DELETE /api/dashboards/:id
 * Delete dashboard
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    // Verify ownership
    const existing = await prisma.dashboard.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Dashboard not found',
      });
    }

    await prisma.dashboard.delete({
      where: { id },
    });

    logger.info(`Dashboard deleted: ${id}`);

    res.json({
      success: true,
      message: 'Dashboard deleted successfully',
    });
  } catch (error) {
    logger.error(`Error deleting dashboard ${req.params.id}`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete dashboard',
    });
  }
});

/**
 * POST /api/dashboards/:id/duplicate
 * Duplicate dashboard
 */
router.post('/:id/duplicate', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const original = await prisma.dashboard.findFirst({
      where: { id, userId },
    });

    if (!original) {
      return res.status(404).json({
        success: false,
        error: 'Dashboard not found',
      });
    }

    const duplicate = await prisma.dashboard.create({
      data: {
        userId,
        name: `${original.name} (Copy)`,
        description: original.description,
        config: original.config,
        isDefault: false,
        templateId: original.templateId,
      },
    });

    logger.info(`Dashboard duplicated: ${original.id} -> ${duplicate.id}`);

    res.status(201).json({
      success: true,
      data: duplicate,
    });
  } catch (error) {
    logger.error(`Error duplicating dashboard ${req.params.id}`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to duplicate dashboard',
    });
  }
});

/**
 * POST /api/dashboards/from-template/:templateId
 * Create dashboard from template
 */
router.post('/from-template/:templateId', async (req: Request, res: Response) => {
  try {
    const { templateId } = req.params;
    const userId = req.user!.userId;
    const { name } = req.body;

    const template = await prisma.dashboard.findFirst({
      where: {
        id: templateId,
        isTemplate: true,
      },
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found',
      });
    }

    const dashboard = await prisma.dashboard.create({
      data: {
        userId,
        name: name || template.name,
        description: template.description,
        config: template.config,
        templateId: template.id,
        isDefault: false,
      },
    });

    logger.info(`Dashboard created from template: ${templateId} -> ${dashboard.id}`);

    res.status(201).json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    logger.error(`Error creating from template ${req.params.templateId}`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to create dashboard from template',
    });
  }
});

/**
 * GET /api/dashboards/:id/export
 * Export dashboard as JSON
 */
router.get('/:id/export', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const dashboard = await prisma.dashboard.findFirst({
      where: { id, userId },
    });

    if (!dashboard) {
      return res.status(404).json({
        success: false,
        error: 'Dashboard not found',
      });
    }

    const exportData = {
      name: dashboard.name,
      description: dashboard.description,
      config: dashboard.config,
      version: '1.0',
      exportedAt: new Date().toISOString(),
    };

    res.json({
      success: true,
      data: exportData,
    });
  } catch (error) {
    logger.error(`Error exporting dashboard ${req.params.id}`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to export dashboard',
    });
  }
});

/**
 * POST /api/dashboards/import
 * Import dashboard from JSON
 */
router.post('/import', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { name, description, config, version } = req.body;

    if (!config) {
      return res.status(400).json({
        success: false,
        error: 'Invalid dashboard data',
      });
    }

    // Validate version compatibility (optional)
    if (version && version !== '1.0') {
      logger.warn(`Importing dashboard with version ${version}`);
    }

    const dashboard = await prisma.dashboard.create({
      data: {
        userId,
        name: name || 'Imported Dashboard',
        description,
        config,
        isDefault: false,
      },
    });

    logger.info(`Dashboard imported: ${dashboard.id} for user ${userId}`);

    res.status(201).json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    logger.error('Error importing dashboard', error);
    res.status(500).json({
      success: false,
      error: 'Failed to import dashboard',
    });
  }
});

export default router;
