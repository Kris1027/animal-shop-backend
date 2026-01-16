import { describe, it, expect, beforeEach } from 'vitest';
import { categoryService } from '../../../src/services/categories.js';
import { categories } from '../../../src/data/categories.js';
import { products } from '../../../src/data/products.js';

describe('categoryService', () => {
  beforeEach(() => {
    categories.length = 0;
    products.length = 0;
  });

  describe('getAll', () => {
    it('should return paginated results', () => {
      categoryService.create({ name: 'Dogs', description: null, image: null });
      categoryService.create({ name: 'Cats', description: null, image: null });

      const result = categoryService.getAll({ page: 1, limit: 1 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(2);
      expect(result.meta.totalPages).toBe(2);
    });
  });

  describe('getByIdentifier', () => {
    it('should find by id', () => {
      const created = categoryService.create({ name: 'Dogs', description: null, image: null });
      const result = categoryService.getByIdentifier(created.id);
      expect(result?.name).toBe('Dogs');
    });

    it('should find by slug', () => {
      categoryService.create({ name: 'Dogs', description: null, image: null });
      const result = categoryService.getByIdentifier('dogs');
      expect(result?.name).toBe('Dogs');
    });

    it('should return null when not found', () => {
      const result = categoryService.getByIdentifier('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create with generated id and slug', () => {
      const result = categoryService.create({ name: 'Dogs', description: null, image: null });

      expect(result.id).toBeDefined();
      expect(result.slug).toBe('dogs');
      expect(result.name).toBe('Dogs');
    });
  });

  describe('update', () => {
    it('should update existing category', () => {
      const created = categoryService.create({ name: 'Dogs', description: null, image: null });
      const result = categoryService.update(created.id, { name: 'Cats' });

      expect(result?.name).toBe('Cats');
      expect(result?.slug).toBe('cats');
    });

    it('should return null when not found', () => {
      const result = categoryService.update('nonexistent', { name: 'Cats' });
      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('should remove existing category', () => {
      const created = categoryService.create({ name: 'Dogs', description: null, image: null });
      const result = categoryService.remove(created.id);

      expect(result?.id).toBe(created.id);
      expect(categories).toHaveLength(0);
    });

    it('should return null when not found', () => {
      const result = categoryService.remove('nonexistent');
      expect(result).toBeNull();
    });

    it('should throw when category has products', () => {
      const category = categoryService.create({ name: 'Dogs', description: null, image: null });
      products.push({
        id: '1',
        slug: 'dog-food',
        name: 'Dog Food',
        price: 10,
        description: 'Food',
        image: 'https://example.com/img.jpg',
        banner: null,
        category: category.id,
        stock: 5,
        isFeatured: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(() => categoryService.remove(category.id)).toThrow(
        'Cannot delete category with existing products'
      );
    });
  });

  describe('getProductsByCategory', () => {
    it('should return products for category', () => {
      const category = categoryService.create({ name: 'Dogs', description: null, image: null });
      products.push({
        id: '1',
        slug: 'dog-food',
        name: 'Dog Food',
        price: 10,
        description: 'Food',
        image: 'https://example.com/img.jpg',
        banner: null,
        category: category.id,
        stock: 5,
        isFeatured: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = categoryService.getProductsByCategory(category.id, { page: 1, limit: 10 });

      expect(result?.data).toHaveLength(1);
      expect(result?.data[0]!.name).toBe('Dog Food');
    });

    it('should return null when category not found', () => {
      const result = categoryService.getProductsByCategory('nonexistent', { page: 1, limit: 10 });
      expect(result).toBeNull();
    });
  });
});
