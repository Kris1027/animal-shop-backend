import type { User } from '../schemas/user.js';

// Password for all seed users: "password123"
// Hash generated with: bcrypt.hash('password123', 12
const SEED_PASSWORD_HASH = '$2b$12$VmEqQCyUX2uAPCcnQ3RvROlCI2v3O9XTGvLWqX5LRhz9bfFPq60LG';

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
