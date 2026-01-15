import type { Category } from '../schemas/category.js';

export const categories: Category[] = [
  {
    id: 'cat001',
    slug: 'food',
    name: 'Food',
    description: 'Pet food and treats',
    image: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: 'cat002',
    slug: 'toys',
    name: 'Toys',
    description: 'Pet toys and entertainment',
    image: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
];
