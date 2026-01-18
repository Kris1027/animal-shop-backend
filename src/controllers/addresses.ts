import type { Request, Response } from 'express';
import type { AddressQuery } from '../schemas/address.js';

import { addressService } from '../services/addresses.js';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/success.js';
import { asyncHandler } from '../utils/async-handler.js';
import { NotFoundError } from '../utils/errors.js';

export const addressController = {
  // GET /addresses
  getAll: asyncHandler((req: Request, res: Response) => {
    const { page, limit } = res.locals.query as AddressQuery;
    const result = addressService.getAllByUser(req.user!.userId, { page, limit });
    sendPaginated(res, result.data, result.meta);
  }),

  // GET /addresses/:id
  getById: asyncHandler((req: Request, res: Response) => {
    const address = addressService.getById(req.params.id as string, req.user!.userId);
    if (!address) throw new NotFoundError('Address');
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
    if (!address) throw new NotFoundError('Address');
    sendSuccess(res, address);
  }),

  // DELETE /addresses/:id
  delete: asyncHandler((req: Request, res: Response) => {
    const address = addressService.delete(req.params.id as string, req.user!.userId);
    if (!address) throw new NotFoundError('Address');
    sendSuccess(res, address);
  }),

  // PATCH /addresses/:id/default
  setDefault: asyncHandler((req: Request, res: Response) => {
    const address = addressService.setDefault(req.params.id as string, req.user!.userId);
    if (!address) throw new NotFoundError('Address');
    sendSuccess(res, address);
  }),
};
