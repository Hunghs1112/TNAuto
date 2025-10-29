// src/redux/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../../services/authApi';
import { customerApi } from '../../services/customerApi';
import { offerApi } from '../../services/offerApi';
import { productApi } from '../../services/productApi';
import { categoryApi } from '../../services/categoryApi';
import { serviceOrderApi } from '../../services/serviceOrderApi';
import { employeeApi } from '../../services/employeeApi';
import { imageApi } from '../../services/imageApi';
import { serviceApi } from '../../services/serviceApi';
import { notificationApi } from '../../services/notificationApi';
import { warrantyApi } from '../../services/warrantyApi';
import { vehicleApi } from '../../services/vehicleApi';

import authReducer from '../slices/authSlice';
import loadingReducer from '../slices/loadingSlice';
import customerReducer from '../slices/customerSlice';
import servicesReducer from '../slices/servicesSlice';
import ordersReducer from '../slices/ordersSlice';
import offersReducer from '../slices/offersSlice';
import productReducer from '../slices/productSlice';
import categoryReducer from '../slices/categorySlice'; // Added
import employeeReducer from '../slices/employeeSlice';
import imageReducer from '../slices/imageSlice';
import notificationReducer from '../slices/notificationSlice';
import warrantyReducer from '../slices/warrantySlice'; // Added

// Cấu hình persist riêng cho auth reducer
const authPersistConfig = {
  key: 'auth',
  storage: AsyncStorage,
  timeout: 10000, // 10 giây timeout thay vì mặc định
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    loading: loadingReducer,
    customer: customerReducer,
    services: servicesReducer,
    orders: ordersReducer,
    offers: offersReducer,
    product: productReducer,
    category: categoryReducer, // Added
    employee: employeeReducer,
    image: imageReducer,
    notification: notificationReducer,
    warranty: warrantyReducer, // Added
    [authApi.reducerPath]: authApi.reducer,
    [customerApi.reducerPath]: customerApi.reducer,
    [offerApi.reducerPath]: offerApi.reducer,
    [productApi.reducerPath]: productApi.reducer,
    [categoryApi.reducerPath]: categoryApi.reducer,
    [serviceOrderApi.reducerPath]: serviceOrderApi.reducer,
    [employeeApi.reducerPath]: employeeApi.reducer,
    [imageApi.reducerPath]: imageApi.reducer,
    [serviceApi.reducerPath]: serviceApi.reducer,
    [notificationApi.reducerPath]: notificationApi.reducer,
    [warrantyApi.reducerPath]: warrantyApi.reducer,
    [vehicleApi.reducerPath]: vehicleApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/REGISTER'],
      },
      immutableCheck: false, // Tắt immutable check để tăng performance
    }).concat(
      authApi.middleware,
      customerApi.middleware, 
      offerApi.middleware, 
      productApi.middleware,
      categoryApi.middleware,
      serviceOrderApi.middleware,
      employeeApi.middleware,
      imageApi.middleware,
      serviceApi.middleware,
      notificationApi.middleware,
      warrantyApi.middleware,
      vehicleApi.middleware
    ),
});

setupListeners(store.dispatch);

export const persistor = persistStore(store);

console.log('Store configured with all APIs including vehicleApi');

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;