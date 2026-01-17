import type { TokenPayload } from '../services/auth.js';

declare module 'express-serve-static-core' {
  interface Request {
    user?: TokenPayload;
  }
}

declare global {
  namespace Express {
    interface Request {
      guestId?: string;
    }
  }
}
