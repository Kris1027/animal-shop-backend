import type { Request, Response, NextFunction } from 'express';

import { authService } from '../services/auth.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) throw new UnauthorizedError('No token provided');

  const token = authHeader.slice(7);
  req.user = authService.verifyToken(token);
  next();
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) throw new UnauthorizedError('Not authenticated');
    if (!roles.includes(req.user.role)) throw new ForbiddenError('Insufficient permissions');

    next();
  };
};
