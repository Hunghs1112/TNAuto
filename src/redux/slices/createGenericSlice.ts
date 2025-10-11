// src/redux/slices/createGenericSlice.ts
// Generic slice factory to reduce boilerplate code
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface GenericState<T> {
  items: T[];
  selectedItem: T | null;
  loading: boolean;
  error: string | null;
  count: number;
}

export function createGenericSlice<T extends { id: number | string }>(name: string) {
  const initialState: GenericState<T> = {
    items: [],
    selectedItem: null,
    loading: false,
    error: null,
    count: 0,
  };

  const slice = createSlice({
    name,
    initialState,
    reducers: {
      setItems: (state, action: PayloadAction<T[]>) => {
        state.items = action.payload;
        state.count = action.payload.length;
        state.loading = false;
        state.error = null;
      },
      addItem: (state, action: PayloadAction<T>) => {
        state.items.unshift(action.payload);
        state.count += 1;
      },
      updateItem: (state, action: PayloadAction<T>) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      },
      removeItem: (state, action: PayloadAction<number | string>) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
        state.count = state.items.length;
      },
      setSelectedItem: (state, action: PayloadAction<T | null>) => {
        state.selectedItem = action.payload;
      },
      setLoading: (state, action: PayloadAction<boolean>) => {
        state.loading = action.payload;
      },
      setError: (state, action: PayloadAction<string | null>) => {
        state.error = action.payload;
        state.loading = false;
      },
      clearItems: (state) => {
        state.items = [];
        state.selectedItem = null;
        state.count = 0;
        state.error = null;
      },
    },
  });

  return slice;
}

