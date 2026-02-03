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

type NavigationProp = NativeStackNavigationProp<AppStackParamList>

export const useHomeScreen = () => {
  const dispatch = useAppDispatch()
  const navigation = useNavigation<NavigationProp>()
  const { refreshing, onRefresh: baseOnRefresh } = useAutoRefresh()
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

  const isAnyFetching =
    isFetchingOrders ||
    isFetchingAssignedOrders ||
    isFetchingNotifications ||
    isFetchingUnreadCount
  const actualRefreshing = refreshing || isAnyFetching

  const handleRefresh = useCallback(async () => {
    baseOnRefresh()

    const refetchPromises: Promise<any>[] = []

    if (refetchOrders) {
      refetchPromises.push(refetchOrders())
    }

    if (refetchAssignedOrders) {
      refetchPromises.push(refetchAssignedOrders())
    }

    if (refetchNotifications) {
      refetchPromises.push(refetchNotifications())
    }

    if (refetchUnreadCount) {
      refetchPromises.push(refetchUnreadCount())
    }

    try {
      await Promise.all(refetchPromises)
    } catch (error) {
      console.error("HomeScreen: Error during refetch:", error)
    }
  }, [baseOnRefresh, refetchOrders, refetchAssignedOrders, refetchNotifications, refetchUnreadCount])

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

