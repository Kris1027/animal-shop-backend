import { z } from 'zod';
import { paginationQuerySchema } from './pagination.js';

export const categorySchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string({ message: 'Name is required' }).min(1),
  description: z.string().nullable(),
  image: z.url({ message: 'Image must be a valid URL' }).nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createCategorySchema = categorySchema
  .omit({
    id: true,
    slug: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    description: z.string().optional(),
    image: z.url({ message: 'Image must be a valid URL' }).optional(),
  });

export const updateCategorySchema = createCategorySchema.partial();
export const categoryQuerySchema = paginationQuerySchema;

export type Category = z.infer<typeof categorySchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CategoryQuery = z.infer<typeof categoryQuerySchema>;
