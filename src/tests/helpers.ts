import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const getAdminToken = (): string => {
  return jwt.sign(
    { userId: 'admin-001', email: 'admin@example.com', role: 'admin' },
    env.JWT_SECRET,
    { expiresIn: '1h', issuer: 'animal-shop-api', audience: 'animal-shop-client' }
  );
};

export const getUserToken = (
  userId: string = 'user-001',
  email: string = 'john@example.com'
): string => {
  return jwt.sign({ userId, email, role: 'user' }, env.JWT_SECRET, {
    expiresIn: '1h',
    issuer: 'animal-shop-api',
    audience: 'animal-shop-client',
  });
};
