// src/services/baseApi.ts - Base API configuration with optimized caching
import { createApi, fetchBaseQuery, retry } from '@reduxjs/toolkit/query/react';
import limitedFetch from '../utils/limitedFetch';
import { API_BASE_URL } from '../constants/config';

/**
 * Base query with retry logic for failed requests
 */
export const baseQueryWithRetry = retry(
  fetchBaseQuery({ 
    fetchFn: limitedFetch,

    baseUrl: API_BASE_URL,
    timeout: 15000, // 15 seconds timeout
    prepareHeaders: (headers) => {
      // Set default headers for all requests
      headers.set('Content-Type', 'application/json');
      headers.set('Accept', 'application/json');
      
      // You can add authentication token here if needed
      // const token = getState()?.auth?.token;
      // if (token) {
      //   headers.set('Authorization', `Bearer ${token}`);
      // }
      
      return headers;
    },
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
  // Cache unused data for 5 seconds before garbage collection
  keepUnusedDataFor: 5,

  // Refetch when mounting if cached data is older than 5 seconds.
  refetchOnMountOrArgChange: 5,

  // Refetch when app regains focus (e.g., user backgrounded the app).
  // This addresses the "close app then reopen to see new data" issue.
  refetchOnFocus: true,

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
    'Image',
    'ProductImage'
  ],
  endpoints: () => ({}),
});

export default baseApi;

