// src/services/offerApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { ENDPOINTS, buildEndpointUrl } from '../constants/apiEndpoints';
import { API_CONFIG, baseQueryWithRetry } from './baseApi';
import { Offer, OfferImage } from '../types/api.types';

interface CreateOfferRequest {
  name: string;
  service_id: number;
  image_url?: string;
}

interface CreateOfferResponse {
  success: boolean;
  offer_id: number;
  message: string;
}

interface UpdateOfferRequest {
  name?: string;
  service_id?: number;
  image_url?: string;
}

interface UpdateOfferResponse {
  success: boolean;
  message: string;
}

interface GetOffersResponse {
  success: boolean;
  data: Offer[];
  count: number;
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  pagination?: unknown;
}

export interface GetOfferResponse {
  success: boolean;
  data: Offer;
}

interface GetOfferImagesResponse {
  success: boolean;
  data: OfferImage[];
  count: number;
}

export const offerApi = createApi({
  ...API_CONFIG,
  reducerPath: 'offerApi' as const,
  baseQuery: baseQueryWithRetry,
  tagTypes: ['Offer', 'OfferImage'] as const,
  endpoints: (builder) => ({
    getOffers: builder.query<GetOffersResponse, { garageCode?: string; page?: number; limit?: number; customer_id?: number } | void>({
      query: (args) => ({
        url: ENDPOINTS.getOffers.path,
        params: args,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Offer' as const, id })),
              { type: 'Offer' as const, id: 'LIST' },
            ]
          : [{ type: 'Offer' as const, id: 'LIST' }],
      transformResponse: (response: GetOffersResponse) => {
        if (!response.success || !response.data) {
          // Return empty list instead of throwing to keep cache stable
          // and avoid re-fetches when endpoint is unavailable.
          return { success: true, data: [], count: 0 } as GetOffersResponse;
        }
        return response;
      },
    }),
    createOffer: builder.mutation<CreateOfferResponse, CreateOfferRequest>({
      query: (body) => ({ url: ENDPOINTS.createOffer.path, method: 'POST', body }),
      invalidatesTags: [{ type: 'Offer' as const, id: 'LIST' }],
      transformResponse: (response: CreateOfferResponse) => {
        if (!response.success) throw new Error('Failed to create offer');
        return response;
      },
    }),
    getOfferById: builder.query<GetOfferResponse, { garageCode?: string; id: number; customer_id?: number }>({
      query: ({ id, customer_id }) => ({
        url: ENDPOINTS.getOfferById.path.replace(':id', id.toString()),
        params: customer_id ? { customer_id } : undefined,
      }),
      providesTags: (result, error, { id }) => [{ type: 'Offer' as const, id }],
      transformResponse: (response: GetOfferResponse) => {
        if (!response.success || !response.data) throw new Error('Failed to fetch offer');
        return response;
      },
    }),
    // Lấy danh sách ảnh của ưu đãi (nếu backend hỗ trợ endpoint riêng)
    // Nếu không, có thể sử dụng images từ getOfferById
    getOfferImages: builder.query<OfferImage[], { garageCode?: string; offerId: number; customer_id?: number }>({
      query: ({ offerId, customer_id }) => ({
        url: ENDPOINTS.getOfferImages.path.replace(':id', offerId.toString()),
        params: customer_id ? { customer_id } : undefined,
      }),
      providesTags: (result, error, { offerId }) => [
        { type: 'OfferImage' as const, id: offerId },
        { type: 'Offer' as const, id: offerId },
      ],
      transformResponse: (response: GetOfferImagesResponse | OfferImage[]) => {
        // Hỗ trợ cả 2 format: response trực tiếp là array hoặc có wrapper
        if (Array.isArray(response)) {
          return response;
        }
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error('Failed to fetch offer images');
      },
    }),
    updateOffer: builder.mutation<UpdateOfferResponse, { id: number; body: UpdateOfferRequest }>({
      query: ({ id, body }) => ({ url: buildEndpointUrl('updateOffer', { id: id.toString() }), method: 'PATCH', body }),
      invalidatesTags: [{ type: 'Offer' as const, id: 'LIST' }],
      transformResponse: (response: UpdateOfferResponse) => {
        if (!response.success) throw new Error('Failed to update offer');
        return response;
      },
    }),
    deleteOffer: builder.mutation<UpdateOfferResponse, number>({
      query: (id) => ({ url: buildEndpointUrl('deleteOffer', { id: id.toString() }), method: 'DELETE' }),
      invalidatesTags: [{ type: 'Offer' as const, id: 'LIST' }],
      transformResponse: (response: UpdateOfferResponse) => {
        if (!response.success) throw new Error('Failed to delete offer');
        return response;
      },
    }),
  }),
});

export const {
  useGetOffersQuery,
  useCreateOfferMutation,
  useGetOfferByIdQuery,
  useGetOfferImagesQuery,
  useUpdateOfferMutation,
  useDeleteOfferMutation,
} = offerApi;