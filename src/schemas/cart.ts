import { z } from 'zod';

export const cartItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
  addedAt: z.date(),
});

export const cartSchema = z.object({
  id: z.string(),
  userId: z.string().nullable(),
  guestId: z.string().nullable(),
  shippingAddressId: z.string().nullable(),
  items: z.array(cartItemSchema),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const addToCartSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z
    .number()
    .int()
    .min(1, 'Quantity must be at least 1')
    .max(99, 'Quantity cannot exceed 99'),
});

export const updateCartItemSchema = z.object({
  quantity: z
    .number()
    .int()
    .min(1, 'Quantity must be at least 1')
    .max(99, 'Quantity cannot exceed 99'),
});

export type CartItem = z.infer<typeof cartItemSchema>;
export type Cart = z.infer<typeof cartSchema>;
export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;

export interface CartItemWithProduct extends CartItem {
  product: {
    id: string;
    slug: string;
    name: string;
    price: number;
    image: string;
    stock: number;
  };
  lineTotal: number;
}

export interface CartResponse {
  id: string;
  items: CartItemWithProduct[];
  itemCount: number;
  total: number;
  shippingAddressId?: string;
  shippingAddress?: {
    firstName: string;
    lastName: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export const setShippingAddressSchema = z.object({
  addressId: z.string().min(1, 'Address ID is required'),
});

export type SetShippingAddressInput = z.infer<typeof setShippingAddressSchema>;

export const checkoutSchema = z.object({
  addressId: z.string().min(1, 'Address ID is required').optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
