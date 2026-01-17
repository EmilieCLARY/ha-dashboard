import { Router, Request, Response } from 'express';
import homeAssistantService from '../../services/homeAssistant.service.js';
import { logger } from '../../utils/logger.js';

const router = Router();

/**
 * POST /api/services/:domain/:service
 * Call a Home Assistant service
 */
router.post('/:domain/:service', async (req: Request, res: Response) => {
  try {
    const { domain, service } = req.params;
    const serviceData = req.body;

    logger.info(`Calling service ${domain}.${service}`, serviceData);

    const result = await homeAssistantService.callService(domain, service, serviceData);
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error(`Error calling service ${req.params.domain}.${req.params.service}`, error);
    res.status(500).json({
      success: false,
      error: `Failed to call service ${req.params.domain}.${req.params.service}`,
    });
  }
});

export default router;
