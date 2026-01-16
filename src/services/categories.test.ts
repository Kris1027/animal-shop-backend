import { describe, it, expect, beforeEach } from 'vitest';
import { categories } from '../data/categories.js';
import { categoryService } from './categories.js';

describe('categoryService', () => {
  beforeEach(() => {
    categories.length = 0;
  });

  describe('create', () => {
    it('should create a category with generated id and slug', () => {
      const result = categoryService.create({ name: 'Dogs', description: null, image: null });

      expect(result.id).toBeDefined();
      expect(result.slug).toBe('dogs');
      expect(result.name).toBe('Dogs');
    });
  });

  describe('getByIdentifier', () => {
    it('should return null when category not found', () => {
      const result = categoryService.getByIdentifier('nonexistent');
      expect(result).toBeNull();
    });
  });
});
