import { nanoid } from 'nanoid';
import { categories } from '../data/categories.js';
import type { Category } from '../schemas/category.js';
import { generateSlug } from '../utils/slug.js';

export const categoryService = {
  getAll: () => {
    return categories;
  },

  getByIdentifier: (identifier: string) => {
    return categories.find((c) => c.id === identifier || c.slug === identifier) ?? null;
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
    return categories.splice(index, 1)[0] ?? null;
  },
};
