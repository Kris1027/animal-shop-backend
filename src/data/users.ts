import type { User } from '../schemas/user.js';

// Password for all seed users: "password123"
// Hash generated with: bcrypt.hash('password123', 10)
const SEED_PASSWORD_HASH = '$2b$10$ofTtpLljlm7zs0kQ/IhH8eFXmb88g0yXzkouGRcFfPSMfBIXRLSca';

export const users: User[] = [
  {
    id: 'admin-001',
    email: 'admin@example.com',
    password: SEED_PASSWORD_HASH,
    role: 'admin',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'user-001',
    email: 'john@example.com',
    password: SEED_PASSWORD_HASH,
    role: 'user',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'user-002',
    email: 'jane@example.com',
    password: SEED_PASSWORD_HASH,
    role: 'user',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];
