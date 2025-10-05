// src/redux/slices/warrantySlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../types';
import { Warranty } from '../../services/warrantyApi';

interface WarrantyState {
  warranties: Warranty[];
  loading: boolean;
  error: string | null;
}

const initialState: WarrantyState = {
  warranties: [],
  loading: false,
  error: null,
};

const warrantySlice = createSlice({
  name: 'warranty',
  initialState,
  reducers: {
    setWarranties: (state, action: PayloadAction<Warranty[]>) => {
      state.warranties = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
      if (action.payload) state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearWarranties: (state) => {
      state.warranties = [];
      state.error = null;
    },
  },
});

export const { setWarranties, setLoading, setError, clearWarranties } = warrantySlice.actions;
export const selectWarranties = (state: RootState) => state.warranty.warranties;
export const selectWarrantyLoading = (state: RootState) => state.warranty.loading;
export const selectWarrantyError = (state: RootState) => state.warranty.error;

export default warrantySlice.reducer;