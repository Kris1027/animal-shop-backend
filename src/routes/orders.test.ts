import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { orders } from '../data/orders.js';
import { products } from '../data/products.js';
import { addresses } from '../data/addresses.js';
import { getAdminToken, getUserToken } from '../tests/helpers.js';

describe('Orders API', () => {
  const userToken = getUserToken();
  const adminToken = getAdminToken();
  const otherUserToken = getUserToken('user-002', 'other@example.com');

  beforeEach(() => {
    orders.length = 0;

    products[0]!.stock = 100;
    products[1]!.stock = 50;

    addresses.length = 0;
    addresses.push({
      id: 'addr-001',
      userId: 'user-001',
      label: 'Home',
      firstName: 'John',
      lastName: 'Doe',
      address1: '123 Main St',
      address2: null,
      city: 'Austin',
      state: 'TX',
      postalCode: '78701',
      country: 'USA',
      phone: null,
      isDefault: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  describe('POST /orders', () => {
    const validOrder = {
      addressId: 'addr-001',
      items: [{ productId: 'abc123xyz', quantity: 2 }],
    };

    it('should return 401 without auth', async () => {
      const res = await request(app).post('/orders').send(validOrder);
      expect(res.status).toBe(401);
    });

    it('should create order with valid data', async () => {
      const res = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send(validOrder);

      expect(res.status).toBe(201);
      expect(res.body.data).toMatchObject({
        status: 'pending',
        total: 99.98,
      });
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.orderNumber).toBeDefined();
    });

    it('should decrease product stock', async () => {
      const initialStock = products[0]!.stock;

      await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send(validOrder);

      expect(products[0]!.stock).toBe(initialStock - 2);
    });

    it('should return 404 for address not owned by user', async () => {
      const res = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send(validOrder);

      expect(res.status).toBe(404);
    });

    it('should return 400 for invalid product', async () => {
      const res = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          addressId: 'addr-001',
          items: [{ productId: 'invalid-id', quantity: 1 }],
        });

      expect(res.status).toBe(400);
    });

    it('should return 400 for insufficient stock', async () => {
      const res = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          addressId: 'addr-001',
          items: [{ productId: 'abc123xyz', quantity: 999 }],
        });

      expect(res.status).toBe(400);
    });

    it('should return 400 for empty items', async () => {
      const res = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ addressId: 'addr-001', items: [] });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /orders', () => {
    it('should return 401 without auth', async () => {
      const res = await request(app).get('/orders');
      expect(res.status).toBe(401);
    });

    it('should return empty array when no orders', async () => {
      const res = await request(app).get('/orders').set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    });

    it('should return only user orders', async () => {
      await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ addressId: 'addr-001', items: [{ productId: 'abc123xyz', quantity: 1 }] });

      addresses.push({
        id: 'addr-002',
        userId: 'user-002',
        label: 'Work',
        firstName: 'Jane',
        lastName: 'Doe',
        address1: '456 Oak Ave',
        address2: null,
        city: 'Dallas',
        state: 'TX',
        postalCode: '75201',
        country: 'USA',
        phone: null,
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({ addressId: 'addr-002', items: [{ productId: 'def456uvw', quantity: 1 }] });

      const res = await request(app).get('/orders').set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });

    it('should return all orders for admin', async () => {
      await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ addressId: 'addr-001', items: [{ productId: 'abc123xyz', quantity: 1 }] });

      addresses.push({
        id: 'addr-002',
        userId: 'user-002',
        label: 'Work',
        firstName: 'Jane',
        lastName: 'Doe',
        address1: '456 Oak Ave',
        address2: null,
        city: 'Dallas',
        state: 'TX',
        postalCode: '75201',
        country: 'USA',
        phone: null,
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({ addressId: 'addr-002', items: [{ productId: 'def456uvw', quantity: 1 }] });

      const res = await request(app).get('/orders').set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
    });
  });

  describe('GET /orders/:id', () => {
    it('should return order for owner', async () => {
      const createRes = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ addressId: 'addr-001', items: [{ productId: 'abc123xyz', quantity: 1 }] });

      const orderId = createRes.body.data.id;

      const res = await request(app)
        .get(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(orderId);
    });

    it('should return 404 for other user order', async () => {
      const createRes = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ addressId: 'addr-001', items: [{ productId: 'abc123xyz', quantity: 1 }] });

      const orderId = createRes.body.data.id;

      const res = await request(app)
        .get(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${otherUserToken}`);

      expect(res.status).toBe(404);
    });

    it('should return order for admin', async () => {
      const createRes = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ addressId: 'addr-001', items: [{ productId: 'abc123xyz', quantity: 1 }] });

      const orderId = createRes.body.data.id;

      const res = await request(app)
        .get(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    it('should return 404 for non-existent order', async () => {
      const res = await request(app)
        .get('/orders/non-existent')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /orders/:id/status', () => {
    it('should return 403 for non-admin', async () => {
      const createRes = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ addressId: 'addr-001', items: [{ productId: 'abc123xyz', quantity: 1 }] });

      const res = await request(app)
        .patch(`/orders/${createRes.body.data.id}/status`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: 'processing' });

      expect(res.status).toBe(403);
    });

    it('should update pending to processing', async () => {
      const createRes = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ addressId: 'addr-001', items: [{ productId: 'abc123xyz', quantity: 1 }] });

      const res = await request(app)
        .patch(`/orders/${createRes.body.data.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'processing' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('processing');
    });

    it('should update processing to shipped', async () => {
      const createRes = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ addressId: 'addr-001', items: [{ productId: 'abc123xyz', quantity: 1 }] });

      await request(app)
        .patch(`/orders/${createRes.body.data.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'processing' });

      const res = await request(app)
        .patch(`/orders/${createRes.body.data.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'shipped' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('shipped');
    });

    it('should update shipped to delivered', async () => {
      const createRes = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ addressId: 'addr-001', items: [{ productId: 'abc123xyz', quantity: 1 }] });

      await request(app)
        .patch(`/orders/${createRes.body.data.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'processing' });

      await request(app)
        .patch(`/orders/${createRes.body.data.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'shipped' });

      const res = await request(app)
        .patch(`/orders/${createRes.body.data.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'delivered' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('delivered');
    });

    it('should return 400 for invalid transition', async () => {
      const createRes = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ addressId: 'addr-001', items: [{ productId: 'abc123xyz', quantity: 1 }] });

      const res = await request(app)
        .patch(`/orders/${createRes.body.data.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'shipped' });

      expect(res.status).toBe(400);
    });

    it('should restore stock when admin cancels', async () => {
      const initialStock = products[0]!.stock;

      const createRes = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ addressId: 'addr-001', items: [{ productId: 'abc123xyz', quantity: 5 }] });

      expect(products[0]!.stock).toBe(initialStock - 5);

      await request(app)
        .patch(`/orders/${createRes.body.data.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'cancelled' });

      expect(products[0]!.stock).toBe(initialStock);
    });
  });

  describe('PATCH /orders/:id/cancel', () => {
    it('should cancel pending order', async () => {
      const createRes = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ addressId: 'addr-001', items: [{ productId: 'abc123xyz', quantity: 1 }] });

      const res = await request(app)
        .patch(`/orders/${createRes.body.data.id}/cancel`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('cancelled');
    });

    it('should restore stock on cancel', async () => {
      const initialStock = products[0]!.stock;

      const createRes = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ addressId: 'addr-001', items: [{ productId: 'abc123xyz', quantity: 3 }] });

      expect(products[0]!.stock).toBe(initialStock - 3);

      await request(app)
        .patch(`/orders/${createRes.body.data.id}/cancel`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(products[0]!.stock).toBe(initialStock);
    });

    it('should return 400 for non-pending order', async () => {
      const createRes = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ addressId: 'addr-001', items: [{ productId: 'abc123xyz', quantity: 1 }] });

      await request(app)
        .patch(`/orders/${createRes.body.data.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'processing' });

      const res = await request(app)
        .patch(`/orders/${createRes.body.data.id}/cancel`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(400);
    });

    it('should return 404 for other user order', async () => {
      const createRes = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ addressId: 'addr-001', items: [{ productId: 'abc123xyz', quantity: 1 }] });

      const res = await request(app)
        .patch(`/orders/${createRes.body.data.id}/cancel`)
        .set('Authorization', `Bearer ${otherUserToken}`);

      expect(res.status).toBe(404);
    });
  });
});
