// src/utils/paginationHelpers.ts
// Utility for extracting pagination metadata from API responses
// Supports both new `meta` object format and legacy flat fields (backward compatible)

import { PaginationMeta } from '../types/api.types';

export type { PaginationMeta };

/**
 * Extracts pagination metadata from an API response.
 *
 * Priority:
 * 1. Reads from `response.meta.*` when the `meta` object is present
 * 2. Falls back to flat fields (`response.total`, `response.page`, etc.)
 *    for backward compatibility with older API responses
 *
 * Never returns `undefined` for any pagination field — all fields have safe defaults.
 *
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6
 */
export function extractPaginationMeta(response: any): PaginationMeta {
  // Priority: read from meta object first
  if (response?.meta) {
    return {
      total: response.meta.total ?? 0,
      page: response.meta.page ?? 1,
      limit: response.meta.limit ?? 20,
      totalPages: response.meta.totalPages ?? 0,
      hasNextPage: response.meta.hasNextPage ?? false,
    };
  }
  // Fallback to flat fields (backward compatibility)
  return {
    total: response?.total ?? response?.count ?? 0,
    page: response?.page ?? 1,
    limit: response?.limit ?? 20,
    totalPages: response?.totalPages ?? 0,
    hasNextPage: response?.hasNextPage ?? false,
  };
}
