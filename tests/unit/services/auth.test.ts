import { describe, it, expect, beforeEach } from 'vitest';
import { authService } from '../../../src/services/auth.js';
import { users } from '../../../src/data/users.js';
import { carts } from '../../../src/data/carts.js';
import { products } from '../../../src/data/products.js';
import { cartService } from '../../../src/services/cart.js';

describe('authService', () => {
  beforeEach(() => {
    users.length = 0;
    carts.length = 0;
  });

  describe('getAll', () => {
    it('should return users without passwords', async () => {
      await authService.register({ email: 'test@example.com', password: 'password123' });

      const result = authService.getAll();

      expect(result).toHaveLength(1);
      expect(result[0]).not.toHaveProperty('password');
      expect(result[0]!.email).toBe('test@example.com');
    });

    it('should return empty array when no users', () => {
      const result = authService.getAll();
      expect(result).toEqual([]);
    });
  });

  describe('register', () => {
    it('should create user and return token', async () => {
      const result = await authService.register({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.user.email).toBe('test@example.com');
      expect(result.user.role).toBe('user');
      expect(result.user).not.toHaveProperty('password');
      expect(result.token).toBeDefined();
    });

    it('should hash the password', async () => {
      await authService.register({ email: 'test@example.com', password: 'password123' });

      const user = users[0]!;
      expect(user.password).not.toBe('password123');
      expect(user.password.startsWith('$2b$')).toBe(true);
    });

    it('should throw for duplicate email', async () => {
      await authService.register({ email: 'test@example.com', password: 'password123' });

      await expect(
        authService.register({ email: 'test@example.com', password: 'other' })
      ).rejects.toThrow('Email already registered');
    });
  });

  describe('login', () => {
    it('should return user and token for valid credentials', async () => {
      await authService.register({ email: 'test@example.com', password: 'password123' });

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.user.email).toBe('test@example.com');
      expect(result.user).not.toHaveProperty('password');
      expect(result.token).toBeDefined();
    });

    it('should throw for invalid email', async () => {
      await expect(
        authService.login({ email: 'nonexistent@example.com', password: 'password123' })
      ).rejects.toThrow('Invalid email or password');
    });

    it('should throw for invalid password', async () => {
      await authService.register({ email: 'test@example.com', password: 'password123' });

      await expect(
        authService.login({ email: 'test@example.com', password: 'wrongpassword' })
      ).rejects.toThrow('Invalid email or password');
    });

    it('should merge guest cart on login when guestId provided', async () => {
      await authService.register({ email: 'test@example.com', password: 'password123' });

      const product = products[0];
      cartService.addItem(undefined, 'guest-123', { productId: product.id, quantity: 2 });

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
        guestId: 'guest-123',
      });

      expect(result.cart).toBeDefined();
      expect(result.cart!.items).toHaveLength(1);
      expect(result.cart!.items[0].quantity).toBe(2);
    });

    it('should return undefined cart when no guestId provided', async () => {
      await authService.register({ email: 'test@example.com', password: 'password123' });

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.cart).toBeUndefined();
    });

    it('should work with non-existent guestId', async () => {
      await authService.register({ email: 'test@example.com', password: 'password123' });

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
        guestId: 'non-existent-guest',
      });

      expect(result.cart).toBeDefined();
      expect(result.cart!.items).toHaveLength(0);
    });
  });

  describe('verifyToken', () => {
    it('should verify valid token', async () => {
      const { token } = await authService.register({
        email: 'test@example.com',
        password: 'password123',
      });

      const payload = authService.verifyToken(token);

      expect(payload.email).toBe('test@example.com');
      expect(payload.role).toBe('user');
      expect(payload.userId).toBeDefined();
    });

    it('should throw for invalid token', () => {
      expect(() => authService.verifyToken('invalid-token')).toThrow(
        'Invalid or expired token'
      );
    });
  });

  describe('updateRole', () => {
    it('should update user role', async () => {
      const { user } = await authService.register({
        email: 'test@example.com',
        password: 'password123',
      });

      const result = authService.updateRole(user.id, 'admin');

      expect(result?.role).toBe('admin');
      expect(result).not.toHaveProperty('password');
    });

    it('should return null for non-existent user', () => {
      const result = authService.updateRole('nonexistent', 'admin');
      expect(result).toBeNull();
    });
  });
});
