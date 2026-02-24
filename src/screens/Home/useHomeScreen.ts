import React, { useCallback, useEffect, useMemo } from "react"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { spacing } from "../../design-system/spacing"
import { useAppDispatch } from "../../redux/hooks/useAppDispatch"
import { useAppSelector } from "../../redux/hooks/useAppSelector"
import { useAutoRefresh } from "../../redux/hooks/useAutoRefresh"
import {
  selectCurrentEmployee,
  selectServicesList,
  selectUnreadCount,
  selectUserId,
  selectUserName,
  selectUserPhone,
  selectUserType,
} from "../../redux/selectors"
import { RootState } from "../../redux/types"
import { setNotifications, setUnreadCount } from "../../redux/slices/notificationSlice"
import { useGetNotificationsQuery, useGetUnreadCountQuery } from "../../services/notificationApi"
import { useOrdersData } from "./hooks/useOrdersData"
import { AppStackParamList } from "../../navigation/AppNavigator"
import { useRefreshQueries } from "../../hooks/useRefreshQueries"
import { useGetProductsQuery } from "../../services/productApi"
import { useGetServicesQuery } from "../../services/customerApi"

type NavigationProp = NativeStackNavigationProp<AppStackParamList>

export const useHomeScreen = () => {
  const dispatch = useAppDispatch()
  const navigation = useNavigation<NavigationProp>()
  const { refreshing: autoRefreshing, onRefresh: baseOnRefresh } = useAutoRefresh()
  const insets = useSafeAreaInsets()

  const navbarHeight =
    spacing.md + (spacing.sm * 2) + 64 + insets.bottom + spacing.lg + spacing.md

  const userType = useAppSelector(selectUserType)
  const userName = useAppSelector(selectUserName)
  const userPhone = useAppSelector(selectUserPhone)
  const userId = useAppSelector(selectUserId)
  const currentEmployee = useAppSelector(selectCurrentEmployee)
  const services = useAppSelector(selectServicesList)
  const unreadCount = useAppSelector(selectUnreadCount)

  const isLoggedIn = useAppSelector((state: RootState) => state.auth.isLoggedIn)

  const employeeId = currentEmployee?.id || (userType === "employee" ? userId : undefined)

  const productsQuery = useGetProductsQuery(undefined)
  const servicesQuery = useGetServicesQuery(undefined)

  const homePreviewProducts = useMemo(() => {
    return (productsQuery.data || []).slice(0, 4)
  }, [productsQuery.data])

  const homePreviewServices = useMemo(() => {
    const list = servicesQuery.data?.data || []
    return list.slice(0, 4)
  }, [servicesQuery.data])

  const {
    sortedOrders,
    displayedOrders,
    ordersLoading,
    sortedAssignedOrders,
    assignedLoading,
    refetchOrders,
    refetchAssignedOrders,
    isFetchingOrders,
    isFetchingAssignedOrders,
  } = useOrdersData({
    userType,

    userPhone,
    currentEmployeeId: employeeId,
  })

  const {
    data: notifications,
    refetch: refetchNotifications,
    isFetching: isFetchingNotifications,
  } = useGetNotificationsQuery(
    { recipient_id: userId, recipient_type: userType },
    { skip: !userId || !isLoggedIn },
  )

  const {
    data: apiUnreadCount,
    refetch: refetchUnreadCount,
    isFetching: isFetchingUnreadCount,
  } = useGetUnreadCountQuery(
    { recipient_id: userId, recipient_type: userType },
    { skip: !userId || !isLoggedIn },
  )

  const { refreshing: queryRefreshing, onRefresh: queryOnRefresh } = useRefreshQueries([
    { refetch: refetchOrders, isFetching: isFetchingOrders },
    { refetch: refetchAssignedOrders, isFetching: isFetchingAssignedOrders },
    { refetch: refetchNotifications, isFetching: isFetchingNotifications },
    { refetch: refetchUnreadCount, isFetching: isFetchingUnreadCount },
    { refetch: servicesQuery.refetch, isFetching: servicesQuery.isFetching },
    { refetch: productsQuery.refetch, isFetching: productsQuery.isFetching },
  ])

  const actualRefreshing = autoRefreshing || queryRefreshing

  const handleRefresh = useCallback(async () => {
    baseOnRefresh()
    await queryOnRefresh()
  }, [baseOnRefresh, queryOnRefresh])

  useEffect(() => {
    if (notifications) {
      dispatch(setNotifications(notifications))
    }
  }, [notifications, dispatch])

  useEffect(() => {
    if (apiUnreadCount !== undefined) {
      dispatch(setUnreadCount(apiUnreadCount))
    }
  }, [apiUnreadCount, dispatch])

  const handleNotificationPress = useCallback(() => {
    navigation.navigate("Notification")
  }, [navigation])

  const handleOrderPress = useCallback(
    (id: string) => {
      if (userType === "customer") {
        navigation.navigate("OrderDetail", { id })
      } else {
        navigation.navigate("EmployeeOrderDetail", { id })
      }
    },
    [navigation, userType],
  )

  const handleViewMore = useCallback(() => {
    navigation.navigate("MyService")
  }, [navigation])

  const handleLoginPress = useCallback(() => {
    navigation.navigate("Login")
  }, [navigation])

  const headerUserName = isLoggedIn ? userName : "Khách"
  const headerNotificationCount = isLoggedIn ? unreadCount : undefined

  const sections = useMemo(() => {
    return {
      headerUserName,
      headerNotificationCount,
      showNotificationButton: isLoggedIn,
      showEmployeeSections: isLoggedIn && userType === "employee",
      showCustomerVehicle: isLoggedIn && userType === "customer",
      showCustomerOrders: isLoggedIn,
      showCustomerBooking: isLoggedIn && userType === "customer",
      showLoginPrompt: !isLoggedIn,
      showViewMoreOrders: sortedOrders.length > 2,
    }
  }, [
    headerUserName,
    headerNotificationCount,
    isLoggedIn,
    userType,
    sortedOrders.length,
  ])

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

    sortedAssignedOrders,
    assignedLoading,

    sections,

    handleNotificationPress,
    handleOrderPress,
    handleViewMore,
    handleLoginPress,

    isLoggedIn,
  }
}
