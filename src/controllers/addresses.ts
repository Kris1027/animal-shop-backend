import type { Request, Response } from 'express';

import { addressService } from '../services/addresses.js';
import { sendSuccess, sendCreated } from '../utils/success.js';
import { asyncHandler } from '../utils/async-handler.js';

export const addressController = {
  // GET /addresses
  getAll: asyncHandler((req: Request, res: Response) => {
    const addresses = addressService.getAllByUser(req.user!.userId);
    sendSuccess(res, addresses);
  }),

  // GET /addresses/:id
  getById: asyncHandler((req: Request, res: Response) => {
    const address = addressService.getById(req.params.id as string, req.user!.userId);
    sendSuccess(res, address);
  }),

  // POST /addresses
  create: asyncHandler((req: Request, res: Response) => {
    const address = addressService.create(req.user!.userId, req.body);
    sendCreated(res, address);
  }),

  // PUT /addresses/:id
  update: asyncHandler((req: Request, res: Response) => {
    const address = addressService.update(req.params.id as string, req.user!.userId, req.body);
    sendSuccess(res, address);
  }),

  // DELETE /addresses/:id
  delete: asyncHandler((req: Request, res: Response) => {
    const address = addressService.delete(req.params.id as string, req.user!.userId);
    sendSuccess(res, address);
  }),

  // PATCH /addresses/:id/default
  setDefault: asyncHandler((req: Request, res: Response) => {
    const address = addressService.setDefault(req.params.id as string, req.user!.userId);
    sendSuccess(res, address);
  }),
};
