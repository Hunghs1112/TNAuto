// src/services/productReviewApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { ENDPOINTS, buildEndpointUrl } from '../constants/apiEndpoints';
import { API_CONFIG, baseQueryWithRetry } from './baseApi';
import { ProductReview, ReviewStats, CreateReviewRequest, ReviewListResponse } from '../types/api.types';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface GetReviewsParams {
  product_id: number;
  approved_only?: boolean;
  rating?: number;
  page?: number;
  limit?: number;
}

export const productReviewApi = createApi({
  ...API_CONFIG,
  reducerPath: 'productReviewApi' as const,
  baseQuery: baseQueryWithRetry,
  tagTypes: ['ProductReview'] as const,
  endpoints: (builder) => ({
    // GET /api/product-reviews - Get reviews with filters
    getProductReviews: builder.query<ReviewListResponse, GetReviewsParams>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        queryParams.append('product_id', params.product_id.toString());
        if (params.approved_only !== undefined) {
          queryParams.append('approved_only', params.approved_only.toString());
        }
        if (params.rating) {
          queryParams.append('rating', params.rating.toString());
        }
        if (params.page) {
          queryParams.append('page', params.page.toString());
        }
        if (params.limit) {
          queryParams.append('limit', params.limit.toString());
        }
        return `${ENDPOINTS.getProductReviews?.path || '/api/product-reviews'}?${queryParams.toString()}`;
      },
      providesTags: ['ProductReview'],
      transformResponse: (response: ReviewListResponse) => {
        if (!response.success) throw new Error(response.error || 'Failed to fetch reviews');
        return response;
      },
    }),

    // GET /api/products/:id/reviews/stats - Get review statistics
    getReviewStats: builder.query<ReviewStats, number>({
      query: (productId) => 
        buildEndpointUrl('getProductReviewStats', { id: productId.toString() }),
      providesTags: ['ProductReview'],
      transformResponse: (response: ApiResponse<ReviewStats>) => {
        if (!response.success || !response.data) throw new Error(response.error || 'Failed to fetch review stats');
        return response.data;
      },
    }),

    // POST /api/product-reviews - Create new review
    createReview: builder.mutation<ProductReview, CreateReviewRequest>({
      query: (body) => ({
        url: ENDPOINTS.createProductReview?.path || '/api/product-reviews',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ProductReview'],
      transformResponse: (response: ApiResponse<ProductReview>) => {
        if (!response.success || !response.data) throw new Error(response.error || 'Failed to create review');
        return response.data;
      },
    }),

    // POST /api/product-reviews/:id/helpful - Mark review as helpful
    markReviewHelpful: builder.mutation<{ helpful_count: number }, { reviewId: number; customer_id: number }>({
      query: ({ reviewId, customer_id }) => ({
        url: buildEndpointUrl('markReviewHelpful', { id: reviewId.toString() }) || 
             `/api/product-reviews/${reviewId}/helpful`,
        method: 'POST',
        body: { customer_id },
      }),
      invalidatesTags: ['ProductReview'],
      transformResponse: (response: ApiResponse<{ helpful_count: number }>) => {
        if (!response.success || !response.data) throw new Error(response.error || 'Failed to mark review helpful');
        return response.data;
      },
    }),
  }),
});

export const {
  useGetProductReviewsQuery,
  useGetReviewStatsQuery,
  useCreateReviewMutation,
  useMarkReviewHelpfulMutation,
} = productReviewApi;


