// src/redux/hooks/usePrefetchData.ts - Hook for prefetching critical data
import { useEffect } from 'react';
import { useAppSelector } from './useAppSelector';
import { useAppDispatch } from './useAppDispatch';
import { RootState } from '../types';
import { useGetServicesQuery } from '../../services/customerApi';
import { useGetCategoriesQuery } from '../../services/categoryApi';
import { useGetDealerCategoriesQuery } from '../../services/dealerCategoryApi';
import { useGetOffersQuery } from '../../services/offerApi';
import { setServices } from '../slices/servicesSlice';
import { setCategories } from '../slices/categorySlice';
import { setOffers } from '../slices/offersSlice';
import { selectGarageCode } from '../selectors';

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
  const userType = useAppSelector((state: RootState) => state.auth.userType);
  const customerId = useAppSelector((state: RootState) => state.auth.userId);
  const activeGarageCode = useAppSelector(selectGarageCode);
  const hasGarageContext = useAppSelector(
    (state: RootState) => Boolean(state.garageContext.garageCode && state.garageContext.resolved),
  );
  const isDealer = userType === 'dealer';
  const isManagerRole = userType === 'garage_manager' || userType === 'garage_admin';
  const hasGarageCode = Boolean(activeGarageCode);
  const canUseTenantCatalog =
    (userType === 'employee' || isDealer ? isLoggedIn : hasGarageContext) && hasGarageCode;

  // Prefetch services (critical for booking and home screens)
  const { data: servicesData, isSuccess: servicesSuccess } = useGetServicesQuery({ garageCode: activeGarageCode }, {
    skip: !canUseTenantCatalog || isDealer, // Dealer khong dung luong service
  });

  // Prefetch categories (critical for product browsing)
  const { data: categoriesData, isSuccess: categoriesSuccess } = useGetCategoriesQuery({ garageCode: activeGarageCode }, {
    skip: !canUseTenantCatalog || isDealer,
  });
  const { data: dealerCategoriesData, isSuccess: dealerCategoriesSuccess } = useGetDealerCategoriesQuery(undefined, {
    skip: !isLoggedIn || !isDealer || isManagerRole,
  });

  // Prefetch offers (critical for home screen badge)
  const { data: offersData, isSuccess: offersSuccess } = useGetOffersQuery(
    userType === 'customer'
      ? { customer_id: customerId ? Number(customerId) : undefined }
      : { garageCode: activeGarageCode },
    {
      skip: isManagerRole || (userType === 'customer' ? !isLoggedIn || !customerId : !canUseTenantCatalog),
    },
  );

  // Sync services to redux slice when loaded
  useEffect(() => {
    if (servicesSuccess && servicesData?.data) {
      dispatch(setServices({ 
        data: servicesData.data, 
        count: servicesData.data.length 
      }));
      if (__DEV__) console.log('usePrefetchData: Services prefetched:', servicesData.data.length);
    }
  }, [servicesSuccess, servicesData, dispatch]);

  // Sync categories to redux slice when loaded
  useEffect(() => {
    if (categoriesSuccess && categoriesData) {
      dispatch(setCategories(categoriesData));
      if (__DEV__) console.log('usePrefetchData: Categories prefetched:', categoriesData.length);
    }
  }, [categoriesSuccess, categoriesData, dispatch]);

  useEffect(() => {
    if (dealerCategoriesSuccess && dealerCategoriesData) {
      dispatch(setCategories(dealerCategoriesData as any));
      if (__DEV__) console.log('usePrefetchData: Dealer categories prefetched:', dealerCategoriesData.length);
    }
  }, [dealerCategoriesSuccess, dealerCategoriesData, dispatch]);

  // Sync offers to redux slice when loaded
  useEffect(() => {
    if (offersSuccess && offersData?.data) {
      dispatch(setOffers({ 
        data: offersData.data as any, 
        count: offersData.count 
      }));
      if (__DEV__) console.log('usePrefetchData: Offers prefetched:', offersData.count);
    }
  }, [offersSuccess, offersData, dispatch]);

  return {
    servicesLoaded: servicesSuccess,
    categoriesLoaded: categoriesSuccess || dealerCategoriesSuccess,
    offersLoaded: offersSuccess,
  };
};

