import React from "react"
import HomeScreenView from "./HomeScreenView"
import { useHomeScreen } from "./useHomeScreen"

export default function HomeScreen() {
  const {
    navbarHeight,
    actualRefreshing,
    handleRefresh,

    userType,
    userName,
    unreadCount,
    userId,
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

    handleNotificationPress,
    handleOrderPress,
    handleClaimOrder,
    handleViewMore,
    handleLoginPress,

    isLoggedIn,
  } = useHomeScreen()

  return (
    <HomeScreenView
      navbarHeight={navbarHeight}
      actualRefreshing={actualRefreshing}
      onRefresh={handleRefresh}
      isLoggedIn={isLoggedIn}
      userType={userType}
      userName={userName as any}
      unreadCount={unreadCount as any}
      userId={userId as any}
      userPhone={userPhone as any}
      services={services as any}
      homePreviewServices={homePreviewServices as any}
      homePreviewProducts={homePreviewProducts as any}
      displayedOrders={displayedOrders as any}
      sortedOrders={sortedOrders as any}
      ordersLoading={ordersLoading}
      sortedAvailableOrders={sortedAvailableOrders as any}
      availableLoading={availableLoading}
      claimingOrderId={claimingOrderId}
      sortedAssignedOrders={sortedAssignedOrders as any}
      assignedLoading={assignedLoading}
      onNotificationPress={handleNotificationPress}
      onOrderPress={handleOrderPress}
      onClaimOrder={handleClaimOrder}
      onViewMore={handleViewMore}
      onLoginPress={handleLoginPress}
    />
  )
}
