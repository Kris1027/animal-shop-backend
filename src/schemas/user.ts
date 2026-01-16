import { z } from 'zod';

export const userSchema = z.object({
  id: z.string(),
  email: z.string(),
  password: z.string(),
  role: z.enum(['user', 'admin']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const registerSchema = z.object({
  email: z.email({ message: 'Valid email is required' }),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = registerSchema;

export type User = z.infer<typeof userSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export const updateRoleSchema = z.object({
  role: z.enum(['user', 'admin']),
});

export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
