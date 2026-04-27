// src/services/authApi.ts - Authentication API for unified login flow
import { createApi } from '@reduxjs/toolkit/query/react';
import { API_CONFIG, baseQueryWithRetry } from './baseApi';
import { ENDPOINTS } from '../constants/apiEndpoints';


export interface GarageSummary {
  id: number | string;
  code: string;
  name: string;
  is_super_garage?: boolean;
  address?: string | null;
  avatar_url?: string | null;
  banner_url?: string | null;
  status?: string | null;
  description?: string | null;
  phone?: string | null;
  city?: string | null;
  district?: string | null;
}

export interface ResolveGarageResponse {
  success: boolean;
  data?: GarageSummary;
  error?: string;
  message?: string;
}

interface ListGaragesResponse {
  success: boolean;
  data?: GarageSummary[];
  error?: string;
  message?: string;
}

interface AddCustomerGarageRequest {
  customer_id: number;
  garage_code: string;
  source?: 'manual' | 'saved_list' | 'tab' | 'qr';
}

interface AddCustomerGarageResponse {
  success: boolean;
  data?: GarageSummary;
  garage?: GarageSummary;
  error?: string;
  message?: string;
}

export type CheckPhoneRole = 'garage_manager' | 'garage_admin' | 'dealer' | 'customer' | 'employee';

type CheckPhoneAccount = {
  id: number | string;
  name?: string;
  garage_id?: number | string;
  garage_code?: string;
};

export interface CheckPhoneResponse {
  success: boolean;
  phone: string;
  roles: CheckPhoneRole[];
  accounts?: Partial<Record<CheckPhoneRole, CheckPhoneAccount>>;
  error?: string;
  message?: string;
}

export const authApi = createApi({
  ...API_CONFIG,
  reducerPath: 'authApi',
  baseQuery: baseQueryWithRetry,
  endpoints: (builder) => ({
    resolveGarageByCode: builder.query<GarageSummary, string>({
      query: (code) => ({
        url: `/api/public/garages/by-code/${encodeURIComponent(code)}`,
      }),
      transformResponse: (response: ResolveGarageResponse) => {
        if (!response.success || !response.data) {
          throw new Error(response.error || response.message || 'Failed to resolve garage');
        }

        return response.data;
      },
    }),
    getPublicGarages: builder.query<GarageSummary[], void>({
      query: () => ({
        url: '/api/public/garages',
      }),
      transformResponse: (response: ListGaragesResponse | GarageSummary[]) => {
        if (Array.isArray(response)) {
          return response;
        }

        if (!response.success || !response.data) {
          throw new Error(response.error || response.message || 'Failed to fetch public garages');
        }

        return response.data;
      },
    }),
    addCustomerGarage: builder.mutation<GarageSummary, AddCustomerGarageRequest>({
      query: (body) => ({
        url: ENDPOINTS.addCustomerGarage.path,
        method: 'POST',
        body,
      }),
      transformResponse: (response: AddCustomerGarageResponse) => {
        const garage = response.data || response.garage;

        if (!response.success || !garage) {
          throw new Error(response.error || response.message || 'Failed to add customer garage');
        }

        return garage;
      },
    }),
    checkPhone: builder.mutation<CheckPhoneResponse, { phone: string }>({
      query: (body) => ({
        url: ENDPOINTS.checkPhone.path,
        method: 'POST',
        body,
      }),
    }),
    dealerLogin: builder.mutation<any, { garage_code: string; phone: string; password: string }>({
      query: (body) => ({
        url: '/api/app/dealer/auth/login',
        method: 'POST',
        body,
      }),
    }),
    managerLogin: builder.mutation<any, { login: string; password: string }>({
      query: (body) => ({
        url: ENDPOINTS.managerLogin.path,
        method: 'POST',
        body,
      }),
    }),
    dealerRegister: builder.mutation<any, { garage_code: string; name: string; phone: string; password: string; email?: string; address?: string; avatar_url?: string }>({
      query: (body) => ({
        url: '/api/app/dealer/auth/register',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useAddCustomerGarageMutation,
  useCheckPhoneMutation,
  useDealerLoginMutation,
  useManagerLoginMutation,
  useDealerRegisterMutation,
  useGetPublicGaragesQuery,
  useLazyResolveGarageByCodeQuery,
  useResolveGarageByCodeQuery,
} = authApi;
