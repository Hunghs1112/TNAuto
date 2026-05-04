import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";
import { Alert } from "react-native";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { spacing } from "../../design-system/spacing";
import { useAppDispatch } from "../../redux/hooks/useAppDispatch";
import { useAppSelector } from "../../redux/hooks/useAppSelector";
import { useAutoRefresh } from "../../redux/hooks/useAutoRefresh";
import {
  selectCurrentEmployee,
  selectGarageAvatarUrl,
  selectGarageCode,
  selectGarageName,
  selectHasGarageContext,
  selectServicesList,
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
import { useGetCustomerVehiclesQuery } from "../../services/vehicleApi";
import { useResolveGarageByCodeQuery } from "../../services/authApi";
import { setGarageContext } from "../../redux/slices/garageContextSlice";
type HomeBanner = {
  variant: "info" | "warning" | "danger";
  title: string;
  subtitle: string;
  nextRoute: keyof AppStackParamList;
  nextParams?: any;
};

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

const getApiErrorMessage = (error: any, fallback: string) => {
  return (
    error?.data?.error ||
    error?.data?.message ||
    error?.error ||
    fallback
  );
};

const normalizeGarageValue = (value?: string | null) => value?.trim().toUpperCase() || "";

const hasResolvedGarageName = (garageName?: string | null, garageCode?: string | null) => {
  const normalizedName = normalizeGarageValue(garageName);
  if (!normalizedName || normalizedName === "DEFAULT") {
    return false;
  }

  const normalizedCode = normalizeGarageValue(garageCode);
  return !normalizedCode || normalizedName !== normalizedCode;
};

export const useHomeScreen = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavigationProp>();
  const { refreshing: autoRefreshing, onRefresh: baseOnRefresh } = useAutoRefresh();
  const insets = useSafeAreaInsets();
  const [claimingOrderId, setClaimingOrderId] = useState(null as string | null);
  const [bannerDismissedThisSession, setBannerDismissedThisSession] = useState(false);
  const isFocused = useIsFocused();

  const navbarHeight =
    spacing.md + (spacing.sm * 2) + 64 + insets.bottom + spacing.lg + spacing.md;

  const userType = useAppSelector(selectUserType);
  const userName = useAppSelector(selectUserName);
  const userPhone = useAppSelector(selectUserPhone);
  const userId = useAppSelector(selectUserId);
  const currentEmployee = useAppSelector(selectCurrentEmployee);
  const garageContext = useAppSelector((state: RootState) => state.garageContext);
  const currentGarageCode = useAppSelector(selectGarageCode);
  const currentGarageName = useAppSelector(selectGarageName);
  const currentGarageAvatarUrl = useAppSelector(selectGarageAvatarUrl);
  const hasGarageContext = useAppSelector(selectHasGarageContext);
  const services = useAppSelector(selectServicesList);

  const isLoggedIn = useAppSelector((state: RootState) => state.auth.isLoggedIn);
  const isDealer = (userType === "dealer" || userType === "garage_manager" || userType === "garage_admin");
  const employeeId = currentEmployee?.id || (userType === "employee" ? userId : undefined);
  const canUseTenantCatalog = userType === "employee" || isDealer ? isLoggedIn : hasGarageContext;
  const customerNotificationParams =
    userType === "customer" ? { recipient_id: userId, recipient_type: "customer" } : undefined;
  const shouldResolveGarageName =
    isLoggedIn &&
    Boolean(currentGarageCode) &&
    garageContext.resolved &&
    !hasResolvedGarageName(currentGarageName, currentGarageCode);
  const shouldShowPromoHome =
    !isLoggedIn || (userType === "customer" && !hasGarageContext);

  const [claimEmployeeOrder] = useClaimEmployeeOrderMutation();
  const { data: resolvedGarageByCode, refetch: refetchResolvedGarageByCode } = useResolveGarageByCodeQuery(currentGarageCode, {
    skip: !shouldResolveGarageName,
  });
  const lastSyncedGarageSignatureRef = useRef<string>('');
  const isRefreshingGarageRef = useRef(false);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  const productsQuery = useGetProductsQuery({ garageCode: currentGarageCode }, { skip: isDealer || !canUseTenantCatalog });
  const dealerProductsQuery = useGetDealerProductsQuery(undefined, { skip: !isDealer });
  const servicesQuery = useGetServicesQuery({ garageCode: currentGarageCode }, { skip: isDealer || !canUseTenantCatalog });
  const customerVehiclesQuery = useGetCustomerVehiclesQuery(
    userType === "customer" ? { customer_id: userId } : undefined,
    { skip: !isLoggedIn || userType !== "customer" || !userId },
  );
  const activeProductsQuery = isDealer ? dealerProductsQuery : productsQuery;
  const customerVehicle = useMemo(() => {
    return customerVehiclesQuery.data?.data?.[0] ?? null;
  }, [customerVehiclesQuery.data]);

  const homePreviewProducts = useMemo(() => {
    return (activeProductsQuery.data || []).slice(0, 4);
  }, [activeProductsQuery.data]);

  const homePreviewServices = useMemo(() => {
    const list = servicesQuery.data?.data || [];
    return list.slice(0, 4);
  }, [servicesQuery.data]);

  const homeContent = useMemo(() => {
    return {
      previewServices: homePreviewServices,
      previewProducts: homePreviewProducts,
    };
  }, [homePreviewProducts, homePreviewServices]);

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
    hasGarageContext,
  });

  const {
    data: notifications,
    refetch: refetchNotifications,
    isFetching: isFetchingNotifications,
  } = useGetNotificationsQuery(
    userType === "customer" ? customerNotificationParams : undefined,
    { skip: !isLoggedIn || (userType === "customer" && !userId) },
  );


  const {
    data: apiUnreadCount,
    refetch: refetchUnreadCount,
    isFetching: isFetchingUnreadCount,
  } = useGetUnreadCountQuery(
    userType === "customer" ? customerNotificationParams : undefined,
    { skip: !isLoggedIn || (userType === "customer" && !userId) },
  );

  const { refreshing: queryRefreshing, onRefresh: queryOnRefresh } = useRefreshQueries([
    { refetch: refetchOrders, isFetching: isFetchingOrders },
    { refetch: refetchAvailableOrders, isFetching: isFetchingAvailableOrders },
    { refetch: refetchAssignedOrders, isFetching: isFetchingAssignedOrders },
    { refetch: refetchNotifications, isFetching: isFetchingNotifications },
    { refetch: refetchUnreadCount, isFetching: isFetchingUnreadCount },
    { refetch: servicesQuery.refetch, isFetching: servicesQuery.isFetching },
    { refetch: customerVehiclesQuery.refetch, isFetching: customerVehiclesQuery.isFetching },
    { refetch: activeProductsQuery.refetch, isFetching: activeProductsQuery.isFetching },
  ]);

  const actualRefreshing = autoRefreshing || queryRefreshing;

  const handleRefresh = useCallback(async () => {
    baseOnRefresh();
    await Promise.all([
      queryOnRefresh(),
      currentGarageCode ? refetchResolvedGarageByCode() : Promise.resolve(),
    ]);
  }, [baseOnRefresh, currentGarageCode, queryOnRefresh, refetchResolvedGarageByCode]);

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

  useEffect(() => {
    if (!resolvedGarageByCode?.name || isRefreshingGarageRef.current) {
      return;
    }

    if (!isFocused || appStateRef.current !== 'active') {
      return;
    }

    const signature = [
      resolvedGarageByCode.id ?? garageContext.garageId,
      resolvedGarageByCode.code || currentGarageCode,
      resolvedGarageByCode.name,
      resolvedGarageByCode.address ?? garageContext.address,
      resolvedGarageByCode.avatar_url ?? garageContext.avatarUrl,
      resolvedGarageByCode.banner_url ?? garageContext.bannerUrl,
      resolvedGarageByCode.status ?? garageContext.status,
    ].join('|');

    if (lastSyncedGarageSignatureRef.current === signature) {
      return;
    }

    lastSyncedGarageSignatureRef.current = signature;
    dispatch(
      setGarageContext({
        garageId: resolvedGarageByCode.id ?? garageContext.garageId,
        garageCode: resolvedGarageByCode.code || currentGarageCode,
        garageName: resolvedGarageByCode.name,
        address: resolvedGarageByCode.address ?? garageContext.address,
        avatarUrl: resolvedGarageByCode.avatar_url ?? garageContext.avatarUrl,
        bannerUrl: resolvedGarageByCode.banner_url ?? garageContext.bannerUrl,
        status: resolvedGarageByCode.status ?? garageContext.status,
        resolved: true,
      }),
    );
  }, [
    currentGarageCode,
    dispatch,
    garageContext.address,
    garageContext.avatarUrl,
    garageContext.bannerUrl,
    garageContext.garageId,
    garageContext.status,
    resolvedGarageByCode,
  ]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      const previousState = appStateRef.current;
      appStateRef.current = nextState;

      if (nextState !== 'active' || previousState === 'active' || !isFocused || !currentGarageCode || isRefreshingGarageRef.current) {
        return;
      }

      isRefreshingGarageRef.current = true;
      lastSyncedGarageSignatureRef.current = '';

      Promise.resolve(refetchResolvedGarageByCode())
        .catch((error) => {
          console.warn('Failed to refetch garage after resume:', error);
        })
        .finally(() => {
          isRefreshingGarageRef.current = false;
        });
    });

    return () => subscription.remove();
  }, [currentGarageCode, isFocused, refetchResolvedGarageByCode]);

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

  const handleProductPress = useCallback(
    (id: string) => {
      navigation.navigate("ProductDetail", { productId: id });
    },
    [navigation],
  );

  const handleServicePress = useCallback(
    (id: string) => {
      navigation.navigate("ServiceDetail", { serviceId: id });
    },
    [navigation],
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

  const handleOfferPress = useCallback(() => {
    navigation.navigate("Offer");
  }, [navigation]);

  const handleWarrantyPress = useCallback(() => {
    navigation.navigate("Warranty");
  }, [navigation]);

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

  const handleGaragePress = useCallback(() => {
    if (userType === "employee" || (userType === "dealer" || userType === "garage_manager" || userType === "garage_admin")) {
      return;
    }

    navigation.navigate("SelectGarage");
  }, [navigation, userType]);

  const handleVehicleBannerPress = useCallback(() => {
    if (!userId || !userPhone) {
      return;
    }

    navigation.navigate("VehicleList", { userId, userPhone });
  }, [navigation, userId, userPhone]);

  const ordersState = useMemo(() => {
    return {
      displayedOrders,
      sortedOrders,
      ordersLoading,
      sortedAvailableOrders,
      availableLoading,
      sortedAssignedOrders,
      assignedLoading,
      claimingOrderId,
    };
  }, [
    availableLoading,
    assignedLoading,
    claimingOrderId,
    displayedOrders,
    ordersLoading,
    sortedAssignedOrders,
    sortedAvailableOrders,
    sortedOrders,
  ]);

  const actions = useMemo(() => {
    return {
      onNotificationPress: handleNotificationPress,
      onOfferPress: handleOfferPress,
      onWarrantyPress: handleWarrantyPress,
      onOrderPress: handleOrderPress,
      onProductPress: handleProductPress,
      onServicePress: handleServicePress,
      onClaimOrder: handleClaimOrder,
      onViewMore: handleViewMore,
      onLoginPress: handleLoginPress,
      onGaragePress: handleGaragePress,
      onVehicleBannerPress: handleVehicleBannerPress,
    };
  }, [
    handleNotificationPress,
    handleOfferPress,
    handleWarrantyPress,
    handleOrderPress,
    handleProductPress,
    handleServicePress,
    handleClaimOrder,
    handleViewMore,
    handleLoginPress,
    handleGaragePress,
    handleVehicleBannerPress,
  ]);

  const headerGarageName = useMemo(() => {
    if (resolvedGarageByCode?.name?.trim()) {
      return resolvedGarageByCode.name.trim();
    }

    if (hasResolvedGarageName(currentGarageName, currentGarageCode)) {
      return currentGarageName.trim();
    }

    return "";
  }, [currentGarageCode, currentGarageName, resolvedGarageByCode?.name]);

  const headerGarageAvatarUrl = useMemo(() => {
    return resolvedGarageByCode?.avatar_url ?? currentGarageAvatarUrl ?? garageContext.avatarUrl ?? undefined;
  }, [currentGarageAvatarUrl, garageContext.avatarUrl, resolvedGarageByCode?.avatar_url]);
  const headerGarageBannerUrl = useMemo(() => {
    return resolvedGarageByCode?.banner_url ?? garageContext.bannerUrl ?? undefined;
  }, [garageContext.bannerUrl, resolvedGarageByCode?.banner_url]);

  const garageSummary = useMemo(() => {
    return {
      name: headerGarageName,
      code: currentGarageCode || undefined,
      address: garageContext.address || undefined,
      avatarUrl: headerGarageAvatarUrl,
      bannerUrl: headerGarageBannerUrl,
      hasContext: hasGarageContext,
      canChangeGarage: Boolean(hasGarageContext && userType === "customer"),
    };
  }, [currentGarageCode, garageContext.address, hasGarageContext, headerGarageAvatarUrl, headerGarageBannerUrl, headerGarageName, userType]);

  const banner = useMemo<HomeBanner | null>(() => {
    if (bannerDismissedThisSession || !isLoggedIn || userType !== "customer") {
      return null;
    }

    const missingFields: string[] = [];

    if (!customerVehicle?.license_expiry_date) missingFields.push("Bằng lái");
    if (!customerVehicle?.inspection_expiry_date) missingFields.push("Đăng kiểm");
    if (!customerVehicle?.insurance_expiry_date) missingFields.push("Bảo hiểm");

    if (missingFields.length === 0) return null;

    return {
      variant: "info",
      title: "Hãy nhớ cập nhật thông tin xe",
      subtitle: `Bạn đang thiếu thông tin: ${missingFields.join(", ")}.`,
      nextRoute: "VehicleList",
      nextParams: { userId, userPhone },
    };
  }, [bannerDismissedThisSession, customerVehicle?.insurance_expiry_date, customerVehicle?.inspection_expiry_date, customerVehicle?.license_expiry_date, isLoggedIn, userId, userPhone, userType]);

  const promoBanner = useMemo(() => {
    if (!banner) {
      return null;
    }

    return {
      title: banner.title,
      subtitle: banner.subtitle,
      dismiss: () => setBannerDismissedThisSession(true),
    };
  }, [banner]);

  return {
    navbarHeight,
    actualRefreshing,
    handleRefresh,

    userType,
    userId,
    userName,
    userPhone,
    services,
    garageSummary,
    customerVehicle,

    homeContent,
    shouldShowPromoHome,

    ordersState,

    actions,

    promoBanner,

    isLoggedIn,
  };
};


