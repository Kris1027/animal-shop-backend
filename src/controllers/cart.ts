import type { Request, Response } from 'express';

import { cartService } from '../services/cart.js';
import { sendSuccess } from '../utils/success.js';
import { asyncHandler } from '../utils/async-handler.js';

export const cartController = {
  get: asyncHandler((req: Request, res: Response) => {
    const cart = cartService.get(req.user!.userId);
    sendSuccess(res, cart);
  }),

  addItem: asyncHandler((req: Request, res: Response) => {
    const cart = cartService.addItem(req.user!.userId, req.body);
    sendSuccess(res, cart);
  }),

  updateItem: asyncHandler((req: Request, res: Response) => {
    const { productId } = req.params as { productId: string };
    const { quantity } = req.body;
    const cart = cartService.updateItem(req.user!.userId, productId, quantity);
    sendSuccess(res, cart);
  }),

  removeItem: asyncHandler((req: Request, res: Response) => {
    const { productId } = req.params as { productId: string };
    const cart = cartService.removeItem(req.user!.userId, productId);
    sendSuccess(res, cart);
  }),

  clear: asyncHandler((req: Request, res: Response) => {
    const result = cartService.clear(req.user!.userId);
    sendSuccess(res, result);
  }),
};
