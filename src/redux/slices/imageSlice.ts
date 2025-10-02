// src/redux/slices/imageSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ServiceOrderImage {
  id: string;
  order_id: string;
  image_url: string;
  status_at_time: string;
  description?: string;
  uploaded_by: string;
  created_at?: string;
}

interface ImageState {
  images: ServiceOrderImage[];
  loading: boolean;
  error: string | null;
}

const initialState: ImageState = {
  images: [],
  loading: false,
  error: null,
};

const imageSlice = createSlice({
  name: 'image',
  initialState,
  reducers: {
    setImages: (state, action: PayloadAction<ServiceOrderImage[]>) => {
      console.log('ImageSlice debug - Setting images:', action.payload);
      state.images = action.payload;
      state.loading = false;
      state.error = null;
    },
    addImage: (state, action: PayloadAction<ServiceOrderImage>) => {
      console.log('ImageSlice debug - Adding image:', action.payload);
      state.images.push(action.payload);
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      console.log('ImageSlice debug - Setting loading:', action.payload);
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      console.log('ImageSlice debug - Setting error:', action.payload);
      state.error = action.payload;
      state.loading = false;
    },
    clearImages: (state) => {
      console.log('ImageSlice debug - Clearing images');
      state.images = [];
      state.loading = false;
      state.error = null;
    },
  },
});

export const { setImages, addImage, setLoading, setError, clearImages } = imageSlice.actions;
export default imageSlice.reducer;