import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import express from 'express';

describe('Health Check API', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.get('/health', (req, res) => {
      res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
    });
  });

  it('should return 200 OK for health check', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('timestamp');
  });

  it('should return JSON content type', async () => {
    const response = await request(app).get('/health');
    expect(response.type).toBe('application/json');
  });
});
