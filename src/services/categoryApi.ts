// src/services/categoryApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { ENDPOINTS } from '../constants/apiEndpoints';
import { API_CONFIG, baseQueryWithRetry } from './baseApi';

export interface Category {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
  product_count?: number; // Số lượng sản phẩm trong danh mục (tự động cập nhật bởi backend)
  created_at?: string;
  updated_at?: string;
}

import { Product } from './productApi';

export interface CategoryWithProducts extends Category {
  products?: Product[];
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  image_url?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  image_url?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const categoryApi = createApi({
  ...API_CONFIG,
  reducerPath: 'categoryApi',
  baseQuery: baseQueryWithRetry,
  tagTypes: ['Category'],
  endpoints: (builder) => ({
    // GET /api/app/garages/:garageCode/categories - Get all categories
    getCategories: builder.query<Category[], GarageScopedQueryArg | void>({
      query: ({ garageCode } = {}) => {
        const normalizedGarageCode = (garageCode || '').trim();
        if (!normalizedGarageCode) {
          throw new Error('Missing garageCode for getCategories');
        }

        return ENDPOINTS.getCategories.path.replace(':garageCode', encodeURIComponent(normalizedGarageCode));
      },
      transformResponse: (response: ApiResponse<Category[]> | Category[]) => {
        if (Array.isArray(response)) {
          return response;
        }

        if (!response.success || !response.data) throw new Error(response.error || 'Failed to fetch categories');
        return response.data;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Category' as const, id })),
              { type: 'Category', id: 'LIST' },
            ]
          : [{ type: 'Category', id: 'LIST' }],
    }),

    // GET /api/app/garages/:garageCode/categories/:id - Get category details with products
    getCategoryById: builder.query<CategoryWithProducts, GarageScopedCategoryArg>({
      query: ({ id, garageCode }) => {
        const normalizedGarageCode = (garageCode || '').trim();
        if (!normalizedGarageCode) {
          throw new Error('Missing garageCode for getCategoryById');
        }

        return ENDPOINTS.getCategoryById.path
          .replace(':garageCode', encodeURIComponent(normalizedGarageCode))
          .replace(':id', id.toString());
      },
      providesTags: (result, error, { id }) => [{ type: 'Category', id }],
      transformResponse: (response: ApiResponse<CategoryWithProducts> | CategoryWithProducts) => {
        if (response && typeof response === 'object' && 'success' in response) {
          if (!response.success || !response.data) throw new Error(response.error || 'Failed to fetch category');
          return response.data;
        }

        return response as CategoryWithProducts;
      },
    }),

    // POST /api/categories - Create new category (Admin)
    createCategory: builder.mutation<Category, CreateCategoryRequest>({
      query: (body) => ({
        url: ENDPOINTS.createCategory.path,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Category', id: 'LIST' }],
      transformResponse: (response: ApiResponse<Category>) => {
        if (!response.success || !response.data) throw new Error(response.error || 'Failed to create category');
        return response.data;
      },
    }),

    // PATCH /api/categories/:id - Update category (Admin)
    updateCategory: builder.mutation<Category, { id: number; data: UpdateCategoryRequest }>({
      query: ({ id, data }) => ({
        url: buildEndpointUrl('updateCategory', { id: id.toString() }),
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Category', id },
        { type: 'Category', id: 'LIST' },
      ],
      transformResponse: (response: ApiResponse<Category>) => {
        if (!response.success || !response.data) throw new Error(response.error || 'Failed to update category');
        return response.data;
      },
    }),

    // DELETE /api/categories/:id - Delete category (Admin)
    deleteCategory: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: buildEndpointUrl('deleteCategory', { id: id.toString() }),
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Category', id: 'LIST' }],
      transformResponse: (response: ApiResponse<void>) => {
        if (!response.success) throw new Error(response.error || 'Failed to delete category');
        return { message: 'Category deleted successfully' };
      },
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi;
