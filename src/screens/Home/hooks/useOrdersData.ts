import { useMemo, useCallback, useEffect } from 'react';
import { useGetCustomerOrdersQuery } from '../../../services/customerApi';
import { useGetAssignedOrdersQuery, useGetAvailableOrdersQuery } from '../../../services/employeeApi';
import { ApiResponse, ServiceOrder } from '../../../types/api.types';

interface UseOrdersDataProps {
  userType: 'customer' | 'employee' | 'dealer' | null;
  userPhone: string;
  currentEmployeeId?: string;
  hasGarageContext?: boolean;
}

const extractOrdersFromResponse = (response?: ApiResponse<ServiceOrder[]> | ServiceOrder[]) => {
  if (!response) {
    return [];
  }

  if (Array.isArray(response)) {
    return response;
  }

  if (response.success && Array.isArray(response.data)) {
    return response.data;
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  return [];
};

const sortOrdersByReceiveDate = (orders: ServiceOrder[]) =>
  [...orders].sort(
    (a, b) => new Date(a.receive_date).getTime() - new Date(b.receive_date).getTime(),
  );

const isUnassignedAvailableOrder = (order: ServiceOrder) =>
  order.status === 'received' &&
  (order.employee_id === null || order.employee_id === undefined || order.employee_id === '') &&
  order.claimable !== false;

export const useOrdersData = ({ userType, userPhone, currentEmployeeId, hasGarageContext = false }: UseOrdersDataProps) => {
  const {
    data: ordersResponse,
    isLoading: ordersLoading,
    error: ordersError,
    refetch: refetchCustomerOrders,
    isFetching: isFetchingCustomerOrders,
  } = useGetCustomerOrdersQuery(userPhone, {
    skip: userType !== 'customer' || !userPhone || !hasGarageContext,
  });

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

  const {
    data: availableResponse,
    isLoading: availableLoading,
    error: availableError,
    refetch: refetchAvailableOrders,
    isFetching: isFetchingAvailableOrders,
  } = useGetAvailableOrdersQuery(
    { page: 1, limit: 20 },
    {
      skip: userType !== 'employee' || !currentEmployeeId,
    },
  );

  useEffect(() => {
    if (userType === 'employee') {
      if (assignedError) {
        console.error('useOrdersData: Error fetching assigned orders:', assignedError);
      }

      if (availableError) {
        console.error('useOrdersData: Error fetching available orders:', availableError);
      }
    }
  }, [userType, assignedError, availableError]);

  const orders = useMemo(() => ordersResponse?.data || [], [ordersResponse]);
  const assignedOrders = useMemo(() => extractOrdersFromResponse(assignedResponse), [assignedResponse]);
  const availableOrders = useMemo(
    () => extractOrdersFromResponse(availableResponse).filter(isUnassignedAvailableOrder),
    [availableResponse],
  );

  const sortedOrders = useMemo(() => sortOrdersByReceiveDate(orders), [orders]);
  const sortedAssignedOrders = useMemo(() => sortOrdersByReceiveDate(assignedOrders), [assignedOrders]);
  const sortedAvailableOrders = useMemo(() => sortOrdersByReceiveDate(availableOrders), [availableOrders]);

  const displayedOrders = useMemo(() => sortedOrders.slice(0, 2), [sortedOrders]);

  const vehicleInfo = useMemo(() => {
    const firstOrder = orders[0];

    return {
      licensePlate: firstOrder?.license_plate || '12A2222',
      vehicleType: firstOrder?.vehicle_type || 'Toyota Camry 2023',
      isUnderRepair: orders.length > 0,
    };
  }, [orders]);

  const refetchOrders = useCallback(async () => {
    if (userType === 'customer' && userPhone && refetchCustomerOrders) {
      return refetchCustomerOrders();
    }

    return Promise.resolve();
  }, [userType, userPhone, refetchCustomerOrders]);

  const refetchAssigned = useCallback(async () => {
    if (userType === 'employee' && currentEmployeeId && refetchAssignedOrders) {
      return refetchAssignedOrders();
    }

    return Promise.resolve();
  }, [userType, currentEmployeeId, refetchAssignedOrders]);

  const refetchAvailable = useCallback(async () => {
    if (userType === 'employee' && currentEmployeeId && refetchAvailableOrders) {
      return refetchAvailableOrders();
    }

    return Promise.resolve();
  }, [userType, currentEmployeeId, refetchAvailableOrders]);

  return {
    orders,
    sortedOrders,
    displayedOrders,
    ordersLoading,
    ordersError,
    vehicleInfo,
    refetchOrders,
    isFetchingOrders: isFetchingCustomerOrders,

    availableOrders,
    sortedAvailableOrders,
    availableLoading,
    availableError,
    refetchAvailableOrders: refetchAvailable,
    isFetchingAvailableOrders,

    assignedOrders,
    sortedAssignedOrders,
    assignedLoading,
    assignedError,
    refetchAssignedOrders: refetchAssigned,
    isFetchingAssignedOrders,
  };
};
