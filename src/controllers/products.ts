import type { Request, Response } from 'express';
import { sendCreated, sendNotFound, sendPaginated, sendSuccess } from '../utils/response.js';
import { productService } from '../services/products.js';
import { ProductQuery } from '../schemas/product.js';

export const productController = {
  // GET /products
  getAll: (req: Request, res: Response) => {
    const { page, limit, category, isFeatured } = req.query as unknown as ProductQuery;

    const result = productService.getAll({ page, limit, category, isFeatured });
    sendPaginated(res, result.data, result.meta);
  },

  // GET /products/:identifier
  getOne: (req: Request, res: Response) => {
    const identifier = req.params.identifier as string;
    const product = productService.getByIdentifier(identifier);

    if (!product) {
      sendNotFound(res, 'Product not found');
      return;
    }

    sendSuccess(res, product);
  },

  // POST /products
  create: (req: Request, res: Response) => {
    const product = productService.create(req.body);
    sendCreated(res, product);
  },

  // PUT /products/:id
  update: (req: Request, res: Response) => {
    const id = req.params.id as string;
    const product = productService.update(id, req.body);

    if (!product) {
      sendNotFound(res, 'Product not found');
      return;
    }

    sendSuccess(res, product);
  },

  // DELETE /products/:id
  remove: (req: Request, res: Response) => {
    const id = req.params.id as string;
    const product = productService.remove(id);

    if (!product) {
      sendNotFound(res, 'Product not found');
      return;
    }

    sendSuccess(res, product);
  },
};
