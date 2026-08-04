import { createApi } from '@reduxjs/toolkit/query/react';
import { ENDPOINTS, buildEndpointUrl } from '../constants/apiEndpoints';
import { API_CONFIG, baseQueryWithRetry } from './baseApi';

interface BackendNotification {
  id: string;
  recipient_id: string;
  recipient_type: 'customer' | 'employee' | string;
  type?: string;
  title?: string | null;
  body?: string | null;
  message?: string;
  image_url?: string | null;
  is_read: 0 | 1 | boolean;
  status?: string;
  scheduled_at?: string | null;
  sent_at?: string | null;
  canceled_at?: string | null;
  ref_type?: string | null;
  ref_id?: string | null;
  priority?: number;
  metadata?: Record<string, any> | null;
  created_at?: string;
  /**
   * Deep-link target screen (spec §3, §6). Trả về từ backend sau khi extend
   * `notifications` table. Có thể là string thuần (DB column VARCHAR) hoặc đã
   * được backend wrap trong object.
   */
  target_screen?: string | null;
  /**
   * Deep-link params (spec §3, §6). Backend lưu ở JSON column nên giá trị có
   * thể trả về dưới dạng object (khi DB driver parse tự động) HOẶC string
   * (JSON-encoded). Helper `normalizeTargetParams` xử lý cả 2 trường hợp.
   */
  target_params?: Record<string, any> | string | null;
}

interface Notification {
  id: string;
  recipient_id: string;
  recipient_type: 'customer' | 'employee' | string;
  type?: string;
  title?: string | null;
  body?: string | null;
  message?: string;
  image_url?: string | null;
  is_read: 0 | 1;
  read: boolean;
  status?: string;
  ref_type?: string | null;
  ref_id?: string | null;
  created_at?: string;
  sent_at?: string | null;
  order_id?: string;
  source?: string;
  claimable?: boolean;
  metadata?: Record<string, any>;
  target_screen?: string | null;
  target_params?: Record<string, any> | null;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
  message?: string;
  unread_count?: number;
}

interface NotificationScopeParams {
  user_type?: 'customer' | 'employee' | 'dealer' | string;
}

interface GetNotificationsParams extends NotificationScopeParams {
  customer_id?: string;
  is_read?: number;
  limit?: number;
  offset?: number;
}

interface UnreadCountParams extends NotificationScopeParams {
  customer_id?: string;
}

interface MarkAllReadParams extends NotificationScopeParams {
  customer_id?: string;
}

const compactParams = (params?: Record<string, any>) => {
  if (!params) {
    return undefined;
  }

  const entries = Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '');

  if (entries.length === 0) {
    return undefined;
  }

  return Object.fromEntries(entries);
};

const resolveNotificationEndpoints = (scope?: string) => {
  if (scope === 'employee') {
    return {
      list: ENDPOINTS.getEmployeeNotifications.path,
      unreadCount: ENDPOINTS.getEmployeeUnreadCount.path,
      markReadKey: 'markEmployeeNotificationRead' as const,
      markAllRead: ENDPOINTS.markAllEmployeeNotificationsRead.path,
      deleteKey: 'deleteEmployeeNotification' as const,
    };
  }

  if (scope === 'dealer') {
    return {
      list: ENDPOINTS.getDealerNotifications.path,
      unreadCount: ENDPOINTS.getDealerUnreadCount.path,
      markReadKey: 'markDealerNotificationRead' as const,
      markAllRead: ENDPOINTS.markAllDealerNotificationsRead.path,
      deleteKey: 'deleteDealerNotification' as const,
    };
  }

  return {
    list: ENDPOINTS.getCustomerNotifications.path,
    unreadCount: ENDPOINTS.getCustomerUnreadCount.path,
    markReadKey: 'markCustomerNotificationRead' as const,
    markAllRead: ENDPOINTS.markAllCustomerNotificationsRead.path,
    deleteKey: 'deleteCustomerNotification' as const,
  };
};

const getMetadata = (item: BackendNotification) =>
  item.metadata && typeof item.metadata === 'object' ? item.metadata : {};

const normalizeBoolean = (value: unknown) => {
  if (value === true || value === 1 || value === '1' || value === 'true') {
    return true;
  }

  if (value === false || value === 0 || value === '0' || value === 'false') {
    return false;
  }

  return undefined;
};

const extractOrderId = (item: BackendNotification, metadata: Record<string, any>) => {
  const fallbackRefId =
    item.ref_type === 'order' || item.type?.includes('order')
      ? item.ref_id
      : undefined;
  const rawOrderId = metadata.order_id ?? fallbackRefId;

  if (rawOrderId === undefined || rawOrderId === null || rawOrderId === '') {
    return undefined;
  }

  return String(rawOrderId);
};

/**
 * `target_params` có thể trả về dưới nhiều dạng tuỳ backend / DB driver:
 *  - `Record<string, any>` khi JSON column đã được parse tự động
 *  - `string` chứa JSON-encoded object (khi driver trả text thuần)
 *  - `null` / `undefined` khi notification cũ (legacy)
 *
 * Hàm này chuẩn hoá về `Record<string, any> | null` để `tryNavigateToTargetScreen`
 * (ở NotificationService) và `handlePress` (ở NotificationScreen) có thể đọc
 * thống nhất. Trả về `null` khi payload không hợp lệ để caller fallback an toàn.
 */
const normalizeTargetParams = (
  raw: Record<string, any> | string | null | undefined,
): Record<string, any> | null => {
  if (raw === null || raw === undefined) {
    return null;
  }
  if (typeof raw === 'object' && !Array.isArray(raw)) {
    return raw;
  }
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) {
      return null;
    }
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, any>;
      }
    } catch {
      return null;
    }
  }
  return null;
};

export const notificationApi = createApi({
  ...API_CONFIG,
  reducerPath: 'notificationApi' as const,
  baseQuery: baseQueryWithRetry,
  tagTypes: ['Notification'] as const,
  endpoints: (builder) => ({
    getNotifications: builder.query<Notification[], GetNotificationsParams | void>({
      query: (params) => {
        const scope = params?.user_type;
        const endpoints = resolveNotificationEndpoints(scope);
        const { user_type, ...rest } = (params || {}) as GetNotificationsParams;

        return {
          url: endpoints.list,
          params: compactParams(rest as Record<string, any>),
        };
      },
      providesTags: ['Notification'],
      transformResponse: (response: ApiResponse<BackendNotification[]>) => {
        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to fetch notifications');
        }

        return response.data.map((item: BackendNotification) => {
          const metadata = getMetadata(item);
          const isRead = item.is_read === true || item.is_read === 1;
          const normalizedClaimable = normalizeBoolean(metadata.claimable);

          return {
            ...item,
            type: item.type || metadata.type,
            title: item.title ?? metadata.title ?? null,
            body: item.body ?? metadata.body ?? null,
            is_read: isRead ? 1 : 0,
            read: isRead,
            image_url: item.image_url ?? null,
            status: item.status ?? metadata.status,
            order_id: extractOrderId(item, metadata),
            source: metadata.source,
            claimable: normalizedClaimable,
            metadata,
            // Deep-link (spec §3, §6, §7). Map từ backend columns vào Notification
            // để tryNavigateToTargetScreen có thể đọc khi user tap notif trong list.
            target_screen: item.target_screen ?? null,
            target_params: normalizeTargetParams(item.target_params),
          };
        });
      },
    }),
    getUnreadCount: builder.query<number, UnreadCountParams | void>({
      query: (params) => {
        const scope = params?.user_type;
        const endpoints = resolveNotificationEndpoints(scope);
        const { user_type, ...rest } = (params || {}) as UnreadCountParams;

        return {
          url: endpoints.unreadCount,
          params: compactParams(rest as Record<string, any>),
        };
      },
      providesTags: ['Notification'],
      transformResponse: (response: ApiResponse<{ unread_count: number }>) => {
        if (!response.success) {
          throw new Error(response.error || 'Failed to get unread count');
        }

        if (typeof response.data?.unread_count === 'number') {
          return response.data.unread_count;
        }

        if (typeof response.unread_count === 'number') {
          return response.unread_count;
        }

        return 0;
      },
    }),
    createNotification: builder.mutation<void, { recipient_id: string; recipient_type: string; message: string; image_url?: string }>({
      query: (body) => ({
        url: ENDPOINTS.createNotification.path,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Notification'],
      transformResponse: (response: ApiResponse<{ notification_id: string }>) => {
        if (!response.success) {
          throw new Error(response.error || 'Failed to create notification');
        }
      },
    }),
    markNotificationRead: builder.mutation<void, { id: string; user_type?: 'customer' | 'employee' | 'dealer' | string }>({
      query: ({ id, user_type }) => {
        const endpoints = resolveNotificationEndpoints(user_type);

        return {
          url: buildEndpointUrl(endpoints.markReadKey, { id }),
          method: 'PUT',
        };
      },
      invalidatesTags: ['Notification'],
      transformResponse: (response: ApiResponse<{ message: string }>) => {
        if (!response.success) {
          throw new Error(response.error || 'Failed to mark as read');
        }
      },
    }),
    markAllNotificationsRead: builder.mutation<void, MarkAllReadParams | void>({
      query: (body) => {
        const scope = body?.user_type;
        const endpoints = resolveNotificationEndpoints(scope);
        const { user_type, ...rest } = (body || {}) as MarkAllReadParams;

        return {
          url: endpoints.markAllRead,
          method: 'PUT',
          body: compactParams(rest as Record<string, any>),
        };
      },
      invalidatesTags: ['Notification'],
      transformResponse: (response: ApiResponse<{ message: string; updated_count: number }>) => {
        if (!response.success) {
          throw new Error(response.error || 'Failed to mark all as read');
        }
      },
    }),
    deleteNotification: builder.mutation<void, { id: string; user_type?: 'customer' | 'employee' | 'dealer' | string }>({
      query: ({ id, user_type }) => {
        const endpoints = resolveNotificationEndpoints(user_type);

        return {
          url: buildEndpointUrl(endpoints.deleteKey, { id }),
          method: 'DELETE',
        };
      },
      invalidatesTags: ['Notification'],
      transformResponse: (response: ApiResponse<{ message: string }>) => {
        if (!response.success) {
          throw new Error(response.error || 'Failed to delete notification');
        }
      },
    }),
    registerFcmToken: builder.mutation<void, { user_id: string; user_type: string; token: string; device_info?: string }>({
      query: (body) => ({
        url: ENDPOINTS.registerFcmToken.path,
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<{ message: string; token_id?: number; is_new?: boolean }>) => {
        if (!response.success) {
          throw new Error(response.error || 'Failed to register FCM token');
        }
      },
    }),
    refreshFcmToken: builder.mutation<void, { token: string }>({
      query: (body) => ({
        url: ENDPOINTS.refreshFcmToken.path,
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<{ message: string }>) => {
        if (!response.success) {
          throw new Error(response.error || 'Failed to refresh FCM token');
        }
      },
    }),
    getUserFcmTokens: builder.query<any[], { user_id: string; user_type: string }>({
      query: (params) => ({
        url: ENDPOINTS.getUserFcmTokens.path,
        params,
      }),
      transformResponse: (response: ApiResponse<{ tokens: any[]; count: number }>) => {
        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to get FCM tokens');
        }

        return response.data.tokens;
      },
    }),
    deleteFcmToken: builder.mutation<void, { token: string }>({
      query: (body) => ({
        url: ENDPOINTS.deleteFcmToken.path,
        method: 'DELETE',
        body,
      }),
      transformResponse: (response: ApiResponse<{ message: string }>) => {
        if (!response.success) {
          throw new Error(response.error || 'Failed to delete FCM token');
        }
      },
    }),
    getActiveFcmTokens: builder.query<any[], void>({
      query: () => ({
        url: ENDPOINTS.getActiveFcmTokens.path,
      }),
      transformResponse: (response: ApiResponse<{ tokens: any[]; count: number }>) => {
        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to get active FCM tokens');
        }

        return response.data.tokens;
      },
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useCreateNotificationMutation,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationMutation,
  useRegisterFcmTokenMutation,
  useRefreshFcmTokenMutation,
  useGetUserFcmTokensQuery,
  useDeleteFcmTokenMutation,
  useGetActiveFcmTokensQuery,
} = notificationApi;
