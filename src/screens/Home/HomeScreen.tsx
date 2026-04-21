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
    offerCount,
    insuranceCount,
    userId,
    userPhone,
    currentGarageName,
    hasGarageContext,
    services,
    homePreviewServices,
    homePreviewProducts,
    customerVehicle,
    ecosystemGarages,
    ecosystemGaragesLoading,
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
    handleClaimOrder,
    handleViewMore,
    handleLoginPress,
    handleGaragePress,
    handleVehicleBannerPress,

    banner,
    bannerDismissedThisSession,
    dismissBanner,

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
      offerCount={offerCount as any}
      insuranceCount={insuranceCount as any}
      userId={userId as any}
      userPhone={userPhone as any}
      garageName={currentGarageName as any}
      canChangeGarage={Boolean(isLoggedIn && userType === "customer" && hasGarageContext)}
      services={services as any}
      homePreviewServices={homePreviewServices as any}
      homePreviewProducts={homePreviewProducts as any}
      vehicle={customerVehicle as any}
      ecosystemGarages={ecosystemGarages as any}
      ecosystemGaragesLoading={ecosystemGaragesLoading}
      shouldShowPromoHome={shouldShowPromoHome}
      displayedOrders={displayedOrders as any}
      sortedOrders={sortedOrders as any}
      ordersLoading={ordersLoading}
      sortedAvailableOrders={sortedAvailableOrders as any}
      availableLoading={availableLoading}
      claimingOrderId={claimingOrderId}
      sortedAssignedOrders={sortedAssignedOrders as any}
      assignedLoading={assignedLoading}
      onNotificationPress={handleNotificationPress}
      onOfferPress={handleOfferPress as any}
      onWarrantyPress={handleWarrantyPress as any}
      onOrderPress={handleOrderPress}
      onClaimOrder={handleClaimOrder}
      onViewMore={handleViewMore}
      onLoginPress={handleLoginPress}
      onGaragePress={handleGaragePress}
      banner={banner as any}
      bannerDismissed={bannerDismissedThisSession}
      onDismissBanner={dismissBanner}
      onBannerPress={handleVehicleBannerPress}
    />
  )
}
