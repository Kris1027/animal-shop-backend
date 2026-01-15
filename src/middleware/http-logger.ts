import type { Request, Response } from 'express';
import { pinoHttp } from 'pino-http';
import { logger } from '../utils/logger.js';

export const httpLogger = pinoHttp({
  logger,
  customSuccessMessage: (req: Request, res: Response) => {
    return `${req.method} ${req.url} ${res.statusCode}`;
  },
  customErrorMessage: (req: Request, res: Response) => {
    return `${req.method} ${req.url} ${res.statusCode}`;
  },
});
