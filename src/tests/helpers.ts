import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const getAdminToken = (): string => {
  return jwt.sign(
    { userId: 'admin-001', email: 'admin@example.com', role: 'admin' },
    env.JWT_SECRET,
    { expiresIn: '1h', issuer: 'animal-shop-api', audience: 'animal-shop-client' }
  );
};
