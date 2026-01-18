import { describe, it, expect, beforeEach } from 'vitest';
import { orderService } from '../../../src/services/orders.js';
import { orders } from '../../../src/data/orders.js';
import { products } from '../../../src/data/products.js';
import { addresses } from '../../../src/data/addresses.js';

describe('orderService', () => {
  beforeEach(() => {
    orders.length = 0;
    products.length = 0;
    addresses.length = 0;

    // Add test product
    products.push({
      id: 'product-001',
      slug: 'dog-food',
      name: 'Dog Food',
      price: 29.99,
      description: 'Premium dog food',
      image: 'https://example.com/img.jpg',
      banner: null,
      category: 'dogs',
      stock: 100,
      isFeatured: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Add test address
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

  describe('getAllByUser', () => {
    it('should return only orders for specified user', () => {
      orderService.create('user-001', {
        addressId: 'addr-001',
        items: [{ productId: 'product-001', quantity: 1 }],
      });

      // Add address for user-002
      addresses.push({
        id: 'addr-002',
        userId: 'user-002',
        label: 'Home',
        firstName: 'Jane',
        lastName: 'Doe',
        address1: '456 Oak St',
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

      orderService.create('user-002', {
        addressId: 'addr-002',
        items: [{ productId: 'product-001', quantity: 1 }],
      });

      const result = orderService.getAllByUser('user-001', { page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.data[0]!.userId).toBe('user-001');
    });
  });

  describe('getAll', () => {
    it('should return all orders', () => {
      orderService.create('user-001', {
        addressId: 'addr-001',
        items: [{ productId: 'product-001', quantity: 1 }],
      });

      const result = orderService.getAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
    });
  });

  describe('getById', () => {
    it('should return order by id', () => {
      const created = orderService.create('user-001', {
        addressId: 'addr-001',
        items: [{ productId: 'product-001', quantity: 1 }],
      });

      const result = orderService.getById(created.id);

      expect(result).not.toBeNull();
      expect(result!.id).toBe(created.id);
    });

    it('should return null for non-existent order', () => {
      const result = orderService.getById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create order with calculated total', () => {
      const result = orderService.create('user-001', {
        addressId: 'addr-001',
        items: [{ productId: 'product-001', quantity: 2 }],
      });

      expect(result.id).toBeDefined();
      expect(result.total).toBe(59.98);
      expect(result.status).toBe('pending');
      expect(result.items).toHaveLength(1);
      expect(result.items[0]!.productName).toBe('Dog Food');
    });

    it('should decrease product stock', () => {
      orderService.create('user-001', {
        addressId: 'addr-001',
        items: [{ productId: 'product-001', quantity: 5 }],
      });

      expect(products[0]!.stock).toBe(95);
    });

    it('should throw for invalid product', () => {
      expect(() =>
        orderService.create('user-001', {
          addressId: 'addr-001',
          items: [{ productId: 'invalid', quantity: 1 }],
        })
      ).toThrow('Product invalid not found');
    });

    it('should throw for insufficient stock', () => {
      expect(() =>
        orderService.create('user-001', {
          addressId: 'addr-001',
          items: [{ productId: 'product-001', quantity: 999 }],
        })
      ).toThrow('Insufficient stock for Dog Food');
    });

    it('should throw for invalid address', () => {
      expect(() =>
        orderService.create('user-001', {
          addressId: 'invalid',
          items: [{ productId: 'product-001', quantity: 1 }],
        })
      ).toThrow('Address not found');
    });

    it('should throw for address owned by another user', () => {
      expect(() =>
        orderService.create('user-002', {
          addressId: 'addr-001',
          items: [{ productId: 'product-001', quantity: 1 }],
        })
      ).toThrow('Address not found');
    });
  });

  describe('updateStatus', () => {
    it('should update pending to processing', () => {
      const created = orderService.create('user-001', {
        addressId: 'addr-001',
        items: [{ productId: 'product-001', quantity: 1 }],
      });

      const result = orderService.updateStatus(created.id, { status: 'processing' });

      expect(result).not.toBeNull();
      expect(result!.status).toBe('processing');
    });

    it('should update processing to shipped', () => {
      const created = orderService.create('user-001', {
        addressId: 'addr-001',
        items: [{ productId: 'product-001', quantity: 1 }],
      });
      orderService.updateStatus(created.id, { status: 'processing' });

      const result = orderService.updateStatus(created.id, { status: 'shipped' });

      expect(result).not.toBeNull();
      expect(result!.status).toBe('shipped');
    });

    it('should update shipped to delivered', () => {
      const created = orderService.create('user-001', {
        addressId: 'addr-001',
        items: [{ productId: 'product-001', quantity: 1 }],
      });
      orderService.updateStatus(created.id, { status: 'processing' });
      orderService.updateStatus(created.id, { status: 'shipped' });

      const result = orderService.updateStatus(created.id, { status: 'delivered' });

      expect(result).not.toBeNull();
      expect(result!.status).toBe('delivered');
    });

    it('should throw for invalid transition', () => {
      const created = orderService.create('user-001', {
        addressId: 'addr-001',
        items: [{ productId: 'product-001', quantity: 1 }],
      });

      expect(() => orderService.updateStatus(created.id, { status: 'delivered' })).toThrow(
        'Cannot change status from pending to delivered'
      );
    });

    it('should restore stock when cancelled', () => {
      const created = orderService.create('user-001', {
        addressId: 'addr-001',
        items: [{ productId: 'product-001', quantity: 5 }],
      });

      expect(products[0]!.stock).toBe(95);

      orderService.updateStatus(created.id, { status: 'cancelled' });

      expect(products[0]!.stock).toBe(100);
    });

    it('should return null for non-existent order', () => {
      const result = orderService.updateStatus('nonexistent', { status: 'processing' });

      expect(result).toBeNull();
    });
  });

  describe('cancel', () => {
    it('should cancel pending order', () => {
      const created = orderService.create('user-001', {
        addressId: 'addr-001',
        items: [{ productId: 'product-001', quantity: 1 }],
      });

      const result = orderService.cancel(created.id, 'user-001');

      expect(result).not.toBeNull();
      expect(result!.status).toBe('cancelled');
    });

    it('should restore stock on cancel', () => {
      const created = orderService.create('user-001', {
        addressId: 'addr-001',
        items: [{ productId: 'product-001', quantity: 5 }],
      });

      expect(products[0]!.stock).toBe(95);

      orderService.cancel(created.id, 'user-001');

      expect(products[0]!.stock).toBe(100);
    });

    it('should throw for non-pending order', () => {
      const created = orderService.create('user-001', {
        addressId: 'addr-001',
        items: [{ productId: 'product-001', quantity: 1 }],
      });
      orderService.updateStatus(created.id, { status: 'processing' });

      expect(() => orderService.cancel(created.id, 'user-001')).toThrow(
        'Only pending orders can be cancelled'
      );
    });

    it('should return null for non-existent order', () => {
      const result = orderService.cancel('nonexistent', 'user-001');

      expect(result).toBeNull();
    });

    it('should return null for order owned by another user', () => {
      const created = orderService.create('user-001', {
        addressId: 'addr-001',
        items: [{ productId: 'product-001', quantity: 1 }],
      });

      const result = orderService.cancel(created.id, 'user-002');

      expect(result).toBeNull();
    });
  });
});
