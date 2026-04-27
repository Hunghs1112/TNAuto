// src/redux/slices/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type AuthUserType = 'customer' | 'employee' | 'dealer' | 'garage_manager' | 'garage_admin';
export type CustomerAuthMode = 'identity_lookup' | '';

interface AuthState {
  isLoggedIn: boolean;
  userType: AuthUserType | null;
  userId: string;
  userName: string;
  userPhone: string;
  userLicensePlate: string;
  avatarUrl: string;
  userEmail?: string;
  token: string;
  expiresAt: string;
  authMode: CustomerAuthMode;
}

const initialState: AuthState = {
  isLoggedIn: false,
  userType: null,
  userId: '',
  userName: '',
  userPhone: '',
  userLicensePlate: '',
  avatarUrl: '',
  userEmail: '',
  token: '',
  expiresAt: '',
  authMode: '',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoggedIn: (
      state,
      action: PayloadAction<{
        isLoggedIn: boolean;
        userType: AuthUserType;
        userId: string;
        userName: string;
        userPhone: string;
        userLicensePlate: string;
        avatarUrl: string;
        userEmail?: string;
        token?: string;
        expiresAt?: string;
        authMode?: CustomerAuthMode;
      }>,
    ) => {
      state.isLoggedIn = action.payload.isLoggedIn;
      state.userType = action.payload.userType;
      state.userId = action.payload.userId;
      state.userName = action.payload.userName;
      state.userPhone = action.payload.userPhone;
      state.userLicensePlate = action.payload.userLicensePlate;
      state.avatarUrl = action.payload.avatarUrl;
      state.userEmail = action.payload.userEmail || '';
      state.token = action.payload.token || '';
      state.expiresAt = action.payload.expiresAt || '';
      state.authMode = action.payload.authMode || '';
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.userType = null;
      state.userId = '';
      state.userName = '';
      state.userPhone = '';
      state.userLicensePlate = '';
      state.avatarUrl = '';
      state.userEmail = '';
      state.token = '';
      state.expiresAt = '';
      state.authMode = '';
    },
    updateUserProfile: (state, action: PayloadAction<{ userName?: string; avatarUrl?: string; userEmail?: string }>) => {
      if (action.payload.userName !== undefined) {
        state.userName = action.payload.userName;
      }
      if (action.payload.avatarUrl !== undefined) {
        state.avatarUrl = action.payload.avatarUrl;
      }
      if (action.payload.userEmail !== undefined) {
        state.userEmail = action.payload.userEmail;
      }
    },
  },
});

export const { setLoggedIn, logout, updateUserProfile } = authSlice.actions;
export type { AuthState };
export default authSlice.reducer;
