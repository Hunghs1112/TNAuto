// src/services/baseApi.ts - Base API configuration with optimized caching
import { createApi, fetchBaseQuery, retry } from '@reduxjs/toolkit/query/react';
import limitedFetch from '../utils/limitedFetch';
import { API_BASE_URL } from '../constants/config';

/**
 * Base query with retry logic for failed requests
 */
export const baseQueryWithRetry = retry(
  async (args, api, extraOptions) => {
    const result = await fetchBaseQuery({ 
      fetchFn: limitedFetch,

      baseUrl: API_BASE_URL,
      timeout: 15000, // 15 seconds timeout
      prepareHeaders: (headers, { getState, endpoint }) => {
        // Set default headers for all requests
        headers.set('Content-Type', 'application/json');
        headers.set('Accept', 'application/json');

        const state = getState() as any;
        const token = state?.auth?.token;
        const customerId = state?.auth?.userId;
        const userType = state?.auth?.userType;

        const nonAuthEndpoints = new Set([
          'addCustomerGarage',
          'getPublicGarages',
          'resolveGarageByCode',
          'registerCustomer',
          'loginCustomer',
          'checkPhone',
          'loginEmployee',
          'dealerLogin',
          'managerLogin',
          'dealerRegister',
        ]);

        if (token && !nonAuthEndpoints.has(endpoint)) {
          headers.set('Authorization', `Bearer ${token}`);
        } else {
          headers.delete('Authorization');
        }

        // New contract: customer aggregate routes use customer context, not garage headers.
        if (userType === 'customer' && customerId) {
          headers.set('x-customer-id', String(customerId));
        } else {
          headers.delete('x-customer-id');
        }

        headers.delete('x-garage-code');

        return headers;
      },
    })(args, api, extraOptions);
    
    // Don't retry on 401 (auth errors)
    if (result.error?.status === 401) {
      retry.fail(result.error);
    }
    
    return result;
  },
  {
    maxRetries: 3, // Retry failed requests up to 3 times (1s, 2s, 4s)
    backoff: (attempt) => {
      // Exponential backoff: 1s, 2s, 4s
      return Math.min(1000 * Math.pow(2, attempt), 10000);
    },
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
