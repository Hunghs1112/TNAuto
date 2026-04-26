import { useCallback, useEffect, useMemo, useState } from "react";
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
  selectGarageAvatarUrl,
  selectGarageCode,
  selectGarageName,
  selectHasGarageContext,
  selectSavedGarages,
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
import { useGetCustomerVehiclesQuery } from "../../services/vehicleApi";
import { useGetOffersQuery } from "../../services/offerApi";
import { useGetWarrantiesQuery } from "../../services/warrantyApi";
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
  const savedGarages = useAppSelector(selectSavedGarages);
  const savedGarageCount = savedGarages.filter((garage) => Boolean(garage.garageCode)).length;
  const hasGarageContext = useAppSelector(selectHasGarageContext);
  const services = useAppSelector(selectServicesList);
  const unreadCount = useAppSelector(selectUnreadCount);

  const isLoggedIn = useAppSelector((state: RootState) => state.auth.isLoggedIn);
  const isDealer = userType === "dealer";
  const employeeId = currentEmployee?.id || (userType === "employee" ? userId : undefined);
  const canUseTenantCatalog =
    userType === "employee" || userType === "dealer" ? isLoggedIn : hasGarageContext;
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
  const { data: resolvedGarageByCode } = useResolveGarageByCodeQuery(currentGarageCode, {
    skip: !shouldResolveGarageName,
  });

  const productsQuery = useGetProductsQuery({ garageCode: currentGarageCode }, { skip: isDealer || !canUseTenantCatalog });
  const dealerProductsQuery = useGetDealerProductsQuery(undefined, { skip: !isDealer });
  const servicesQuery = useGetServicesQuery({ garageCode: currentGarageCode }, { skip: isDealer || !canUseTenantCatalog });
  const customerVehiclesQuery = useGetCustomerVehiclesQuery(
    userType === "customer" ? { customer_id: userId } : undefined,
    { skip: !isLoggedIn || userType !== "customer" || !userId },
  );
  const activeProductsQuery = isDealer ? dealerProductsQuery : productsQuery;
  const { data: offersData } = useGetOffersQuery({ garageCode: currentGarageCode }, { skip: !isLoggedIn || !currentGarageCode });

  const customerVehicle = useMemo(() => {
    return customerVehiclesQuery.data?.data?.[0] ?? null;
  }, [customerVehiclesQuery.data]);

  const { data: warrantyItems = [] } = useGetWarrantiesQuery(
    userType === "customer"
      ? {
          userType: "customer",
          userId,
          garageCode: currentGarageCode || undefined,
          status: "all",
        }
      : undefined,
    { skip: !isLoggedIn || userType !== "customer" || !userId },
  );

  const offerCount = offersData?.count ?? 0;
  const insuranceCount = warrantyItems.length;

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

  useEffect(() => {
    if (!resolvedGarageByCode?.name) {
      return;
    }

    if (
      hasResolvedGarageName(currentGarageName, currentGarageCode) &&
      normalizeGarageValue(currentGarageName) === normalizeGarageValue(resolvedGarageByCode.name)
    ) {
      return;
    }

    dispatch(
      setGarageContext({
        garageId: resolvedGarageByCode.id ?? garageContext.garageId,
        garageCode: resolvedGarageByCode.code || currentGarageCode,
        garageName: resolvedGarageByCode.name,
        address: resolvedGarageByCode.address ?? garageContext.address,
        avatarUrl: resolvedGarageByCode.avatar_url ?? garageContext.avatarUrl,
        status: resolvedGarageByCode.status ?? garageContext.status,
        resolved: true,
      }),
    );
  }, [
    currentGarageCode,
    currentGarageName,
    dispatch,
    garageContext.address,
    garageContext.avatarUrl,
    garageContext.garageId,
    garageContext.status,
    resolvedGarageByCode,
  ]);

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
    if (userType === "employee" || userType === "dealer") {
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

  return {
    navbarHeight,
    actualRefreshing,
    handleRefresh,

    userType,
    userId,
    userName,
    userPhone,
    services,
    currentGarageName: headerGarageName,
    currentGarageAvatarUrl: headerGarageAvatarUrl,
    savedGarageCount,
    hasGarageContext,
    customerVehicle,

    homePreviewServices,
    homePreviewProducts,
    shouldShowPromoHome,

    displayedOrders,
    sortedOrders,
    ordersLoading,

    sortedAvailableOrders,
    availableLoading,
    claimingOrderId,

    sortedAssignedOrders,
    assignedLoading,

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

    banner,
    bannerDismissedThisSession,
    dismissBanner: () => setBannerDismissedThisSession(true),
    bannerNextRoute: banner?.nextRoute,
    bannerNextParams: banner?.nextParams,

    isLoggedIn,
  };
};
