// src/redux/slices/offersSlice.ts (Updated: Added image_url to Offer interface)
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Offer } from '../../types/api.types';

interface OffersState {
  offers: Offer[];
  count: number;
  isFetching: boolean;
}

const initialState: OffersState = {
  offers: [],
  count: 0,
  isFetching: false,
};

const offersSlice = createSlice({
  name: 'offers',
  initialState,
  reducers: {
    setOffers: (state, action: PayloadAction<{ data: Offer[]; count: number }>) => {
      state.offers = action.payload.data;
      state.count = action.payload.count;
      state.isFetching = false;
    },
    setFetching: (state, action: PayloadAction<boolean>) => {
      state.isFetching = action.payload;
    },
    clearOffers: (state) => {
      state.offers = [];
      state.count = 0;
    },
  },
});

export const { setOffers, setFetching, clearOffers } = offersSlice.actions;
export default offersSlice.reducer;
