import type { Request, Response } from 'express';

import { authService } from '../services/auth.js';
import { sendCreated, sendSuccess } from '../utils/success.js';
import { NotFoundError } from '../utils/errors.js';
import { asyncHandler } from '../utils/async-handler.js';

export const authController = {
  // GET /auth/users
  getAll: asyncHandler((_req: Request, res: Response) => {
    const users = authService.getAll();
    sendSuccess(res, users);
  }),

  // POST /auth/register
  register: asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.register(req.body);
    sendCreated(res, user);
  }),

  // POST /auth/login
  login: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.login(req.body);
    sendSuccess(res, result);
  }),

  // GET /auth/me
  me: asyncHandler((req: Request, res: Response) => {
    sendSuccess(res, req.user);
  }),

  // PATCH /auth/users/:id/role
  updateRole: asyncHandler((req: Request, res: Response) => {
    const id = req.params.id as string;
    const { role } = req.body;
    const user = authService.updateRole(id, role);
    if (!user) throw new NotFoundError('User');
    sendSuccess(res, user);
  }),

  // POST /auth/logout
  logout: asyncHandler((_req: Request, res: Response) => {
    sendSuccess(res, { message: 'Logged out successfully' });
  }),
};
