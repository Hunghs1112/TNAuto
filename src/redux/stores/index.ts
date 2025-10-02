// src/redux/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { customerApi } from '../../services/customerApi';
import { offerApi } from '../../services/offerApi';
import { productApi } from '../../services/productApi';
import { serviceOrderApi } from '../../services/serviceOrderApi';
import { employeeApi } from '../../services/employeeApi';
import { imageApi } from '../../services/imageApi';
import { serviceApi } from '../../services/serviceApi'; // Added
import { notificationApi } from '../../services/notificationApi'; // Added

import authReducer from '../slices/authSlice';
import loadingReducer from '../slices/loadingSlice';
import customerReducer from '../slices/customerSlice';
import servicesReducer from '../slices/servicesSlice';
import ordersReducer from '../slices/ordersSlice';
import offersReducer from '../slices/offersSlice';
import productReducer from '../slices/productSlice';
import employeeReducer from '../slices/employeeSlice';
import imageReducer from '../slices/imageSlice';
import notificationReducer from '../slices/notificationSlice'; // Added

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth'], // Chỉ persist auth để tránh lưu dữ liệu transient như RTK Query
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    loading: loadingReducer,
    customer: customerReducer,
    services: servicesReducer,
    orders: ordersReducer,
    offers: offersReducer,
    product: productReducer,
    employee: employeeReducer,
    image: imageReducer,
    notification: notificationReducer, // Added
    [customerApi.reducerPath]: customerApi.reducer,
    [offerApi.reducerPath]: offerApi.reducer,
    [productApi.reducerPath]: productApi.reducer,
    [serviceOrderApi.reducerPath]: serviceOrderApi.reducer,
    [employeeApi.reducerPath]: employeeApi.reducer,
    [imageApi.reducerPath]: imageApi.reducer,
    [serviceApi.reducerPath]: serviceApi.reducer, // Added
    [notificationApi.reducerPath]: notificationApi.reducer, // Added
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/REGISTER'],
      },
    }).concat(
      customerApi.middleware, 
      offerApi.middleware, 
      productApi.middleware,
      serviceOrderApi.middleware,
      employeeApi.middleware,
      imageApi.middleware,
      serviceApi.middleware, // Added
      notificationApi.middleware // Added
    ),
});

setupListeners(store.dispatch);

export const persistor = persistStore(store);

console.log('Store configured with persist for auth, all APIs including serviceApi and notificationApi'); // Debug

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;