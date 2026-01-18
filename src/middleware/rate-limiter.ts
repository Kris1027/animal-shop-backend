import type { Request, Response, NextFunction } from 'express';

import { rateLimit } from 'express-rate-limit';

const isTest = process.env.NODE_ENV === 'test';

const skipInTest = (_req: Request, _res: Response, next: NextFunction) => next();

export const globalLimiter = isTest
  ? skipInTest
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 100,
      standardHeaders: 'draft-8',
      legacyHeaders: false,
      handler: (_req: Request, res: Response) => {
        res.status(429).json({
          success: false,
          error: 'Too many requests, please try again later',
          code: 'RATE_LIMIT_EXCEEDED',
        });
      },
    });

export const strictLimiter = isTest
  ? skipInTest
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 20,
      standardHeaders: 'draft-8',
      legacyHeaders: false,
      handler: (_req: Request, res: Response) => {
        res.status(429).json({
          success: false,
          error: 'Too many requests, please try again later',
          code: 'RATE_LIMIT_EXCEEDED',
        });
      },
    });
