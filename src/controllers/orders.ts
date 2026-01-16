import type { Request, Response } from 'express';

import { orderService } from '../services/orders.js';
import { sendSuccess, sendCreated } from '../utils/success.js';
import { asyncHandler } from '../utils/async-handler.js';

export const orderController = {
  // GET /orders
  getAll: asyncHandler((req: Request, res: Response) => {
    const isAdmin = req.user!.role === 'admin';
    const orders = isAdmin ? orderService.getAll() : orderService.getAllByUser(req.user!.userId);
    sendSuccess(res, orders);
  }),

  // GET /orders/:id
  getById: asyncHandler((req: Request, res: Response) => {
    const isAdmin = req.user!.role === 'admin';
    const order = orderService.getById(req.params.id as string, req.user!.userId, isAdmin);
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
    sendSuccess(res, order);
  }),

  // PATCH /orders/:id/cancel
  cancel: asyncHandler((req: Request, res: Response) => {
    const order = orderService.cancel(req.params.id as string, req.user!.userId);
    sendSuccess(res, order);
  }),
};
