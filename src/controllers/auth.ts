import type { Request, Response } from 'express';
import { authService } from '../services/auth.js';
import { sendCreated, sendSuccess } from '../utils/success.js';

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
};
