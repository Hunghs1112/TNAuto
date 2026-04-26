import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import LinearGradient from "react-native-linear-gradient";

import Screen from "../../components/layout/Screen/Screen";
import Item from "../../components/Item";
import FloatingNoticeBanner from "../../components/FloatingNoticeBanner";
import { Colors } from "../../constants/colors";
import { getPrimaryCatalogProductImageUrl } from "../../utils/catalog";
import { styles } from "./styles";
import UserHeader from "./UserHeader";
import GarageSummaryCard from "./GarageSummaryCard";
import VehicleInfoCard from "./VehicleInfoCard";
import SectionHeader from "./SectionHeader";
import QuickBookingForm from "./QuickBookingForm";
import OrdersList from "./components/OrdersList";
import AvailableOrdersList from "./components/AvailableOrdersList";
import EmployeeOrdersList from "./components/EmployeeOrdersList";
import WarrantyInfo from "./components/WarrantyInfo";
import ViewMoreButton from "./ViewMoreButton";
import DocumentExpiryCards from "./DocumentExpiryCards";
import { useHomeScreen } from "./useHomeScreen";

export default function HomeScreen() {
  const {
    userType,
    userName,
    userId,
    userPhone,
    currentGarageName,
    currentGarageAvatarUrl,
    hasGarageContext,
    services,
    homePreviewServices,
    homePreviewProducts,
    customerVehicle,
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
    banner,
    dismissBanner,
    isLoggedIn,
    savedGarageCount,
  } = useHomeScreen();

  return (
    <Screen hideHeader statusBarStyle="light-content">
      <View style={styles.homeRoot}>
        <LinearGradient
          colors={[...Colors.gradients.primary, Colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.homeBackground}
        >
          <View style={styles.homeDecorativeContainer}>
            <View style={[styles.homeDecorativeCircle, styles.homeCircle1]} />
            <View style={[styles.homeDecorativeCircle, styles.homeCircle2]} />
            <View style={[styles.homeDecorativeCircle, styles.homeCircle3]} />
          </View>
        </LinearGradient>

        <View style={styles.headerBackground}>
          <UserHeader
            userName={isLoggedIn ? userName : "Khách"}
            onNotificationPress={isLoggedIn ? handleNotificationPress : undefined}
            onOfferPress={isLoggedIn ? handleOfferPress : undefined}
            onInsurancePress={isLoggedIn ? handleWarrantyPress : undefined}
            onLoginPress={handleLoginPress}
            isLoggedIn={isLoggedIn}
          />
          {isLoggedIn && currentGarageName && (
            <View style={styles.garageSummaryWrap}>
              <GarageSummaryCard
                garageName={currentGarageName}
                garageAvatarUrl={currentGarageAvatarUrl}
                savedGarageCount={savedGarageCount}
                canChangeGarage={Boolean(hasGarageContext && userType === "customer")}
                onPress={handleGaragePress}
              />
            </View>
          )}
        </View>

        {!shouldShowPromoHome && isLoggedIn && userType === "customer" && (
          <View style={styles.documentExpiryOverlay}>
            <DocumentExpiryCards vehicle={customerVehicle} />
          </View>
        )}

        {!shouldShowPromoHome && banner && (
          <View style={styles.bannerInlineWrap}>
            <FloatingNoticeBanner
              title={banner.title}
              subtitle={banner.subtitle}
              onDismiss={dismissBanner}
              onPress={undefined}
            />
          </View>
        )}

        <View style={styles.bottomSheet}>
          {shouldShowPromoHome ? (
            <View style={styles.section}>
              <View style={styles.loginPromptCard}>
                <Ionicons name="business-outline" size={48} color={Colors.primary} />
                <Text style={styles.loginPromptTitle}>Liên kết mã gara để sử dụng đầy đủ tính năng</Text>
                <Text style={styles.loginPromptDescription}>
                  Tài khoản của bạn chưa được gắn với mã gara nào. Hãy nhập mã gara để kết nối tài khoản, đồng bộ dữ liệu và bắt đầu sử dụng dịch vụ.
                </Text>
                <TouchableOpacity style={styles.loginPromptButton} onPress={handleGaragePress}>
                  <Text style={styles.loginPromptButtonText}>Nhập mã gara</Text>
                  <Ionicons name="arrow-forward" size={20} color={Colors.background.light} />
                </TouchableOpacity>
              </View>
            </View>
          ) : isLoggedIn && userType === "employee" ? (
            <>
              <View style={styles.section}>
                <SectionHeader title="Việc mới tạo chưa giao ai" />
                <AvailableOrdersList
                  orders={sortedAvailableOrders}
                  isLoading={availableLoading}
                  services={services}
                  onOrderPress={handleOrderPress}
                  onClaimPress={handleClaimOrder}
                  claimingOrderId={claimingOrderId}
                  emptyMessage="Chưa có việc mới nào đang chờ nhận"
                />
              </View>

              <View style={styles.section}>
                <SectionHeader title="Việc đang đảm nhận" />
                <EmployeeOrdersList
                  orders={sortedAssignedOrders}
                  isLoading={assignedLoading}
                  services={services}
                  onOrderPress={handleOrderPress}
                  emptyMessage="Chưa có việc nào đang đảm nhận"
                />
              </View>

              <View style={styles.section}>
                <SectionHeader title="Thông tin bảo hành" />
                <WarrantyInfo
                  orders={sortedAssignedOrders}
                  onWarrantyPress={(orderId: string) => handleOrderPress(orderId)}
                />
              </View>
            </>
          ) : (
            <>
              {isLoggedIn && userType === "customer" && (
                <View style={styles.section}>
                  <VehicleInfoCard userId={userId} userPhone={userPhone} />
                </View>
              )}

              {isLoggedIn && userType === "customer" && (
                <View style={styles.section}>
                  <SectionHeader title="Dịch vụ đang sử dụng" />
                  <OrdersList
                    orders={displayedOrders}
                    isLoading={ordersLoading}
                    services={services}
                    userType={userType}
                    onOrderPress={handleOrderPress}
                    emptyMessage="Chưa có đơn hàng nào"
                  />
                  {sortedOrders.length > 2 && <ViewMoreButton onPress={handleViewMore} title="Xem tất cả đơn hàng" />}
                </View>
              )}

              {isLoggedIn && userType === "customer" ? (
                <View style={styles.section}>
                  <QuickBookingForm />
                </View>
              ) : isLoggedIn && userType === "dealer" ? (
                <View style={styles.section}>
                  <SectionHeader title="Sản phẩm nổi bật" />
                  <View style={styles.servicesContainer}>
                    {homePreviewProducts.map((product: any) => (
                      <Item
                        key={product.id}
                        title={product.name}
                        description={product.description || "Xem chi tiết sản phẩm"}
                        imageUri={getPrimaryCatalogProductImageUrl(product)}
                        onPress={() => handleProductPress(String(product.id))}
                      />
                    ))}
                  </View>
                  <ViewMoreButton onPress={handleViewMore} title="Xem thêm sản phẩm" />
                </View>
              ) : !isLoggedIn ? (
                <>
                  <View style={styles.section}>
                    <SectionHeader title="Dịch vụ của chúng tôi" />
                    <View style={styles.servicesContainer}>
                      {homePreviewServices.map((service: any) => (
                        <Item
                          key={service.id}
                          title={service.name}
                          description={service.description}
                          imageUri={service.image_url}
                          onPress={() => handleServicePress(String(service.id))}
                        />
                      ))}
                    </View>
                    <ViewMoreButton onPress={handleViewMore} title="Xem thêm dịch vụ" />
                  </View>

                  <View style={styles.section}>
                    <SectionHeader title="Sản phẩm nổi bật" />
                    <View style={styles.servicesContainer}>
                      {homePreviewProducts.map((product: any) => (
                        <Item
                          key={product.id}
                          title={product.name}
                          description={product.description || "Xem chi tiết sản phẩm"}
                          imageUri={getPrimaryCatalogProductImageUrl(product)}
                          onPress={() => handleProductPress(String(product.id))}
                        />
                      ))}
                    </View>
                    <ViewMoreButton onPress={handleViewMore} title="Xem thêm sản phẩm" />
                  </View>

                  <View style={styles.section}>
                    <View style={styles.loginPromptCard}>
                      <Ionicons name="calendar-outline" size={48} color={Colors.primary} />
                      <Text style={styles.loginPromptTitle}>Đăng nhập để đặt lịch dịch vụ</Text>
                      <Text style={styles.loginPromptDescription}>
                        Đăng nhập để đặt lịch dịch vụ, xem lịch sử đơn hàng và quản lý thông tin xe của bạn
                      </Text>
                      <TouchableOpacity style={styles.loginPromptButton} onPress={handleLoginPress}>
                        <Text style={styles.loginPromptButtonText}>Đăng nhập / Đăng ký</Text>
                        <Ionicons name="arrow-forward" size={20} color={Colors.background.light} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </>
              ) : null}
            </>
          )}
        </View>
      </View>
    </Screen>
  );
}
