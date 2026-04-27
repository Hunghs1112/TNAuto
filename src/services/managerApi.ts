import { createApi } from '@reduxjs/toolkit/query/react';
import { ENDPOINTS } from '../constants/apiEndpoints';
import { API_CONFIG, baseQueryWithRetry } from './baseApi';
import { ServiceOrder } from '../types/api.types';

type ManagerSummaryStats = {
  pending_orders?: number;
  processing_orders?: number;
  completed_today?: number;
  overdue_orders?: number;
  alerts?: number;
  [key: string]: number | string | null | undefined;
};

type ManagerHomeSummary = {
  stats?: ManagerSummaryStats;
  [key: string]: unknown;
};

type ManagerNotification = {
  id: string | number;
  title?: string | null;
  body?: string | null;
  is_read?: boolean | number;
  created_at?: string;
  [key: string]: unknown;
};

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

const extractArray = <T>(payload: unknown, key?: string): T[] => {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (payload && typeof payload === 'object') {
    const body = payload as Record<string, unknown>;

    if (key && Array.isArray(body[key])) {
      return body[key] as T[];
    }

    if (Array.isArray(body.data)) {
      return body.data as T[];
    }

    if (Array.isArray(body.items)) {
      return body.items as T[];
    }
  }

  return [];
};

export const managerApi = createApi({
  ...API_CONFIG,
  reducerPath: 'managerApi' as const,
  baseQuery: baseQueryWithRetry,
  tagTypes: ['ManagerHome'] as const,
  endpoints: (builder) => ({
    getManagerHomeSummary: builder.query<ManagerHomeSummary | null, void>({
      query: () => ({
        url: ENDPOINTS.getManagerHomeSummary.path,
      }),
      providesTags: ['ManagerHome'],
      transformResponse: (response: ApiResponse<ManagerHomeSummary>) => {
        if (!response?.success) {
          throw new Error(response?.error || 'Failed to fetch manager home summary');
        }

        return response.data || null;
      },
    }),
    getManagerHomeOrders: builder.query<ServiceOrder[], void>({
      query: () => ({
        url: ENDPOINTS.getManagerHomeOrders.path,
      }),
      providesTags: ['ManagerHome'],
      transformResponse: (response: ApiResponse<unknown>) => {
        if (!response?.success) {
          throw new Error(response?.error || 'Failed to fetch manager home orders');
        }

        return extractArray<ServiceOrder>(response.data, 'orders');
      },
    }),
    getManagerHomeNotifications: builder.query<ManagerNotification[], void>({
      query: () => ({
        url: ENDPOINTS.getManagerHomeNotifications.path,
      }),
      providesTags: ['ManagerHome'],
      transformResponse: (response: ApiResponse<unknown>) => {
        if (!response?.success) {
          throw new Error(response?.error || 'Failed to fetch manager notifications');
        }

        return extractArray<ManagerNotification>(response.data, 'notifications');
      },
    }),
  }),
});

export const {
  useGetManagerHomeSummaryQuery,
  useGetManagerHomeOrdersQuery,
  useGetManagerHomeNotificationsQuery,
} = managerApi;

export type { ManagerHomeSummary, ManagerNotification, ManagerSummaryStats };
