import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { spacing } from "../../design-system/spacing";
import { useAppDispatch } from "../../redux/hooks/useAppDispatch";
import { useAppSelector } from "../../redux/hooks/useAppSelector";
import { useAutoRefresh } from "../../redux/hooks/useAutoRefresh";
import {
  selectCurrentEmployee,
  selectServicesList,
  selectUnreadCount,
  selectUserId,
  selectUserName,
  selectUserPhone,
  selectUserType,
} from "../../redux/selectors";
import { RootState } from "../../redux/types";
import { setNotifications, setUnreadCount } from "../../redux/slices/notificationSlice";
import { useGetNotificationsQuery, useGetUnreadCountQuery } from "../../services/notificationApi";
import { useClaimEmployeeOrderMutation } from "../../services/employeeApi";
import { useOrdersData } from "./hooks/useOrdersData";
import { AppStackParamList } from "../../navigation/AppNavigator";
import { useRefreshQueries } from "../../hooks/useRefreshQueries";
import { useGetProductsQuery } from "../../services/productApi";
import { useGetDealerProductsQuery } from "../../services/dealerProductApi";
import { useGetServicesQuery } from "../../services/customerApi";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

const getApiErrorMessage = (error: any, fallback: string) => {
  return (
    error?.data?.error ||
    error?.data?.message ||
    error?.error ||
    fallback
  );
};

export const useHomeScreen = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavigationProp>();
  const { refreshing: autoRefreshing, onRefresh: baseOnRefresh } = useAutoRefresh();
  const insets = useSafeAreaInsets();
  const [claimingOrderId, setClaimingOrderId] = useState(null as string | null);

  const navbarHeight =
    spacing.md + (spacing.sm * 2) + 64 + insets.bottom + spacing.lg + spacing.md;

  const userType = useAppSelector(selectUserType);
  const userName = useAppSelector(selectUserName);
  const userPhone = useAppSelector(selectUserPhone);
  const userId = useAppSelector(selectUserId);
  const currentEmployee = useAppSelector(selectCurrentEmployee);
  const services = useAppSelector(selectServicesList);
  const unreadCount = useAppSelector(selectUnreadCount);

  const isLoggedIn = useAppSelector((state: RootState) => state.auth.isLoggedIn);
  const isDealer = userType === "dealer";
  const employeeId = currentEmployee?.id || (userType === "employee" ? userId : undefined);

  const [claimEmployeeOrder] = useClaimEmployeeOrderMutation();

  const productsQuery = useGetProductsQuery(undefined, { skip: isDealer });
  const dealerProductsQuery = useGetDealerProductsQuery(undefined, { skip: !isDealer });
  const servicesQuery = useGetServicesQuery(undefined, { skip: isDealer });
  const activeProductsQuery = isDealer ? dealerProductsQuery : productsQuery;

  const homePreviewProducts = useMemo(() => {
    return (activeProductsQuery.data || []).slice(0, 4);
  }, [activeProductsQuery.data]);

  const homePreviewServices = useMemo(() => {
    const list = servicesQuery.data?.data || [];
    return list.slice(0, 4);
  }, [servicesQuery.data]);

  const {
    sortedOrders,
    displayedOrders,
    ordersLoading,
    sortedAvailableOrders,
    availableLoading,
    sortedAssignedOrders,
    assignedLoading,
    refetchOrders,
    refetchAvailableOrders,
    refetchAssignedOrders,
    isFetchingOrders,
    isFetchingAvailableOrders,
    isFetchingAssignedOrders,
  } = useOrdersData({
    userType,
    userPhone,
    currentEmployeeId: employeeId,
  });

  const {
    data: notifications,
    refetch: refetchNotifications,
    isFetching: isFetchingNotifications,
  } = useGetNotificationsQuery(
    { recipient_id: userId, recipient_type: userType },
    { skip: !userId || !isLoggedIn },
  );

  const {
    data: apiUnreadCount,
    refetch: refetchUnreadCount,
    isFetching: isFetchingUnreadCount,
  } = useGetUnreadCountQuery(
    { recipient_id: userId, recipient_type: userType },
    { skip: !userId || !isLoggedIn },
  );

  const { refreshing: queryRefreshing, onRefresh: queryOnRefresh } = useRefreshQueries([
    { refetch: refetchOrders, isFetching: isFetchingOrders },
    { refetch: refetchAvailableOrders, isFetching: isFetchingAvailableOrders },
    { refetch: refetchAssignedOrders, isFetching: isFetchingAssignedOrders },
    { refetch: refetchNotifications, isFetching: isFetchingNotifications },
    { refetch: refetchUnreadCount, isFetching: isFetchingUnreadCount },
    { refetch: servicesQuery.refetch, isFetching: servicesQuery.isFetching },
    { refetch: activeProductsQuery.refetch, isFetching: activeProductsQuery.isFetching },
  ]);

  const actualRefreshing = autoRefreshing || queryRefreshing;

  const handleRefresh = useCallback(async () => {
    baseOnRefresh();
    await queryOnRefresh();
  }, [baseOnRefresh, queryOnRefresh]);

  useEffect(() => {
    if (notifications) {
      dispatch(setNotifications(notifications));
    }
  }, [notifications, dispatch]);

  useEffect(() => {
    if (apiUnreadCount !== undefined) {
      dispatch(setUnreadCount(apiUnreadCount));
    }
  }, [apiUnreadCount, dispatch]);

  const handleNotificationPress = useCallback(() => {
    navigation.navigate("Notification");
  }, [navigation]);

  const handleOrderPress = useCallback(
    (id: string) => {
      if (userType === "customer") {
        navigation.navigate("OrderDetail", { id });
      } else if (userType === "employee") {
        navigation.navigate("EmployeeOrderDetail", { id });
      } else {
        navigation.navigate("Category" as never);
      }
    },
    [navigation, userType],
  );

  const handleClaimOrder = useCallback(
    async (id: string) => {
      if (!employeeId) {
        Alert.alert("Lỗi", "Không tìm thấy thông tin nhân viên.");
        return;
      }

      setClaimingOrderId(id);

      try {
        await claimEmployeeOrder({
          id,
          employee_id: String(employeeId),
        }).unwrap();

        await Promise.all([
          refetchAvailableOrders(),
          refetchAssignedOrders(),
          refetchNotifications(),
          refetchUnreadCount(),
        ]);

        navigation.navigate("EmployeeOrderDetail", { id });
      } catch (error: any) {
        const statusCode = error?.status || error?.originalStatus;
        const message = getApiErrorMessage(error, "Nhận đơn thất bại");

        await Promise.all([
          refetchAvailableOrders(),
          refetchAssignedOrders(),
        ]);

        if (statusCode === 409) {
          Alert.alert("Đơn đã có người nhận", message || "Đơn vừa được nhân viên khác nhận.");
          return;
        }

        Alert.alert("Không thể nhận đơn", message);
      } finally {
        setClaimingOrderId(null);
      }
    },
    [
      claimEmployeeOrder,
      employeeId,
      navigation,
      refetchAssignedOrders,
      refetchAvailableOrders,
      refetchNotifications,
      refetchUnreadCount,
    ],
  );

  const handleViewMore = useCallback(() => {
    if (userType === "customer") {
      navigation.navigate("MyService");
    } else {
      navigation.navigate("Category" as never);
    }
  }, [navigation, userType]);

  const handleLoginPress = useCallback(() => {
    navigation.navigate("Login");
  }, [navigation]);

  const headerUserName = isLoggedIn ? userName : "Khách";
  const headerNotificationCount = isLoggedIn ? unreadCount : undefined;

  const sections = useMemo(() => {
    return {
      headerUserName,
      headerNotificationCount,
      showNotificationButton: isLoggedIn,
      showEmployeeSections: isLoggedIn && userType === "employee",
      showCustomerVehicle: isLoggedIn && userType === "customer",
      showCustomerOrders: isLoggedIn && userType === "customer",
      showCustomerBooking: isLoggedIn && userType === "customer",
      showLoginPrompt: !isLoggedIn,
      showViewMoreOrders: sortedOrders.length > 2,
    };
  }, [
    headerUserName,
    headerNotificationCount,
    isLoggedIn,
    userType,
    sortedOrders.length,
  ]);

  return {
    navbarHeight,
    actualRefreshing,
    handleRefresh,

    userType,
    userId,
    userName,
    unreadCount,
    userPhone,
    services,

    homePreviewServices,
    homePreviewProducts,

    displayedOrders,
    sortedOrders,
    ordersLoading,

    sortedAvailableOrders,
    availableLoading,
    claimingOrderId,

    sortedAssignedOrders,
    assignedLoading,

    sections,

    handleNotificationPress,
    handleOrderPress,
    handleClaimOrder,
    handleViewMore,
    handleLoginPress,

    isLoggedIn,
  };
};
