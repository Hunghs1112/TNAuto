// src/screens/Home/hooks/useOrdersData.ts
import { useMemo } from 'react';
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
  } = useGetCustomerOrdersQuery(userPhone, {
    skip: userType !== 'customer' || !userPhone,
  });

  // Employee assigned orders
  const {
    data: assignedResponse,
    isLoading: assignedLoading,
    error: assignedError,
  } = useGetAssignedOrdersQuery(
    { employee_id: currentEmployeeId || '' },
    { skip: userType !== 'employee' || !currentEmployeeId },
  );

  // Memoized orders data
  const orders = useMemo(() => ordersResponse?.data || [], [ordersResponse]);
  const assignedOrders = useMemo(() => assignedResponse?.data || [], [assignedResponse]);

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

  return {
    // Customer data
    orders,
    sortedOrders,
    displayedOrders,
    ordersLoading,
    ordersError,
    vehicleInfo,
    // Employee data
    assignedOrders,
    sortedAssignedOrders,
    assignedLoading,
    assignedError,
  };
};

