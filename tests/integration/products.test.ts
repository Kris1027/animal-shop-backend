import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import { products } from '../../src/data/products.js';
import { categories } from '../../src/data/categories.js';
import { getAdminToken } from '../helpers.js';

const adminToken = getAdminToken();

describe('Products API', () => {
  beforeEach(() => {
    products.length = 0;
    categories.length = 0;
    categories.push({
      id: '1',
      slug: 'dogs',
      name: 'Dogs',
      description: null,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  describe('GET /products', () => {
    it('should return empty array', async () => {
      const response = await request(app).get('/products').expect(200);
      expect(response.body.data).toEqual([]);
    });
  });

  describe('GET /products/:identifier', () => {
    it('should return product by id', async () => {
      products.push({
        id: '123',
        slug: 'dog-food',
        name: 'Dog Food',
        price: 10,
        description: 'Food',
        image: 'https://example.com/img.jpg',
        banner: null,
        category: 'dogs',
        stock: 5,
        isFeatured: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app).get('/products/123').expect(200);

      expect(response.body.data.name).toBe('Dog Food');
    });

    it('should return product by slug', async () => {
      products.push({
        id: '123',
        slug: 'dog-food',
        name: 'Dog Food',
        price: 10,
        description: 'Food',
        image: 'https://example.com/img.jpg',
        banner: null,
        category: 'dogs',
        stock: 5,
        isFeatured: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app).get('/products/dog-food').expect(200);

      expect(response.body.data.name).toBe('Dog Food');
    });

    it('should return 404 when not found', async () => {
      const response = await request(app).get('/products/nonexistent').expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /products', () => {
    it('should create product', async () => {
      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Dog Food',
          price: 29.99,
          description: 'Premium food',
          image: 'https://example.com/img.jpg',
          category: 'dogs',
          stock: 10,
        })
        .expect(201);

      expect(response.body.data.name).toBe('Dog Food');
    });

    it('should return 400 for invalid category', async () => {
      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Dog Food',
          price: 29.99,
          description: 'Premium food',
          image: 'https://example.com/img.jpg',
          category: 'invalid',
          stock: 10,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /products/:id', () => {
    it('should update product', async () => {
      products.push({
        id: '123',
        slug: 'dog-food',
        name: 'Dog Food',
        price: 10,
        description: 'Food',
        image: 'https://example.com/img.jpg',
        banner: null,
        category: 'dogs',
        stock: 5,
        isFeatured: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app)
        .put('/products/123')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Cat Food' })
        .expect(200);

      expect(response.body.data.name).toBe('Cat Food');
    });
  });

  describe('DELETE /products/:id', () => {
    it('should delete product', async () => {
      products.push({
        id: '123',
        slug: 'dog-food',
        name: 'Dog Food',
        price: 10,
        description: 'Food',
        image: 'https://example.com/img.jpg',
        banner: null,
        category: 'dogs',
        stock: 5,
        isFeatured: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await request(app)
        .delete('/products/123')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(products).toHaveLength(0);
    });
  });
});
