import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import { carts } from '../../src/data/carts.js';
import { products } from '../../src/data/products.js';
import { getUserToken, getAdminToken } from '../helpers.js';

describe('Cart API', () => {
  let userToken: string;
  let adminToken: string;

  beforeEach(() => {
    carts.length = 0;
    userToken = getUserToken();
    adminToken = getAdminToken();
  });

  describe('GET /cart', () => {
    it('should return 401 without auth', async () => {
      const res = await request(app).get('/cart');
      expect(res.status).toBe(401);
    });

    it('should return empty cart for new user', async () => {
      const res = await request(app)
        .get('/cart')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toHaveLength(0);
      expect(res.body.data.itemCount).toBe(0);
      expect(res.body.data.total).toBe(0);
    });

    it('should return enriched cart with items', async () => {
      const product = products[0];

      await request(app)
        .post('/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId: product.id, quantity: 2 });

      const res = await request(app)
        .get('/cart')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.items[0].quantity).toBe(2);
      expect(res.body.data.items[0].product.name).toBe(product.name);
      expect(res.body.data.items[0].product.price).toBe(product.price);
      expect(res.body.data.items[0].lineTotal).toBe(product.price * 2);
      expect(res.body.data.itemCount).toBe(2);
      expect(res.body.data.total).toBe(product.price * 2);
    });
  });

  describe('POST /cart/items', () => {
    it('should add item to cart', async () => {
      const product = products[0];

      const res = await request(app)
        .post('/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId: product.id, quantity: 2 });

      expect(res.status).toBe(200);
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.items[0].productId).toBe(product.id);
      expect(res.body.data.items[0].product.name).toBe(product.name);
      expect(res.body.data.total).toBe(product.price * 2);
    });

    it('should return 401 without auth', async () => {
      const product = products[0];

      const res = await request(app)
        .post('/cart/items')
        .send({ productId: product.id, quantity: 1 });

      expect(res.status).toBe(401);
    });

    it('should return 404 for non-existent product', async () => {
      const res = await request(app)
        .post('/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId: 'invalid-id', quantity: 1 });

      expect(res.status).toBe(404);
    });

    it('should return 400 for insufficient stock', async () => {
      const product = products[1]; // stock: 50

      const res = await request(app)
        .post('/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId: product.id, quantity: 51 });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Insufficient stock');
    });

    it('should return 400 for invalid quantity', async () => {
      const product = products[0];

      const res = await request(app)
        .post('/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId: product.id, quantity: 0 });

      expect(res.status).toBe(400);
    });

    it('should return 400 for quantity exceeding max', async () => {
      const product = products[0];

      const res = await request(app)
        .post('/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId: product.id, quantity: 100 });

      expect(res.status).toBe(400);
    });

    it('should update quantity when adding same item', async () => {
      const product = products[0];

      await request(app)
        .post('/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId: product.id, quantity: 1 });

      const res = await request(app)
        .post('/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId: product.id, quantity: 2 });

      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.items[0].quantity).toBe(3);
      expect(res.body.data.itemCount).toBe(3);
    });

    it('should add multiple different products', async () => {
      const product1 = products[0];
      const product2 = products[1];

      await request(app)
        .post('/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId: product1.id, quantity: 2 });

      const res = await request(app)
        .post('/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId: product2.id, quantity: 3 });

      expect(res.body.data.items).toHaveLength(2);
      expect(res.body.data.itemCount).toBe(5);
      expect(res.body.data.total).toBe(product1.price * 2 + product2.price * 3);
    });
  });

  describe('PATCH /cart/items/:productId', () => {
    it('should update item quantity', async () => {
      const product = products[0];

      await request(app)
        .post('/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId: product.id, quantity: 1 });

      const res = await request(app)
        .patch(`/cart/items/${product.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 5 });

      expect(res.status).toBe(200);
      expect(res.body.data.items[0].quantity).toBe(5);
      expect(res.body.data.items[0].lineTotal).toBe(product.price * 5);
      expect(res.body.data.total).toBe(product.price * 5);
    });

    it('should return 401 without auth', async () => {
      const res = await request(app)
        .patch('/cart/items/prod-001')
        .send({ quantity: 5 });

      expect(res.status).toBe(401);
    });

    it('should return 404 for non-existent cart', async () => {
      const res = await request(app)
        .patch('/cart/items/prod-001')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 5 });

      expect(res.status).toBe(404);
    });

    it('should return 404 for non-existent item', async () => {
      const product = products[0];

      await request(app)
        .post('/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId: product.id, quantity: 1 });

      const res = await request(app)
        .patch('/cart/items/invalid-id')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 5 });

      expect(res.status).toBe(404);
    });

    it('should return 400 for insufficient stock', async () => {
      const product = products[1]; // stock: 50

      await request(app)
        .post('/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId: product.id, quantity: 1 });

      const res = await request(app)
        .patch(`/cart/items/${product.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 51 });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Insufficient stock');
    });

    it('should return 400 for invalid quantity', async () => {
      const product = products[0];

      await request(app)
        .post('/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId: product.id, quantity: 1 });

      const res = await request(app)
        .patch(`/cart/items/${product.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 0 });

      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /cart/items/:productId', () => {
    it('should remove item from cart', async () => {
      const product = products[0];

      await request(app)
        .post('/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId: product.id, quantity: 1 });

      const res = await request(app)
        .delete(`/cart/items/${product.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.items).toHaveLength(0);
      expect(res.body.data.itemCount).toBe(0);
      expect(res.body.data.total).toBe(0);
    });

    it('should return 401 without auth', async () => {
      const res = await request(app).delete('/cart/items/prod-001');
      expect(res.status).toBe(401);
    });

    it('should return 404 for non-existent cart', async () => {
      const res = await request(app)
        .delete('/cart/items/prod-001')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
    });

    it('should return 404 for non-existent item', async () => {
      const product = products[0];

      await request(app)
        .post('/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId: product.id, quantity: 1 });

      const res = await request(app)
        .delete('/cart/items/invalid-id')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
    });

    it('should keep other items when removing one', async () => {
      const product1 = products[0];
      const product2 = products[1];

      await request(app)
        .post('/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId: product1.id, quantity: 2 });

      await request(app)
        .post('/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId: product2.id, quantity: 3 });

      const res = await request(app)
        .delete(`/cart/items/${product1.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.items[0].productId).toBe(product2.id);
      expect(res.body.data.itemCount).toBe(3);
    });
  });

  describe('DELETE /cart', () => {
    it('should clear cart', async () => {
      const product = products[0];

      await request(app)
        .post('/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId: product.id, quantity: 1 });

      const res = await request(app)
        .delete('/cart')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.message).toBe('Cart cleared');
    });

    it('should return 401 without auth', async () => {
      const res = await request(app).delete('/cart');
      expect(res.status).toBe(401);
    });

    it('should succeed even with no cart', async () => {
      const res = await request(app)
        .delete('/cart')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.message).toBe('Cart cleared');
    });
  });

  describe('User isolation', () => {
    it('should keep carts separate for different users', async () => {
      const product = products[0];

      await request(app)
        .post('/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId: product.id, quantity: 1 });

      await request(app)
        .post('/cart/items')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ productId: product.id, quantity: 5 });

      const userCart = await request(app)
        .get('/cart')
        .set('Authorization', `Bearer ${userToken}`);

      const adminCart = await request(app)
        .get('/cart')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(userCart.body.data.items[0].quantity).toBe(1);
      expect(adminCart.body.data.items[0].quantity).toBe(5);
    });

    it('should not affect other user cart when clearing', async () => {
      const product = products[0];

      await request(app)
        .post('/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId: product.id, quantity: 1 });

      await request(app)
        .post('/cart/items')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ productId: product.id, quantity: 5 });

      await request(app)
        .delete('/cart')
        .set('Authorization', `Bearer ${userToken}`);

      const userCart = await request(app)
        .get('/cart')
        .set('Authorization', `Bearer ${userToken}`);

      const adminCart = await request(app)
        .get('/cart')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(userCart.body.data.items).toHaveLength(0);
      expect(adminCart.body.data.items).toHaveLength(1);
    });
  });
});
