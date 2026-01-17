import type { Request, Response } from 'express';

import { cartService } from '../services/cart.js';
import { sendCreated, sendSuccess } from '../utils/success.js';
import { asyncHandler } from '../utils/async-handler.js';
import { BadRequestError } from '../utils/errors.js';

export const cartController = {
  // GET /cart
  get: asyncHandler((req: Request, res: Response) => {
    const userId = req.user?.userId;
    const guestId = req.guestId;

    if (!userId && !guestId) {
      throw new BadRequestError('Authentication or X-Guest-Id header required');
    }

    const cart = cartService.get(userId, guestId);
    sendSuccess(res, cart);
  }),

  // POST /cart/items
  addItem: asyncHandler((req: Request, res: Response) => {
    const userId = req.user?.userId;
    const guestId = req.guestId;

    if (!userId && !guestId) {
      throw new BadRequestError('Authentication or X-Guest-Id header required');
    }

    const cart = cartService.addItem(userId, guestId, req.body);
    sendSuccess(res, cart);
  }),

  // PATCH /cart/items/:productId
  updateItem: asyncHandler((req: Request, res: Response) => {
    const userId = req.user?.userId;
    const guestId = req.guestId;

    if (!userId && !guestId) {
      throw new BadRequestError('Authentication or X-Guest-Id header required');
    }

    const productId = req.params.productId as string;
    const { quantity } = req.body;
    const cart = cartService.updateItem(userId, guestId, productId, quantity);
    sendSuccess(res, cart);
  }),

  // DELETE /cart/items/:productId
  removeItem: asyncHandler((req: Request, res: Response) => {
    const userId = req.user?.userId;
    const guestId = req.guestId;

    if (!userId && !guestId) {
      throw new BadRequestError('Authentication or X-Guest-Id header required');
    }

    const productId = req.params.productId as string;
    const cart = cartService.removeItem(userId, guestId, productId);
    sendSuccess(res, cart);
  }),

  // DELETE /cart
  clear: asyncHandler((req: Request, res: Response) => {
    const userId = req.user?.userId;
    const guestId = req.guestId;

    if (!userId && !guestId) {
      throw new BadRequestError('Authentication or X-Guest-Id header required');
    }

    const result = cartService.clear(userId, guestId);
    sendSuccess(res, result);
  }),

  // PUT /cart/shipping-address
  setShippingAddress: asyncHandler((req: Request, res: Response) => {
    if (!req.user) {
      throw new BadRequestError('Authentication required to set shipping address');
    }

    const { addressId } = req.body;
    const cart = cartService.setShippingAddress(req.user.userId, req.guestId, addressId);
    sendSuccess(res, cart);
  }),

  // POST /cart/checkout
  checkout: asyncHandler((req: Request, res: Response) => {
    if (!req.user) {
      throw new BadRequestError('Authentication required for checkout');
    }

    const { addressId } = req.body;
    const order = cartService.checkout(req.user.userId, addressId);
    sendCreated(res, order);
  }),
};
