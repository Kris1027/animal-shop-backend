import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import { addresses } from '../../src/data/addresses.js';
import { getUserToken } from '../helpers.js';

const userToken = getUserToken();

describe('Addresses API', () => {
  beforeEach(() => {
    addresses.length = 0;
  });

  describe('GET /addresses', () => {
    it('should return empty array when no addresses', async () => {
      const response = await request(app)
        .get('/addresses')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.data).toEqual([]);
    });

    it('should return only user own addresses', async () => {
      addresses.push({
        id: 'addr-1',
        userId: 'user-001',
        label: 'Home',
        firstName: 'John',
        lastName: 'Doe',
        address1: '123 Main St',
        address2: null,
        city: 'NYC',
        state: 'NY',
        postalCode: '10001',
        country: 'US',
        phone: null,
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      addresses.push({
        id: 'addr-2',
        userId: 'user-002',
        label: 'Work',
        firstName: 'Jane',
        lastName: 'Doe',
        address1: '456 Oak St',
        address2: null,
        city: 'LA',
        state: 'CA',
        postalCode: '90001',
        country: 'US',
        phone: null,
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app)
        .get('/addresses')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].id).toBe('addr-1');
    });

    it('should return 401 without token', async () => {
      await request(app).get('/addresses').expect(401);
    });
  });

  describe('GET /addresses/:id', () => {
    it('should return address by id', async () => {
      addresses.push({
        id: 'addr-1',
        userId: 'user-001',
        label: 'Home',
        firstName: 'John',
        lastName: 'Doe',
        address1: '123 Main St',
        address2: null,
        city: 'NYC',
        state: 'NY',
        postalCode: '10001',
        country: 'US',
        phone: null,
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app)
        .get('/addresses/addr-1')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.data.label).toBe('Home');
    });

    it('should return 404 for other user address', async () => {
      addresses.push({
        id: 'addr-1',
        userId: 'user-002',
        label: 'Home',
        firstName: 'Jane',
        lastName: 'Doe',
        address1: '123 Main St',
        address2: null,
        city: 'NYC',
        state: 'NY',
        postalCode: '10001',
        country: 'US',
        phone: null,
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await request(app)
        .get('/addresses/addr-1')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });

    it('should return 404 when not found', async () => {
      await request(app)
        .get('/addresses/nonexistent')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });
  });

  describe('POST /addresses', () => {
    it('should create address', async () => {
      const response = await request(app)
        .post('/addresses')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          label: 'Home',
          firstName: 'John',
          lastName: 'Doe',
          address1: '123 Main St',
          city: 'NYC',
          state: 'NY',
          postalCode: '10001',
          country: 'US',
        })
        .expect(201);

      expect(response.body.data.label).toBe('Home');
      expect(response.body.data.userId).toBe('user-001');
    });

    it('should set first address as default', async () => {
      const response = await request(app)
        .post('/addresses')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          label: 'Home',
          firstName: 'John',
          lastName: 'Doe',
          address1: '123 Main St',
          city: 'NYC',
          state: 'NY',
          postalCode: '10001',
          country: 'US',
        })
        .expect(201);

      expect(response.body.data.isDefault).toBe(true);
    });

    it('should return 400 for invalid data', async () => {
      const response = await request(app)
        .post('/addresses')
        .set('Authorization', `Bearer ${userToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 without token', async () => {
      await request(app).post('/addresses').send({ label: 'Home' }).expect(401);
    });
  });

  describe('PUT /addresses/:id', () => {
    it('should update address', async () => {
      addresses.push({
        id: 'addr-1',
        userId: 'user-001',
        label: 'Home',
        firstName: 'John',
        lastName: 'Doe',
        address1: '123 Main St',
        address2: null,
        city: 'NYC',
        state: 'NY',
        postalCode: '10001',
        country: 'US',
        phone: null,
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app)
        .put('/addresses/addr-1')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ label: 'Work' })
        .expect(200);

      expect(response.body.data.label).toBe('Work');
    });

    it('should return 404 for other user address', async () => {
      addresses.push({
        id: 'addr-1',
        userId: 'user-002',
        label: 'Home',
        firstName: 'Jane',
        lastName: 'Doe',
        address1: '123 Main St',
        address2: null,
        city: 'NYC',
        state: 'NY',
        postalCode: '10001',
        country: 'US',
        phone: null,
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await request(app)
        .put('/addresses/addr-1')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ label: 'Work' })
        .expect(404);
    });
  });

  describe('DELETE /addresses/:id', () => {
    it('should delete address', async () => {
      addresses.push({
        id: 'addr-1',
        userId: 'user-001',
        label: 'Home',
        firstName: 'John',
        lastName: 'Doe',
        address1: '123 Main St',
        address2: null,
        city: 'NYC',
        state: 'NY',
        postalCode: '10001',
        country: 'US',
        phone: null,
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await request(app)
        .delete('/addresses/addr-1')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(addresses).toHaveLength(0);
    });

    it('should return 404 for other user address', async () => {
      addresses.push({
        id: 'addr-1',
        userId: 'user-002',
        label: 'Home',
        firstName: 'Jane',
        lastName: 'Doe',
        address1: '123 Main St',
        address2: null,
        city: 'NYC',
        state: 'NY',
        postalCode: '10001',
        country: 'US',
        phone: null,
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await request(app)
        .delete('/addresses/addr-1')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });
  });

  describe('PATCH /addresses/:id/default', () => {
    it('should set address as default', async () => {
      addresses.push({
        id: 'addr-1',
        userId: 'user-001',
        label: 'Home',
        firstName: 'John',
        lastName: 'Doe',
        address1: '123 Main St',
        address2: null,
        city: 'NYC',
        state: 'NY',
        postalCode: '10001',
        country: 'US',
        phone: null,
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      addresses.push({
        id: 'addr-2',
        userId: 'user-001',
        label: 'Work',
        firstName: 'John',
        lastName: 'Doe',
        address1: '456 Oak St',
        address2: null,
        city: 'NYC',
        state: 'NY',
        postalCode: '10002',
        country: 'US',
        phone: null,
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app)
        .patch('/addresses/addr-2/default')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.data.isDefault).toBe(true);
      expect(addresses.find((a) => a.id === 'addr-1')?.isDefault).toBe(false);
    });

    it('should return 404 for other user address', async () => {
      addresses.push({
        id: 'addr-1',
        userId: 'user-002',
        label: 'Home',
        firstName: 'Jane',
        lastName: 'Doe',
        address1: '123 Main St',
        address2: null,
        city: 'NYC',
        state: 'NY',
        postalCode: '10001',
        country: 'US',
        phone: null,
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await request(app)
        .patch('/addresses/addr-1/default')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });
  });
});
