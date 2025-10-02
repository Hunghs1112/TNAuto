// src/redux/slices/servicesSlice.ts (Updated: Added image_url to Service interface)
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Service {
  id: number;
  name: string;
  description: string;
  estimated_time: number;
  image_url?: string;
  created_at: string;
}

interface ServicesState {
  services: Service[];
  count: number;
  isFetching: boolean;
}

const initialState: ServicesState = {
  services: [],
  count: 0,
  isFetching: false,
};

const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    setServices: (state, action: PayloadAction<{ data: Service[]; count: number }>) => {
      state.services = action.payload.data;
      state.count = action.payload.count;
      state.isFetching = false;
    },
    setFetching: (state, action: PayloadAction<boolean>) => {
      state.isFetching = action.payload;
    },
    clearServices: (state) => {
      state.services = [];
      state.count = 0;
    },
  },
});

export const { setServices, setFetching, clearServices } = servicesSlice.actions;
export default servicesSlice.reducer;