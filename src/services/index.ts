import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../redux/slices/authSlice';
import loadingReducer from '../redux/slices/loadingSlice';
import { customerApi } from './customerApi';
import { employeeApi } from './employeeApi';
import { serviceOrderApi } from './serviceOrderApi';
import { serviceApi } from './serviceApi';
import { productApi } from './productApi';
import { warrantyApi } from './warrantyApi';
import { notificationApi } from './notificationApi';
import { imageApi } from './imageApi';

export const rootReducer = combineReducers({
  auth: authReducer,
  loading: loadingReducer,
  customerApi: customerApi.reducer,
  employeeApi: employeeApi.reducer,
  serviceOrderApi: serviceOrderApi.reducer,
  serviceApi: serviceApi.reducer,
  productApi: productApi.reducer,
  warrantyApi: warrantyApi.reducer,
  notificationApi: notificationApi.reducer,
  imageApi: imageApi.reducer,
});

export const rootMiddleware = [
  customerApi.middleware,
  employeeApi.middleware,
  serviceOrderApi.middleware,
  serviceApi.middleware,
  productApi.middleware,
  warrantyApi.middleware,
  notificationApi.middleware,
  imageApi.middleware,
];

// Re-export hooks
export * from './customerApi';
export * from './employeeApi';
export * from './serviceOrderApi';
export * from './serviceApi';
export * from './productApi';
export * from './warrantyApi';
export * from './notificationApi';
export * from './imageApi';