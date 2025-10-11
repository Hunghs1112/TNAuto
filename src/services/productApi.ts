// src/services/productApi.ts - Product API with Image Management
// 
// IMPORTANT: Product schema has changed!
// - Products NO LONGER have image_url field
// - Use primary_image from response (populated from ProductImages)
// - To add images: Use createProductImage after creating product
// - To manage images: Use createProductImage/deleteProductImage endpoints
//
// Usage flow:
// 1. Create product (no image): createProduct({ name, price, description })
// 2. Add primary image: createProductImage({ product_id, image_url, is_primary: true })
// 3. Add more images: createProductImage({ product_id, image_url, is_primary: false })
// 4. Products will automatically include primary_image in response

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ENDPOINTS, buildEndpointUrl } from '../constants/apiEndpoints';
import { API_BASE_URL } from '../constants/config';

export interface ProductImage {
  image_url: string;
  is_primary: boolean;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  category_id?: number;
  primary_image?: string; // URL of primary image (from images array)
  images?: ProductImage[];
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  product_id?: number;
  image_id?: number;
  message?: string;
  error?: string;
}

export const productApi = createApi({
  reducerPath: 'productApi' as const,
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: ['Product'] as const,
  endpoints: (builder) => ({
    getProducts: builder.query<Product[], void>({
      query: () => ENDPOINTS.getProducts.path,
      providesTags: ['Product'],
      transformResponse: (response: ApiResponse<Product[]>) => {
        console.log('getProducts response:', response); // Debug
        if (!response.success || !response.data) throw new Error(response.error || 'Failed to fetch products');
        return response.data;
      },
    }),
    createProduct: builder.mutation<{ id: number }, { name: string; price: number; description?: string; category_id?: number }>({
      query: (body) => ({ 
        url: ENDPOINTS.createProduct.path, 
        method: 'POST', 
        body 
      }),
      invalidatesTags: ['Product'],
      transformResponse: (response: ApiResponse<{ id: number }>) => {
        console.log('createProduct response:', response); // Debug
        if (!response.success) throw new Error(response.error || 'Failed to create product');
        return { id: response.product_id! };
      },
    }),
    updateProduct: builder.mutation<void, { id: number; name?: string; description?: string; price?: number; category_id?: number }>({
      query: ({ id, ...body }) => ({ 
        url: buildEndpointUrl('updateProduct', { id: id.toString() }), 
        method: 'PATCH', 
        body 
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Product' as const, id }, 'Product'],
      transformResponse: (response: ApiResponse<void>) => {
        console.log('updateProduct response:', response); // Debug
        if (!response.success) throw new Error(response.error || 'Failed to update product');
      },
    }),
    deleteProduct: builder.mutation<void, number>({
      query: (id) => ({ 
        url: buildEndpointUrl('deleteProduct', { id: id.toString() }), 
        method: 'DELETE' 
      }),
      invalidatesTags: ['Product'],
      transformResponse: (response: ApiResponse<void>) => {
        console.log('deleteProduct response:', response); // Debug
        if (!response.success) throw new Error(response.error || 'Failed to delete product');
      },
    }),
    createProductImage: builder.mutation<{ id: number }, { product_id: number; image_url: string; is_primary?: boolean }>({
      query: (body) => ({ 
        url: ENDPOINTS.createProductImage.path, 
        method: 'POST', 
        body 
      }),
      invalidatesTags: ['Product'],
      transformResponse: (response: ApiResponse<{ id: number }>) => {
        console.log('createProductImage response:', response); // Debug
        if (!response.success) throw new Error(response.error || 'Failed to create product image');
        return { id: response.image_id! };
      },
    }),
    deleteProductImage: builder.mutation<void, number>({
      query: (id) => ({ 
        url: buildEndpointUrl('deleteProductImage', { id: id.toString() }), 
        method: 'DELETE' 
      }),
      invalidatesTags: ['Product'],
      transformResponse: (response: ApiResponse<void>) => {
        console.log('deleteProductImage response:', response); // Debug
        if (!response.success) throw new Error(response.error || 'Failed to delete product image');
      },
    }),
  }),
});

export const {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useCreateProductImageMutation,
  useDeleteProductImageMutation,
} = productApi;