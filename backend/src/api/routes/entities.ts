import { Router, Request, Response } from 'express';
import homeAssistantService from '../../services/homeAssistant.service.js';
import { logger } from '../../utils/logger.js';

const router = Router();

/**
 * GET /api/entities
 * Get all entities from Home Assistant
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const states = await homeAssistantService.getStates();
    res.json({
      success: true,
      data: states,
      count: states.length,
    });
  } catch (error) {
    logger.error('Error fetching entities', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch entities from Home Assistant',
    });
  }
});

/**
 * GET /api/entities/:id
 * Get specific entity state
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const state = await homeAssistantService.getState(id);
    
    res.json({
      success: true,
      data: state,
    });
  } catch (error) {
    logger.error(`Error fetching entity ${req.params.id}`, error);
    res.status(404).json({
      success: false,
      error: `Entity ${req.params.id} not found`,
    });
  }
});

/**
 * GET /api/entities/:id/history
 * Get entity history
 */
router.get('/:id/history', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { start, end } = req.query;

    const startTime = start ? new Date(start as string) : new Date(Date.now() - 24 * 60 * 60 * 1000);
    const endTime = end ? new Date(end as string) : new Date();

    const history = await homeAssistantService.getHistory(id, startTime, endTime);
    
    res.json({
      success: true,
      data: history[0] || [],
      entity_id: id,
      period: {
        start: startTime,
        end: endTime,
      },
    });
  } catch (error) {
    logger.error(`Error fetching history for ${req.params.id}`, error);
    res.status(500).json({
      success: false,
      error: `Failed to fetch history for ${req.params.id}`,
    });
  }
});

export default router;
