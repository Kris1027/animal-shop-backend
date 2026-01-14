import { Product } from '../schemas/product.js';

export const products: Product[] = [
  {
    id: 1,
    name: 'Dog Food Premium',
    price: 49.99,
    description: 'High-quality dog food for all breeds',
    image: 'https://example.com/dog-food.jpg',
    category: 'food',
    stock: 100,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2025-01-15'),
  },
  {
    id: 2,
    name: 'Cat Toy Mouse',
    price: 9.99,
    description: 'Interactive mouse toy for cats',
    image: 'https://example.com/cat-toy.jpg',
    category: 'toys',
    stock: 50,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2025-01-20'),
  },
];
