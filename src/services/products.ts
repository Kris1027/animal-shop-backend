import type { PaginatedResult } from '../types/pagination.js';
import type { Product } from '../schemas/product.js';

import { nanoid } from 'nanoid';
import { products } from '../data/products.js';
import { generateSlug } from '../utils/slug.js';
import { categories } from '../data/categories.js';
import { BadRequestError } from '../utils/errors.js';
import { paginate } from '../utils/paginate.js';

interface GetAllParams {
  page: number;
  limit: number;
  category?: string;
  isFeatured?: string;
}

const validateCategory = (category: string) => {
  const exists = categories.some((c) => c.id === category || c.slug === category);
  if (!exists) {
    throw new BadRequestError(`Category ${category} does not exist`);
  }
};

export const productService = {
  getAll: ({ page, limit, category, isFeatured }: GetAllParams): PaginatedResult<Product> => {
    let filtered = [...products];

    if (category) {
      filtered = filtered.filter((p) => p.category === category);
    }

    if (isFeatured !== undefined) {
      filtered = filtered.filter((p) => p.isFeatured === (isFeatured === 'true'));
    }

    return paginate(filtered, { page, limit });
  },

  getByIdentifier: (identifier: string) => {
    return products.find((p) => p.id === identifier || p.slug === identifier) || null;
  },

  create: (data: Omit<Product, 'id' | 'slug' | 'createdAt' | 'updatedAt'>): Product => {
    validateCategory(data.category);
    const existingSlugs = products.map((p) => p.slug);

    const newProduct: Product = {
      id: nanoid(),
      slug: generateSlug(data.name, existingSlugs),
      ...data,
      banner: data.banner ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    products.push(newProduct);
    return newProduct;
  },

  update: (id: string, data: Partial<Product>): Product | null => {
    const index = products.findIndex((p) => p.id === id);
    const existingSlugs = products.filter((p) => p.id !== id).map((p) => p.slug);

    if (index === -1) {
      return null;
    }

    if (data.category) {
      validateCategory(data.category);
    }

    const existing = products[index]!;
    const slug = data.name ? generateSlug(data.name, existingSlugs) : existing.slug;

    const updated: Product = { ...existing, ...data, slug, updatedAt: new Date() };
    products[index] = updated;
    return updated;
  },

  remove: (id: string): Product | null => {
    const index = products.findIndex((p) => p.id === id);

    if (index === -1) {
      return null;
    }

    return products.splice(index, 1)[0] ?? null;
  },
};
