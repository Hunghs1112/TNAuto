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
    getOffers: builder.query<GetOffersResponse, void>({
      query: () => ENDPOINTS.getOffers.path,
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Offer' as const, id })),
              { type: 'Offer' as const, id: 'LIST' },
            ]
          : [{ type: 'Offer' as const, id: 'LIST' }],
      transformResponse: (response: GetOffersResponse) => {
        console.log('offerApi: getOffers response:', response); // Debug
        if (!response.success || !response.data) throw new Error('Failed to fetch offers');
        return response;
      },
    }),
    createOffer: builder.mutation<CreateOfferResponse, CreateOfferRequest>({
      query: (body) => ({ url: ENDPOINTS.createOffer.path, method: 'POST', body }),
      invalidatesTags: [{ type: 'Offer' as const, id: 'LIST' }],
      transformResponse: (response: CreateOfferResponse) => {
        console.log('offerApi: createOffer response:', response); // Debug
        if (!response.success) throw new Error('Failed to create offer');
        return response;
      },
    }),
    getOfferById: builder.query<GetOfferResponse, number>({
      query: (id) => buildEndpointUrl('getOfferById', { id: id.toString() }),
      providesTags: (result, error, id) => [{ type: 'Offer' as const, id }],
      transformResponse: (response: GetOfferResponse) => {
        console.log('offerApi: getOfferById response:', response); // Debug
        if (!response.success || !response.data) throw new Error('Failed to fetch offer');
        return response;
      },
    }),
    // Lấy danh sách ảnh của ưu đãi (nếu backend hỗ trợ endpoint riêng)
    // Nếu không, có thể sử dụng images từ getOfferById
    getOfferImages: builder.query<OfferImage[], number>({
      query: (offerId) => `/offers/${offerId}/images`,
      providesTags: (result, error, offerId) => [
        { type: 'OfferImage' as const, id: offerId },
        { type: 'Offer' as const, id: offerId }
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
        console.log('offerApi: updateOffer response:', response); // Debug
        if (!response.success) throw new Error('Failed to update offer');
        return response;
      },
    }),
    deleteOffer: builder.mutation<UpdateOfferResponse, number>({
      query: (id) => ({ url: buildEndpointUrl('deleteOffer', { id: id.toString() }), method: 'DELETE' }),
      invalidatesTags: [{ type: 'Offer' as const, id: 'LIST' }],
      transformResponse: (response: UpdateOfferResponse) => {
        console.log('offerApi: deleteOffer response:', response); // Debug
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