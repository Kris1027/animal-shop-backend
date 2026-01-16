import type { Request, Response } from 'express';
import { authService } from '../services/auth.js';
import { sendCreated, sendSuccess } from '../utils/success.js';
import { NotFoundError } from '../utils/errors.js';

export const authController = {
  // POST /auth/register
  register: async (req: Request, res: Response) => {
    const user = await authService.register(req.body);
    sendCreated(res, user);
  },

  // POST /auth/login
  login: async (req: Request, res: Response) => {
    const result = await authService.login(req.body);
    sendSuccess(res, result);
  },

  // GET /auth/me
  me: (req: Request, res: Response) => {
    sendSuccess(res, req.user);
  },

  // PATCH /auth/users/:id/role
  updateRole: (req: Request, res: Response) => {
    const id = req.params.id as string;
    const { role } = req.body;
    const user = authService.updateRole(id, role);
    if (!user) throw new NotFoundError('User');
    sendSuccess(res, user);
  },
};
