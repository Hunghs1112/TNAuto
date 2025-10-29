// src/services/authApi.ts - Authentication API for unified login flow
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants/config';

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
  user_type: 'customer' | 'employee' | 'not_found';
  message: string;
  data?: CheckPhoneData;
  error?: string;
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  endpoints: (builder) => ({
    checkPhone: builder.mutation<CheckPhoneResponse, { phone: string }>({
      query: (body) => ({ 
        url: '/auth/check-phone', 
        method: 'POST', 
        body 
      }),
      transformResponse: (response: CheckPhoneResponse) => {
        console.log('checkPhone response:', response);
        return response;
      },
    }),
  }),
});

export const { useCheckPhoneMutation } = authApi;

// Re-export types for convenience
export type { CheckPhoneResponse, CheckPhoneData };

