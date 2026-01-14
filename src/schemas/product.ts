import { z } from 'zod';

export const productSchema = z.object({
  id: z.number(),
  slug: z.string(),
  name: z.string({ message: 'Name is required' }).min(1),
  price: z.number({ message: 'Price is required' }).positive('Price must be positive'),
  description: z.string({ message: 'Description is required' }).min(1),
  image: z.url({ message: 'Image must be a valid URL' }),
  banner: z.url().nullable(),
  category: z.string({ message: 'Category is required' }).min(1),
  stock: z.number({ message: 'Stock is required' }).int().nonnegative('Stock must be 0 or more'),
  isFeatured: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createProductSchema = productSchema
  .omit({
    id: true,
    slug: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    banner: z.url({ message: 'Banner must be a valid URL' }).optional(),
    isFeatured: z.boolean().optional().default(false),
  });
export const updateProductSchema = createProductSchema.partial();

export type Product = z.infer<typeof productSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export const productQuerySchema = z.object({
  page: z.coerce.number().positive().optional().default(1),
  limit: z.coerce.number().positive().max(100).optional().default(10),
  category: z.string().optional(),
  isFeatured: z
    .string()
    .refine((val) => val === 'true' || val === 'false', {
      message: `isFeatured must be "true" or "false"`,
    })
    .optional(),
});

export type ProductQuery = z.infer<typeof productQuerySchema>;
