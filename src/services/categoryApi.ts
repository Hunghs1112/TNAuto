// src/services/categoryApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants/config';
import { ENDPOINTS, buildEndpointUrl } from '../constants/apiEndpoints';
import { RootState } from '../redux/types';

export interface Category {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryWithProducts extends Category {
  products?: Array<{
    id: number;
    name: string;
    price: number;
    description?: string;
    image_url?: string;
  }>;
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
  reducerPath: 'categoryApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Category'],
  endpoints: (builder) => ({
    // GET /api/categories - Get all categories
    getCategories: builder.query<Category[], void>({
      query: () => ENDPOINTS.getCategories.path,
      transformResponse: (response: ApiResponse<Category[]>) => {
        console.log('getCategories response:', response);
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

    // GET /api/categories/:id - Get category details with products
    getCategoryById: builder.query<CategoryWithProducts, number>({
      query: (id) => buildEndpointUrl('getCategoryById', { id: id.toString() }),
      providesTags: (result, error, id) => [{ type: 'Category', id }],
      transformResponse: (response: ApiResponse<CategoryWithProducts>) => {
        console.log('getCategoryById response:', response);
        if (!response.success || !response.data) throw new Error(response.error || 'Failed to fetch category');
        return response.data;
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
        console.log('createCategory response:', response);
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
        console.log('updateCategory response:', response);
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
        console.log('deleteCategory response:', response);
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

