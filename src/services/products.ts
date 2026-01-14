import { products } from '../data/products.js';
import { Product } from '../schemas/product.js';
import { generateSlug } from '../utils/slug.js';

interface GetAllParams {
  page: number;
  limit: number;
  category?: string;
  isFeatured?: string;
}

interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const productService = {
  getAll: ({ page, limit, category, isFeatured }: GetAllParams): PaginatedResult<Product> => {
    let filtered = [...products];

    if (category) {
      filtered = filtered.filter((p) => p.category === category);
    }

    if (isFeatured !== undefined) {
      filtered = filtered.filter((p) => p.isFeatured === (isFeatured === 'true'));
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginated = filtered.slice(startIndex, endIndex);

    return {
      data: paginated,
      meta: {
        total: filtered.length,
        page,
        limit,
        totalPages: Math.ceil(filtered.length / limit),
      },
    };
  },

  getByIdentifier: (identifier: string): Product | null => {
    const product = /^\d+$/.test(identifier)
      ? products.find((p) => p.id === parseInt(identifier))
      : products.find((p) => p.slug === identifier);

    return product || null;
  },

  create: (data: Omit<Product, 'id' | 'slug' | 'createdAt' | 'updatedAt'>): Product => {
    const newProduct: Product = {
      id: products.length + 1,
      slug: generateSlug(data.name),
      ...data,
      banner: data.banner ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    products.push(newProduct);
    return newProduct;
  },

  update: (id: number, data: Partial<Product>): Product | null => {
    const index = products.findIndex((p) => p.id === id);

    if (index === -1) {
      return null;
    }

    const slug = data.name ? generateSlug(data.name) : products[index].slug;

    products[index] = { ...products[index], ...data, slug, updatedAt: new Date() };
    return products[index];
  },

  remove: (id: number): Product | null => {
    const index = products.findIndex((p) => p.id === id);

    if (index === -1) {
      return null;
    }

    return products.splice(index, 1)[0];
  },
};
