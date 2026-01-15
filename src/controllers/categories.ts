import type { Request, Response } from 'express';
import { categoryService } from '../services/categories.js';
import { sendCreated, sendSuccess } from '../utils/success.js';
import { NotFoundError } from '../utils/errors.js';

export const categoryController = {
  getAll: (_req: Request, res: Response) => {
    const result = categoryService.getAll();
    sendSuccess(res, result);
  },

  getOne: (req: Request, res: Response) => {
    const identifier = req.params.identifier as string;
    const category = categoryService.getByIdentifier(identifier);
    if (!category) throw new NotFoundError('Category');
    sendSuccess(res, category);
  },

  create: (req: Request, res: Response) => {
    const category = categoryService.create(req.body);
    sendCreated(res, category);
  },

  update: (req: Request, res: Response) => {
    const id = req.params.id as string;
    const category = categoryService.update(id, req.body);
    if (!category) throw new NotFoundError('Category');
    sendSuccess(res, category);
  },

  remove: (req: Request, res: Response) => {
    const id = req.params.id as string;
    const category = categoryService.remove(id);
    if (!category) throw new NotFoundError('Category');
    sendSuccess(res, category);
  },
};
