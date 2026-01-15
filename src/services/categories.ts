import type { PaginatedResult, PaginationParams } from '../types/pagination.js';
import type { Category } from '../schemas/category.js';
import type { Product } from '../schemas/product.js';

import { nanoid } from 'nanoid';
import { categories } from '../data/categories.js';
import { generateSlug } from '../utils/slug.js';
import { paginate } from '../utils/paginate.js';
import { products } from '../data/products.js';
import { BadRequestError } from '../utils/errors.js';

interface GetAllParams {
  page: number;
  limit: number;
}

export const categoryService = {
  getAll: ({ page, limit }: GetAllParams): PaginatedResult<Category> => {
    return paginate(categories, { page, limit });
  },

  getByIdentifier: (identifier: string) => {
    return categories.find((c) => c.id === identifier || c.slug === identifier) ?? null;
  },

  getProductsByCategory: (
    identifier: string,
    { page, limit }: PaginationParams
  ): PaginatedResult<Product> | null => {
    const category = categories.find((c) => c.id === identifier || c.slug === identifier);
    if (!category) return null;

    const categoryProducts = products.filter(
      (p) => p.category === category.id || p.category === category.slug
    );
    return paginate(categoryProducts, { page, limit });
  },

  create: (data: Omit<Category, 'id' | 'slug' | 'createdAt' | 'updatedAt'>): Category => {
    const newCategory: Category = {
      id: nanoid(),
      slug: generateSlug(data.name),
      ...data,
      description: data.description ?? null,
      image: data.image ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    categories.push(newCategory);
    return newCategory;
  },

  update: (id: string, data: Partial<Category>): Category | null => {
    const index = categories.findIndex((c) => c.id === id);
    if (index === -1) return null;

    const existing = categories[index]!;
    const slug = data.name ? generateSlug(data.name) : existing.slug;
    const updated: Category = { ...existing, ...data, slug, updatedAt: new Date() };
    categories[index] = updated;
    return updated;
  },

  remove: (id: string): Category | null => {
    const index = categories.findIndex((c) => c.id === id);
    if (index === -1) return null;

    const category = categories[index]!;
    const hasProducts = products.some(
      (p) => p.category === category.id || p.category === category.slug
    );

    if (hasProducts) {
      throw new BadRequestError('Cannot delete category with existing products');
    }

    return categories.splice(index, 1)[0] ?? null;
  },
};
