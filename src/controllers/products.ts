import type { Request, Response } from 'express';
import { sendCreated, sendNotFound, sendPaginated, sendSuccess } from '../utils/response.js';
import { productService } from '../services/products.js';

export const productController = {
  // GET /products
  getAll: (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const category = req.query.category as string | undefined;
    const isFeatured = req.query.isFeatured as string | undefined;

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
    const id = parseInt(req.params.id as string);
    const product = productService.update(id, req.body);

    if (!product) {
      sendNotFound(res, 'Product not found');
      return;
    }

    sendSuccess(res, product);
  },

  // DELETE /products/:id
  remove: (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string);
    const product = productService.remove(id);

    if (!product) {
      sendNotFound(res, 'Product not found');
      return;
    }

    sendSuccess(res, product);
  },
};
