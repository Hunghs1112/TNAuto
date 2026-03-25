import { createApi } from '@reduxjs/toolkit/query/react';
import { ENDPOINTS, buildEndpointUrl } from '../constants/apiEndpoints';
import { API_CONFIG, baseQueryWithRetry } from './baseApi';
import {
  CreateDealerProductImageRequest,
  CreateDealerProductRequest,
  DealerProduct,
  DealerProductImage,
  UpdateDealerProductImageRequest,
  UpdateDealerProductRequest,
} from './dealerCatalog.types';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  count?: number;
  product_id?: number;
  image_id?: number;
  message?: string;
  error?: string;
}

export const dealerProductApi = createApi({
  ...API_CONFIG,
  reducerPath: 'dealerProductApi',
  baseQuery: baseQueryWithRetry,
  tagTypes: ['Product', 'ProductImage'],
  endpoints: (builder) => ({
    getDealerProducts: builder.query<DealerProduct[], void>({
      query: () => ENDPOINTS.getDealerProducts.path,
      transformResponse: (response: ApiResponse<DealerProduct[]>) => {
        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to fetch dealer products');
        }

        return response.data;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Product' as const, id })),
              { type: 'Product' as const, id: 'LIST' },
            ]
          : [{ type: 'Product' as const, id: 'LIST' }],
    }),

    getDealerProductById: builder.query<DealerProduct, number>({
      query: (id) => buildEndpointUrl('getDealerProductById', { id: id.toString() }),
      transformResponse: (response: ApiResponse<DealerProduct>) => {
        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to fetch dealer product');
        }

        return response.data;
      },
      providesTags: (result, error, id) => [{ type: 'Product' as const, id }],
    }),

    getDealerProductImages: builder.query<DealerProductImage[], number>({
      query: (productId) => buildEndpointUrl('getDealerProductImages', { productId: productId.toString() }),
      transformResponse: (response: ApiResponse<DealerProductImage[]>) => {
        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to fetch dealer product images');
        }

        return response.data;
      },
      providesTags: (result, error, productId) => [{ type: 'ProductImage' as const, id: productId }],
    }),

    createDealerProduct: builder.mutation<{ id: number; message?: string }, CreateDealerProductRequest>({
      query: (body) => ({
        url: ENDPOINTS.createDealerProduct.path,
        method: ENDPOINTS.createDealerProduct.method,
        body,
      }),
      transformResponse: (response: ApiResponse<never>) => {
        if (!response.success || !response.product_id) {
          throw new Error(response.error || 'Failed to create dealer product');
        }

        return {
          id: response.product_id,
          message: response.message,
        };
      },
      invalidatesTags: [{ type: 'Product' as const, id: 'LIST' }],
    }),

    updateDealerProduct: builder.mutation<{ message?: string }, { id: number; data: UpdateDealerProductRequest }>({
      query: ({ id, data }) => ({
        url: buildEndpointUrl('updateDealerProduct', { id: id.toString() }),
        method: ENDPOINTS.updateDealerProduct.method,
        body: data,
      }),
      transformResponse: (response: ApiResponse<never>) => {
        if (!response.success) {
          throw new Error(response.error || 'Failed to update dealer product');
        }

        return {
          message: response.message,
        };
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'Product' as const, id },
        { type: 'Product' as const, id: 'LIST' },
      ],
    }),

    deleteDealerProduct: builder.mutation<{ message?: string }, number>({
      query: (id) => ({
        url: buildEndpointUrl('deleteDealerProduct', { id: id.toString() }),
        method: ENDPOINTS.deleteDealerProduct.method,
      }),
      transformResponse: (response: ApiResponse<never>) => {
        if (!response.success) {
          throw new Error(response.error || 'Failed to delete dealer product');
        }

        return {
          message: response.message,
        };
      },
      invalidatesTags: (result, error, id) => [
        { type: 'Product' as const, id },
        { type: 'Product' as const, id: 'LIST' },
        { type: 'ProductImage' as const, id: 'LIST' },
      ],
    }),

    createDealerProductImage: builder.mutation<{ id: number; message?: string }, CreateDealerProductImageRequest>({
      query: (body) => ({
        url: ENDPOINTS.createDealerProductImage.path,
        method: ENDPOINTS.createDealerProductImage.method,
        body,
      }),
      transformResponse: (response: ApiResponse<never>) => {
        if (!response.success || !response.image_id) {
          throw new Error(response.error || 'Failed to create dealer product image');
        }

        return {
          id: response.image_id,
          message: response.message,
        };
      },
      invalidatesTags: (result, error, { product_id }) => [
        { type: 'Product' as const, id: product_id },
        { type: 'Product' as const, id: 'LIST' },
        { type: 'ProductImage' as const, id: product_id },
        { type: 'ProductImage' as const, id: 'LIST' },
      ],
    }),

    updateDealerProductImage: builder.mutation<{ message?: string }, { id: number; data: UpdateDealerProductImageRequest }>({
      query: ({ id, data }) => ({
        url: buildEndpointUrl('updateDealerProductImage', { id: id.toString() }),
        method: ENDPOINTS.updateDealerProductImage.method,
        body: data,
      }),
      transformResponse: (response: ApiResponse<never>) => {
        if (!response.success) {
          throw new Error(response.error || 'Failed to update dealer product image');
        }

        return {
          message: response.message,
        };
      },
      invalidatesTags: [{ type: 'Product' as const, id: 'LIST' }, { type: 'ProductImage' as const, id: 'LIST' }],
    }),

    deleteDealerProductImage: builder.mutation<{ message?: string }, number>({
      query: (id) => ({
        url: buildEndpointUrl('deleteDealerProductImage', { id: id.toString() }),
        method: ENDPOINTS.deleteDealerProductImage.method,
      }),
      transformResponse: (response: ApiResponse<never>) => {
        if (!response.success) {
          throw new Error(response.error || 'Failed to delete dealer product image');
        }

        return {
          message: response.message,
        };
      },
      invalidatesTags: [{ type: 'Product' as const, id: 'LIST' }, { type: 'ProductImage' as const, id: 'LIST' }],
    }),
  }),
});

export const {
  useGetDealerProductsQuery,
  useGetDealerProductByIdQuery,
  useGetDealerProductImagesQuery,
  useCreateDealerProductMutation,
  useUpdateDealerProductMutation,
  useDeleteDealerProductMutation,
  useCreateDealerProductImageMutation,
  useUpdateDealerProductImageMutation,
  useDeleteDealerProductImageMutation,
} = dealerProductApi;

export type { DealerProduct, DealerProductImage } from './dealerCatalog.types';
