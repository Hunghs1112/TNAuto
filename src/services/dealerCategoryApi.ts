import { createApi } from '@reduxjs/toolkit/query/react';
import { ENDPOINTS, buildEndpointUrl } from '../constants/apiEndpoints';
import { API_CONFIG, baseQueryWithRetry } from './baseApi';
import {
  CreateDealerCategoryRequest,
  DealerCategory,
  DealerCategoryDetail,
  UpdateDealerCategoryRequest,
} from './dealerCatalog.types';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  count?: number;
  category_id?: number;
  message?: string;
  error?: string;
}

export const dealerCategoryApi = createApi({
  ...API_CONFIG,
  reducerPath: 'dealerCategoryApi',
  baseQuery: baseQueryWithRetry,
  tagTypes: ['Category'],
  endpoints: (builder) => ({
    getDealerCategories: builder.query<DealerCategory[], void>({
      query: () => ENDPOINTS.getDealerCategories.path,
      transformResponse: (response: ApiResponse<DealerCategory[]>) => {
        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to fetch dealer categories');
        }

        return response.data;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Category' as const, id })),
              { type: 'Category' as const, id: 'LIST' },
            ]
          : [{ type: 'Category' as const, id: 'LIST' }],
    }),

    getDealerCategoryById: builder.query<DealerCategoryDetail, number>({
      query: (id) => buildEndpointUrl('getDealerCategoryById', { id: id.toString() }),
      transformResponse: (response: ApiResponse<DealerCategoryDetail>) => {
        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to fetch dealer category');
        }

        return response.data;
      },
      providesTags: (result, error, id) => [{ type: 'Category' as const, id }],
    }),

    createDealerCategory: builder.mutation<{ id: number; message?: string }, CreateDealerCategoryRequest>({
      query: (body) => ({
        url: ENDPOINTS.createDealerCategory.path,
        method: ENDPOINTS.createDealerCategory.method,
        body,
      }),
      transformResponse: (response: ApiResponse<never>) => {
        if (!response.success || !response.category_id) {
          throw new Error(response.error || 'Failed to create dealer category');
        }

        return {
          id: response.category_id,
          message: response.message,
        };
      },
      invalidatesTags: [{ type: 'Category' as const, id: 'LIST' }],
    }),

    updateDealerCategory: builder.mutation<{ message?: string }, { id: number; data: UpdateDealerCategoryRequest }>({
      query: ({ id, data }) => ({
        url: buildEndpointUrl('updateDealerCategory', { id: id.toString() }),
        method: ENDPOINTS.updateDealerCategory.method,
        body: data,
      }),
      transformResponse: (response: ApiResponse<never>) => {
        if (!response.success) {
          throw new Error(response.error || 'Failed to update dealer category');
        }

        return {
          message: response.message,
        };
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'Category' as const, id },
        { type: 'Category' as const, id: 'LIST' },
      ],
    }),

    deleteDealerCategory: builder.mutation<{ message?: string }, number>({
      query: (id) => ({
        url: buildEndpointUrl('deleteDealerCategory', { id: id.toString() }),
        method: ENDPOINTS.deleteDealerCategory.method,
      }),
      transformResponse: (response: ApiResponse<never>) => {
        if (!response.success) {
          throw new Error(response.error || 'Failed to delete dealer category');
        }

        return {
          message: response.message,
        };
      },
      invalidatesTags: (result, error, id) => [
        { type: 'Category' as const, id },
        { type: 'Category' as const, id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetDealerCategoriesQuery,
  useGetDealerCategoryByIdQuery,
  useCreateDealerCategoryMutation,
  useUpdateDealerCategoryMutation,
  useDeleteDealerCategoryMutation,
} = dealerCategoryApi;

export type { DealerCategory, DealerCategoryDetail } from './dealerCatalog.types';
