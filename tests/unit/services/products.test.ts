import { describe, it, expect, beforeEach } from 'vitest';
import { productService } from '../../../src/services/products.js';
import { products } from '../../../src/data/products.js';
import { categories } from '../../../src/data/categories.js';

const validProduct = {
  name: 'Dog Food',
  price: 29.99,
  description: 'Premium dog food',
  image: 'https://example.com/img.jpg',
  banner: null,
  category: 'dogs',
  stock: 10,
  isFeatured: false,
};

describe('productService', () => {
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

  describe('getAll', () => {
    it('should return paginated results', () => {
      productService.create(validProduct);
      productService.create({ ...validProduct, name: 'Cat Food' });

      const result = productService.getAll({ page: 1, limit: 1 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(2);
    });

    it('should filter by category', () => {
      productService.create(validProduct);

      const result = productService.getAll({ page: 1, limit: 10, category: 'dogs' });

      expect(result.data).toHaveLength(1);
    });

    it('should filter by isFeatured', () => {
      productService.create({ ...validProduct, isFeatured: true });
      productService.create(validProduct);

      const result = productService.getAll({ page: 1, limit: 10, isFeatured: 'true' });

      expect(result.data).toHaveLength(1);
    });
  });

  describe('create', () => {
    it('should create product with valid category', () => {
      const result = productService.create(validProduct);

      expect(result.id).toBeDefined();
      expect(result.slug).toBe('dog-food');
    });

    it('should throw for invalid category', () => {
      expect(() => productService.create({ ...validProduct, category: 'invalid' })).toThrow(
        'Category invalid does not exist'
      );
    });
  });

  describe('update', () => {
    it('should update existing product', () => {
      const created = productService.create(validProduct);
      const result = productService.update(created.id, { name: 'Cat Food' });

      expect(result?.name).toBe('Cat Food');
      expect(result?.slug).toBe('cat-food');
    });

    it('should throw for invalid category on update', () => {
      const created = productService.create(validProduct);

      expect(() => productService.update(created.id, { category: 'invalid' })).toThrow(
        'Category invalid does not exist'
      );
    });
  });

  describe('remove', () => {
    it('should remove existing product', () => {
      const created = productService.create(validProduct);
      const result = productService.remove(created.id);

      expect(result?.id).toBe(created.id);
      expect(products).toHaveLength(0);
    });
  });
});
