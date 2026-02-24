// src/services/serviceCategoryApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { ENDPOINTS, buildEndpointUrl } from '../constants/apiEndpoints';
import { API_CONFIG, baseQueryWithRetry } from './baseApi';

export interface ServiceCategory {
  id: number;
  name: string;
  description?: string | null;
  image_url?: string | null;
  created_at: string;
  service_count?: number; // Chỉ có trong GET /api/service-categories
  services?: Service[]; // Chỉ có trong GET /api/service-categories/:id
}

export interface Service {
  id: number;
  name: string;
  description?: string | null;
  estimated_time: number; // giây
  image_url?: string | null;
  created_at: string;
  category_id?: number;
  warranty_period?: number | null; // giây
}

interface CreateServiceCategoryRequest {
  name: string;
  description?: string;
  image_url?: string;
}

interface UpdateServiceCategoryRequest {
  name?: string;
  description?: string;
  image_url?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  count?: number;
  error?: string;
  message?: string;
  category_id?: number;
  image_url?: string;
}

export const serviceCategoryApi = createApi({
  ...API_CONFIG,
  reducerPath: 'serviceCategoryApi' as const,
  baseQuery: baseQueryWithRetry,
  tagTypes: ['ServiceCategory'] as const,
  endpoints: (builder) => ({
    // GET /api/service-categories - Lấy danh sách tất cả danh mục dịch vụ
    getServiceCategories: builder.query<ServiceCategory[], void>({
      query: () => {
        const path = ENDPOINTS.getServiceCategories?.path || '/service-categories';
        return path;
      },
      providesTags: ['ServiceCategory'],
      transformResponse: (response: ApiResponse<ServiceCategory[]>) => {
        if (!response.success || !response.data) {
          console.error('Failed to fetch service categories:', response.error);
          throw new Error(response.error || 'Failed to fetch service categories');
        }
        return response.data;
      },
      transformErrorResponse: (response: any) => {
        console.error('Service categories error response:', response);
        return response;
      },
    }),

    // GET /api/service-categories/:id - Lấy thông tin chi tiết danh mục kèm danh sách dịch vụ
    getServiceCategoryById: builder.query<ServiceCategory, number>({
      query: (id) => {
        // Use endpoint path directly and replace :id
        let path = ENDPOINTS.getServiceCategoryById?.path || '/service-categories/:id';
        path = path.replace(':id', id.toString());
        return path;
      },
      providesTags: (result, error, id) => [{ type: 'ServiceCategory' as const, id }],
      transformResponse: (response: ApiResponse<ServiceCategory>) => {
        if (!response.success || !response.data) {
          console.error('Failed to fetch service category:', response.error);
          throw new Error(response.error || 'Failed to fetch service category');
        }
        return response.data;
      },
      transformErrorResponse: (response: any) => {
        console.error('Service category error response:', response);
        return response;
      },
    }),

    // POST /api/service-categories/admin - Tạo danh mục dịch vụ mới (Admin)
    createServiceCategory: builder.mutation<{ id: number }, CreateServiceCategoryRequest>({
      query: (body) => ({
        url: ENDPOINTS.createServiceCategory?.path || '/api/service-categories/admin',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ServiceCategory'],
      transformResponse: (response: ApiResponse<{ id: number }>) => {
        if (!response.success) throw new Error(response.error || 'Failed to create service category');
        return { id: response.category_id || 0 };
      },
    }),

    // PUT /api/service-categories/admin/:id - Cập nhật danh mục dịch vụ (Admin)
    updateServiceCategory: builder.mutation<void, { id: number; data: UpdateServiceCategoryRequest }>({
      query: ({ id, data }) => ({
        url: buildEndpointUrl('updateServiceCategory', { id: id.toString() }) || `/api/service-categories/admin/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'ServiceCategory' as const, id },
        'ServiceCategory',
      ],
      transformResponse: (response: ApiResponse<void>) => {
        if (!response.success) throw new Error(response.error || 'Failed to update service category');
      },
    }),

    // DELETE /api/service-categories/admin/:id - Xóa danh mục dịch vụ (Admin)
    deleteServiceCategory: builder.mutation<void, number>({
      query: (id) => ({
        url: buildEndpointUrl('deleteServiceCategory', { id: id.toString() }) || `/api/service-categories/admin/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ServiceCategory'],
      transformResponse: (response: ApiResponse<void>) => {
        if (!response.success) throw new Error(response.error || 'Failed to delete service category');
      },
    }),

    // GET /api/service-categories/admin/stats - Lấy thống kê danh mục dịch vụ (Admin)
    getServiceCategoryStats: builder.query<{
      total_categories: number;
      new_categories_30d: number;
      new_categories_7d: number;
      new_categories_1d: number;
      categories_with_services: number;
      avg_services_per_category: number;
    }, void>({
      query: () => ENDPOINTS.getServiceCategoryStats?.path || '/api/service-categories/admin/stats',
      providesTags: ['ServiceCategory'],
      transformResponse: (response: ApiResponse<{
        total_categories: number;
        new_categories_30d: number;
        new_categories_7d: number;
        new_categories_1d: number;
        categories_with_services: number;
        avg_services_per_category: number;
      }>) => {
        if (!response.success || !response.data) throw new Error(response.error || 'Failed to fetch service category stats');
        return response.data;
      },
    }),
  }),
});

export const {
  useGetServiceCategoriesQuery,
  useGetServiceCategoryByIdQuery,
  useCreateServiceCategoryMutation,
  useUpdateServiceCategoryMutation,
  useDeleteServiceCategoryMutation,
  useGetServiceCategoryStatsQuery,
} = serviceCategoryApi;



