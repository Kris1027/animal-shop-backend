import { z } from 'zod';

export const productSchema = z.object({
  id: z.number(),
  name: z.string({ message: 'Name is required' }).min(1),
  price: z.number({ message: 'Price is required' }).positive('Price must be positive'),
  description: z.string({ message: 'Description is required' }).min(1),
  image: z.url({ message: 'Image must be a valid URL' }),
  category: z.string({ message: 'Category is required' }).min(1),
  stock: z.number({ message: 'Stock is required' }).int().nonnegative('Stock must be 0 or more'),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createProductSchema = productSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const updateProductSchema = createProductSchema.partial();

export type Product = z.infer<typeof productSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
