// src/services/authApi.ts - Authentication API for unified login flow
import { createApi } from '@reduxjs/toolkit/query/react';
import { API_CONFIG, baseQueryWithRetry } from './baseApi';

interface CheckPhoneData {
  id: number;
  name: string;
  phone: string;
  email?: string;
  license_plate?: string;
  avatar_url?: string;
  position?: string;
}

interface CheckPhoneResponse {
  success: boolean;
  user_type: 'customer' | 'employee' | 'dealer' | 'not_found';
  message: string;
  data?: CheckPhoneData;
  error?: string;
}

export const authApi = createApi({
  ...API_CONFIG,
  reducerPath: 'authApi',
  baseQuery: baseQueryWithRetry,
  endpoints: (builder) => ({
    checkPhone: builder.mutation<CheckPhoneResponse, { phone: string }>({
      query: (body) => ({ 
        url: '/auth/check-phone', 
        method: 'POST', 
        body 
      }),
      transformResponse: (response: CheckPhoneResponse) => {
        return response;
      },
    }),
    dealerLogin: builder.mutation<any, { phone: string; password: string }>({
      query: (body) => ({
        url: '/auth/dealer/login',
        method: 'POST',
        body,
      }),
    }),
    dealerRegister: builder.mutation<any, { name: string; phone: string; password: string; email?: string; address?: string; avatar_url?: string }>({
      query: (body) => ({
        url: '/auth/dealer/register',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useCheckPhoneMutation, useDealerLoginMutation, useDealerRegisterMutation } = authApi;

// Re-export types for convenience
export type { CheckPhoneResponse, CheckPhoneData };

