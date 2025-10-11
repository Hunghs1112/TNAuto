// src/services/notificationApi.ts (Updated: Use params object for getNotifications to let RTK serialize query string)
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ENDPOINTS, buildEndpointUrl } from '../constants/apiEndpoints';
import { API_BASE_URL } from '../constants/config';

interface BackendNotification {
  id: string;
  recipient_id: string;
  recipient_type: string;
  message: string;
  is_read: boolean;
  image_url?: string;
  created_at?: string;
}

interface Notification {
  id: string;
  recipient_id: string;
  recipient_type: string;
  message: string;
  read: boolean;
  image_url?: string;
  created_at?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
}

export const notificationApi = createApi({
  reducerPath: 'notificationApi' as const,
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: ['Notification'] as const,
  endpoints: (builder) => ({
    getNotifications: builder.query<Notification[], { recipient_id: string; recipient_type: string }>({
      query: (params) => ({ 
        url: ENDPOINTS.getNotifications.path, 
        params // RTK will serialize to ?recipient_id=...&recipient_type=...
      }),
      providesTags: ['Notification'],
      transformResponse: (response: ApiResponse<BackendNotification[]>) => {
        console.log('notificationApi: getNotifications response:', response); // Debug
        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to fetch notifications');
        }
        return response.data.map((item: BackendNotification) => ({
          ...item,
          read: item.is_read, // Map backend 'is_read' to frontend 'read'
          image_url: item.image_url, // Map image_url
        }));
      },
    }),
    createNotification: builder.mutation<void, { recipient_id: string; recipient_type: string; message: string; image_url?: string }>({
      query: (body) => ({ 
        url: ENDPOINTS.createNotification.path, 
        method: 'POST', 
        body 
      }),
      invalidatesTags: ['Notification'],
      transformResponse: (response: ApiResponse<{ notification_id: string }>) => {
        console.log('notificationApi: createNotification response:', response); // Debug
        if (!response.success) {
          throw new Error(response.error || 'Failed to create notification');
        }
      },
    }),
    markNotificationRead: builder.mutation<void, string>({
      query: (id) => ({ 
        url: buildEndpointUrl('markNotificationRead', { id }), 
        method: 'PATCH' 
      }),
      invalidatesTags: ['Notification'],
      transformResponse: (response: ApiResponse<{ message: string }>) => {
        console.log('notificationApi: markNotificationRead response:', response); // Debug
        if (!response.success) {
          throw new Error(response.error || 'Failed to mark as read');
        }
      },
    }),
    registerFcmToken: builder.mutation<void, { user_id: string; user_type: string; token: string; device_info?: string }>({
      query: (body) => ({ 
        url: ENDPOINTS.registerFcmToken.path, 
        method: 'POST', 
        body 
      }),
      transformResponse: (response: ApiResponse<{ message: string; token_id?: number; is_new?: boolean }>) => {
        console.log('notificationApi: registerFcmToken response:', response); // Debug
        if (!response.success) {
          throw new Error(response.error || 'Failed to register FCM token');
        }
      },
    }),
    getUserFcmTokens: builder.query<any[], { user_id: string; user_type: string }>({
      query: (params) => ({ 
        url: ENDPOINTS.getUserFcmTokens.path, 
        params 
      }),
      transformResponse: (response: ApiResponse<{ tokens: any[]; count: number }>) => {
        console.log('notificationApi: getUserFcmTokens response:', response); // Debug
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
        body 
      }),
      transformResponse: (response: ApiResponse<{ message: string }>) => {
        console.log('notificationApi: deleteFcmToken response:', response); // Debug
        if (!response.success) {
          throw new Error(response.error || 'Failed to delete FCM token');
        }
      },
    }),
    getActiveFcmTokens: builder.query<any[], void>({
      query: () => ({ 
        url: ENDPOINTS.getActiveFcmTokens.path 
      }),
      transformResponse: (response: ApiResponse<{ tokens: any[]; count: number }>) => {
        console.log('notificationApi: getActiveFcmTokens response:', response); // Debug
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
  useCreateNotificationMutation,
  useMarkNotificationReadMutation,
  useRegisterFcmTokenMutation,
  useGetUserFcmTokensQuery,
  useDeleteFcmTokenMutation,
  useGetActiveFcmTokensQuery,
} = notificationApi;