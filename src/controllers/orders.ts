import type { Request, Response } from 'express';
import { orderService } from '../services/orders.js';
import { sendSuccess, sendCreated } from '../utils/success.js';

export const orderController = {
  getAll: (req: Request, res: Response) => {
    const isAdmin = req.user!.role === 'admin';
    const orders = isAdmin ? orderService.getAll() : orderService.getAllByUser(req.user!.userId);
    sendSuccess(res, orders);
  },

  getById: (req: Request, res: Response) => {
    const isAdmin = req.user!.role === 'admin';
    const order = orderService.getById(req.params.id as string, req.user!.userId, isAdmin);
    sendSuccess(res, order);
  },

  create: (req: Request, res: Response) => {
    const order = orderService.create(req.user!.userId, req.body);
    sendCreated(res, order);
  },

  updateStatus: (req: Request, res: Response) => {
    const order = orderService.updateStatus(req.params.id as string, req.body);
    sendSuccess(res, order);
  },

  cancel: (req: Request, res: Response) => {
    const order = orderService.cancel(req.params.id as string, req.user!.userId);
    sendSuccess(res, order);
  },
};
