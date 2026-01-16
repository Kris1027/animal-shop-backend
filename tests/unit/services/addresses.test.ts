import { describe, it, expect, beforeEach } from 'vitest';
import { addressService } from '../../../src/services/addresses.js';
import { addresses } from '../../../src/data/addresses.js';

const validAddress = {
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
};

describe('addressService', () => {
  beforeEach(() => {
    addresses.length = 0;
  });

  describe('getAllByUser', () => {
    it('should return only addresses for specified user', () => {
      addressService.create('user-001', validAddress);
      addressService.create('user-002', { ...validAddress, label: 'Work' });

      const result = addressService.getAllByUser('user-001');

      expect(result).toHaveLength(1);
      expect(result[0]!.label).toBe('Home');
    });

    it('should return empty array when user has no addresses', () => {
      const result = addressService.getAllByUser('user-001');
      expect(result).toEqual([]);
    });
  });

  describe('getById', () => {
    it('should return address for owner', () => {
      const created = addressService.create('user-001', validAddress);

      const result = addressService.getById(created.id, 'user-001');

      expect(result.label).toBe('Home');
    });

    it('should throw for non-existent address', () => {
      expect(() => addressService.getById('nonexistent', 'user-001')).toThrow(
        'Address not found'
      );
    });

    it('should throw for address owned by another user', () => {
      const created = addressService.create('user-001', validAddress);

      expect(() => addressService.getById(created.id, 'user-002')).toThrow(
        'Address not found'
      );
    });
  });

  describe('create', () => {
    it('should create address with generated id', () => {
      const result = addressService.create('user-001', validAddress);

      expect(result.id).toBeDefined();
      expect(result.userId).toBe('user-001');
      expect(result.label).toBe('Home');
    });

    it('should set first address as default', () => {
      const result = addressService.create('user-001', validAddress);
      expect(result.isDefault).toBe(true);
    });

    it('should not set second address as default', () => {
      addressService.create('user-001', validAddress);
      const second = addressService.create('user-001', { ...validAddress, label: 'Work' });

      expect(second.isDefault).toBe(false);
    });

    it('should clear other defaults when creating with isDefault true', () => {
      const first = addressService.create('user-001', validAddress);
      const second = addressService.create('user-001', {
        ...validAddress,
        label: 'Work',
        isDefault: true,
      });

      expect(second.isDefault).toBe(true);
      expect(addresses.find((a) => a.id === first.id)?.isDefault).toBe(false);
    });
  });

  describe('update', () => {
    it('should update address', () => {
      const created = addressService.create('user-001', validAddress);

      const result = addressService.update(created.id, 'user-001', { label: 'Office' });

      expect(result.label).toBe('Office');
    });

    it('should throw for non-existent address', () => {
      expect(() =>
        addressService.update('nonexistent', 'user-001', { label: 'Office' })
      ).toThrow('Address not found');
    });

    it('should throw for address owned by another user', () => {
      const created = addressService.create('user-001', validAddress);

      expect(() =>
        addressService.update(created.id, 'user-002', { label: 'Office' })
      ).toThrow('Address not found');
    });

    it('should clear other defaults when setting isDefault', () => {
      const first = addressService.create('user-001', validAddress);
      const second = addressService.create('user-001', { ...validAddress, label: 'Work' });

      addressService.update(second.id, 'user-001', { isDefault: true });

      expect(addresses.find((a) => a.id === first.id)?.isDefault).toBe(false);
      expect(addresses.find((a) => a.id === second.id)?.isDefault).toBe(true);
    });
  });

  describe('delete', () => {
    it('should delete address', () => {
      const created = addressService.create('user-001', validAddress);

      const result = addressService.delete(created.id, 'user-001');

      expect(result.id).toBe(created.id);
      expect(addresses).toHaveLength(0);
    });

    it('should throw for non-existent address', () => {
      expect(() => addressService.delete('nonexistent', 'user-001')).toThrow(
        'Address not found'
      );
    });

    it('should throw for address owned by another user', () => {
      const created = addressService.create('user-001', validAddress);

      expect(() => addressService.delete(created.id, 'user-002')).toThrow(
        'Address not found'
      );
    });
  });

  describe('setDefault', () => {
    it('should set address as default', () => {
      addressService.create('user-001', validAddress);
      const second = addressService.create('user-001', { ...validAddress, label: 'Work' });

      const result = addressService.setDefault(second.id, 'user-001');

      expect(result.isDefault).toBe(true);
    });

    it('should clear other defaults', () => {
      const first = addressService.create('user-001', validAddress);
      const second = addressService.create('user-001', { ...validAddress, label: 'Work' });

      addressService.setDefault(second.id, 'user-001');

      expect(addresses.find((a) => a.id === first.id)?.isDefault).toBe(false);
    });

    it('should throw for non-existent address', () => {
      expect(() => addressService.setDefault('nonexistent', 'user-001')).toThrow(
        'Address not found'
      );
    });

    it('should throw for address owned by another user', () => {
      const created = addressService.create('user-001', validAddress);

      expect(() => addressService.setDefault(created.id, 'user-002')).toThrow(
        'Address not found'
      );
    });
  });
});
