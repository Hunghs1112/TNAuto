// src/hooks/useAutoRefresh.ts (Custom hook cho auto-refresh và pull-to-refresh)
import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch } from 'react-redux';

import { customerApi } from '../../services/customerApi';
import { offerApi } from '../../services/offerApi';
import { productApi } from '../../services/productApi';
import { serviceOrderApi } from '../../services/serviceOrderApi';
import { serviceApi } from '../../services/serviceApi';
import { notificationApi } from '../../services/notificationApi';
import { employeeApi } from '../../services/employeeApi';
import { AppDispatch } from '../stores';

export const useAutoRefresh = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [refreshing, setRefreshing] = useState(false);

  const refreshAllData = useCallback(async () => {
    setRefreshing(true);
    console.log('Auto-refresh triggered'); // Debug
    dispatch(customerApi.util.invalidateTags(['Customer']));
    dispatch(offerApi.util.invalidateTags(['Offer']));
    dispatch(productApi.util.invalidateTags(['Product']));
    dispatch(serviceOrderApi.util.invalidateTags(['ServiceOrder']));
    dispatch(serviceApi.util.invalidateTags(['Service']));
    dispatch(notificationApi.util.invalidateTags(['Notification']));
    dispatch(employeeApi.util.invalidateTags(['Employee']));
    setRefreshing(false);
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      refreshAllData();
    }, [refreshAllData])
  );

  return { refreshing, onRefresh: refreshAllData };
};