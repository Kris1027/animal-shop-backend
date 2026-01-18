import type { Request, Response } from 'express';
import type { OrderQuery } from '../schemas/order.js';

import { orderService } from '../services/orders.js';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/success.js';
import { asyncHandler } from '../utils/async-handler.js';
import { NotFoundError } from '../utils/errors.js';

export const orderController = {
  // GET /orders
  getAll: asyncHandler((req: Request, res: Response) => {
    const { page, limit, status } = res.locals.query as OrderQuery;
    const isAdmin = req.user!.role === 'admin';
    const result = isAdmin
      ? orderService.getAll({ page, limit, status })
      : orderService.getAllByUser(req.user!.userId, { page, limit, status });
    sendPaginated(res, result.data, result.meta);
  }),

  // GET /orders/:id
  getById: asyncHandler((req: Request, res: Response) => {
    const order = orderService.getById(req.params.id as string);
    if (!order) throw new NotFoundError('Order');
    if (req.user!.role !== 'admin' && order.userId !== req.user!.userId) {
      throw new NotFoundError('Order');
    }
    sendSuccess(res, order);
  }),

  // POST /orders
  create: asyncHandler((req: Request, res: Response) => {
    const order = orderService.create(req.user!.userId, req.body);
    sendCreated(res, order);
  }),

  // PATCH /orders/:id/status
  updateStatus: asyncHandler((req: Request, res: Response) => {
    const order = orderService.updateStatus(req.params.id as string, req.body);
    if (!order) throw new NotFoundError('Order');
    sendSuccess(res, order);
  }),

  // PATCH /orders/:id/cancel
  cancel: asyncHandler((req: Request, res: Response) => {
    const order = orderService.cancel(req.params.id as string, req.user!.userId);
    if (!order) throw new NotFoundError('Order');
    sendSuccess(res, order);
  }),
};
