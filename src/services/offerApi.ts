// src/services/offerApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ENDPOINTS, buildEndpointUrl } from '../constants/apiEndpoints';
import { API_BASE_URL } from '../constants/config';

interface Offer {
  id: number;
  name: string;
  image_url?: string;
  service_id: number;
  service_name: string;
  created_at: string;
}

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

interface GetOfferResponse {
  success: boolean;
  data: Offer;
}

export const offerApi = createApi({
  reducerPath: 'offerApi' as const,
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: ['Offer'] as const,
  endpoints: (builder) => ({
    getOffers: builder.query<GetOffersResponse, void>({
      query: () => ENDPOINTS.getOffers.path,
      providesTags: ['Offer'],
      transformResponse: (response: GetOffersResponse) => {
        console.log('offerApi: getOffers response:', response); // Debug
        if (!response.success || !response.data) throw new Error('Failed to fetch offers');
        return response;
      },
    }),
    createOffer: builder.mutation<CreateOfferResponse, CreateOfferRequest>({
      query: (body) => ({ url: ENDPOINTS.createOffer.path, method: 'POST', body }),
      invalidatesTags: ['Offer'],
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
    updateOffer: builder.mutation<UpdateOfferResponse, { id: number; body: UpdateOfferRequest }>({
      query: ({ id, body }) => ({ url: buildEndpointUrl('updateOffer', { id: id.toString() }), method: 'PATCH', body }),
      invalidatesTags: ['Offer'],
      transformResponse: (response: UpdateOfferResponse) => {
        console.log('offerApi: updateOffer response:', response); // Debug
        if (!response.success) throw new Error('Failed to update offer');
        return response;
      },
    }),
    deleteOffer: builder.mutation<UpdateOfferResponse, number>({
      query: (id) => ({ url: buildEndpointUrl('deleteOffer', { id: id.toString() }), method: 'DELETE' }),
      invalidatesTags: ['Offer'],
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
  useUpdateOfferMutation,
  useDeleteOfferMutation,
} = offerApi;