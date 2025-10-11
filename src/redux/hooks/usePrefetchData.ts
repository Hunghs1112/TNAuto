// src/redux/hooks/usePrefetchData.ts - Hook for prefetching critical data
import { useEffect } from 'react';
import { useAppSelector } from './useAppSelector';
import { useAppDispatch } from './useAppDispatch';
import { RootState } from '../types';
import { useGetServicesQuery } from '../../services/customerApi';
import { useGetCategoriesQuery } from '../../services/categoryApi';
import { useGetOffersQuery } from '../../services/offerApi';
import { setServices } from '../slices/servicesSlice';
import { setCategories } from '../slices/categorySlice';
import { setOffers } from '../slices/offersSlice';

/**
 * Hook to prefetch critical data (services, categories, offers) on app startup
 * This ensures data is available immediately when users navigate to screens
 * 
 * Usage: Call this once in your root navigator or App.tsx
 * ```tsx
 * function App() {
 *   usePrefetchData();
 *   // ... rest of app
 * }
 * ```
 */
export const usePrefetchData = () => {
  const dispatch = useAppDispatch();
  const isLoggedIn = useAppSelector((state: RootState) => state.auth.isLoggedIn);

  // Prefetch services (critical for booking and home screens)
  const { data: servicesData, isSuccess: servicesSuccess } = useGetServicesQuery(undefined, {
    skip: !isLoggedIn, // Only fetch if user is logged in
  });

  // Prefetch categories (critical for product browsing)
  const { data: categoriesData, isSuccess: categoriesSuccess } = useGetCategoriesQuery(undefined, {
    skip: !isLoggedIn, // Only fetch if user is logged in
  });

  // Prefetch offers (critical for home screen badge)
  const { data: offersData, isSuccess: offersSuccess } = useGetOffersQuery(undefined, {
    skip: !isLoggedIn, // Only fetch if user is logged in
  });

  // Sync services to redux slice when loaded
  useEffect(() => {
    if (servicesSuccess && servicesData?.data) {
      dispatch(setServices({ 
        data: servicesData.data, 
        count: servicesData.data.length 
      }));
      console.log('usePrefetchData: Services prefetched and synced:', servicesData.data.length);
    }
  }, [servicesSuccess, servicesData, dispatch]);

  // Sync categories to redux slice when loaded
  useEffect(() => {
    if (categoriesSuccess && categoriesData) {
      dispatch(setCategories(categoriesData));
      console.log('usePrefetchData: Categories prefetched and synced:', categoriesData.length);
    }
  }, [categoriesSuccess, categoriesData, dispatch]);

  // Sync offers to redux slice when loaded
  useEffect(() => {
    if (offersSuccess && offersData?.data) {
      dispatch(setOffers({ 
        data: offersData.data, 
        count: offersData.count 
      }));
      console.log('usePrefetchData: Offers prefetched and synced:', offersData.count);
    }
  }, [offersSuccess, offersData, dispatch]);

  return {
    servicesLoaded: servicesSuccess,
    categoriesLoaded: categoriesSuccess,
    offersLoaded: offersSuccess,
  };
};

/**
 * Hook to prefetch user-specific data (orders, notifications)
 * Call this after user authentication
 * 
 * Usage:
 * ```tsx
 * function HomeScreen() {
 *   usePrefetchUserData();
 *   // ... rest of screen
 * }
 * ```
 */
export const usePrefetchUserData = () => {
  const userType = useAppSelector((state: RootState) => state.auth.userType);
  const userPhone = useAppSelector((state: RootState) => state.auth.userPhone);
  const userId = useAppSelector((state: RootState) => state.auth.userId);

  // Can add prefetching for orders, notifications here if needed
  // For now, we let screens load them on demand with caching

  console.log('usePrefetchUserData: User data ready for', userType, userPhone, userId);
};

