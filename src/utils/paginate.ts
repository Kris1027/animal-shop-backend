import type { PaginatedResult, PaginationParams } from '../types/pagination.js';

export const paginate = <T>(items: T[], { page, limit }: PaginationParams): PaginatedResult<T> => {
  const startIndex = (page - 1) * limit;
  const paginated = items.slice(startIndex, startIndex + limit);

  return {
    data: paginated,
    meta: {
      total: items.length,
      page,
      limit,
      totalPages: Math.ceil(items.length / limit),
    },
  };
};
