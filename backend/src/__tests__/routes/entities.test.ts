import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express, { Express } from 'express';
import router from '../../api/routes/entities';
import * as haServiceModule from '../../services/homeAssistant.service';

// Mock Home Assistant service
vi.mock('../../services/homeAssistant.service', () => ({
  default: {
    getStates: vi.fn(),
    getState: vi.fn(),
    getHistory: vi.fn(),
  },
}));

describe('Entities Routes', () => {
  let app: Express;
  let mockHaService: any;

  beforeEach(() => {
    vi.clearAllMocks();

    app = express();
    app.use(express.json());
    app.use('/api/entities', router);

    mockHaService = {
      getStates: vi.fn(),
      getState: vi.fn(),
      getHistory: vi.fn(),
    };
  });

  describe('GET /api/entities', () => {
    it('returns all entities successfully', async () => {
      const mockEntities = [
        {
          entity_id: 'sensor.temperature',
          state: '22.5',
          attributes: { unit_of_measurement: '°C' },
        },
        {
          entity_id: 'sensor.humidity',
          state: '65',
          attributes: { unit_of_measurement: '%' },
        },
      ];

      vi.mocked(haServiceModule.default.getStates).mockResolvedValue(mockEntities);

      const response = await request(app).get('/api/entities');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockEntities);
      expect(response.body.count).toBe(2);
    });

    it('returns empty array when no entities', async () => {
      vi.mocked(haServiceModule.default.getStates).mockResolvedValue([]);

      const response = await request(app).get('/api/entities');

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
      expect(response.body.count).toBe(0);
    });

    it('handles service errors gracefully', async () => {
      const error = new Error('Home Assistant connection failed');
      vi.mocked(haServiceModule.default.getStates).mockRejectedValue(error);

      const response = await request(app).get('/api/entities');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/entities/:id', () => {
    it('returns specific entity state', async () => {
      const mockEntity = {
        entity_id: 'sensor.temperature',
        state: '22.5',
        attributes: { unit_of_measurement: '°C' },
        last_changed: '2024-01-17T10:00:00Z',
        last_updated: '2024-01-17T10:05:00Z',
      };

      vi.mocked(haServiceModule.default.getState).mockResolvedValue(mockEntity);

      const response = await request(app).get('/api/entities/sensor.temperature');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockEntity);
    });

    it('returns 404 for non-existent entity', async () => {
      const error = new Error('Entity not found');
      vi.mocked(haServiceModule.default.getState).mockRejectedValue(error);

      const response = await request(app).get('/api/entities/sensor.nonexistent');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });

    it('passes entity id to service correctly', async () => {
      vi.mocked(haServiceModule.default.getState).mockResolvedValue({
        entity_id: 'light.living_room',
        state: 'on',
      });

      await request(app).get('/api/entities/light.living_room');

      expect(haServiceModule.default.getState).toHaveBeenCalledWith('light.living_room');
    });
  });

  describe('GET /api/entities/:id/history', () => {
    it('returns entity history with default time range', async () => {
      const mockHistory = [
        {
          entity_id: 'sensor.temperature',
          state: '20.0',
          last_changed: '2024-01-16T10:00:00Z',
        },
        {
          entity_id: 'sensor.temperature',
          state: '22.5',
          last_changed: '2024-01-17T10:00:00Z',
        },
      ];

      vi.mocked(haServiceModule.default.getHistory).mockResolvedValue([mockHistory]);

      const response = await request(app).get('/api/entities/sensor.temperature/history');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockHistory);
      expect(response.body.entity_id).toBe('sensor.temperature');
      expect(response.body.period).toBeDefined();
    });

    it('accepts custom time range query parameters', async () => {
      const mockHistory = [];
      vi.mocked(haServiceModule.default.getHistory).mockResolvedValue([mockHistory]);

      const startDate = '2024-01-10T00:00:00Z';
      const endDate = '2024-01-17T23:59:59Z';

      const response = await request(app)
        .get(`/api/entities/sensor.temperature/history?start=${startDate}&end=${endDate}`);

      expect(response.status).toBe(200);
      expect(haServiceModule.default.getHistory).toHaveBeenCalled();
    });

    it('returns empty array when no history available', async () => {
      vi.mocked(haServiceModule.default.getHistory).mockResolvedValue([[]]);

      const response = await request(app).get('/api/entities/sensor.temperature/history');

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    });

    it('handles history fetch errors', async () => {
      const error = new Error('Failed to fetch history');
      vi.mocked(haServiceModule.default.getHistory).mockRejectedValue(error);

      const response = await request(app).get('/api/entities/sensor.temperature/history');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });

    it('uses 24h default when start/end not provided', async () => {
      vi.mocked(haServiceModule.default.getHistory).mockResolvedValue([[]]);

      await request(app).get('/api/entities/sensor.temperature/history');

      const callArgs = vi.mocked(haServiceModule.default.getHistory).mock.calls[0];
      const startTime = callArgs[1];
      const endTime = callArgs[2];

      const hoursDiff = (endTime - startTime) / (1000 * 60 * 60);
      expect(hoursDiff).toBeCloseTo(24, 1);
    });
  });

  describe('Error Response Format', () => {
    it('returns consistent error structure', async () => {
      vi.mocked(haServiceModule.default.getStates).mockRejectedValue(new Error('Error'));

      const response = await request(app).get('/api/entities');

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('error');
      expect(response.body.success).toBe(false);
    });
  });
});
