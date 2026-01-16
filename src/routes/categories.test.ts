import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { categories } from '../data/categories.js';
import { products } from '../data/products.js';
import { getAdminToken } from '../tests/helpers.js';

const adminToken = getAdminToken();

describe('Categories API', () => {
  beforeEach(() => {
    categories.length = 0;
    products.length = 0;
  });

  describe('GET /categories', () => {
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
    });
  });

  describe('GET /categories/:identifier', () => {
    it('should return category by id', async () => {
      categories.push({
        id: '123',
        slug: 'dogs',
        name: 'Dogs',
        description: null,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app).get('/categories/123').expect(200);

      expect(response.body.data.name).toBe('Dogs');
    });

    it('should return 404 when not found', async () => {
      const response = await request(app).get('/categories/nonexistent').expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /categories', () => {
    it('should create category', async () => {
      const response = await request(app)
        .post('/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Dogs' })
        .expect(201);

      expect(response.body.data.name).toBe('Dogs');
      expect(response.body.data.slug).toBe('dogs');
    });

    it('should return 400 for invalid data', async () => {
      const response = await request(app)
        .post('/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /categories/:id', () => {
    it('should update category', async () => {
      categories.push({
        id: '123',
        slug: 'dogs',
        name: 'Dogs',
        description: null,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app)
        .put('/categories/123')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Cats' })
        .expect(200);

      expect(response.body.data.name).toBe('Cats');
      expect(response.body.data.slug).toBe('cats');
    });

    it('should return 404 when not found', async () => {
      await request(app)
        .put('/categories/nonexistent')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Cats' })
        .expect(404);
    });
  });

  describe('DELETE /categories/:id', () => {
    it('should delete category', async () => {
      categories.push({
        id: '123',
        slug: 'dogs',
        name: 'Dogs',
        description: null,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await request(app)
        .delete('/categories/123')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(categories).toHaveLength(0);
    });

    it('should return 404 when not found', async () => {
      await request(app)
        .delete('/categories/nonexistent')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should return 400 when category has products', async () => {
      categories.push({
        id: '123',
        slug: 'dogs',
        name: 'Dogs',
        description: null,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      products.push({
        id: '1',
        slug: 'dog-food',
        name: 'Dog Food',
        price: 10,
        description: 'Food',
        image: 'https://example.com/img.jpg',
        banner: null,
        category: '123',
        stock: 5,
        isFeatured: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await request(app)
        .delete('/categories/123')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
    });
  });

  describe('GET /categories/:identifier/products', () => {
    it('should return products for category', async () => {
      categories.push({
        id: '123',
        slug: 'dogs',
        name: 'Dogs',
        description: null,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      products.push({
        id: '1',
        slug: 'dog-food',
        name: 'Dog Food',
        price: 10,
        description: 'Food',
        image: 'https://example.com/img.jpg',
        banner: null,
        category: '123',
        stock: 5,
        isFeatured: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app).get('/categories/123/products').expect(200);

      expect(response.body.data).toHaveLength(1);
    });

    it('should return 404 when category not found', async () => {
      await request(app).get('/categories/nonexistent/products').expect(404);
    });
  });
});
