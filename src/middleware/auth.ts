import type { Request, Response, NextFunction } from 'express';

import { authService } from '../services/auth.js';
import { UnauthorizedError, ForbiddenError, BadRequestError } from '../utils/errors.js';

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

export const rejectAuthenticated = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);

    try {
      authService.verifyToken(token);
      throw new BadRequestError('Already authenticated. Logout first.');
    } catch (error) {
      if (error instanceof BadRequestError) throw error;
    }
  }

  next();
};

export const optionalAuth = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return next();
  }

  try {
    const token = authHeader.slice(7);
    req.user = authService.verifyToken(token);
  } catch {
    // Invalid token - continue as guest
  }

  next();
};
