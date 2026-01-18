import { z } from 'zod';
import { paginationQuerySchema } from './pagination.js';

export const addressSchema = z.object({
  id: z.string(),
  userId: z.string(),
  label: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  address1: z.string(),
  address2: z.string().nullable(),
  city: z.string(),
  state: z.string(),
  postalCode: z.string(),
  country: z.string(),
  phone: z.string().nullable(),
  isDefault: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createAddressSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  address1: z.string().min(1, 'Address is required'),
  address2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(2, 'Country is required'),
  phone: z.string().optional(),
  isDefault: z.boolean().optional().default(false),
});

export const updateAddressSchema = createAddressSchema.partial();
export const addressQuerySchema = paginationQuerySchema;

export type Address = z.infer<typeof addressSchema>;
export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
export type AddressQuery = z.infer<typeof addressQuerySchema>;
