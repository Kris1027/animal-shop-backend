import { z } from 'zod';
import { paginationQuerySchema } from './pagination.js';

export const orderItemSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  price: z.number(),
  quantity: z.number().int().positive(),
});

export const orderSchema = z.object({
  id: z.string(),
  orderNumber: z.number().int().positive(),
  userId: z.string(),
  addressId: z.string(),
  items: z.array(orderItemSchema),
  total: z.number(),
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createOrderSchema = z.object({
  addressId: z.string().min(1, 'Address is required'),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, 'Product ID is required'),
        quantity: z.number().int().positive('Quantity must be positive'),
      })
    )
    .min(1, 'At least one item is required'),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['processing', 'shipped', 'delivered', 'cancelled']),
});

export const orderQuerySchema = paginationQuerySchema.extend({
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).optional(),
});

export type OrderItem = z.infer<typeof orderItemSchema>;
export type Order = z.infer<typeof orderSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type OrderQuery = z.infer<typeof orderQuerySchema>;
