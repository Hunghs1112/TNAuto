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
  summary?: ManagerSummaryStats;
  statistics?: ManagerSummaryStats;
  [key: string]: unknown;
};

const STAT_KEYS: (keyof ManagerSummaryStats)[] = [
  'pending_orders',
  'processing_orders',
  'completed_today',
  'overdue_orders',
  'alerts',
];

const pickStats = (source: Record<string, unknown> | undefined): ManagerSummaryStats | undefined => {
  if (!source) {
    return undefined;
  }

  const stats: ManagerSummaryStats = {};
  let hasValue = false;

  STAT_KEYS.forEach((key) => {
    const value = source[key];
    if (value !== undefined) {
      stats[key] = value as number | string | null | undefined;
      hasValue = true;
    }
  });

  return hasValue ? stats : undefined;
};

const normalizeManagerHomeSummary = (payload: unknown): ManagerHomeSummary | null => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const body = payload as Record<string, unknown>;
  const nestedSources = [body.stats, body.summary, body.statistics, body.data]
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object');

  for (const source of nestedSources) {
    const stats = pickStats(source);
    if (stats) {
      return {
        ...body,
        stats,
      };
    }
  }

  const directStats = pickStats(body);
  if (directStats) {
    return {
      ...body,
      stats: directStats,
    };
  }

  return body as ManagerHomeSummary;
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

        const normalized = normalizeManagerHomeSummary(response.data);

        if (!normalized) {
          return null;
        }

        return normalized;
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
