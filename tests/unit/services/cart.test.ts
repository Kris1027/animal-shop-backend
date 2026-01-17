import { describe, it, expect, beforeEach } from 'vitest';
import { cartService } from '../../../src/services/cart.js';
import { carts } from '../../../src/data/carts.js';
import { products } from '../../../src/data/products.js';
import { addresses } from '../../../src/data/addresses.js';
import { orders } from '../../../src/data/orders.js';

describe('Cart Service', () => {
  beforeEach(() => {
    carts.length = 0;
  });

  describe('get', () => {
    it('should return empty cart for user with no cart', () => {
      const cart = cartService.get('user-001');

      expect(cart.id).toBe('');
      expect(cart.items).toHaveLength(0);
      expect(cart.itemCount).toBe(0);
      expect(cart.total).toBe(0);
    });

    it('should return enriched cart with items for user', () => {
      const product = products[0];
      cartService.addItem('user-001', undefined, { productId: product.id, quantity: 2 });

      const cart = cartService.get('user-001');

      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].quantity).toBe(2);
      expect(cart.items[0].product.name).toBe(product.name);
      expect(cart.items[0].product.price).toBe(product.price);
      expect(cart.items[0].lineTotal).toBe(product.price * 2);
      expect(cart.itemCount).toBe(2);
      expect(cart.total).toBe(product.price * 2);
    });
  });

  describe('addItem', () => {
    it('should add item to cart', () => {
      const product = products[0];
      const cart = cartService.addItem('user-001', undefined, { productId: product.id, quantity: 1 });

      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].productId).toBe(product.id);
      expect(cart.items[0].quantity).toBe(1);
      expect(cart.items[0].product.name).toBe(product.name);
    });

    it('should update quantity when adding same item', () => {
      const product = products[0];
      cartService.addItem('user-001', undefined, { productId: product.id, quantity: 1 });
      const cart = cartService.addItem('user-001', undefined, { productId: product.id, quantity: 2 });

      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].quantity).toBe(3);
    });

    it('should throw error for non-existent product', () => {
      expect(() =>
        cartService.addItem('user-001', undefined, { productId: 'invalid-id', quantity: 1 })
      ).toThrow('Product');
    });

    it('should throw error for insufficient stock', () => {
      const product = products[0];

      expect(() =>
        cartService.addItem('user-001', undefined, { productId: product.id, quantity: product.stock + 1 })
      ).toThrow('Insufficient stock');
    });

    it('should throw error when adding exceeds stock with existing cart items', () => {
      const product = products[0];
      cartService.addItem('user-001', undefined, { productId: product.id, quantity: product.stock - 1 });

      expect(() =>
        cartService.addItem('user-001', undefined, { productId: product.id, quantity: 5 })
      ).toThrow('Insufficient stock');
    });

    it('should calculate totals correctly', () => {
      const product = products[0];
      const cart = cartService.addItem('user-001', undefined, { productId: product.id, quantity: 2 });

      expect(cart.total).toBe(product.price * 2);
      expect(cart.items[0].lineTotal).toBe(product.price * 2);
      expect(cart.itemCount).toBe(2);
    });

    it('should add multiple different products', () => {
      const product1 = products[0];
      const product2 = products[1];

      cartService.addItem('user-001', undefined, { productId: product1.id, quantity: 2 });
      const cart = cartService.addItem('user-001', undefined, { productId: product2.id, quantity: 3 });

      expect(cart.items).toHaveLength(2);
      expect(cart.itemCount).toBe(5);
      expect(cart.total).toBe(product1.price * 2 + product2.price * 3);
    });
  });

  describe('updateItem', () => {
    it('should update item quantity', () => {
      const product = products[0];
      cartService.addItem('user-001', undefined, { productId: product.id, quantity: 1 });
      const cart = cartService.updateItem('user-001', undefined, product.id, 5);

      expect(cart.items[0].quantity).toBe(5);
      expect(cart.items[0].lineTotal).toBe(product.price * 5);
      expect(cart.total).toBe(product.price * 5);
    });

    it('should throw error for non-existent cart', () => {
      expect(() => cartService.updateItem('user-001', undefined, 'prod-001', 1)).toThrow('Cart');
    });

    it('should throw error for non-existent item', () => {
      const product = products[0];
      cartService.addItem('user-001', undefined, { productId: product.id, quantity: 1 });

      expect(() => cartService.updateItem('user-001', undefined, 'invalid-id', 1)).toThrow('Cart item');
    });

    it('should throw error for insufficient stock', () => {
      const product = products[0];
      cartService.addItem('user-001', undefined, { productId: product.id, quantity: 1 });

      expect(() =>
        cartService.updateItem('user-001', undefined, product.id, product.stock + 1)
      ).toThrow('Insufficient stock');
    });
  });

  describe('removeItem', () => {
    it('should remove item from cart', () => {
      const product = products[0];
      cartService.addItem('user-001', undefined, { productId: product.id, quantity: 1 });
      const cart = cartService.removeItem('user-001', undefined, product.id);

      expect(cart.items).toHaveLength(0);
      expect(cart.itemCount).toBe(0);
      expect(cart.total).toBe(0);
    });

    it('should keep other items when removing one', () => {
      const product1 = products[0];
      const product2 = products[1];

      cartService.addItem('user-001', undefined, { productId: product1.id, quantity: 2 });
      cartService.addItem('user-001', undefined, { productId: product2.id, quantity: 3 });
      const cart = cartService.removeItem('user-001', undefined, product1.id);

      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].productId).toBe(product2.id);
      expect(cart.itemCount).toBe(3);
    });

    it('should throw error for non-existent cart', () => {
      expect(() => cartService.removeItem('user-001', undefined, 'prod-001')).toThrow('Cart');
    });

    it('should throw error for non-existent item', () => {
      const product = products[0];
      cartService.addItem('user-001', undefined, { productId: product.id, quantity: 1 });

      expect(() => cartService.removeItem('user-001', undefined, 'invalid-id')).toThrow('Cart item');
    });
  });

  describe('clear', () => {
    it('should clear cart', () => {
      const product = products[0];
      cartService.addItem('user-001', undefined, { productId: product.id, quantity: 1 });
      const result = cartService.clear('user-001');

      expect(result.message).toBe('Cart cleared');

      const cart = cartService.get('user-001');
      expect(cart.items).toHaveLength(0);
    });

    it('should not throw error for non-existent cart', () => {
      expect(() => cartService.clear('user-001')).not.toThrow();
    });
  });

  describe('user isolation', () => {
    it('should keep carts separate for different users', () => {
      const product = products[0];
      cartService.addItem('user-001', undefined, { productId: product.id, quantity: 1 });
      cartService.addItem('user-002', undefined, { productId: product.id, quantity: 3 });

      const cart1 = cartService.get('user-001');
      const cart2 = cartService.get('user-002');

      expect(cart1.items[0].quantity).toBe(1);
      expect(cart2.items[0].quantity).toBe(3);
    });

    it('should not affect other user cart when clearing', () => {
      const product = products[0];
      cartService.addItem('user-001', undefined, { productId: product.id, quantity: 1 });
      cartService.addItem('user-002', undefined, { productId: product.id, quantity: 3 });

      cartService.clear('user-001');

      const cart1 = cartService.get('user-001');
      const cart2 = cartService.get('user-002');

      expect(cart1.items).toHaveLength(0);
      expect(cart2.items).toHaveLength(1);
    });
  });

  describe('checkout', () => {
    const initialOrdersLength = orders.length;

    beforeEach(() => {
      // Reset orders to initial state
      orders.length = initialOrdersLength;
    });

    it('should create order from cart', () => {
      const product = products[0];
      const address = addresses.find((a) => a.userId === 'user-001')!;

      cartService.addItem('user-001', undefined, { productId: product.id, quantity: 2 });
      const order = cartService.checkout('user-001', address.id);

      expect(order.items).toHaveLength(1);
      expect(order.items[0].productId).toBe(product.id);
      expect(order.items[0].quantity).toBe(2);
      expect(order.total).toBe(product.price * 2);
      expect(order.status).toBe('pending');
    });

    it('should clear cart after checkout', () => {
      const product = products[0];
      const address = addresses.find((a) => a.userId === 'user-001')!;

      cartService.addItem('user-001', undefined, { productId: product.id, quantity: 1 });
      cartService.checkout('user-001', address.id);

      const cart = cartService.get('user-001');
      expect(cart.items).toHaveLength(0);
    });

    it('should deduct stock after checkout', () => {
      const product = products[0];
      const initialStock = product.stock;
      const address = addresses.find((a) => a.userId === 'user-001')!;

      cartService.addItem('user-001', undefined, { productId: product.id, quantity: 2 });
      cartService.checkout('user-001', address.id);

      expect(product.stock).toBe(initialStock - 2);

      // Restore stock for other tests
      product.stock = initialStock;
    });

    it('should throw error for empty cart', () => {
      const address = addresses.find((a) => a.userId === 'user-001')!;

      expect(() => cartService.checkout('user-001', address.id)).toThrow('Cart is empty');
    });

    it('should throw error for invalid address', () => {
      const product = products[0];

      cartService.addItem('user-001', undefined, { productId: product.id, quantity: 1 });

      expect(() => cartService.checkout('user-001', 'invalid-address')).toThrow('Address');
    });

    it('should throw error for address belonging to another user', () => {
      const product = products[0];
      const otherUserAddress = addresses.find((a) => a.userId === 'user-002')!;

      cartService.addItem('user-001', undefined, { productId: product.id, quantity: 1 });

      expect(() => cartService.checkout('user-001', otherUserAddress.id)).toThrow('Address');
    });

    it('should throw error for insufficient stock at checkout', () => {
      const product = products[1]; // stock: 50
      const originalStock = product.stock;
      const address = addresses.find((a) => a.userId === 'user-001')!;

      cartService.addItem('user-001', undefined, { productId: product.id, quantity: 10 });

      // Simulate stock change after adding to cart
      product.stock = 5;

      expect(() => cartService.checkout('user-001', address.id)).toThrow('Insufficient stock');

      // Restore stock for other tests
      product.stock = originalStock;
    });
  });
});
