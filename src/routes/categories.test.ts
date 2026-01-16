import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { categories } from '../data/categories.js';

describe('GET /categories', () => {
  beforeEach(() => {
    categories.length = 0;
  });

  it('should return empty array when no categories', async () => {
    const response = await request(app).get('/categories').expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual([]);
  });

  it('should return paginated categories', async () => {
    categories.push({
      id: '1',
      slug: 'dogs',
      name: 'Dogs',
      description: null,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const response = await request(app).get('/categories').expect(200);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].name).toBe('Dogs');
  });
});
