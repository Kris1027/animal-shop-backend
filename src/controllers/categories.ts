import type { Request, Response } from 'express';
import type { CategoryQuery } from '../schemas/category.js';

import { categoryService } from '../services/categories.js';
import { sendCreated, sendPaginated, sendSuccess } from '../utils/success.js';
import { NotFoundError } from '../utils/errors.js';

export const categoryController = {
  // GET /categories
  getAll: (_req: Request, res: Response) => {
    const { page, limit } = res.locals.query as CategoryQuery;
    const result = categoryService.getAll({ page, limit });
    sendPaginated(res, result.data, result.meta);
  },

  // GET /categories/:identifier
  getOne: (req: Request, res: Response) => {
    const identifier = req.params.identifier as string;
    const category = categoryService.getByIdentifier(identifier);
    if (!category) throw new NotFoundError('Category');
    sendSuccess(res, category);
  },

  // GET /categories/:identifier/products
  getProductsByCategory: (req: Request, res: Response) => {
    const identifier = req.params.identifier as string;
    const { page, limit } = res.locals.query as CategoryQuery;
    const result = categoryService.getProductsByCategory(identifier, { page, limit });
    if (!result) throw new NotFoundError('Category');
    sendPaginated(res, result.data, result.meta);
  },

  // POST /categories
  create: (req: Request, res: Response) => {
    const category = categoryService.create(req.body);
    sendCreated(res, category);
  },

  // PUT /categories/:id
  update: (req: Request, res: Response) => {
    const id = req.params.id as string;
    const category = categoryService.update(id, req.body);
    if (!category) throw new NotFoundError('Category');
    sendSuccess(res, category);
  },

  // DELETE /categories/:id
  remove: (req: Request, res: Response) => {
    const id = req.params.id as string;
    const category = categoryService.remove(id);
    if (!category) throw new NotFoundError('Category');
    sendSuccess(res, category);
  },
};
