import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express, { Express } from 'express';
import router from '../../api/routes/services';
import * as haServiceModule from '../../services/homeAssistant.service';

// Mock Home Assistant service
vi.mock('../../services/homeAssistant.service', () => ({
  default: {
    callService: vi.fn(),
  },
}));

// Mock logger
vi.mock('../../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe('Services Routes', () => {
  let app: Express;

  beforeEach(() => {
    vi.clearAllMocks();

    app = express();
    app.use(express.json());
    app.use('/api/services', router);
  });

  describe('POST /api/services/:domain/:service', () => {
    it('calls service successfully', async () => {
      const mockResult = { success: true };
      vi.mocked(haServiceModule.default.callService).mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/services/light/turn_on')
        .send({ entity_id: 'light.living_room', brightness: 255 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockResult);
    });

    it('passes domain and service parameters correctly', async () => {
      vi.mocked(haServiceModule.default.callService).mockResolvedValue({});

      await request(app)
        .post('/api/services/climate/set_temperature')
        .send({ entity_id: 'climate.living_room', temperature: 20 });

      expect(haServiceModule.default.callService).toHaveBeenCalledWith(
        'climate',
        'set_temperature',
        expect.any(Object)
      );
    });

    it('passes service data from request body', async () => {
      const serviceData = {
        entity_id: 'light.bedroom',
        brightness: 128,
        color_temp: 4000,
      };

      vi.mocked(haServiceModule.default.callService).mockResolvedValue({});

      await request(app).post('/api/services/light/turn_on').send(serviceData);

      expect(haServiceModule.default.callService).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        serviceData
      );
    });

    it('handles various service types', async () => {
      const services = [
        { domain: 'light', service: 'turn_on' },
        { domain: 'light', service: 'turn_off' },
        { domain: 'switch', service: 'toggle' },
        { domain: 'climate', service: 'set_temperature' },
      ];

      vi.mocked(haServiceModule.default.callService).mockResolvedValue({});

      for (const srv of services) {
        await request(app)
          .post(`/api/services/${srv.domain}/${srv.service}`)
          .send({});

        expect(haServiceModule.default.callService).toHaveBeenCalledWith(
          srv.domain,
          srv.service,
          {}
        );
      }
    });

    it('returns service response data', async () => {
      const responseData = {
        result: 'Service called successfully',
        timestamp: '2024-01-17T10:00:00Z',
      };

      vi.mocked(haServiceModule.default.callService).mockResolvedValue(responseData);

      const response = await request(app)
        .post('/api/services/light/turn_on')
        .send({ entity_id: 'light.living_room' });

      expect(response.body.data).toEqual(responseData);
    });

    it('returns 500 when service call fails', async () => {
      const error = new Error('Service call failed');
      vi.mocked(haServiceModule.default.callService).mockRejectedValue(error);

      const response = await request(app)
        .post('/api/services/light/turn_on')
        .send({ entity_id: 'light.living_room' });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });

    it('includes domain and service in error message', async () => {
      const error = new Error('Connection failed');
      vi.mocked(haServiceModule.default.callService).mockRejectedValue(error);

      const response = await request(app)
        .post('/api/services/invalid_domain/invalid_service')
        .send({});

      expect(response.body.error).toContain('invalid_domain');
      expect(response.body.error).toContain('invalid_service');
    });

    it('handles empty request body', async () => {
      vi.mocked(haServiceModule.default.callService).mockResolvedValue({});

      const response = await request(app)
        .post('/api/services/light/turn_off')
        .send({});

      expect(response.status).toBe(200);
      expect(haServiceModule.default.callService).toHaveBeenCalledWith(
        'light',
        'turn_off',
        {}
      );
    });

    it('handles large request payloads', async () => {
      const largeData = {
        entity_id: 'light.living_room',
        data: 'x'.repeat(10000),
      };

      vi.mocked(haServiceModule.default.callService).mockResolvedValue({});

      const response = await request(app)
        .post('/api/services/light/turn_on')
        .send(largeData);

      expect(response.status).toBe(200);
    });

    it('returns consistent success response structure', async () => {
      vi.mocked(haServiceModule.default.callService).mockResolvedValue({
        result: 'success',
      });

      const response = await request(app)
        .post('/api/services/light/turn_on')
        .send({ entity_id: 'light.living_room' });

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('data');
      expect(response.body.success).toBe(true);
    });

    it('returns consistent error response structure', async () => {
      vi.mocked(haServiceModule.default.callService).mockRejectedValue(
        new Error('Error')
      );

      const response = await request(app)
        .post('/api/services/light/turn_on')
        .send({});

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('error');
      expect(response.body.success).toBe(false);
    });
  });

  describe('Parameter Validation', () => {
    it('handles special characters in domain and service', async () => {
      vi.mocked(haServiceModule.default.callService).mockResolvedValue({});

      const response = await request(app)
        .post('/api/services/light_custom/turn_on_bright')
        .send({});

      expect(response.status).toBe(200);
      expect(haServiceModule.default.callService).toHaveBeenCalledWith(
        'light_custom',
        'turn_on_bright',
        {}
      );
    });

    it('accepts domain with numbers', async () => {
      vi.mocked(haServiceModule.default.callService).mockResolvedValue({});

      const response = await request(app)
        .post('/api/services/zwave/turn_on_device_123')
        .send({});

      expect(response.status).toBe(200);
    });
  });
});
