import { z } from 'zod';

export const paginationQuerySchema = z.object({
  page: z.coerce.number().positive().optional().default(1),
  limit: z.coerce.number().positive().max(100).optional().default(10),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
