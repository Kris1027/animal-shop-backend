import type { User, RegisterInput, LoginInput } from '../schemas/user.js';

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';
import { users } from '../data/users.js';
import { env } from '../config/env.js';
import { BadRequestError, UnauthorizedError } from '../utils/errors.js';

const SALT_ROUNDS = 10;

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export const authService = {
  register: async (data: RegisterInput): Promise<Omit<User, 'password'>> => {
    const exists = users.find((u) => u.email === data.email);
    if (exists) throw new BadRequestError('Email already registered');

    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

    const user: User = {
      id: nanoid(),
      email: data.email,
      password: hashedPassword,
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    users.push(user);

    const { password: _password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  login: async (data: LoginInput): Promise<{ user: Omit<User, 'password'>; token: string }> => {
    const user = users.find((u) => u.email === data.email);
    if (!user) throw new UnauthorizedError('Invalid email or password');

    const valid = await bcrypt.compare(data.password, user.password);
    if (!valid) throw new UnauthorizedError('Invalid email or password');

    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });

    const { password: _password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  },

  verifyToken: (token: string): TokenPayload => {
    try {
      return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    } catch {
      throw new UnauthorizedError('Invalid or expired token');
    }
  },

  updateRole: (userId: string, role: 'user' | 'admin'): Omit<User, 'password'> | null => {
    const index = users.findIndex((u) => u.id === userId);
    if (index === -1) return null;

    const user = users[index]!;
    user.role = role;
    user.updatedAt = new Date();

    const { password: _password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },
};
