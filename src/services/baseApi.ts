// src/services/baseApi.ts - Base API configuration with optimized caching
import { createApi, fetchBaseQuery, retry } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants/config';

/**
 * Base query with retry logic for failed requests
 */
const baseQueryWithRetry = retry(
  fetchBaseQuery({ 
    baseUrl: API_BASE_URL,
    timeout: 15000, // 15 seconds timeout
  }),
  {
    maxRetries: 2, // Retry failed requests up to 2 times
  }
);

/**
 * Global API configuration applied to all API slices
 * 
 * Performance optimizations:
 * - keepUnusedDataFor: Cache data for 5 minutes (300 seconds)
 * - refetchOnMountOrArgChange: Only refetch if data is older than 30 seconds
 * - refetchOnFocus: Disabled to prevent unnecessary refetches
 * - refetchOnReconnect: Enabled to sync after network reconnection
 */
export const API_CONFIG = {
  // Cache unused data for 5 minutes before garbage collection
  keepUnusedDataFor: 300, // 5 minutes
  
  // Only refetch on mount if data is older than 30 seconds
  refetchOnMountOrArgChange: 30, // 30 seconds
  
  // Disable refetch on window focus (manual refresh via pull-to-refresh instead)
  refetchOnFocus: false,
  
  // Enable refetch on network reconnection
  refetchOnReconnect: true,
};

/**
 * Empty base API - will be injected into by other API slices
 * This allows code splitting and prevents circular dependencies
 */
export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: baseQueryWithRetry,
  tagTypes: [
    'Customer',
    'Employee', 
    'Service',
    'ServiceOrder',
    'Product',
    'Category',
    'Offer',
    'Warranty',
    'Notification',
    'Image'
  ],
  endpoints: () => ({}),
});

export default baseApi;

