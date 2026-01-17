import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import { users } from '../../src/data/users.js';
import { getAdminToken } from '../helpers.js';
import type { User } from '../../src/schemas/user.js';
import { carts } from '../../src/data/carts.js';
import { products } from '../../src/data/products.js';
import { cartService } from '../../src/services/cart.js';

const adminToken = getAdminToken();

describe('Auth API', () => {
  let originalUsers: User[];

  beforeAll(() => {
    originalUsers = users.map((u) => ({ ...u }));
  });

  beforeEach(() => {
    users.length = 0;
    users.push(...originalUsers.map((u) => ({ ...u })));
    carts.length = 0;
  });

  describe('POST /auth/register', () => {
    it('should register new user and return token', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({ email: 'newuser@example.com', password: 'password123' })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('newuser@example.com');
      expect(response.body.data.user.role).toBe('user');
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.password).toBeUndefined();
    });

    it('should return 400 for duplicate email', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({ email: 'admin@example.com', password: 'password123' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid data', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({ email: 'invalid', password: '123' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject if already authenticated', async () => {
      const response = await request(app)
        .post('/auth/register')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email: 'test@example.com', password: 'password123' })
        .expect(400);

      expect(response.body.error).toContain('Already authenticated');
    });
  });

  describe('POST /auth/login', () => {
    it('should login and return token', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'admin@example.com', password: 'password123' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('admin@example.com');
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.password).toBeUndefined();
    });

    it('should return 401 for wrong password', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'admin@example.com', password: 'wrongpassword' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 for non-existent user', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'nobody@example.com', password: 'password123' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject if already authenticated', async () => {
      const response = await request(app)
        .post('/auth/login')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email: 'admin@example.com', password: 'password123' })
        .expect(400);

      expect(response.body.error).toContain('Already authenticated');
    });

    it('should merge guest cart on login', async () => {
      const product = products[0];
      cartService.addItem(undefined, 'guest-merge-test', { productId: product.id, quantity: 3 });

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'john@example.com',
          password: 'password123',
          guestId: 'guest-merge-test',
        })
        .expect(200);

      expect(response.body.data.cart).toBeDefined();
      expect(response.body.data.cart.items).toHaveLength(1);
      expect(response.body.data.cart.items[0].quantity).toBe(3);
    });

    it('should not include cart when no guestId', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'john@example.com', password: 'password123' })
        .expect(200);

      expect(response.body.data.cart).toBeUndefined();
    });
  });

  describe('GET /auth/me', () => {
    it('should return current user', async () => {
      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data.email).toBe('admin@example.com');
      expect(response.body.data.role).toBe('admin');
    });

    it('should return 401 without token', async () => {
      await request(app).get('/auth/me').expect(401);
    });

    it('should return 401 with invalid token', async () => {
      await request(app).get('/auth/me').set('Authorization', 'Bearer invalidtoken').expect(401);
    });
  });

  describe('GET /auth/users', () => {
    it('should return all users for admin', async () => {
      const response = await request(app)
        .get('/auth/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data.length).toBeGreaterThanOrEqual(3);
      expect(response.body.data[0].password).toBeUndefined();
    });

    it('should return 403 for non-admin', async () => {
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({ email: 'john@example.com', password: 'password123' });

      const userToken = loginResponse.body.data.token;

      await request(app).get('/auth/users').set('Authorization', `Bearer ${userToken}`).expect(403);
    });

    it('should return 401 without token', async () => {
      await request(app).get('/auth/users').expect(401);
    });
  });

  describe('PATCH /auth/users/:id/role', () => {
    it('should update user role', async () => {
      const response = await request(app)
        .patch('/auth/users/user-001/role')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'admin' })
        .expect(200);

      expect(response.body.data.role).toBe('admin');
    });

    it('should return 404 for non-existent user', async () => {
      await request(app)
        .patch('/auth/users/nonexistent/role')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'admin' })
        .expect(404);
    });

    it('should return 403 for non-admin', async () => {
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({ email: 'john@example.com', password: 'password123' });

      const userToken = loginResponse.body.data.token;

      await request(app)
        .patch('/auth/users/user-002/role')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ role: 'admin' })
        .expect(403);
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/auth/logout')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data.message).toContain('Logged out');
    });

    it('should return 401 without token', async () => {
      await request(app).post('/auth/logout').expect(401);
    });
  });
});
