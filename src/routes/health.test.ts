import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('Health API', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health').expect(200);

      expect(response.body.status).toBe('ok');
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('GET /ready', () => {
    it('should return ready status', async () => {
      const response = await request(app).get('/ready').expect(200);

      expect(response.body.status).toBe('ready');
    });
  });
});
