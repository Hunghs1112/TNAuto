// src/screens/Home/hooks/useOrdersData.ts
import React, { useMemo, useCallback, useEffect } from 'react';
import { useGetCustomerOrdersQuery } from '../../../services/customerApi';
import { useGetAssignedOrdersQuery } from '../../../services/employeeApi';

interface UseOrdersDataProps {
  userType: 'customer' | 'employee' | null;
  userPhone: string;
  currentEmployeeId?: string;
}

export const useOrdersData = ({ userType, userPhone, currentEmployeeId }: UseOrdersDataProps) => {
  // Customer orders
  const {
    data: ordersResponse,
    isLoading: ordersLoading,
    error: ordersError,
    refetch: refetchCustomerOrders,
    isFetching: isFetchingCustomerOrders,
  } = useGetCustomerOrdersQuery(userPhone, {
    skip: userType !== 'customer' || !userPhone,
  });

  // Employee assigned orders
  const {
    data: assignedResponse,
    isLoading: assignedLoading,
    error: assignedError,
    refetch: refetchAssignedOrders,
    isFetching: isFetchingAssignedOrders,
  } = useGetAssignedOrdersQuery(
    { employee_id: currentEmployeeId || '' },
    { 
      skip: userType !== 'employee' || !currentEmployeeId,
    },
  );

  // Log for debugging and error handling
  useEffect(() => {
    if (userType === 'employee') {
      // Log errors
      if (assignedError) {
        console.error('useOrdersData: Error fetching assigned orders:', assignedError);
      }
    }
  }, [userType, assignedError]);
  // Memoized orders data
  const orders = useMemo(() => ordersResponse?.data || [], [ordersResponse]);
  
  // Handle different response formats for assigned orders
  const assignedOrders = useMemo(() => {
    if (!assignedResponse) {
      return [];
    }
    
    // Check if response is ApiResponse format
    if (assignedResponse.success && assignedResponse.data) {
      return assignedResponse.data;
    }
    
    // Check if response is array directly
    if (Array.isArray(assignedResponse)) {
      return assignedResponse;
    }
    
    // Check if response has data property
    if (assignedResponse.data && Array.isArray(assignedResponse.data)) {
      return assignedResponse.data;
    }
    
    console.warn('useOrdersData: Unknown assigned response format:', assignedResponse);
    return [];
  }, [assignedResponse]);

  // Sort orders by receive_date ascending
  const sortedOrders = useMemo(
    () => [...orders].sort((a, b) => 
      new Date(a.receive_date).getTime() - new Date(b.receive_date).getTime()
    ),
    [orders]
  );

  const sortedAssignedOrders = useMemo(
    () => [...assignedOrders].sort((a, b) => 
      new Date(a.receive_date).getTime() - new Date(b.receive_date).getTime()
    ),
    [assignedOrders]
  );

  // Display limited orders for customer
  const displayedOrders = useMemo(
    () => sortedOrders.slice(0, 2),
    [sortedOrders]
  );

  // Vehicle info from first order (customer only)
  const vehicleInfo = useMemo(() => {
    const firstOrder = orders[0];
    return {
      licensePlate: firstOrder?.license_plate || '12A2222',
      vehicleType: firstOrder?.vehicle_type || 'Toyota Camry 2023',
      isUnderRepair: orders.length > 0,
    };
  }, [orders]);

  // Refetch function for customer orders
  const refetchOrders = useCallback(async () => {
    if (userType === 'customer' && userPhone && refetchCustomerOrders) {
      return refetchCustomerOrders();
    }
    return Promise.resolve();
  }, [userType, userPhone, refetchCustomerOrders]);

  // Refetch function for assigned orders
  const refetchAssigned = useCallback(async () => {
    if (userType === 'employee' && currentEmployeeId && refetchAssignedOrders) {
      return refetchAssignedOrders();
    }
    return Promise.resolve();
  }, [userType, currentEmployeeId, refetchAssignedOrders]);

  return {
    // Customer data
    orders,
    sortedOrders,
    displayedOrders,
    ordersLoading,
    ordersError,
    vehicleInfo,
    refetchOrders,
    isFetchingOrders: isFetchingCustomerOrders,
    // Employee data
    assignedOrders,
    sortedAssignedOrders,
    assignedLoading,
    assignedError,
    refetchAssignedOrders: refetchAssigned,
    isFetchingAssignedOrders: isFetchingAssignedOrders,
  };
};

