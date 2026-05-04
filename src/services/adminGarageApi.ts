import { createApi } from '@reduxjs/toolkit/query/react';

import { API_CONFIG, baseQueryWithRetry } from './baseApi';
import { Customer, Employee, Vehicle } from '../types/api.types';

type Primitive = string | number | boolean | null | undefined;
type UnknownRecord = Record<string, unknown>;

export type AdminStatResource =
  | 'customers'
  | 'employees'
  | 'service-orders'
  | 'services'
  | 'service-categories'
  | 'products'
  | 'categories'
  | 'offers'
  | 'warranties'
  | 'vehicles'
  | 'notifications';

export type AdminListResource =
  | AdminStatResource
  | 'dealers'
  | 'dealer-categories'
  | 'dealer-products'
  | 'garages';

export type AdminWritableResource = AdminListResource;

export type AdminStats = Record<string, Primitive>;
export type AdminEntity = Record<string, unknown>;

export interface AdminCustomer extends Customer {
  active_order_count?: number;
  total_orders?: number;
  vehicle_count?: number;
  last_service_at?: string | null;
  status?: string | null;
}

export interface AdminEmployee extends Employee {
  position?: string | null;
  status?: string | null;
  active_order_count?: number;
  total_orders?: number;
  garage_id?: number | string | null;
  garage_name?: string | null;
}

export interface AdminNotificationLog extends AdminEntity {
  id: string | number;
  title?: string | null;
  body?: string | null;
  message?: string | null;
  type?: string | null;
  status?: string | null;
  image_url?: string | null;
  ref_id?: string | number | null;
  ref_type?: string | null;
  order_id?: string | number | null;
  created_at?: string;
  sent_at?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface AdminUiVisibilitySetting extends AdminEntity {
  id?: string | number;
  key?: string;
  label?: string;
  section?: string;
  is_hidden?: number | boolean;
  updated_at?: string;
}

export interface AdminServiceReminderConfig extends AdminEntity {
  service_id: string | number;
  service_name?: string;
  enabled?: number | boolean;
  is_enabled?: number | boolean;
  reminder_days?: number;
  interval_days?: number;
  updated_at?: string;
}

export interface AdminMutationResponse extends AdminEntity {
  success: boolean;
  error?: string;
  message?: string;
}

interface ResourceListArgs {
  resource: AdminListResource;
  params?: Record<string, unknown>;
}

interface ResourceDetailArgs {
  resource: AdminListResource;
  id: string | number;
  params?: Record<string, unknown>;
}

interface ResourceMutationArgs {
  resource: AdminWritableResource;
  body: Record<string, unknown> | FormData;
}

interface ResourceUpdateArgs extends ResourceMutationArgs {
  id: string | number;
  method?: 'PUT' | 'PATCH';
}

interface ResourceDeleteArgs {
  resource: AdminWritableResource;
  id: string | number;
}

interface ResourceImageListArgs {
  resource: 'dealer-products' | 'service-orders' | 'products' | 'offers';
  parentId: string | number;
}

interface ResourceImageMutationArgs {
  resource: 'dealer-products' | 'service-orders' | 'products' | 'offers';
  body: Record<string, unknown>;
}

interface ResourceImageUpdateArgs extends ResourceImageMutationArgs {
  id: string | number;
}

interface UploadEntityAssetArgs {
  resource: 'customers' | 'employees' | 'services' | 'service-categories' | 'categories' | 'offers' | 'vehicles';
  id: string | number;
  action: 'upload-avatar' | 'upload-image';
  body: FormData;
}

const ADMIN_BASE_PATH = '/api/app/admin';

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const getErrorMessage = (response: unknown, fallback: string) => {
  if (!isRecord(response)) {
    return fallback;
  }

  const error = response.error;
  const message = response.message;

  if (typeof error === 'string' && error.trim()) {
    return error;
  }

  if (typeof message === 'string' && message.trim()) {
    return message;
  }

  return fallback;
};

const ensureSuccess = (response: unknown, fallback: string) => {
  if (isRecord(response) && response.success === false) {
    throw new Error(getErrorMessage(response, fallback));
  }

  return response;
};

const extractList = <T>(response: unknown, fallback: string): T[] => {
  ensureSuccess(response, fallback);

  if (Array.isArray(response)) {
    return response as T[];
  }

  if (!isRecord(response)) {
    return [];
  }

  const candidateArrays = [
    response.data,
    response.items,
    response.rows,
    response.logs,
    response.customers,
    response.orders,
    response.employees,
    response.vehicles,
    response.notifications,
    response.products,
    response.categories,
    response.services,
    response.offers,
    response.warranties,
    response.garages,
  ];

  for (const candidate of candidateArrays) {
    if (Array.isArray(candidate)) {
      return candidate as T[];
    }
  }

  if (isRecord(response.data)) {
    const nested = response.data;
    const nestedArrays = [
      nested.items,
      nested.rows,
      nested.logs,
      nested.customers,
      nested.orders,
      nested.employees,
      nested.vehicles,
      nested.notifications,
      nested.products,
      nested.categories,
      nested.services,
      nested.offers,
      nested.warranties,
      nested.garages,
    ];

    for (const candidate of nestedArrays) {
      if (Array.isArray(candidate)) {
        return candidate as T[];
      }
    }
  }

  return [];
};

const extractObject = <T>(response: unknown, fallback: string): T => {
  ensureSuccess(response, fallback);

  if (!isRecord(response)) {
    return response as T;
  }

  if (isRecord(response.data)) {
    return response.data as T;
  }

  const candidateObjects = [
    response.customer,
    response.employee,
    response.order,
    response.vehicle,
    response.notification,
    response.garage,
    response.config,
    response.settings,
    response.inspection,
    response.driver_license,
  ];

  for (const candidate of candidateObjects) {
    if (candidate !== undefined) {
      return candidate as T;
    }
  }

  return response as T;
};

const extractStats = (response: unknown, fallback: string): AdminStats => {
  ensureSuccess(response, fallback);

  if (!isRecord(response)) {
    return {};
  }

  if (isRecord(response.data)) {
    return response.data as AdminStats;
  }

  if (isRecord(response.stats)) {
    return response.stats as AdminStats;
  }

  const entries = Object.entries(response).filter(([key, value]) => {
    if (key === 'success' || key === 'error' || key === 'message' || key === 'data') {
      return false;
    }

    return (
      typeof value === 'number' ||
      typeof value === 'string' ||
      typeof value === 'boolean' ||
      value === null
    );
  });

  return Object.fromEntries(entries) as AdminStats;
};

const normalizeMutationResponse = (response: unknown, fallback: string): AdminMutationResponse => {
  ensureSuccess(response, fallback);

  if (isRecord(response)) {
    return {
      success: true,
      ...response,
    };
  }

  return { success: true };
};

const buildResourcePath = (resource: AdminListResource, id?: string | number) =>
  id === undefined
    ? `${ADMIN_BASE_PATH}/${resource}`
    : `${ADMIN_BASE_PATH}/${resource}/${encodeURIComponent(String(id))}`;

const buildResourceImagePath = (
  resource: ResourceImageListArgs['resource'],
  id?: string | number,
  parentId?: string | number,
) => {
  if (id !== undefined) {
    return `${ADMIN_BASE_PATH}/${resource}/images/${encodeURIComponent(String(id))}`;
  }

  if (parentId !== undefined) {
    return `${ADMIN_BASE_PATH}/${resource}/${encodeURIComponent(String(parentId))}/images`;
  }

  return `${ADMIN_BASE_PATH}/${resource}/images`;
};

export const adminGarageApi = createApi({
  ...API_CONFIG,
  reducerPath: 'adminGarageApi' as const,
  baseQuery: baseQueryWithRetry,
  tagTypes: [
    'AdminCustomers',
    'AdminEmployees',
    'AdminOrders',
    'AdminNotifications',
    'AdminSettings',
    'AdminDashboard',
  ] as const,
  endpoints: (builder) => ({
    getAdminStats: builder.query<AdminStats, { resource: AdminStatResource }>({
      query: ({ resource }) => `${ADMIN_BASE_PATH}/${resource}/stats`,
      providesTags: (result, error, { resource }) => [{ type: 'AdminDashboard' as const, id: resource }],
      transformResponse: (response: unknown) =>
        extractStats(response, 'Failed to fetch admin statistics'),
    }),
    getAdminResourceList: builder.query<AdminEntity[], ResourceListArgs>({
      query: ({ resource, params }) => ({
        url: buildResourcePath(resource),
        params,
      }),
      providesTags: (result, error, { resource }) => [{ type: 'AdminDashboard' as const, id: `${resource}:list` }],
      transformResponse: (response: unknown) =>
        extractList<AdminEntity>(response, 'Failed to fetch admin list'),
    }),
    getAdminResourceDetail: builder.query<AdminEntity, ResourceDetailArgs>({
      query: ({ resource, id, params }) => ({
        url: buildResourcePath(resource, id),
        params,
      }),
      providesTags: (result, error, { resource, id }) => [{ type: 'AdminDashboard' as const, id: `${resource}:${id}` }],
      transformResponse: (response: unknown) =>
        extractObject<AdminEntity>(response, 'Failed to fetch admin detail'),
    }),
    getAdminCustomerVehicles: builder.query<Vehicle[], string | number>({
      query: (id) => `${ADMIN_BASE_PATH}/customers/${encodeURIComponent(String(id))}/vehicles`,
      providesTags: (result, error, id) => [{ type: 'AdminCustomers' as const, id: `vehicles:${id}` }],
      transformResponse: (response: unknown) =>
        extractList<Vehicle>(response, 'Failed to fetch customer vehicles'),
    }),
    getAdminCustomerDriverLicense: builder.query<AdminEntity | null, string | number>({
      query: (id) => `${ADMIN_BASE_PATH}/customers/${encodeURIComponent(String(id))}/driver-license`,
      providesTags: (result, error, id) => [{ type: 'AdminCustomers' as const, id: `license:${id}` }],
      transformResponse: (response: unknown) => {
        try {
          return extractObject<AdminEntity>(response, 'Failed to fetch driver license');
        } catch {
          return null;
        }
      },
    }),
    getAdminResourceImages: builder.query<AdminEntity[], ResourceImageListArgs>({
      query: ({ resource, parentId }) => buildResourceImagePath(resource, undefined, parentId),
      providesTags: (result, error, { resource, parentId }) => [{ type: 'AdminDashboard' as const, id: `${resource}:images:${parentId}` }],
      transformResponse: (response: unknown) =>
        extractList<AdminEntity>(response, 'Failed to fetch images'),
    }),
    getAdminNotificationLogs: builder.query<AdminNotificationLog[], void>({
      query: () => `${ADMIN_BASE_PATH}/notifications/logs`,
      providesTags: ['AdminNotifications'],
      transformResponse: (response: unknown) =>
        extractList<AdminNotificationLog>(response, 'Failed to fetch notification logs'),
    }),
    getAdminServiceReminderConfigs: builder.query<AdminServiceReminderConfig[], void>({
      query: () => `${ADMIN_BASE_PATH}/settings/service-reminder-configs`,
      providesTags: ['AdminSettings'],
      transformResponse: (response: unknown) =>
        extractList<AdminServiceReminderConfig>(response, 'Failed to fetch reminder configs'),
    }),
    getAdminUiVisibility: builder.query<AdminUiVisibilitySetting[], void>({
      query: () => `${ADMIN_BASE_PATH}/settings/ui-visibility`,
      providesTags: ['AdminSettings'],
      transformResponse: (response: unknown) =>
        extractList<AdminUiVisibilitySetting>(response, 'Failed to fetch UI visibility'),
    }),
    getAdminVehicleInspection: builder.query<AdminEntity | null, string | number>({
      query: (vehicleId) => `${ADMIN_BASE_PATH}/vehicles/${encodeURIComponent(String(vehicleId))}/inspection`,
      providesTags: (result, error, vehicleId) => [{ type: 'AdminDashboard' as const, id: `inspection:${vehicleId}` }],
      transformResponse: (response: unknown) => {
        try {
          return extractObject<AdminEntity>(response, 'Failed to fetch inspection');
        } catch {
          return null;
        }
      },
    }),
    createAdminResource: builder.mutation<AdminMutationResponse, ResourceMutationArgs>({
      query: ({ resource, body }) => ({
        url: buildResourcePath(resource),
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AdminCustomers', 'AdminEmployees', 'AdminOrders', 'AdminNotifications', 'AdminSettings', 'AdminDashboard'],
      transformResponse: (response: unknown) =>
        normalizeMutationResponse(response, 'Failed to create admin resource'),
    }),
    updateAdminResource: builder.mutation<AdminMutationResponse, ResourceUpdateArgs>({
      query: ({ resource, id, body, method = 'PUT' }) => ({
        url: buildResourcePath(resource, id),
        method,
        body,
      }),
      invalidatesTags: ['AdminCustomers', 'AdminEmployees', 'AdminOrders', 'AdminNotifications', 'AdminSettings', 'AdminDashboard'],
      transformResponse: (response: unknown) =>
        normalizeMutationResponse(response, 'Failed to update admin resource'),
    }),
    patchAdminResource: builder.mutation<AdminMutationResponse, ResourceUpdateArgs>({
      query: ({ resource, id, body }) => ({
        url: buildResourcePath(resource, id),
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['AdminCustomers', 'AdminEmployees', 'AdminOrders', 'AdminNotifications', 'AdminSettings', 'AdminDashboard'],
      transformResponse: (response: unknown) =>
        normalizeMutationResponse(response, 'Failed to patch admin resource'),
    }),
    deleteAdminResource: builder.mutation<AdminMutationResponse, ResourceDeleteArgs>({
      query: ({ resource, id }) => ({
        url: buildResourcePath(resource, id),
        method: 'DELETE',
      }),
      invalidatesTags: ['AdminCustomers', 'AdminEmployees', 'AdminOrders', 'AdminNotifications', 'AdminSettings', 'AdminDashboard'],
      transformResponse: (response: unknown) =>
        normalizeMutationResponse(response, 'Failed to delete admin resource'),
    }),
    createAdminResourceImage: builder.mutation<AdminMutationResponse, ResourceImageMutationArgs>({
      query: ({ resource, body }) => ({
        url: buildResourceImagePath(resource),
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AdminDashboard'],
      transformResponse: (response: unknown) =>
        normalizeMutationResponse(response, 'Failed to create image'),
    }),
    updateAdminResourceImage: builder.mutation<AdminMutationResponse, ResourceImageUpdateArgs>({
      query: ({ resource, id, body }) => ({
        url: buildResourceImagePath(resource, id),
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['AdminDashboard'],
      transformResponse: (response: unknown) =>
        normalizeMutationResponse(response, 'Failed to update image'),
    }),
    deleteAdminResourceImage: builder.mutation<AdminMutationResponse, { resource: ResourceImageListArgs['resource']; id: string | number }>({
      query: ({ resource, id }) => ({
        url: buildResourceImagePath(resource, id),
        method: 'DELETE',
      }),
      invalidatesTags: ['AdminDashboard'],
      transformResponse: (response: unknown) =>
        normalizeMutationResponse(response, 'Failed to delete image'),
    }),
    uploadAdminEntityAsset: builder.mutation<AdminMutationResponse, UploadEntityAssetArgs>({
      query: ({ resource, id, action, body }) => ({
        url: `${buildResourcePath(resource, id)}/${action}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AdminCustomers', 'AdminEmployees', 'AdminDashboard'],
      transformResponse: (response: unknown) =>
        normalizeMutationResponse(response, 'Failed to upload asset'),
    }),
    updateAdminServiceOrderStatus: builder.mutation<AdminMutationResponse, { id: string | number; body: Record<string, unknown> }>({
      query: ({ id, body }) => ({
        url: `${buildResourcePath('service-orders', id)}/status`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['AdminOrders', 'AdminDashboard'],
      transformResponse: (response: unknown) =>
        normalizeMutationResponse(response, 'Failed to update service order status'),
    }),
    completeAdminServiceOrder: builder.mutation<AdminMutationResponse, { id: string | number; body: Record<string, unknown> }>({
      query: ({ id, body }) => ({
        url: `${buildResourcePath('service-orders', id)}/complete`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['AdminOrders', 'AdminDashboard'],
      transformResponse: (response: unknown) =>
        normalizeMutationResponse(response, 'Failed to complete service order'),
    }),
    assignAdminServiceOrder: builder.mutation<AdminMutationResponse, { id: string | number; body: Record<string, unknown> }>({
      query: ({ id, body }) => ({
        url: `${buildResourcePath('service-orders', id)}/assign`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['AdminOrders', 'AdminDashboard'],
      transformResponse: (response: unknown) =>
        normalizeMutationResponse(response, 'Failed to assign service order'),
    }),
    upsertAdminCustomerDriverLicense: builder.mutation<AdminMutationResponse, { id: string | number; body: Record<string, unknown> }>({
      query: ({ id, body }) => ({
        url: `${ADMIN_BASE_PATH}/customers/${encodeURIComponent(String(id))}/driver-license`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['AdminCustomers'],
      transformResponse: (response: unknown) =>
        normalizeMutationResponse(response, 'Failed to update driver license'),
    }),
    deleteAdminCustomerDriverLicense: builder.mutation<AdminMutationResponse, string | number>({
      query: (id) => ({
        url: `${ADMIN_BASE_PATH}/customers/${encodeURIComponent(String(id))}/driver-license`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AdminCustomers'],
      transformResponse: (response: unknown) =>
        normalizeMutationResponse(response, 'Failed to delete driver license'),
    }),
    upsertAdminVehicleInspection: builder.mutation<AdminMutationResponse, { vehicleId: string | number; body: Record<string, unknown> }>({
      query: ({ vehicleId, body }) => ({
        url: `${ADMIN_BASE_PATH}/vehicles/${encodeURIComponent(String(vehicleId))}/inspection`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['AdminDashboard'],
      transformResponse: (response: unknown) =>
        normalizeMutationResponse(response, 'Failed to update inspection'),
    }),
    deleteAdminVehicleInspection: builder.mutation<AdminMutationResponse, string | number>({
      query: (vehicleId) => ({
        url: `${ADMIN_BASE_PATH}/vehicles/${encodeURIComponent(String(vehicleId))}/inspection`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AdminDashboard'],
      transformResponse: (response: unknown) =>
        normalizeMutationResponse(response, 'Failed to delete inspection'),
    }),
    updateAdminServiceReminderConfig: builder.mutation<AdminMutationResponse, { serviceId: string | number; body: Record<string, unknown> }>({
      query: ({ serviceId, body }) => ({
        url: `${ADMIN_BASE_PATH}/settings/service-reminder-configs/${encodeURIComponent(String(serviceId))}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['AdminSettings'],
      transformResponse: (response: unknown) =>
        normalizeMutationResponse(response, 'Failed to update reminder config'),
    }),
    toggleAdminServiceReminderConfig: builder.mutation<AdminMutationResponse, { serviceId: string | number; body: Record<string, unknown> }>({
      query: ({ serviceId, body }) => ({
        url: `${ADMIN_BASE_PATH}/settings/service-reminder-configs/${encodeURIComponent(String(serviceId))}/enabled`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['AdminSettings'],
      transformResponse: (response: unknown) =>
        normalizeMutationResponse(response, 'Failed to toggle reminder config'),
    }),
    updateAdminUiVisibility: builder.mutation<AdminMutationResponse, Record<string, unknown>>({
      query: (body) => ({
        url: `${ADMIN_BASE_PATH}/settings/ui-visibility`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['AdminSettings'],
      transformResponse: (response: unknown) =>
        normalizeMutationResponse(response, 'Failed to update UI visibility'),
    }),
  }),
});

export const {
  useGetAdminStatsQuery,
  useGetAdminResourceListQuery,
  useGetAdminResourceDetailQuery,
  useGetAdminCustomerVehiclesQuery,
  useGetAdminCustomerDriverLicenseQuery,
  useGetAdminResourceImagesQuery,
  useGetAdminNotificationLogsQuery,
  useGetAdminServiceReminderConfigsQuery,
  useGetAdminUiVisibilityQuery,
  useGetAdminVehicleInspectionQuery,
  useCreateAdminResourceMutation,
  useUpdateAdminResourceMutation,
  usePatchAdminResourceMutation,
  useDeleteAdminResourceMutation,
  useCreateAdminResourceImageMutation,
  useUpdateAdminResourceImageMutation,
  useDeleteAdminResourceImageMutation,
  useUploadAdminEntityAssetMutation,
  useUpdateAdminServiceOrderStatusMutation,
  useCompleteAdminServiceOrderMutation,
  useAssignAdminServiceOrderMutation,
  useUpsertAdminCustomerDriverLicenseMutation,
  useDeleteAdminCustomerDriverLicenseMutation,
  useUpsertAdminVehicleInspectionMutation,
  useDeleteAdminVehicleInspectionMutation,
  useUpdateAdminServiceReminderConfigMutation,
  useToggleAdminServiceReminderConfigMutation,
  useUpdateAdminUiVisibilityMutation,
} = adminGarageApi;
