import type { Request, Response, NextFunction } from 'express';

export const extractGuestId = (req: Request, _res: Response, next: NextFunction) => {
  const guestId = req.headers['x-guest-id'] as string | undefined;
  if (guestId) {
    req.guestId = guestId;
  }
  next();
};
