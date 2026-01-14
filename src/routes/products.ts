import { Router } from 'express';
import type { Request, Response } from 'express';
import { products } from '../data/products.js';
import { validate } from '../middleware/validate.js';
import { createProductSchema, Product, updateProductSchema } from '../schemas/product.js';
import { generateSlug } from '../utils/slug.js';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const category = req.query.category as string | undefined;
  const isFeatured = req.query.isFeatured as string | undefined;

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

  res.json({
    data: paginated,
    meta: {
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit),
    },
  });
});

router.get('/:identifier', (req: Request, res: Response) => {
  const identifier = req.params.identifier as string;

  const product = /^\d+$/.test(identifier)
    ? products.find((p) => p.id === parseInt(identifier))
    : products.find((p) => p.slug === identifier);

  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  res.json(product);
});

router.post('/', validate(createProductSchema), (req: Request, res: Response) => {
  const newProduct: Product = {
    id: products.length + 1,
    slug: generateSlug(req.body.name),
    ...req.body,
    banner: req.body.banner ?? null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

router.put('/:id', validate(updateProductSchema), (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string);
  const index = products.findIndex((p) => p.id === id);

  if (index === -1) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  const slug = req.body.name ? generateSlug(req.body.name) : products[index].slug;

  products[index] = { ...products[index], ...req.body, slug, updatedAt: new Date() };
  res.json(products[index]);
});

router.delete('/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string);
  const index = products.findIndex((p) => p.id === id);

  if (index === -1) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  const deleted = products.splice(index, 1)[0];
  res.json(deleted);
});

export default router;
