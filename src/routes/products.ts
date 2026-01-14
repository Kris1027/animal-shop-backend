import { Router } from 'express';
import type { Request, Response } from 'express';
import { products } from '../data/products.js';
import { validate } from '../middleware/validate.js';
import { createProductSchema, Product, updateProductSchema } from '../schemas/product.js';
import { generateSlug } from '../utils/slug.js';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json(products);
});

router.get('/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string);
  const product = products.find((p) => p.id === id);

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
